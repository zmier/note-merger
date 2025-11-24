import { App, MarkdownView, Notice, TFile, Editor } from 'obsidian';
import { NoteMergerSettings } from '../settings';
import { IEvidenceService } from './types';
import { TopicSuggestModal } from './TopicSuggestModal';
import { ClaimSuggestModal } from './ClaimSuggestModal';
import { EvidenceNoteModal } from './EvidenceNoteModal';

export class EvidenceManager implements IEvidenceService {
    app: App;
    settings: NoteMergerSettings;
    saveSettings: () => Promise<void>;
    statusBarItem: HTMLElement | null = null;

    constructor(app: App, settings: NoteMergerSettings, saveSettings: () => Promise<void>) {
        this.app = app;
        this.settings = settings;
        this.saveSettings = saveSettings;
    }

    setStatusBar(item: HTMLElement) {
        this.statusBarItem = item;
        this.updateStatusBar();
    }

    updateStatusBar() {
        if (!this.statusBarItem) return;

        const ctx = this.settings.lastActiveContext;
        if (ctx.targetFilePath && ctx.targetHeading) {
            const fileName = ctx.targetFilePath.split('/').pop()?.replace('.md', '') || 'Unknown';
            const heading = ctx.targetHeading.replace(/^#+\s*/, '');

            this.statusBarItem.setText(`🎯 ${fileName} > ${heading}`);
            this.statusBarItem.setAttr('aria-label', 'Click to change Active Context');
        } else {
            this.statusBarItem.setText(`🎯 No Context`);
        }
    }

    loadContext() {
        this.updateStatusBar();
    }

    async quickCapture(forceRedirect: boolean = false) {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            new Notice("No active Markdown editor found.");
            return;
        }
        const editor = activeView.editor;
        const selection = editor.getSelection();

        if (!selection) {
            new Notice("Please select some text to capture as evidence.");
            return;
        }

        const ctx = this.settings.lastActiveContext;
        const hasValidContext = ctx.targetFilePath && ctx.targetHeading;

        if (forceRedirect || !hasValidContext) {
            this.promptForTopic(editor, selection);
        } else {
            const targetFile = this.app.vault.getAbstractFileByPath(ctx.targetFilePath!);
            if (targetFile instanceof TFile) {
                const contextDesc = `${targetFile.basename} > ${ctx.targetHeading}`;
                this.promptForNote(editor, selection, targetFile, ctx.targetHeading!, contextDesc);
            } else {
                new Notice("Target file not found. Please reset context.");
                this.promptForTopic(editor, selection);
            }
        }
    }

    private promptForTopic(editor: Editor, selection: string) {
        new TopicSuggestModal(this.app, (file) => {
            this.markFileAsTopic(file);
            this.promptForClaim(editor, selection, file);
        }).open();
    }

    private promptForClaim(editor: Editor, selection: string, file: TFile) {
        new ClaimSuggestModal(this.app, file, async (heading) => {
            await this.setActiveContext(file, heading);
            const contextDesc = `${file.basename} > ${heading}`;
            this.promptForNote(editor, selection, file, heading, contextDesc);
        }).open();
    }

    private promptForNote(editor: Editor, selection: string, targetFile: TFile, targetHeading: string, contextDesc: string) {
        new EvidenceNoteModal(this.app, contextDesc, async (note) => {
            await this.executeCapture(editor, selection, targetFile, targetHeading, note);
        }).open();
    }

