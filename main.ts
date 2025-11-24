import { Plugin, Notice, MarkdownView } from 'obsidian'; // ◀︎ 1. 添加 MarkdownView
import { NoteMergerSettingTab } from './src/ui/SettingTab';
import { NoteMergerSettings, DEFAULT_SETTINGS } from './src/settings';
import { mergeLinkedFiles } from './src/merger';
import { adjustHeadingLevel } from './src/heading-adjuster';
import { createFileVersion } from './src/versioning';
import { compareWithLatestVersion, compareWithSelectedVersion, compareWithAnyFile } from './src/diff-view';
import { MergeOptionsModal } from './src/ui/MergeOptionsModal';
import { EvidenceManager } from './src/evidence/EvidenceManager';

export default class NoteMerger extends Plugin {
    settings: NoteMergerSettings;
    evidenceManager: EvidenceManager;

    async onload() {
       await this.loadSettings();

       // --- 初始化 Evidence Manager ---
       this.evidenceManager = new EvidenceManager(
           this.app,
           this.settings,
           this.saveSettings.bind(this)
       );

       // 状态栏
       const statusBarItem = this.addStatusBarItem();
       this.evidenceManager.setStatusBar(statusBarItem);

       // 点击状态栏 -> 触发重定向收集
       statusBarItem.addClass('mod-clickable');
       statusBarItem.onClickEvent(() => {
           this.evidenceManager.quickCapture(true);
       });

       // --- Evidence Mapper Commands ---

       this.addCommand({
           id: 'quick-capture-evidence',
           name: 'Quick Capture Evidence (Context-Aware)',
           icon: 'zap',
           checkCallback: (checking: boolean) => {
               if (checking) {
                   // ◀︎ 2. 修正这里: 直接使用 MarkdownView 类
                   return !!this.app.workspace.getActiveViewOfType(MarkdownView);
               }
               this.evidenceManager.quickCapture(false);
           }
       });

       this.addCommand({
           id: 'redirect-capture-evidence',
           name: 'Redirect Capture Evidence (Change Topic)',
           icon: 'navigation',
           checkCallback: (checking: boolean) => {
               if (checking) {
                   // ◀︎ 3. 修正这里: 直接使用 MarkdownView 类
                   return !!this.app.workspace.getActiveViewOfType(MarkdownView);
               }
               this.evidenceManager.quickCapture(true);
           }
       });


       // --- Merge Commands (Keep Existing) ---
       this.addCommand({
          id: 'merge-linked-notes',
          name: 'Merge Linked Notes',
          callback: () => {
             new MergeOptionsModal(this.app, this.settings, (runtimeOptions) => {
                 mergeLinkedFiles(this.app, runtimeOptions);
             }).open();
          }
       });

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
       if (this.evidenceManager) {
           this.evidenceManager.loadContext();
       }
    }

    async saveSettings() {
       await this.saveData(this.settings);
    }
}
