export type CriticTokenType =
    | 'addition'
    | 'deletion'
    | 'substitution'
    | 'highlight'
    | 'comment';

export interface CriticTokenBase {
    type: CriticTokenType;
    raw: string;
    start: number;
    end: number;
}

export interface AdditionToken extends CriticTokenBase {
    type: 'addition';
    text: string;
}

export interface DeletionToken extends CriticTokenBase {
    type: 'deletion';
    text: string;
}

export interface HighlightToken extends CriticTokenBase {
    type: 'highlight';
    text: string;
}

export interface CommentToken extends CriticTokenBase {
    type: 'comment';
    text: string;
}

export interface SubstitutionToken extends CriticTokenBase {
    type: 'substitution';
    oldText: string;
    newText: string;
}

export type CriticToken =
    | AdditionToken
    | DeletionToken
    | HighlightToken
    | CommentToken
    | SubstitutionToken;

export type CriticPart =
    | { type: 'text'; text: string }
    | { type: 'token'; token: CriticToken };

const CRITICMARKUP_PATTERN = /\{\+\+|\{--|\{~~|\{==|\{>>/;

export function hasCriticMarkup(text: string): boolean {
    return CRITICMARKUP_PATTERN.test(text);
}

export function extractCriticTokens(text: string): CriticToken[] {
    return parseCriticMarkup(text)
        .filter((part): part is { type: 'token'; token: CriticToken } => part.type === 'token')
        .map(part => part.token);
}

export function parseCriticMarkup(text: string): CriticPart[] {
    const parts: CriticPart[] = [];
    let cursor = 0;
    let buffer = '';

    const pushBuffer = () => {
        if (!buffer) return;
        parts.push({ type: 'text', text: buffer });
        buffer = '';
    };

    while (cursor < text.length) {
        const token = parseTokenAt(text, cursor);

        if (!token) {
            buffer += text[cursor];
            cursor += 1;
            continue;
        }

        pushBuffer();
        parts.push({ type: 'token', token });
        cursor = token.end;
    }

    pushBuffer();
    return parts;
}

function parseTokenAt(text: string, start: number): CriticToken | null {
    if (text.startsWith('{++', start)) {
        return parseSimpleToken(text, start, '++}', 'addition');
    }

    if (text.startsWith('{--', start)) {
        return parseSimpleToken(text, start, '--}', 'deletion');
    }

    if (text.startsWith('{==', start)) {
        return parseSimpleToken(text, start, '==}', 'highlight');
    }

    if (text.startsWith('{>>', start)) {
        return parseSimpleToken(text, start, '<<}', 'comment');
    }

    if (text.startsWith('{~~', start)) {
        const closeIndex = text.indexOf('~~}', start + 3);
        if (closeIndex === -1) return null;

        const content = text.slice(start + 3, closeIndex);
        const separatorIndex = content.indexOf('~>');
        if (separatorIndex === -1) return null;

        return {
            type: 'substitution',
            raw: text.slice(start, closeIndex + 3),
            oldText: content.slice(0, separatorIndex),
            newText: content.slice(separatorIndex + 2),
            start,
            end: closeIndex + 3
        };
    }

    return null;
}

function parseSimpleToken(
    text: string,
    start: number,
    closeMarker: string,
    type: 'addition' | 'deletion' | 'highlight' | 'comment'
): CriticToken | null {
    const closeIndex = text.indexOf(closeMarker, start + 3);
    if (closeIndex === -1) return null;

    const content = text.slice(start + 3, closeIndex);
    const raw = text.slice(start, closeIndex + closeMarker.length);
    const base = {
        raw,
        start,
        end: closeIndex + closeMarker.length
    };

    switch (type) {
        case 'addition':
            return { type, text: content, ...base };
        case 'deletion':
            return { type, text: content, ...base };
        case 'highlight':
            return { type, text: content, ...base };
        case 'comment':
            return { type, text: content, ...base };
    }
}
