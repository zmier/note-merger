import { Plugin } from 'obsidian';
import { applyCriticMarkupShortcut, CriticShortcutKind } from './commands';
import { createCriticMarkupEditorExtension } from './editor-extension';
import { renderCriticMarkupInElement } from './renderer';

export class CriticMarkupManager {
    plugin: Plugin;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    register() {
        this.plugin.registerMarkdownPostProcessor((element) => {
            renderCriticMarkupInElement(element);
        });

        this.plugin.registerEditorExtension(
            createCriticMarkupEditorExtension()
        );

        this.registerCommands();
    }

    private registerCommands() {
        this.registerShortcutCommand(
            'criticmarkup-insert-addition',
            'CriticMarkup: Insert Addition',
            'addition'
        );
        this.registerShortcutCommand(
            'criticmarkup-insert-deletion',
            'CriticMarkup: Insert Deletion',
            'deletion'
        );
        this.registerShortcutCommand(
            'criticmarkup-insert-highlight',
            'CriticMarkup: Insert Highlight',
            'highlight'
        );
        this.registerShortcutCommand(
            'criticmarkup-insert-comment',
            'CriticMarkup: Insert Comment',
            'comment'
        );
        this.registerShortcutCommand(
            'criticmarkup-insert-substitution',
            'CriticMarkup: Insert Substitution',
            'substitution'
        );
    }

    private registerShortcutCommand(id: string, name: string, kind: CriticShortcutKind) {
        this.plugin.addCommand({
            id,
            name,
            editorCallback: (editor) => {
                applyCriticMarkupShortcut(editor, kind);
            }
        });
    }
}
