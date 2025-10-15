// src/merger.ts

import { App, TFile, Notice } from 'obsidian';
import { NoteMergerSettings } from './settings';

/**
 * 核心合并函数
 * @param app - Obsidian App 实例，用于访问 API
 * @param settings - 插件的设置
 * @returns Promise<void>
 */
export async function mergeLinkedFiles(app: App, settings: NoteMergerSettings): Promise<void> {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice('No active file.');
        return;
    }

    try {
        // 1. 查找链接文件 (逻辑和之前一样)
        const uniqueFiles = await findUniqueLinkedFiles(app, activeFile);
        if (uniqueFiles.length === 0) {
            new Notice('No valid linked notes found to merge.');
            return;
        }

        // 2. 生成合并后的内容 (逻辑和之前一样)
        const finalContent = await generateMergedContent(app, uniqueFiles, settings);

        // 3. 确定输出路径并写入文件 (逻辑和之前一样)
        const outputFilename = `${activeFile.basename}${settings.outputSuffix}.md`;
        const parent = activeFile.parent;
        const outputPath = (!parent || parent.isRoot()) ? outputFilename : `${parent.path}/${outputFilename}`;

        await app.vault.create(outputPath, finalContent);

        new Notice(`✅ Success! Merged ${uniqueFiles.length} notes into '${outputFilename}'.`);

    } catch (error) {
        console.error('Error merging notes:', error);
        new Notice('❌ Error merging notes. Check console for details.');
    }
}

/**
 * 辅助函数：查找唯一的链接文件
 */
async function findUniqueLinkedFiles(app: App, activeFile: TFile): Promise<TFile[]> {
    const content = await app.vault.read(activeFile);
    const linkRegex = /\[\[([^\]]+)\]\]/g;
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
 * 辅助函数：生成最终的合并内容字符串
 */
async function generateMergedContent(app: App, files: TFile[], settings: NoteMergerSettings): Promise<string> {
    const mergedContent: string[] = [];
    const headingPrefix = '#'.repeat(settings.headingLevel);
    const separator = `\n\n${settings.separatorStyle}\n\n`;

    for (const file of files) {
        const fileContent = await app.vault.read(file);
        const contentBlock = `${headingPrefix} [[${file.basename}]]\n\n${fileContent}`;
        mergedContent.push(contentBlock);
    }
    return mergedContent.join(separator);
}
