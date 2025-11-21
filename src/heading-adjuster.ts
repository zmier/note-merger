import { Editor } from 'obsidian';

/**
 * 调整编辑器中选中区域的标题级别
 * @param editor Obsidian 编辑器实例
 * @param delta 调整的级别数 (例如: 1 为降级/增加#, -1 为升级/减少#)
 */
export function adjustHeadingLevel(editor: Editor, delta: number): void {
    // 获取所有的光标/选区 (Obsidian 支持多光标，所以是列表)
    const selections = editor.listSelections();

    // 用一个 Set 记录已处理的行号，防止多光标在同一行时重复处理
    const processedLines = new Set<number>();

    // 按照行号排序，这是一个好习惯
    selections.sort((a, b) => a.anchor.line - b.anchor.line);

    for (const selection of selections) {
        // 确定选区的起始和结束行
        const startLine = Math.min(selection.anchor.line, selection.head.line);
        const endLine = Math.max(selection.anchor.line, selection.head.line);

        for (let i = startLine; i <= endLine; i++) {
            if (processedLines.has(i)) continue;
            processedLines.add(i);

            const lineContent = editor.getLine(i);

            // 正则解释:
            // ^(#{1,6})  -> 捕获行首的 1 到 6 个井号 (Group 1)
            // (\s+)      -> 捕获井号后的空格 (Group 2)
            // (.*)$      -> 捕获剩下的所有内容 (Group 3)
            const headingRegex = /^(#{1,6})(\s+)(.*)$/;
            const match = lineContent.match(headingRegex);

            if (match) {
                const currentHashes = match[1];
                const separator = match[2];
                const content = match[3];

                const currentLevel = currentHashes.length;
                let newLevel = currentLevel + delta;

                // 边界检查: 限制在 H1 (1) 到 H6 (6) 之间
                if (newLevel < 1) newLevel = 1;
                if (newLevel > 6) newLevel = 6;

                // 只有当级别真正改变时才修改，避免无意义的操作
                if (newLevel !== currentLevel) {
                    const newHashes = '#'.repeat(newLevel);
                    const newLineContent = `${newHashes}${separator}${content}`;
                    editor.setLine(i, newLineContent);
                }
            }
        }
    }
}
