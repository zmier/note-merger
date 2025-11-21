import { App, TFile, Notice } from 'obsidian';
import { NoteMergerSettings } from './settings';

export async function mergeLinkedFiles(app: App, settings: NoteMergerSettings): Promise<void> {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice('No active file.');
        return;
    }

    try {
        let finalContent = "";
        const parentContent = await app.vault.read(activeFile);

        // ---------------------------------------------------------
        // 分支 1: Embed Mode (嵌入模式 - 原位替换)
        // ---------------------------------------------------------
        if (settings.mergeMode === 'embed') {
            // 我们使用 replace 配合异步处理有些麻烦，所以这里先用 matchAll 获取所有链接，
            // 然后进行替换。或者更简单：我们构建一个新的字符串。
            
            // 为了处理简单，我们直接对 parentContent 进行正则替换操作。
            // 注意：由于文件读取是异步的，我们不能直接在 replace 回调里 await。
            // 策略：先扫描找出所有需要替换的链接和对应的文件，准备好内容，最后一次性替换。
            
            const linkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g; // 匹配 [[Link]] 或 [[Link|Alias]]
            const matches = Array.from(parentContent.matchAll(linkRegex));
            
            // 这是一个映射： "[[LinkText]]" -> "处理后的文件内容"
            const replacements = new Map<string, string>();

            for (const match of matches) {
                const fullMatch = match[0]; // e.g. [[Note A]]
                const linkText = match[1];  // e.g. Note A
                
                const linkedFile = app.metadataCache.getFirstLinkpathDest(linkText, activeFile.path);
                
                if (linkedFile instanceof TFile && linkedFile.extension === 'md') {
                    // 处理子文件内容
                    const processedBody = await processFileContent(app, linkedFile, settings);
                    // 加上包装标题
                    const headingPrefix = '#'.repeat(settings.headingLevel);
                    const contentBlock = `\n${headingPrefix} [[${linkedFile.basename}]]\n\n${processedBody}\n`;
                    
                    replacements.set(fullMatch, contentBlock);
                }
            }

            // 执行替换
            // 我们使用 split 和 reduce 来安全地替换，或者简单的 replaceAll (如果环境支持)
            // 为了兼容性，我们遍历 Map 进行替换。
            let embedResult = parentContent;
            
            // 移除 Frontmatter (如果父文档也需要过滤 YAML)
            if (settings.ignoreYAML) {
                embedResult = embedResult.replace(/^---[\s\S]*?---\n/, '');
            }

            for (const [key, value] of replacements) {
                // 使用 split/join 进行全局替换，避免正则特殊字符问题
                embedResult = embedResult.split(key).join(value);
            }
            
            finalContent = embedResult;
        } 
        
        // ---------------------------------------------------------
        // 分支 2: Clean / Append Mode (列表拼接模式)
        // ---------------------------------------------------------
        else {
            // 1. 找出所有链接文件 (复用之前的逻辑)
            const uniqueFiles = await findUniqueLinkedFiles(app, activeFile);
            
            if (uniqueFiles.length === 0) {
                new Notice('No valid linked notes found to merge.');
                return;
            }

            // 2. 处理父文档内容
            if (settings.mergeMode === 'append') {
                let pContent = parentContent;
                if (settings.ignoreYAML) {
                    pContent = pContent.replace(/^---[\s\S]*?---\n/, '');
                }
                finalContent += pContent + `\n\n${settings.separatorStyle}\n\n`;
            }

            // 3. 生成并追加子文档内容
            const separator = `\n\n${settings.separatorStyle}\n\n`;
            const mergedBodyParts: string[] = [];
            const headingPrefix = '#'.repeat(settings.headingLevel);

            for (const file of uniqueFiles) {
                const processedBody = await processFileContent(app, file, settings);
                const contentBlock = `${headingPrefix} [[${file.basename}]]\n\n${processedBody}`;
                mergedBodyParts.push(contentBlock);
            }
            
            finalContent += mergedBodyParts.join(separator);
        }

        // --- 写入文件 (通用逻辑) ---
        const outputFilename = `${activeFile.basename}${settings.outputSuffix}.md`;
        const parent = activeFile.parent;
        const outputPath = (!parent || parent.isRoot()) ? outputFilename : `${parent.path}/${outputFilename}`;
        
        // 检查文件是否存在，如果存在则覆盖 (先删除)
        const existingFile = app.vault.getAbstractFileByPath(outputPath);
        if (existingFile instanceof TFile) {
            await app.vault.delete(existingFile);
        }

        await app.vault.create(outputPath, finalContent);
        
        new Notice(`✅ Success! Merged into '${outputFilename}'.`);

    } catch (error) {
        console.error('Error merging notes:', error);
        new Notice('❌ Error merging notes. Check console.');
    }
}

// --- 辅助函数 ---

async function findUniqueLinkedFiles(app: App, activeFile: TFile): Promise<TFile[]> {
    const content = await app.vault.read(activeFile);
    const linkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    const matches = content.matchAll(linkRegex);
    const linkedFilesMap = new Map<string, TFile>();

    for (const match of matches) {
        const linkText = match[1];
        const linkedFile = app.metadataCache.getFirstLinkpathDest(linkText, activeFile.path);
        if (linkedFile instanceof TFile && linkedFile.extension === 'md') {
            linkedFilesMap.set(linkedFile.path, linkedFile);
        }
    }
    return Array.from(linkedFilesMap.values());
}

/**
 * 读取并处理单个文件的内容（去YAML，降级标题）
 */
async function processFileContent(app: App, file: TFile, settings: NoteMergerSettings): Promise<string> {
    let fileContent = await app.vault.read(file);

    // 功能 1 实现: 移除 YAML Frontmatter
    if (settings.ignoreYAML) {
        fileContent = fileContent.replace(/^---[\s\S]*?---\n/, '');
    }

    // 功能 3 实现: 标题降级
    if (settings.contentBaseLevel > 0) {
        const hashesToAdd = '#'.repeat(settings.contentBaseLevel - 1);
        // 正则：匹配行首的 # 
        fileContent = fileContent.replace(/^(#+)(?=\s)/gm, (match) => {
            return match + hashesToAdd;
        });
    }

    return fileContent.trim();
}
