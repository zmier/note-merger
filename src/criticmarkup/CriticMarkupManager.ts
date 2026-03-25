import { Plugin } from 'obsidian';
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
    }
}
