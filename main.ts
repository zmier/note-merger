import { Plugin, Notice, MarkdownView } from 'obsidian';
import { NoteMergerSettingTab } from './src/ui/SettingTab';
import { NoteMergerSettings, DEFAULT_SETTINGS } from './src/settings';
import { mergeLinkedFiles } from './src/merger';
import { adjustHeadingLevel } from './src/heading-adjuster';
import { createFileVersion } from './src/versioning';
import { compareWithLatestVersion, compareWithSelectedVersion, compareWithAnyFile } from './src/diff-view';
import { MergeOptionsModal } from './src/ui/MergeOptionsModal';
import { EvidenceManager } from './src/evidence/EvidenceManager';
import { LensManager } from './src/lens-crafter/LensManager'; // ◀︎ 引入新模块

export default class NoteMerger extends Plugin {
    settings: NoteMergerSettings;
    evidenceManager: EvidenceManager;
    lensManager: LensManager; // ◀︎ 持有实例

    async onload() {
       await this.loadSettings();

       // --- Init Managers ---
       this.evidenceManager = new EvidenceManager(this.app, this.settings, this.saveSettings.bind(this));
       this.lensManager = new LensManager(this.app); // ◀︎ 初始化

       // --- UI Setup ---
       const statusBarItem = this.addStatusBarItem();
       this.evidenceManager.setStatusBar(statusBarItem);
       statusBarItem.addClass('mod-clickable');
       statusBarItem.onClickEvent(() => {
           this.evidenceManager.quickCapture(true);
       });

       // --- 1. Lens Crafter Commands (新功能) ---
       this.addCommand({
           id: 'create-project-lens',
           name: 'Create Project Lens Note (Context-Aware)',
           icon: 'glasses', // 给它一个眼镜图标 👓
           callback: () => {
               this.lensManager.triggerLensCreation();
           }
       });

       // --- 2. Evidence Mapper Commands ---
       this.addCommand({
           id: 'quick-capture-evidence',
           name: 'Quick Capture Evidence (Context-Aware)',
           icon: 'zap',
           checkCallback: (checking: boolean) => {
               if (checking) return !!this.app.workspace.getActiveViewOfType(MarkdownView);
               this.evidenceManager.quickCapture(false);
           }
       });

       this.addCommand({
           id: 'redirect-capture-evidence',
           name: 'Redirect Capture Evidence (Change Topic)',
           icon: 'navigation',
           checkCallback: (checking: boolean) => {
               if (checking) return !!this.app.workspace.getActiveViewOfType(MarkdownView);
               this.evidenceManager.quickCapture(true);
           }
       });

       // --- 3. Note Merger Commands ---
       this.addCommand({
          id: 'merge-linked-notes',
          name: 'Merge Linked Notes',
          callback: () => {
             new MergeOptionsModal(this.app, this.settings, (runtimeOptions) => {
                 mergeLinkedFiles(this.app, runtimeOptions);
             }).open();
          }
       });

       // --- 4. Utilities ---
       this.addCommand({ id: 'create-file-version', name: 'Create Version (Snapshot)', icon: 'history', callback: () => createFileVersion(this.app) });
       this.addCommand({ id: 'compare-latest-version', name: 'Compare with Latest Version', icon: 'file-diff', callback: () => compareWithLatestVersion(this.app) });
       this.addCommand({ id: 'compare-specific-version', name: 'Compare with Specific Version...', icon: 'search', callback: () => compareWithSelectedVersion(this.app) });
       this.addCommand({ id: 'compare-any-file', name: 'Compare with Any File...', icon: 'files', callback: () => compareWithAnyFile(this.app) });
       this.addCommand({ id: 'demote-headings-in-selection', name: 'Demote Headings in Selection', icon: 'arrow-down', editorCallback: (editor) => adjustHeadingLevel(editor, 1) });
       this.addCommand({ id: 'promote-headings-in-selection', name: 'Promote Headings in Selection', icon: 'arrow-up', editorCallback: (editor) => adjustHeadingLevel(editor, -1) });

       this.addSettingTab(new NoteMergerSettingTab(this.app, this));
    }

    onunload() {}

    async loadSettings() {
       this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
       if (this.evidenceManager) this.evidenceManager.loadContext();
    }

    async saveSettings() {
       await this.saveData(this.settings);
    }
}
