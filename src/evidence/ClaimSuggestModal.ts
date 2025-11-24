import { App, FuzzySuggestModal, TFile, HeadingCache } from 'obsidian';

export class ClaimSuggestModal extends FuzzySuggestModal<HeadingCache> {
    file: TFile;
    onChoose: (heading: string) => void;

    constructor(app: App, file: TFile, onChoose: (heading: string) => void) {
        super(app);
        this.file = file;
        this.onChoose = onChoose;
        this.setPlaceholder(`Select a Claim (Heading) in ${file.basename}...`);
    }

    getItems(): HeadingCache[] {
        const cache = this.app.metadataCache.getFileCache(this.file);
        // 如果文件没有标题，返回空数组
        return cache?.headings || [];
    }

    getItemText(heading: HeadingCache): string {
        // 视觉优化: 根据标题层级进行缩进，还原文档结构
        const indent = "  ".repeat(heading.level - 1);
        const icon = heading.level === 1 ? "🔴 " : "🔹 ";
        return `${indent}${icon}${heading.heading}`;
    }

    onChooseItem(heading: HeadingCache, evt: MouseEvent | KeyboardEvent) {
        // 重构完整的 Markdown 标题字符串 (e.g. "## Intro")
        const fullHeading = "#".repeat(heading.level) + " " + heading.heading;
        this.onChoose(fullHeading);
    }
}
