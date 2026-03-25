import { CriticToken, hasCriticMarkup, parseCriticMarkup } from './parser';

const SKIP_SELECTOR = 'code, pre, script, style, textarea, .math, .note-merger-critic';

export function createCriticTokenElement(token: CriticToken): HTMLElement {
    switch (token.type) {
        case 'addition':
            return createSimpleTokenElement('addition', token.text);
        case 'deletion':
            return createSimpleTokenElement('deletion', token.text);
        case 'highlight':
            return createSimpleTokenElement('highlight', token.text);
        case 'comment':
            return createCommentElement(token.text);
        case 'substitution':
            return createSubstitutionElement(token.oldText, token.newText);
    }
}

export function renderCriticMarkupInElement(root: HTMLElement): void {
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                const textNode = node as Text;
                const value = textNode.nodeValue;
                const parent = textNode.parentElement;

                if (!value || !parent) return NodeFilter.FILTER_REJECT;
                if (!hasCriticMarkup(value)) return NodeFilter.FILTER_REJECT;
                if (parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;

                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    const textNodes: Text[] = [];
    let currentNode: Node | null = walker.nextNode();

    while (currentNode) {
        textNodes.push(currentNode as Text);
        currentNode = walker.nextNode();
    }

    for (const textNode of textNodes) {
        const fragment = renderCriticMarkupText(textNode.nodeValue || '');
        if (!fragment) continue;
        textNode.replaceWith(fragment);
    }
}

export function renderCriticMarkupText(text: string): DocumentFragment | null {
    const parts = parseCriticMarkup(text);
    const hasToken = parts.some(part => part.type === 'token');

    if (!hasToken) {
        return null;
    }

    const fragment = document.createDocumentFragment();

    for (const part of parts) {
        if (part.type === 'text') {
            fragment.appendChild(document.createTextNode(part.text));
            continue;
        }

        fragment.appendChild(createCriticTokenElement(part.token));
    }

    return fragment;
}

function createSimpleTokenElement(kind: 'addition' | 'deletion' | 'highlight', text: string): HTMLElement {
    const el = document.createElement('span');
    el.addClass('note-merger-critic', `note-merger-critic-${kind}`);
    el.setAttribute('data-critic-type', kind);
    el.textContent = text;
    return el;
}

function createCommentElement(text: string): HTMLElement {
    const wrapper = document.createElement('span');
    wrapper.addClass('note-merger-critic', 'note-merger-critic-comment');
    wrapper.setAttribute('data-critic-type', 'comment');

    const badge = document.createElement('span');
    badge.addClass('note-merger-critic-comment-badge');
    badge.textContent = '注';

    const body = document.createElement('span');
    body.addClass('note-merger-critic-comment-text');
    body.textContent = text;

    wrapper.appendChild(badge);
    wrapper.appendChild(body);
    return wrapper;
}

function createSubstitutionElement(oldText: string, newText: string): HTMLElement {
    const wrapper = document.createElement('span');
    wrapper.addClass('note-merger-critic', 'note-merger-critic-substitution');
    wrapper.setAttribute('data-critic-type', 'substitution');

    const oldEl = document.createElement('span');
    oldEl.addClass('note-merger-critic-sub-old');
    oldEl.textContent = oldText;

    const arrow = document.createElement('span');
    arrow.addClass('note-merger-critic-sub-arrow');
    arrow.textContent = '→';

    const newEl = document.createElement('span');
    newEl.addClass('note-merger-critic-sub-new');
    newEl.textContent = newText;

    wrapper.appendChild(oldEl);
    wrapper.appendChild(arrow);
    wrapper.appendChild(newEl);
    return wrapper;
}