    // ▼▼▼ 核心修改: 智能判断多行/单行 ▼▼▼
    private async executeCapture(editor: Editor, selection: string, targetFile: TFile, targetHeading: string, annotation: string) {
        try {
            // A. 确保源文件有 Block ID (作为锚点)
            // 即使是多行复制，我们也在最后一行加个 ID，方便跳回来
            const blockId = this.ensureBlockId(editor);

            // B. 获取源文件名
            const sourceFile = this.app.workspace.getActiveFile();
            const sourceLink = sourceFile ? sourceFile.basename : "Unknown Source";

            let contentToInsert = "";

            // C. 智能分流策略
            // 检测选区是否包含换行符 (多段落)
            if (selection.includes('\n')) {
                // --- 策略 1: 多行引用拷贝 (Blockquote Copy) ---
                // 格式:
                // - 💡 笔记
                //     > 原文行1
                //     > 原文行2...
                //     > [[Source#^id|Source]]

                // 给每一行加引用符号 >，并加缩进以保持在列表项内
                const indentedQuote = selection.split('\n').map(line => `    > ${line}`).join('\n');
                const linkBack = `[[${sourceLink}#^${blockId}|Source]]`;

                // 组装
                contentToInsert = `\n${indentedQuote}\n    > — ${linkBack}`;
            } else {
                // --- 策略 2: 单行嵌入 (Live Embed) ---
                // 格式: - 💡 笔记 ![[Source#^id]]
                contentToInsert = ` ![[${sourceLink}#^${blockId}]]`;
            }

            // D. 写入目标文件
            await this.appendToTopic(targetFile, targetHeading, contentToInsert, annotation);

        } catch (e) {
            console.error("Capture failed", e);
            new Notice("Failed to capture evidence. Check console.");
        }
    }
    // ▲▲▲ 修改结束 ▲▲▲

    ensureBlockId(editor: Editor): string {
        const cursor = editor.getCursor('to');
        const lineNum = cursor.line;
        const lineText = editor.getLine(lineNum);

        const blockIdRegex = /\ \^([a-zA-Z0-9-]+)$/;
        const match = lineText.match(blockIdRegex);

        if (match) {
            return match[1];
        }

        const newId = Math.random().toString(36).substring(2, 8);
        const newLineText = `${lineText.trimEnd()} ^${newId}`;
        editor.setLine(lineNum, newLineText);

        return newId;
    }

    async markFileAsTopic(file: TFile): Promise<void> {
        try {
            await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                if (frontmatter['evidence-topic'] !== true) {
                    frontmatter['evidence-topic'] = true;
                }
            });
        } catch (e) {
            console.error("Failed to mark file as topic", e);
        }
    }

    async appendToTopic(targetFile: TFile, targetHeading: string, contentLine: string, annotation: string): Promise<void> {
        const fileContent = await this.app.vault.read(targetFile);
        const metadata = this.app.metadataCache.getFileCache(targetFile);

        const symbol = this.settings.evidenceTriggerSymbol || '💡';
        // contentLine 包含了引用块或Embed链接
        const lineToInsert = `- ${symbol} ${annotation}${contentLine}`;

        if (!metadata || !metadata.headings) {
            const newContent = fileContent.trimEnd() + `\n\n${targetHeading}\n${lineToInsert}`;
            await this.app.vault.modify(targetFile, newContent);
            new Notice(`Added to ${targetFile.basename}`);
            return;
        }

        const targetLevel = (targetHeading.match(/^#+/) || [''])[0].length;
        const targetName = targetHeading.replace(/^#+\s*/, '');

        const headingEntry = metadata.headings.find(h => h.heading === targetName && h.level === targetLevel);

        if (!headingEntry) {
            const newContent = fileContent.trimEnd() + `\n\n${targetHeading}\n${lineToInsert}`;
            await this.app.vault.modify(targetFile, newContent);
            new Notice(`Added to ${targetFile.basename}`);
            return;
        }

        const lines = fileContent.split('\n');
        const startLine = headingEntry.position.start.line;
        let insertIndex = startLine + 1;

        for (let i = startLine + 1; i < lines.length; i++) {
            const line = lines[i];
            const headingMatch = line.match(/^(#+)\s/);

            if (headingMatch) {
                const level = headingMatch[1].length;
                if (level <= targetLevel) {
                    insertIndex = i;
                    break;
                }
            }
            insertIndex = i + 1;
        }

        lines.splice(insertIndex, 0, lineToInsert);
        const newContent = lines.join('\n');
        await this.app.vault.modify(targetFile, newContent);
        new Notice(`Evidence captured to ${targetFile.basename}`);
    }

    async setActiveContext(file: TFile, heading: string) {
        this.settings.lastActiveContext = {
            targetFilePath: file.path,
            targetHeading: heading
        };
        await this.saveSettings();
        this.updateStatusBar();
        new Notice(`Context Set: ${file.basename}`);
    }
}
