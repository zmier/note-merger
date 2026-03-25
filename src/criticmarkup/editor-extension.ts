import { RangeSetBuilder, Extension } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { editorLivePreviewField } from 'obsidian';
import { CriticToken, extractCriticTokens } from './parser';
import { createCriticTokenElement } from './renderer';

export function createCriticMarkupEditorExtension(): Extension {
    return ViewPlugin.fromClass(class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = buildDecorations(view);
        }

        update(update: ViewUpdate) {
            if (
                update.docChanged ||
                update.selectionSet ||
                update.viewportChanged ||
                update.focusChanged
            ) {
                this.decorations = buildDecorations(update.view);
            }
        }
    }, {
        decorations: value => value.decorations
    });
}

class CriticMarkupWidget extends WidgetType {
    token: CriticToken;

    constructor(token: CriticToken) {
        super();
        this.token = token;
    }

    eq(other: CriticMarkupWidget): boolean {
        return other.token.raw === this.token.raw
            && other.token.start === this.token.start
            && other.token.end === this.token.end;
    }

    toDOM(view: EditorView): HTMLElement {
        const el = createCriticTokenElement(this.token);
        el.addClass('note-merger-critic-widget');
        el.setAttribute('title', 'Click to edit raw CriticMarkup');

        el.addEventListener('mousedown', (event) => {
            if (event.button !== 0) return;

            event.preventDefault();
            view.dispatch({
                selection: {
                    anchor: this.token.start,
                    head: this.token.end
                },
                scrollIntoView: true
            });
            view.focus();
        });

        return el;
    }

    ignoreEvent(): boolean {
        return false;
    }
}

function buildDecorations(view: EditorView): DecorationSet {
    if (!isLivePreview(view)) {
        return Decoration.none;
    }

    const builder = new RangeSetBuilder<Decoration>();
    const tokens = extractCriticTokens(view.state.doc.toString());

    for (const token of tokens) {
        if (intersectsSelection(view, token)) {
            continue;
        }

        builder.add(
            token.start,
            token.end,
            Decoration.replace({
                widget: new CriticMarkupWidget(token),
                inclusive: false
            })
        );
    }

    return builder.finish();
}

function isLivePreview(view: EditorView): boolean {
    try {
        return view.state.field(editorLivePreviewField);
    } catch {
        return false;
    }
}

function intersectsSelection(view: EditorView, token: CriticToken): boolean {
    return view.state.selection.ranges.some(range => {
        return range.from <= token.end && range.to >= token.start;
    });
}
