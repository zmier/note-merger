import { App, Notice, TFolder, TFile, moment } from 'obsidian';

/**
 * 为当前文件创建带时间戳的副本版本
 * @param app Obsidian App 实例
 */
export async function createFileVersion(app: App): Promise<void> {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice('No active file to version.');
        return;
    }

    try {
        // 1. 确定版本文件夹的路径
        // 逻辑：在当前文件同级目录下，创建一个名为 "文件名-版本" 的文件夹
        const parentPath = activeFile.parent?.isRoot() ? "" : `${activeFile.parent?.path}/`;
        const versionFolderName = `${activeFile.basename}-版本`;
        const versionFolderPath = `${parentPath}${versionFolderName}`;

        // 2. 检查文件夹是否存在，不存在则创建
        const existingFolder = app.vault.getAbstractFileByPath(versionFolderPath);
        if (!existingFolder) {
            await app.vault.createFolder(versionFolderPath);
        } else if (!(existingFolder instanceof TFolder)) {
            // 如果路径存在但不是文件夹（比如有个同名文件），报错并退出
            new Notice(`❌ Error: "${versionFolderPath}" already exists but is not a folder.`);
            return;
        }

        // 3. 生成带时间戳的新文件名
        // 格式: 原文件名_V-yyMMdd_HHmm.后缀
        const timestamp = moment().format('YYMMDD_HHmm');
        const versionFileName = `${activeFile.basename}_V-${timestamp}.${activeFile.extension}`;
        const versionFilePath = `${versionFolderPath}/${versionFileName}`;

        // 4. 检查同名版本文件是否已存在 (防止一分钟内多次备份覆盖)
        if (app.vault.getAbstractFileByPath(versionFilePath)) {
            new Notice(`⚠️ Version "${versionFileName}" already exists.`);
            return;
        }

        // 5. 执行复制操作
        await app.vault.copy(activeFile, versionFilePath);

        new Notice(`✅ Version saved: ${versionFileName}`);

    } catch (error) {
        console.error('Error creating version:', error);
        new Notice('❌ Error creating version. Check console.');
    }
}
