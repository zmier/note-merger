import { App, MarkdownView, WorkspaceLeaf, debounce } from 'obsidian';
import { NoteMergerSettings } from '../settings';

export class ScrollbarMarkerManager {
    app: App;
    settings: NoteMergerSettings;
    
    // 存储每个 Leaf 对应的 ResizeObserver，用于清理
    private observers: WeakMap<WorkspaceLeaf, ResizeObserver> = new WeakMap();

    constructor(app: App, settings: NoteMergerSettings) {
        this.app = app;
        this.settings = settings;
    }

    // 更新设置
    updateSettings(settings: NoteMergerSettings) {
        this.settings = settings;
        this.refreshActiveLeaf();
    }

    // 主要入口
    refreshActiveLeaf() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
            this.updateMarkers(view);
        }
    }

    // 核心绘制逻辑
    updateMarkers(view: MarkdownView) {
        if (!this.settings.enableScrollbarMarkers) {
            this.clearMarkers(view);
            return;
        }

        const editor = view.editor;
        const content = editor.getValue();
        const lineCount = editor.lineCount();

        // 1. 准备容器
        // 我们需要找到 .cm-scroller 或 view.contentEl，在其内部追加一个绝对定位的层
        // Obsidian 的编辑器结构通常是 .cm-editor -> .cm-scroller -> .cm-content
        // 我们要把标记层放在 .cm-editor 这一级，覆盖在右侧
        
        // @ts-ignore: 访问内部 dom 结构
        const editorContainer = view.contentEl.querySelector('.cm-editor');
        if (!editorContainer) return;

        let markerContainer = editorContainer.querySelector('.plugin-scrollbar-marks') as HTMLElement;
        
        if (!markerContainer) {
            markerContainer = document.createElement('div');
            markerContainer.addClass('plugin-scrollbar-marks');
            // 样式注入 (建议放在 CSS 文件中，这里为了单文件演示直接写内联)
            markerContainer.setAttribute('style', `
                position: absolute;
                top: 0;
                bottom: 0;
                right: 0;
                width: 12px;
                z-index: 100;
                pointer-events: none; /* 让鼠标事件穿透容器，只响应子元素的点击 */
            `);
            editorContainer.appendChild(markerContainer);
        } else {
            markerContainer.empty(); // 清空旧点
        }

        // 2. 正则匹配
        // 匹配 > [!TYPE] 格式
        const regex = /^>\s*\[!([a-zA-Z0-9_-]+)\]/gm;
        let match;

        // 注意：正则在全文匹配效率尚可，如果文件极大(几万行)可能需要优化
        // 为了获取行号，我们不能只用 content.match，需要知道位置
        // 更简单的方法是按行遍历，或者使用 index 计算行号
        
        // 这里采用按行扫描，因为我们需要精确的行号跳转
        // 对于极大的文档，debounce 是必须的
        
        // 优化策略：直接用正则搜全文，得到 index，然后用 editor.offsetToPos(index) 转行号
        // 这比 split('\n') 遍历要快
        while ((match = regex.exec(content)) !== null) {
            const type = match[1]; // T, Q, etc.
            const matchIndex = match.index;
            const pos = editor.offsetToPos(matchIndex);
            const line = pos.line;

            // 3. 计算颜色
            const config = this.settings.markerConfig.find(c => c.pattern === type);
            const color = config ? config.color : this.settings.markerDefaultColor;

            // 4. 计算位置 (百分比)
            // 既然是滚动条映射，我们使用 top: (line / totalLines)%
            const topPercent = (line / lineCount) * 100;

            // 5. 创建标记点
            const dot = document.createElement('div');
            dot.setAttribute('style', `
                position: absolute;
                top: ${topPercent}%;
                right: 2px;
                width: 8px;
                height: 4px; /* 扁平一点像代码缩略图 */
                background-color: ${color};
                border-radius: 2px;
                cursor: pointer;
                pointer-events: auto; /* 恢复点击响应 */
                opacity: 0.8;
                transition: transform 0.1s;
            `);
            
            // 悬停放大效果
            dot.onmouseenter = () => { dot.style.transform = 'scaleX(1.5)'; dot.style.opacity = '1'; };
            dot.onmouseleave = () => { dot.style.transform = 'scaleX(1)'; dot.style.opacity = '0.8'; };
            
            // 点击跳转
            dot.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 跳转并居中
                editor.setCursor(line, 0);
                
                // 计算滚动位置，让目标行垂直居中
                // 这里调用 obsidian 内部 api 尽量滚动到中间
                // @ts-ignore
                editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true); 
            };
            
            // 简单的 Tooltip
            dot.setAttribute('title', `Line ${line + 1}: [!${type}]`);

            markerContainer.appendChild(dot);
        }
    }

    clearMarkers(view: MarkdownView) {
        const editorContainer = view.contentEl.querySelector('.cm-editor');
        if (editorContainer) {
            const container = editorContainer.querySelector('.plugin-scrollbar-marks');
            if (container) container.remove();
        }
    }
}
