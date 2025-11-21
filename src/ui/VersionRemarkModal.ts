import { App, Modal, Setting } from 'obsidian';

export class VersionRemarkModal extends Modal {
    remarkTitle: string = '';
    remarkBody: string = '';
    onSubmit: (title: string, body: string) => void;

    constructor(app: App, onSubmit: (title: string, body: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: 'Create Version Snapshot' });

        // 输入 1: 备注标题 (追加到文件名)
        new Setting(contentEl)
            .setName('Remark Title (Optional)')
            .setDesc('Short text appended to filename (e.g. "_Refactor").')
            .addText(text => text
                .setPlaceholder('Major_Change')
                .onChange(value => {
                    this.remarkTitle = value;
                }));

        // 输入 2: 备注详情 (写入 YAML)
        new Setting(contentEl)
            .setName('Remark Information (Optional)')
            .setDesc('Detailed info stored in YAML "版本备注".')
            .addTextArea(text => text
                .setPlaceholder('Refactored the introduction paragraph...')
                .onChange(value => {
                    this.remarkBody = value;
                }));

        // 提交按钮
        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('Create Version')
                .setCta() // 设为高亮的主按钮
                .onClick(() => {
                    this.close();
                    this.onSubmit(this.remarkTitle, this.remarkBody);
                }));

        // 支持回车提交 (在标题输入框中)
        contentEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                this.close();
                this.onSubmit(this.remarkTitle, this.remarkBody);
            }
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
