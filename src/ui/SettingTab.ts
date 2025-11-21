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

       // --- 基础设置 ---
       new Setting(containerEl).setName('Basic Settings').setHeading();

       new Setting(containerEl)
          .setName('Output file suffix')
          .setDesc('e.g. "_merged"')
          .addText(text => text
             .setValue(this.plugin.settings.outputSuffix)
             .onChange(async (value) => {
                this.plugin.settings.outputSuffix = value;
                await this.plugin.saveSettings();
             }));

       // --- 核心：合并模式选择 ---
       new Setting(containerEl)
          .setName('Merge Mode')
          .setDesc('How should the content be combined?')
          .addDropdown(dropdown => dropdown
             .addOption('clean', 'Clean (Only merged content)')
             .addOption('append', 'Append (Parent top, children bottom)')
             .addOption('embed', 'Embed (Replace links in place)') // <-- 新功能！
             .setValue(this.plugin.settings.mergeMode)
             .onChange(async (value) => {
                // 强制类型转换，因为我们知道 value 肯定是这三个字符串之一
                this.plugin.settings.mergeMode = value as 'clean' | 'append' | 'embed';
                await this.plugin.saveSettings();
             }));

       // --- 高级内容处理 ---
       new Setting(containerEl).setName('Content Processing').setHeading();

       new Setting(containerEl)
          .setName('Ignore YAML Frontmatter')
          .setDesc('Remove the metadata block (--- ... ---) from merged notes.')
          .addToggle(toggle => toggle
             .setValue(this.plugin.settings.ignoreYAML)
             .onChange(async (value) => {
                this.plugin.settings.ignoreYAML = value;
                await this.plugin.saveSettings();
             }));

       new Setting(containerEl)
          .setName('Demote Content Headings')
          .setDesc('Automatically increase heading levels in merged content.')
          .addDropdown(dropdown => dropdown
             .addOption('0', 'Do not change (Keep original)')
             .addOption('2', 'Start at H2 (##)')
             .addOption('3', 'Start at H3 (###)')
             .addOption('4', 'Start at H4 (####)')
             .setValue(this.plugin.settings.contentBaseLevel.toString())
             .onChange(async (value) => {
                this.plugin.settings.contentBaseLevel = parseInt(value, 10);
                await this.plugin.saveSettings();
             }));
        
        new Setting(containerEl)
            .setName('Wrapper Heading Level')
            .setDesc('The heading level for the [[Link Name]] wrapper.')
            .addDropdown(dropdown => dropdown
                .addOption('1', 'H1 (#)')
                .addOption('2', 'H2 (##)')
                .addOption('3', 'H3 (###)')
                .addOption('4', 'H4 (####)')
                .setValue(this.plugin.settings.headingLevel.toString())
                .onChange(async (value) => {
                    this.plugin.settings.headingLevel = parseInt(value, 10);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
          .setName('Content separator')
          .setDesc('Separator between notes (Only for Clean/Append modes).')
          .addText(text => text
             .setValue(this.plugin.settings.separatorStyle)
             .onChange(async (value) => {
                this.plugin.settings.separatorStyle = value;
                await this.plugin.saveSettings();
             }));
    }
}
