import { App, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

// 定义我们所有设置的“形状”
interface NoteMergerSettings {
	outputSuffix: string;
	headingLevel: number;
	separatorStyle: string;
}

// 为这些设置提供默认值
const DEFAULT_SETTINGS: NoteMergerSettings = {
	outputSuffix: '_merged',
	headingLevel: 2,
	separatorStyle: '---'
}

// --- 插件主逻辑 ---
export default class MyPlugin extends Plugin {
	// 类型要和我们新定义的 interface 保持一致
	settings: NoteMergerSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'merge-linked-notes',
			name: 'Merge Linked Notes',

			callback: async () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) { new Notice('No active file.'); return; }

				const content = await this.app.vault.read(activeFile);
				const linkRegex = /\[\[([^\]]+)\]\]/g;
				const matches = content.matchAll(linkRegex);
				const linkedFilesMap = new Map<string, TFile>();

				for (const match of matches) {
					const linkText = match[1];
					const linkedFile = this.app.metadataCache.getFirstLinkpathDest(linkText, activeFile.path);
					if (linkedFile instanceof TFile && linkedFile.extension === 'md') {
						linkedFilesMap.set(linkedFile.path, linkedFile);
					}
				}

				const uniqueFiles = Array.from(linkedFilesMap.values());
				if (uniqueFiles.length === 0) { new Notice('No valid linked notes found.'); return; }

				try {
					const mergedContent: string[] = [];

					// 从设置中读取标题级别和分隔符样式
					const headingPrefix = '#'.repeat(this.settings.headingLevel);
					const separator = `\n\n${this.settings.separatorStyle}\n\n`;

					for (const file of uniqueFiles) {
						const fileContent = await this.app.vault.read(file);
						const contentBlock = `${headingPrefix} [[${file.basename}]]\n\n${fileContent}`;
						mergedContent.push(contentBlock);
					}

					// 从设置中读取文件后缀
					const outputFilename = `${activeFile.basename}${this.settings.outputSuffix}.md`;
					const parent = activeFile.parent;
					const outputPath = (!parent || parent.isRoot()) ? outputFilename : `${parent.path}/${outputFilename}`;

					const finalContent = mergedContent.join(separator);

					await this.app.vault.create(outputPath, finalContent);
					new Notice(`✅ Success! Merged ${uniqueFiles.length} notes into '${outputFilename}'.`);

				} catch (error) {
					console.error('Error merging notes:', error);
					new Notice('❌ Error merging notes. Check console.');
				}
			}
		});

		// 确保这里使用的是我们重命名后的 SettingTab
		this.addSettingTab(new NoteMergerSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		// 确保类型匹配
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class NoteMergerSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		// 先清空设置页面，防止重复渲染
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
					// 当用户输入时，更新插件的设置并保存
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
				.setValue(this.plugin.settings.headingLevel.toString()) // 下拉菜单的值是字符串
				.onChange(async (value) => {
					// 将字符串转回数字再保存
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
