import { Editor } from 'obsidian';

export type CriticShortcutKind =
    | 'addition'
    | 'deletion'
    | 'highlight'
    | 'comment'
    | 'substitution';

interface TemplateSpec {
    before: string;
    after: string;
    emptyText: string;
    noSelectionCursorOffset?: number;
    selectedTextCursorMode?: 'inside-end' | 'after-selection';
}

const TEMPLATE_SPECS: Record<CriticShortcutKind, TemplateSpec> = {
    addition: {
        before: '{++',
        after: '++}',
        emptyText: '',
        noSelectionCursorOffset: 3,
        selectedTextCursorMode: 'inside-end'
    },
    deletion: {
        before: '{--',
        after: '--}',
        emptyText: '',
        noSelectionCursorOffset: 3,
        selectedTextCursorMode: 'inside-end'
    },
    highlight: {
        before: '{==',
        after: '==}',
        emptyText: '',
        noSelectionCursorOffset: 3,
        selectedTextCursorMode: 'inside-end'
    },
    comment: {
        before: '{>>',
        after: '<<}',
        emptyText: '',
        noSelectionCursorOffset: 3,
        selectedTextCursorMode: 'inside-end'
    },
    substitution: {
        before: '{~~',
        after: '~~}',
        emptyText: '~>',
        noSelectionCursorOffset: 3,
        selectedTextCursorMode: 'after-selection'
    }
};

export function applyCriticMarkupShortcut(editor: Editor, kind: CriticShortcutKind): void {
    const spec = TEMPLATE_SPECS[kind];
    const selection = editor.getSelection();
    const hasSelection = selection.length > 0;
    const anchor = editor.getCursor('from');
    const head = editor.getCursor('to');
    const startOffset = editor.posToOffset(anchor);

    if (!hasSelection) {
        const inserted = spec.before + spec.emptyText + spec.after;
        editor.replaceSelection(inserted);

        if (kind === 'substitution') {
            const from = editor.offsetToPos(startOffset + spec.before.length);
            const to = editor.offsetToPos(startOffset + spec.before.length);
            editor.setSelection(from, to);
        } else {
            const cursor = editor.offsetToPos(startOffset + (spec.noSelectionCursorOffset ?? spec.before.length));
            editor.setCursor(cursor);
        }

        editor.focus();
        return;
    }

    const inserted = spec.before + selection + spec.emptyText + spec.after;
    editor.replaceSelection(inserted);

    if (kind === 'substitution') {
        const cursor = editor.offsetToPos(startOffset + spec.before.length + selection.length + spec.emptyText.length);
        editor.setCursor(cursor);
    } else if (spec.selectedTextCursorMode === 'inside-end') {
        const cursor = editor.offsetToPos(startOffset + spec.before.length + selection.length);
        editor.setCursor(cursor);
    } else {
        editor.setCursor(head);
    }

    editor.focus();
}
