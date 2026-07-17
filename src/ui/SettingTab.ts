import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import NoteMerger from 'main'; 

const CRITICMARKUP_SHARE_GUIDE = `CriticMarkup 语法速查

1. 增补 Addition
{++插入的文字++}

2. 删除 Deletion
{--要删除的文字--}

3. 替换 Substitution
{~~原文~>建议改为~~}

4. 高亮 Highlight
{==被高亮的文字==}

5. 批注 Comment
{>>批注内容<<}

常用组合

高亮 + 批注
{==需要关注的原文==}{>>对这段文字的评审意见<<}

替换 + 批注
{~~原文~>建议改为~~}{>>修改理由：……<<}

本项目中的常用批注约定

- 问题标注：{>>⚠️[维度简称]：具体说明<<}
- 正面确认：{>>注释准确<<}
- 段落级问题可放在段尾单独批注

快捷录入

- 可在 Obsidian 的 Hotkeys 中搜索 CriticMarkup
- 已支持 Addition / Deletion / Highlight / Comment / Substitution 的快捷插入命令`;

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

		// ▼▼▼ 新增：Writer Cockpit 设置区域 ▼▼▼
       containerEl.createEl('h3', {text: 'Writer Cockpit (Rime Stats)'});

       new Setting(containerEl)
          .setName('Rime Log CSV Path')
          .setDesc('The vault-relative path to your Rime log CSV file.')
          .addText(text => text
             .setPlaceholder('Example: 00 Journal/rime_log.csv')
             .setValue(this.plugin.settings.rimeLogPath)
             .onChange(async (value) => {
                this.plugin.settings.rimeLogPath = value;

                // 实时更新 Service 中的路径，无需重启插件
                if (this.plugin.statsService) {
                    this.plugin.statsService.csvPath = value;
                }

                await this.plugin.saveSettings();
             }));

       // ▼▼▼ 新增：UI 增强设置 ▼▼▼
       containerEl.createEl('h3', {text: 'UI Enhancements'});

       new Setting(containerEl)
          .setName('Enable Scrollbar Markers')
          .setDesc('Show colored dots on the right scrollbar for callouts like > [!T] or > [!Q].')
          .addToggle(toggle => toggle
             .setValue(this.plugin.settings.enableScrollbarMarkers)
             .onChange(async (value) => {
                this.plugin.settings.enableScrollbarMarkers = value;
                await this.plugin.saveSettings();
                // 提示用户重启生效或重新打开文件
                // 实际代码中我们可以调用 manager.reload()，这里简单处理
             }));

       new Setting(containerEl)
          .setName('Smart Tab Reuse')
          .setDesc('Clicking a file in explorer jumps to an already open tab instead of opening a new one.')
          .addToggle(toggle => toggle
             .setValue(this.plugin.settings.enableTabReuse)
             .onChange(async (value) => {
                this.plugin.settings.enableTabReuse = value;
                await this.plugin.saveSettings();
             }));

       containerEl.createEl('h3', { text: 'CriticMarkup Guide' });

       const guideSetting = new Setting(containerEl)
          .setName('Shareable syntax guide')
          .setDesc('Copy this summary and share it with collaborators so they can understand the current CriticMarkup conventions quickly.');

       guideSetting.addButton(button => button
          .setButtonText('Copy Guide')
          .setCta()
          .onClick(async () => {
             try {
                await navigator.clipboard.writeText(CRITICMARKUP_SHARE_GUIDE);
                new Notice('CriticMarkup guide copied.');
             } catch (error) {
                console.error('Failed to copy CriticMarkup guide', error);
                new Notice('Failed to copy guide.');
             }
          }));

       const guideBox = containerEl.createEl('textarea', {
          cls: 'note-merger-critic-guide-box'
       });
       guideBox.value = CRITICMARKUP_SHARE_GUIDE;
       guideBox.readOnly = true;
       guideBox.rows = 22;
       guideBox.setAttr('aria-label', 'CriticMarkup shareable guide');
    }
}
