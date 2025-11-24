import { App, Modal, Setting } from 'obsidian';

export class EvidenceNoteModal extends Modal {
    note: string = '';
    onSubmit: (note: string) => void;
    contextDescription: string;

    constructor(app: App, contextDescription: string, onSubmit: (note: string) => void) {
        super(app);
        this.contextDescription = contextDescription;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: 'Capture Evidence' });
        // 显示当前上下文，让用户安心
        // 修复：将 style 放入 attr 属性中
        contentEl.createEl('div', {
            text: `Adding to: ${this.contextDescription}`,
            cls: 'text-muted',
            attr: { style: 'margin-bottom: 1em; font-family: monospace;' }
        });

        const inputSetting = new Setting(contentEl)
            .setName('Context Note')
            .setDesc('Why does this matter?')
            .addText(text => text
                .setPlaceholder('e.g. Key metric for efficiency...')
                .setValue(this.note)
                .onChange(value => {
                    this.note = value;
                }));

        // 体验优化: 自动聚焦输入框，并支持回车提交
        const inputEl = inputSetting.controlEl.querySelector('input');
        if (inputEl) {
            inputEl.focus();
            inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.submit();
                }
            });
        }

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('Collect')
                .setCta()
                .onClick(() => this.submit()));
    }

    submit() {
        this.close();
        this.onSubmit(this.note);
    }

    onClose() {
        this.contentEl.empty();
    }
}
