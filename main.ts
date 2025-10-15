// main.ts

import { Plugin } from 'obsidian';
import { NoteMergerSettingTab } from './src/ui/SettingTab';
import { NoteMergerSettings, DEFAULT_SETTINGS } from './src/settings';
import { mergeLinkedFiles } from './src/merger'; // ◀︎ 引入我们的核心逻辑函数

export default class MyPlugin extends Plugin {
    settings: NoteMergerSettings;

    async onload() {
       await this.loadSettings();

       this.addCommand({
          id: 'merge-linked-notes',
          name: 'Merge Linked Notes',

          // ▼▼▼ 看，callback 现在多么简洁！▼▼▼
          callback: () => {
             // 只需调用我们的合并函数，把 app 实例和 settings 传进去
             mergeLinkedFiles(this.app, this.settings);
          }
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
