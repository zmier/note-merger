import { App, TFile, Notice } from 'obsidian';
import { MergeRuntimeOptions } from './ui/MergeOptionsModal';

export async function mergeLinkedFiles(app: App, options: MergeRuntimeOptions): Promise<void> {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice('No active file.');
        return;
    }

    try {
        // 1. 查找链接文件
        const uniqueFiles = await findUniqueLinkedFiles(app, activeFile, options);

        if (uniqueFiles.length === 0) {
            new Notice('No matching linked notes found to merge.');
            return;
        }

        // ▼▼▼ 新功能：提取子文档列表 ▼▼▼
        if (options.extractSublist) {
            const sublistContent = uniqueFiles
                .map(file => `[[${file.basename}]]`) // 生成双链格式
                .join('\n');

            const sublistFilename = `${activeFile.basename}_sublists.md`;
            const parentPath = activeFile.parent?.isRoot() ? "" : `${activeFile.parent?.path}/`;
            const sublistPath = `${parentPath}${sublistFilename}`;

            // 如果文件存在则覆盖，不存在则创建
            const existingSublist = app.vault.getAbstractFileByPath(sublistPath);
            if (existingSublist instanceof TFile) {
                await app.vault.modify(existingSublist, sublistContent);
            } else {
                await app.vault.create(sublistPath, sublistContent);
            }

            new Notice(`📄 Sublist extracted: ${sublistFilename}`);
        }
        // ▲▲▲ 新功能结束 ▲▲▲

        let finalContent = "";
        const parentContent = await app.vault.read(activeFile);

        // --- Embed Mode ---
        if (options.mergeMode === 'embed') {
            const linkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
            const matches = Array.from(parentContent.matchAll(linkRegex));
            const replacements = new Map<string, string>();

            for (const match of matches) {
                const fullMatch = match[0];
                const linkText = match[1];

                const linkedFile = app.metadataCache.getFirstLinkpathDest(linkText, activeFile.path);

                if (linkedFile instanceof TFile && linkedFile.extension === 'md') {
                    if (options.onlyLitNotes && !linkedFile.basename.startsWith('@')) {
                        continue;
                    }

                    const processedBody = await processFileContent(app, linkedFile, options);
                    const headingPrefix = '#'.repeat(options.headingLevel);
                    const contentBlock = `\n${headingPrefix} [[${linkedFile.basename}]]\n\n${processedBody}\n`;

                    replacements.set(fullMatch, contentBlock);
                }
            }

            let embedResult = parentContent;
            if (options.ignoreYAML) {
                embedResult = embedResult.replace(/^---[\s\S]*?---\n/, '');
            }

            for (const [key, value] of replacements) {
                embedResult = embedResult.split(key).join(value);
            }
            finalContent = embedResult;
        }

        // --- Clean / Append Mode ---
        else {
            if (options.mergeMode === 'append') {
                let pContent = parentContent;
                if (options.ignoreYAML) {
                    pContent = pContent.replace(/^---[\s\S]*?---\n/, '');
                }
                finalContent += pContent + `\n\n${options.separatorStyle}\n\n`;
            }

            const separator = `\n\n${options.separatorStyle}\n\n`;
            const mergedBodyParts: string[] = [];
            const headingPrefix = '#'.repeat(options.headingLevel);

            for (const file of uniqueFiles) {
                const processedBody = await processFileContent(app, file, options);
                const contentBlock = `${headingPrefix} [[${file.basename}]]\n\n${processedBody}`;
                mergedBodyParts.push(contentBlock);
            }

            finalContent += mergedBodyParts.join(separator);
        }

        const outputFilename = `${activeFile.basename}${options.outputSuffix}.md`;
        const parent = activeFile.parent;
        const outputPath = (!parent || parent.isRoot()) ? outputFilename : `${parent.path}/${outputFilename}`;

        const existingFile = app.vault.getAbstractFileByPath(outputPath);
        if (existingFile instanceof TFile) {
            await app.vault.delete(existingFile);
        }

        await app.vault.create(outputPath, finalContent);

        new Notice(`✅ Success! Merged ${uniqueFiles.length} notes into '${outputFilename}'.`);

    } catch (error) {
        console.error('Error merging notes:', error);
        new Notice('❌ Error merging notes. Check console.');
    }
}

async function findUniqueLinkedFiles(app: App, activeFile: TFile, options: MergeRuntimeOptions): Promise<TFile[]> {
    const content = await app.vault.read(activeFile);
    const linkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    const matches = content.matchAll(linkRegex);

    const linkedFilesMap = new Map<string, TFile>();

    for (const match of matches) {
        const linkText = match[1];
        const linkedFile = app.metadataCache.getFirstLinkpathDest(linkText, activeFile.path);

        if (linkedFile instanceof TFile && linkedFile.extension === 'md') {
            if (options.onlyLitNotes && !linkedFile.basename.startsWith('@')) {
                continue;
            }
            linkedFilesMap.set(linkedFile.path, linkedFile);
        }
    }
    return Array.from(linkedFilesMap.values());
}

async function processFileContent(app: App, file: TFile, options: MergeRuntimeOptions): Promise<string> {
    let fileContent = await app.vault.read(file);

    if (options.ignoreYAML) {
        fileContent = fileContent.replace(/^---[\s\S]*?---\n/, '');
    }

    if (options.contentBaseLevel > 0) {
        const hashesToAdd = '#'.repeat(options.contentBaseLevel - 1);
        fileContent = fileContent.replace(/^(#+)(?=\s)/gm, (match) => {
            return match + hashesToAdd;
        });
    }

    return fileContent.trim();
}
