import { App, Modal, Notice, TFile, TFolder, FuzzySuggestModal } from 'obsidian';
import * as Diff from 'diff';

// --- Diff 展示窗口 (不变) ---
export class DiffModal extends Modal {
    oldContent: string;
    newContent: string;
    fileName: string;
    versionName: string;

    constructor(app: App, oldContent: string, newContent: string, fileName: string, versionName: string) {
        super(app);
        this.oldContent = oldContent;
        this.newContent = newContent;
        this.fileName = fileName;
        this.versionName = versionName;
    }

    onOpen() {
        const { contentEl } = this;
        this.modalEl.addClass('note-merger-diff-modal');
        contentEl.createEl('h2', { text: `Comparing: Current vs ${this.versionName}` });

        const diff = Diff.diffLines(this.oldContent, this.newContent);
        const diffContainer = contentEl.createDiv({ cls: 'note-merger-diff-container' });
        const fragment = document.createDocumentFragment();

        diff.forEach((part) => {
            const colorClass = part.added ? 'diff-added' :
                               part.removed ? 'diff-removed' : '';
            const span = document.createElement('span');
            span.className = colorClass;
            span.textContent = part.value;
            fragment.appendChild(span);
        });

        diffContainer.appendChild(fragment);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// --- 通用文件选择器 Modal (重命名并升级) ---
export class FileSuggestModal extends FuzzySuggestModal<TFile> {
    files: TFile[];
    onChoose: (file: TFile) => void;

    constructor(app: App, files: TFile[], onChoose: (file: TFile) => void) {
        super(app);
        this.files = files;
        this.onChoose = onChoose;
    }

    getItems(): TFile[] {
        return this.files;
    }

    getItemText(file: TFile): string {
        // 升级：显示完整路径，以便区分不同文件夹下的文件
        return file.path;
    }

    onChooseItem(file: TFile, evt: MouseEvent | KeyboardEvent) {
        this.onChoose(file);
    }
}

// --- 核心逻辑 ---

function getVersionFiles(app: App, activeFile: TFile): TFile[] | null {
    const parentPath = activeFile.parent?.isRoot() ? "" : `${activeFile.parent?.path}/`;
    const versionFolderName = `${activeFile.basename}-版本`;
    const versionFolderPath = `${parentPath}${versionFolderName}`;

    const versionFolder = app.vault.getAbstractFileByPath(versionFolderPath);

    if (!versionFolder || !(versionFolder instanceof TFolder)) {
        return null;
    }

    const files = versionFolder.children.filter(f => f instanceof TFile) as TFile[];
    files.sort((a, b) => b.stat.mtime - a.stat.mtime);

    return files;
}

/**
 * 命令 1: 直接对比最新版本
 */
export async function compareWithLatestVersion(app: App): Promise<void> {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) { new Notice('No active file.'); return; }

    const versionFiles = getVersionFiles(app, activeFile);

    if (!versionFiles || versionFiles.length === 0) {
        new Notice('No version history found for this file.');
        return;
    }

    const latestVersionFile = versionFiles[0];
    await openDiffView(app, activeFile, latestVersionFile);
}

/**
 * 命令 2: 弹框选择特定版本进行对比
 */
export async function compareWithSelectedVersion(app: App): Promise<void> {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) { new Notice('No active file.'); return; }

    const versionFiles = getVersionFiles(app, activeFile);

    if (!versionFiles || versionFiles.length === 0) {
        new Notice('No version history found for this file.');
        return;
    }

    // 使用通用的 FileSuggestModal
    new FileSuggestModal(app, versionFiles, async (selectedFile) => {
        await openDiffView(app, activeFile, selectedFile);
    }).open();
}

/**
 * 命令 3: 对比库中的任意文件 (新增)
 */
export async function compareWithAnyFile(app: App): Promise<void> {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) { new Notice('No active file.'); return; }

    // 1. 获取库中所有 Markdown 文件
    const allFiles = app.vault.getMarkdownFiles();

    // 2. 排除当前文件自己 (和自己对比没意义)
    const filesToCompare = allFiles.filter(file => file.path !== activeFile.path);

    if (filesToCompare.length === 0) {
        new Notice('No other markdown files found in vault.');
        return;
    }

    // 3. 打开选择器
    new FileSuggestModal(app, filesToCompare, async (selectedFile) => {
        await openDiffView(app, activeFile, selectedFile);
    }).open();
}

async function openDiffView(app: App, activeFile: TFile, compareFile: TFile) {
    try {
        const currentContent = await app.vault.read(activeFile);
        const compareContent = await app.vault.read(compareFile);
        // 参数顺序：compareFile (旧/参照) vs currentContent (新/当前)
        new DiffModal(app, compareContent, currentContent, activeFile.basename, compareFile.name).open();
    } catch (error) {
        console.error('Error comparing files:', error);
        new Notice('Error reading files for comparison.');
    }
}
