import { App, Modal, Setting } from 'obsidian';
import { NoteMergerSettings } from '../settings';

export interface MergeRuntimeOptions extends NoteMergerSettings {
    onlyLitNotes: boolean;
    extractSublist: boolean; // ▼▼▼ 新增：是否提取子文档列表 ▼▼▼
}

export class MergeOptionsModal extends Modal {
    options: MergeRuntimeOptions;
    onSubmit: (options: MergeRuntimeOptions) => void;

    constructor(app: App, defaultSettings: NoteMergerSettings, onSubmit: (options: MergeRuntimeOptions) => void) {
        super(app);
        this.onSubmit = onSubmit;
        this.options = {
            ...defaultSettings,
            onlyLitNotes: false,
            extractSublist: false // 默认关闭
        };
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: 'Merge Options' });
        contentEl.createEl('p', { text: 'Confirm or override settings for this specific merge.', cls: 'text-muted' });

        // 1. 合并模式
        new Setting(contentEl)
            .setName('Merge Mode')
            .addDropdown(dropdown => dropdown
                .addOption('clean', 'Clean (Only merged content)')
                .addOption('append', 'Append (Parent top, children bottom)')
                .addOption('embed', 'Embed (Replace links in place)')
                .setValue(this.options.mergeMode)
                .onChange(value => {
                    this.options.mergeMode = value as any;
                }));

        // 2. 过滤 YAML
        new Setting(contentEl)
            .setName('Ignore YAML Frontmatter')
            .addToggle(toggle => toggle
                .setValue(this.options.ignoreYAML)
                .onChange(value => {
                    this.options.ignoreYAML = value;
                }));

        // 3. 标题降级
        new Setting(contentEl)
            .setName('Demote Content Headings')
            .addDropdown(dropdown => dropdown
                .addOption('0', 'Keep original')
                .addOption('2', 'Start at H2 (##)')
                .addOption('3', 'Start at H3 (###)')
                .addOption('4', 'Start at H4 (####)')
                .setValue(this.options.contentBaseLevel.toString())
                .onChange(value => {
                    this.options.contentBaseLevel = parseInt(value, 10);
                }));

        // --- 额外工具 ---
        new Setting(contentEl).setName('Extra Tools').setHeading();

        // 4. 只合并文献笔记
        new Setting(contentEl)
            .setName('Only Merge Literature Notes')
            .setDesc('Only include files where the filename starts with "@".')
            .addToggle(toggle => toggle
                .setValue(this.options.onlyLitNotes)
                .onChange(value => {
                    this.options.onlyLitNotes = value;
                }));

        // 5. [新功能] 提取子文档列表
        new Setting(contentEl)
            .setName('Extract Sublist File')
            .setDesc('Generate a separate file ending in "_sublists.md" containing all links to be merged.')
            .addToggle(toggle => toggle
                .setValue(this.options.extractSublist)
                .onChange(value => {
                    this.options.extractSublist = value;
                }));

        // 提交按钮
        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('Start Merge')
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onSubmit(this.options);
                }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
