import { Plugin } from 'obsidian';
import { NoteMergerSettingTab } from './src/ui/SettingTab';
import { NoteMergerSettings, DEFAULT_SETTINGS } from './src/settings';
import { mergeLinkedFiles } from './src/merger';
import { adjustHeadingLevel } from './src/heading-adjuster';
import { createFileVersion } from './src/versioning';
import { compareWithLatestVersion, compareWithSelectedVersion, compareWithAnyFile } from './src/diff-view';
// ▼▼▼ 引入新弹窗 ▼▼▼
import { MergeOptionsModal } from './src/ui/MergeOptionsModal';

export default class NoteMerger extends Plugin {
    settings: NoteMergerSettings;

    async onload() {
       await this.loadSettings();

       this.addCommand({
          id: 'merge-linked-notes',
          name: 'Merge Linked Notes',
          callback: () => {
             // ▼▼▼ 核心改动：不再直接合并，而是先打开配置弹窗 ▼▼▼
             new MergeOptionsModal(this.app, this.settings, (runtimeOptions) => {
                 // 用户点击弹窗的确认按钮后，执行这里的逻辑
                 mergeLinkedFiles(this.app, runtimeOptions);
             }).open();
          }
       });

       this.addCommand({
          id: 'create-file-version',
          name: 'Create Version (Snapshot)',
          icon: 'history',
          callback: () => createFileVersion(this.app)
       });

       this.addCommand({
          id: 'compare-latest-version',
          name: 'Compare with Latest Version',
          icon: 'file-diff',
          callback: () => compareWithLatestVersion(this.app)
       });

       this.addCommand({
          id: 'compare-specific-version',
          name: 'Compare with Specific Version...',
          icon: 'search',
          callback: () => compareWithSelectedVersion(this.app)
       });

       this.addCommand({
          id: 'compare-any-file',
          name: 'Compare with Any File...',
          icon: 'files',
          callback: () => compareWithAnyFile(this.app)
       });

       this.addCommand({
          id: 'demote-headings-in-selection',
          name: 'Demote Headings in Selection',
          icon: 'arrow-down',
          editorCallback: (editor) => adjustHeadingLevel(editor, 1)
       });

       this.addCommand({
          id: 'promote-headings-in-selection',
          name: 'Promote Headings in Selection',
          icon: 'arrow-up',
          editorCallback: (editor) => adjustHeadingLevel(editor, -1)
       });

       this.addSettingTab(new NoteMergerSettingTab(this.app, this));
    }

    onunload() {}

    async loadSettings() {
       this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
       await this.saveData(this.settings);
    }
}
