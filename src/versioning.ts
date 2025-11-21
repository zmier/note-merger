import { App, Notice, TFolder, TFile, moment } from 'obsidian';
import { VersionRemarkModal } from './ui/VersionRemarkModal';

/**
 * 为当前文件创建带时间戳和备注的副本版本
 * @param app Obsidian App 实例
 */
export async function createFileVersion(app: App): Promise<void> {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice('No active file to version.');
        return;
    }

    // 打开弹窗，获取用户输入
    new VersionRemarkModal(app, async (remarkTitle, remarkBody) => {
        try {
            // 1. 确定版本文件夹路径
            const parentPath = activeFile.parent?.isRoot() ? "" : `${activeFile.parent?.path}/`;
            const versionFolderName = `${activeFile.basename}-版本`;
            const versionFolderPath = `${parentPath}${versionFolderName}`;

            // 2. 检查文件夹
            let existingFolder = app.vault.getAbstractFileByPath(versionFolderPath);
            if (!existingFolder) {
                await app.vault.createFolder(versionFolderPath);
            } else if (!(existingFolder instanceof TFolder)) {
                new Notice(`❌ Error: "${versionFolderPath}" exists but is not a folder.`);
                return;
            }

            // 3. 生成文件名
            const timestamp = moment().format('YYMMDD_HHmm');
            // 过滤文件名中的非法字符
            const cleanTitle = remarkTitle ? `_${remarkTitle.replace(/[\\/:*?"<>|]/g, "")}` : "";
            const versionFileName = `${activeFile.basename}_V-${timestamp}${cleanTitle}.${activeFile.extension}`;
            const versionFilePath = `${versionFolderPath}/${versionFileName}`;

            if (app.vault.getAbstractFileByPath(versionFilePath)) {
                new Notice(`⚠️ Version "${versionFileName}" already exists.`);
                return;
            }

            // 4. 复制文件
            const newFile = await app.vault.copy(activeFile, versionFilePath);

            // 5. 处理 YAML (添加备注、时间戳、Tag)
            if (newFile instanceof TFile) {
                await app.fileManager.processFrontMatter(newFile, (frontmatter) => {
                    // A. 添加备注信息
                    if (remarkBody) {
                        frontmatter['版本备注'] = remarkBody;
                    } else {
                        // 如果用户没写，也可以留个默认值或者不加
                        frontmatter['版本备注'] = '无';
                    }

                    // B. 添加精确时间戳
                    frontmatter['版本保存timestamp'] = moment().format('YYYY-MM-DD HH:mm:ss');

                    // C. 添加 Tags
                    const versionTag = '版本文档';
                    if (!frontmatter['tags']) {
                        frontmatter['tags'] = [versionTag];
                    } else {
                        // 兼容 tags 是字符串或数组的情况
                        const currentTags = typeof frontmatter['tags'] === 'string'
                            ? [frontmatter['tags']]
                            : frontmatter['tags'];

                        if (!currentTags.includes(versionTag)) {
                            currentTags.push(versionTag);
                            frontmatter['tags'] = currentTags;
                        }
                    }
                });
            }

            new Notice(`✅ Version saved: ${versionFileName}`);

        } catch (error) {
            console.error('Error creating version:', error);
            new Notice('❌ Error creating version. Check console.');
        }
    }).open();
}
