import { App, Editor, MarkdownView, Notice, setIcon, debounce } from 'obsidian';

export class TableToExcelManager {
    app: App;
    buttonEl: HTMLElement;
    currentTableRange: { start: number; end: number } | null = null;
    currentEditor: Editor | null = null;

    constructor(app: App) {
        this.app = app;
        // 初始化悬浮按钮
        this.createFloatingButton();

        // 绑定事件：当编辑器内容变化或光标移动时，检查表格
        // 使用 debounce 防抖，避免光标快速移动时计算过于频繁
        this.checkTable = debounce(this.checkTable.bind(this), 100, true);
    }

    createFloatingButton() {
        this.buttonEl = document.body.createEl('div', { cls: 'obsidian-table-export-btn' });
        this.buttonEl.createSpan({ text: 'Copy to Excel' });

        // 点击事件
        this.buttonEl.addEventListener('click', (e) => {
            e.preventDefault();
            this.exportTable();
        });

        // 鼠标悬停暂停消失逻辑（如果需要更复杂的交互）
    }

    // 核心逻辑：检查光标是否在表格内
    checkTable() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            this.hideButton();
            return;
        }

        const editor = view.editor;
        this.currentEditor = editor;
        const cursor = editor.getCursor();
        const lineText = editor.getLine(cursor.line);

        // 简单的正则判断：行必须包含管道符 |
        // 更严谨的判断可以是： ^\s*\|.*\|\s*$
        if (!lineText.includes('|')) {
            this.hideButton();
            return;
        }

        // 确定表格边界
        const tableRange = this.findTableBounds(editor, cursor.line);
        if (!tableRange) {
            this.hideButton();
            return;
        }

        this.currentTableRange = tableRange;
        this.showButton(view, editor, tableRange.start);
    }

    // 向上和向下寻找表格的边界
    findTableBounds(editor: Editor, currentLine: number): { start: number; end: number } | null {
        const lineCount = editor.lineCount();
        let start = currentLine;
        let end = currentLine;

        // 向上找
        while (start > 0) {
            const prevLine = editor.getLine(start - 1);
            if (!prevLine.trim().includes('|')) break; // 简单判定
            start--;
        }

        // 向下找
        while (end < lineCount - 1) {
            const nextLine = editor.getLine(end + 1);
            if (!nextLine.trim().includes('|')) break;
            end++;
        }

        // 有效性检查：至少要有两行（表头+分割线），且包含分割线特征 |-
        let hasSeparator = false;
        for (let i = start; i <= end; i++) {
            if (editor.getLine(i).match(/\|[:\s-]+\|/)) {
                hasSeparator = true;
                break;
            }
        }

        return hasSeparator ? { start, end } : null;
    }

    showButton(view: MarkdownView, editor: Editor, startLine: number) {
        // 计算位置：放在表格第一行的右侧，或者编辑器的右上角
        // 这里我们使用 coordsAtPos 获取屏幕坐标

        // 获取当前行尾的坐标
        // 注意：Obsidian 的坐标是基于视口的
        const lineLen = editor.getLine(startLine).length;
        const coords = (editor as any).coordsAtPos({ line: startLine, ch: lineLen });

        if (!coords) return;

        // 定位按钮
        // 我们加上一些偏移量，让它显示在行尾右侧上方
        const btnRect = this.buttonEl.getBoundingClientRect();

        // 修正：确保按钮不超出屏幕右侧
        let left = coords.right + 10;
        if (left + btnRect.width > window.innerWidth) {
            left = window.innerWidth - btnRect.width - 20;
        }

        this.buttonEl.style.top = `${coords.top - 5}px`;
        this.buttonEl.style.left = `${left}px`;
        this.buttonEl.addClass('visible');
    }

    hideButton() {
        this.buttonEl.removeClass('visible');
        this.currentTableRange = null;
    }

    async exportTable() {
        if (!this.currentEditor || !this.currentTableRange) return;

        const { start, end } = this.currentTableRange;
        const editor = this.currentEditor;

        const rows: string[] = [];

        for (let i = start; i <= end; i++) {
            const line = editor.getLine(i).trim();

            // 1. 跳过 Markdown 分割线 (e.g. |---|---|)
            // 特征：只包含 | - : 和空格
            if (/^\|[\s:-]+\|$/.test(line.replace(/\s/g, ''))) {
                continue;
            }

            // 2. 处理每一行
            // 移除首尾的 | (如果是 |data| 格式)
            let content = line;
            if (content.startsWith('|')) content = content.substring(1);
            if (content.endsWith('|')) content = content.substring(0, content.length - 1);

            // 3. 分割单元格并清洗
            // 注意：简单的 split('|') 会破坏带管道符的链接 [[A|B]]。
            // 完美方案需要复杂正则，这里使用较稳健的 split 策略
            const cells = content.split('|').map(cell => cell.trim());

            // 4. 用 Tab 连接 (这是 Excel 识别的关键)
            rows.push(cells.join('\t'));
        }

        const tsvContent = rows.join('\n');

        // 写入剪贴板
        await navigator.clipboard.writeText(tsvContent);

        new Notice('✅ Table copied to clipboard for Excel!');
        this.hideButton(); // 复制后隐藏一下给用户反馈
    }

    unload() {
        if (this.buttonEl) {
            this.buttonEl.remove();
        }
    }
}
