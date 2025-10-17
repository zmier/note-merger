// src/ui/SettingTab.ts

import { App, PluginSettingTab, Setting } from 'obsidian';
import NoteMerger from 'main';

export class NoteMergerSettingTab extends PluginSettingTab {
    plugin: NoteMerger;

    constructor(app: App, plugin: NoteMerger) {
       super(app, plugin);
       this.plugin = plugin;
    }

    display(): void {
       const {containerEl} = this;
       containerEl.empty();
       containerEl.createEl('h2', {text: 'Note Merger Settings'});

       // 设置项 1: 输出文件后缀
       new Setting(containerEl)
          .setName('Output file suffix')
          .setDesc('The suffix to add to the merged filename (e.g., _merged).')
          .addText(text => text
             .setPlaceholder('_merged')
             .setValue(this.plugin.settings.outputSuffix)
             .onChange(async (value) => {
                this.plugin.settings.outputSuffix = value;
                await this.plugin.saveSettings();
             }));

       // 设置项 2: 标题级别
       new Setting(containerEl)
          .setName('Heading level')
          .setDesc('The heading level for each merged note title.')
          .addDropdown(dropdown => dropdown
             .addOption('1', 'H1 (#)')
             .addOption('2', 'H2 (##)')
             .addOption('3', 'H3 (###)')
             .addOption('4', 'H4 (####)')
             .addOption('5', 'H5 (#####)')
             .addOption('6', 'H6 (######)')
             .setValue(this.plugin.settings.headingLevel.toString())
             .onChange(async (value) => {
                this.plugin.settings.headingLevel = parseInt(value, 10);
                await this.plugin.saveSettings();
             }));

       // 设置项 3: 内容分隔符
       new Setting(containerEl)
          .setName('Content separator')
          .setDesc('The markdown separator to place between merged notes.')
          .addText(text => text
             .setPlaceholder('---')
             .setValue(this.plugin.settings.separatorStyle)
             .onChange(async (value) => {
                this.plugin.settings.separatorStyle = value;
                await this.plugin.saveSettings();
             }));
    }
}
