import { App, FuzzySuggestModal, TFile, TFolder } from 'obsidian';

// 1. 项目选择器：列出 03 Projects 下的一级子文件夹
export class ProjectSuggestModal extends FuzzySuggestModal<TFolder> {
    onChoose: (folder: TFolder) => void;

    constructor(app: App, onChoose: (folder: TFolder) => void) {
        super(app);
        this.onChoose = onChoose;
        this.setPlaceholder("Select a target Project...");
    }

    getItems(): TFolder[] {
        // 假设项目都在 "03 Projects" 目录下
        const projectsRoot = this.app.vault.getAbstractFileByPath("03 Projects");
        if (projectsRoot instanceof TFolder) {
            return projectsRoot.children
                .filter(f => f instanceof TFolder) as TFolder[];
        }
        return [];
    }

    getItemText(folder: TFolder): string {
        return `📂 ${folder.name}`;
    }

    onChooseItem(folder: TFolder, evt: MouseEvent | KeyboardEvent) {
        this.onChoose(folder);
    }
}

// 2. 文献选择器：列出 02 Sources/Papers 下的 Markdown 文件
export class LiteratureSuggestModal extends FuzzySuggestModal<TFile> {
    onChoose: (file: TFile) => void;

    constructor(app: App, onChoose: (file: TFile) => void) {
        super(app);
        this.onChoose = onChoose;
        this.setPlaceholder("Select a source Literature Meta-Note...");
    }

    getItems(): TFile[] {
        // 假设文献都在 "02 Sources/Papers" 目录下
        const papersRoot = this.app.vault.getAbstractFileByPath("02 Sources/Papers");
        if (papersRoot instanceof TFolder) {
            // 递归获取所有文件，或者只获取一级文件（取决于你的整理习惯）
            // 这里假设文献元笔记可能在子文件夹里，或者直接在 Papers 下
            // 为简单起见，我们暂时只取一级，如果需要递归可以用 getMarkdownFiles() 过滤路径
            return this.app.vault.getMarkdownFiles().filter(file =>
                file.path.startsWith("02 Sources/Papers")
            );
        }
        return [];
    }

    getItemText(file: TFile): string {
        return `📄 ${file.basename}`;
    }

    onChooseItem(file: TFile, evt: MouseEvent | KeyboardEvent) {
        this.onChoose(file);
    }
}
