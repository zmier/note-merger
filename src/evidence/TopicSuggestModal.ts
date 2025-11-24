import { App, FuzzySuggestModal, TFile } from 'obsidian';

export class TopicSuggestModal extends FuzzySuggestModal<TFile> {
    onChoose: (file: TFile) => void;

    constructor(app: App, onChoose: (file: TFile) => void) {
        super(app);
        this.onChoose = onChoose;
        this.setPlaceholder("Select a target Topic (research subject)...");
    }

    getItems(): TFile[] {
        const allFiles = this.app.vault.getMarkdownFiles();

        // 排序逻辑:
        // 1. 优先显示已标记为 Topic 的文件 (evidence-topic: true)
        // 2. 其次按修改时间倒序 (最近使用的在前)
        return allFiles.sort((a, b) => {
            const cacheA = this.app.metadataCache.getFileCache(a);
            const cacheB = this.app.metadataCache.getFileCache(b);

            const isTopicA = cacheA?.frontmatter?.['evidence-topic'] === true;
            const isTopicB = cacheB?.frontmatter?.['evidence-topic'] === true;

            // Topic 优先
            if (isTopicA && !isTopicB) return -1;
            if (!isTopicA && isTopicB) return 1;

            // 同级则按时间倒序
            return b.stat.mtime - a.stat.mtime;
        });
    }

    getItemText(file: TFile): string {
        const cache = this.app.metadataCache.getFileCache(file);
        const isTopic = cache?.frontmatter?.['evidence-topic'] === true;
        // 视觉区分: Topic 用 🌟，普通文件用 📄
        const prefix = isTopic ? "🌟 " : "📄 ";
        return prefix + file.path;
    }

    onChooseItem(file: TFile, evt: MouseEvent | KeyboardEvent) {
        this.onChoose(file);
    }
}
