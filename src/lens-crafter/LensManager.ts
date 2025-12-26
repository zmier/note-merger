import { App, Notice, TFile, TFolder, normalizePath } from 'obsidian';
import { ProjectSuggestModal, LiteratureSuggestModal } from './modals';

export class LensManager {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * 核心入口：触发透镜笔记生成流程
     * 自动识别上下文 (Context Awareness)
     */
    triggerLensCreation() {
        const activeFile = this.app.workspace.getActiveFile();

        // 兜底逻辑：如果没打开文件，直接进入双选流程
        if (!activeFile) {
            this.handleNoContext();
            return;
        }

        const path = activeFile.path;

        // 场景 A: 从文献出发 (Bottom-Up)
        if (path.startsWith("02 Sources/Papers")) {
            this.handleLitToProject(activeFile);
        }
        // 场景 B: 从项目出发 (Top-Down)
        else if (path.startsWith("03 Projects")) {
            // 尝试解析当前项目文件夹
            // 假设路径结构为: 03 Projects/{ProjectName}/...
            const parts = path.split('/');
            if (parts.length >= 3) { // 至少包含 "03 Projects" 和 "ProjectName"
                const projectPath = `03 Projects/${parts[1]}`;
                const projectFolder = this.app.vault.getAbstractFileByPath(projectPath);

                if (projectFolder instanceof TFolder) {
                    this.handleProjectToLit(projectFolder);
                } else {
                    this.handleNoContext(); // 无法解析项目结构
                }
            } else {
                this.handleNoContext();
            }
        }
        // 场景 C: 其他位置 -> 兜底
        else {
            this.handleNoContext();
        }
    }

    // 流程 A: 已有文献，选项目
    private handleLitToProject(litFile: TFile) {
        new ProjectSuggestModal(this.app, (projectFolder) => {
            this.createLensNote(projectFolder, litFile);
        }).open();
    }

    // 流程 B: 已有项目，选文献
    private handleProjectToLit(projectFolder: TFolder) {
        new LiteratureSuggestModal(this.app, (litFile) => {
            this.createLensNote(projectFolder, litFile);
        }).open();
    }

    // 流程 C: 全手动选择
    private handleNoContext() {
        new ProjectSuggestModal(this.app, (projectFolder) => {
            new LiteratureSuggestModal(this.app, (litFile) => {
                this.createLensNote(projectFolder, litFile);
            }).open();
        }).open();
    }

    // 核心操作：创建透镜笔记
    private async createLensNote(projectFolder: TFolder, litFile: TFile) {
        try {
            // 1. 确定目标目录: 03 Projects/{Project}/30 Literature Notes
            const targetDirName = "30 Literature Notes";
            const targetDirPath = `${projectFolder.path}/${targetDirName}`;

            // 检查目录是否存在，不存在则创建
            let targetFolder = this.app.vault.getAbstractFileByPath(targetDirPath);
            if (!targetFolder) {
                await this.app.vault.createFolder(targetDirPath);
                targetFolder = this.app.vault.getAbstractFileByPath(targetDirPath);
            }

            // 2. 构造文件名: {CiteKey}_Lens.md
            // 假设文献文件名即 CiteKey (如 @Smith2020.md)
            // 最终文件名: @Smith2020_Lens.md
            const lensFileName = `${litFile.basename}_Lens.md`;
            const lensFilePath = `${targetDirPath}/${lensFileName}`;

            // 检查文件是否存在
            const existingFile = this.app.vault.getAbstractFileByPath(lensFilePath);
            if (existingFile instanceof TFile) {
                new Notice(`⚠️ Lens Note already exists: ${lensFileName}`);
                // 如果已存在，直接打开它
                this.app.workspace.getLeaf().openFile(existingFile);
                return;
            }

            // 3. 构造内容 (ABC 框架模板)
            // 这里使用了硬编码的模板来保证开箱即用，并在 YAML 中自动注入了双链
            const content = `---
tags:
  - type/lens
project: "[[${projectFolder.name}]]"
source: "[[${litFile.basename}]]"
created: ${new Date().toISOString().split('T')[0]}
---

# ${litFile.basename} (Lens)

## A. Phenomenon (案例文本/研究对象)
> 

## B. Mechanism (理论对话/因果机制)
> 

## C. Significance (理论缺憾/研究意义)
> 

---
**Backlinks**: [[${litFile.basename}]]
`;

            // 4. 创建并打开
            const newFile = await this.app.vault.create(lensFilePath, content);
            this.app.workspace.getLeaf().openFile(newFile);

            new Notice(`✅ Created Lens Note: ${lensFileName}`);

        } catch (error) {
            console.error("Failed to create lens note", error);
            new Notice("❌ Failed to create Lens Note. Check console.");
        }
    }
}
