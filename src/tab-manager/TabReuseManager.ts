import { App, TFile, WorkspaceLeaf } from 'obsidian';
import { NoteMergerSettings } from '../settings';

export class TabReuseManager {
    app: App;
    settings: NoteMergerSettings;

    constructor(app: App, settings: NoteMergerSettings) {
        this.app = app;
        this.settings = settings;
    }

    // 核心处理函数：绑定到全局点击事件
    handleFileClick = (evt: MouseEvent) => {
        if (!this.settings.enableTabReuse) return;

        // 1. 检查是否按下了修饰键 (Ctrl/Cmd/Shift)，如果是，说明用户想强制新开，放行
        if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey) return;

        const target = evt.target as HTMLElement;

        // 2. 检查点击目标是否是文件列表中的项
        // Obsidian 的文件浏览器项通常有 class "nav-file-title"
        const fileEl = target.closest('.nav-file-title');
        if (!fileEl) return;

        // 3. 获取文件路径
        // data-path 是 obsidian 文件列表的标准属性
        const filePath = fileEl.getAttribute('data-path');
        if (!filePath) return;

        // 4. 查找该文件是否已经打开
        // getLeavesOfType('markdown') 获取所有 markdown 视图
        const leaves = this.app.workspace.getLeavesOfType('markdown');
        
        // 找到第一个已经打开该文件的 tab
        const existingLeaf = leaves.find(leaf => {
            // @ts-ignore: leaf.view.file 是存在的
            const leafFile = leaf.view.file; 
            return leafFile && leafFile.path === filePath;
        });

        // 5. 如果找到了，且不是当前激活的 Tab
        if (existingLeaf) {
            const activeLeaf = this.app.workspace.getLeaf();
            
            // 如果已经是当前 Tab，Obsidian 默认行为就是什么都不做，这没问题
            // 但如果是在另一个 Tab...
            if (existingLeaf !== activeLeaf) {
                // 🛑 阻止默认事件 (阻止 Obsidian 在当前 Tab 打开文件)
                evt.preventDefault();
                evt.stopPropagation();

                // ▶️ 激活旧 Tab
                this.app.workspace.setActiveLeaf(existingLeaf, { focus: true });
                
                // 如果在同一个 Split 组里可能只是切换 Tab，
                // 如果在侧边或分割窗口，焦点会跳过去
            }
        }
    };
}
