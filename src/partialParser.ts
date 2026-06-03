import * as vscode from 'vscode';

export interface PartialReference {
    name: string;
    range: vscode.Range;
}

const CSHARP_HELPER_PATTERN =
    /@(?:await\s+)?Html\.(?:Partial|PartialAsync|RenderPartial|RenderPartialAsync)\s*\(\s*["']([^"']+)["']/g;

const PARTIAL_TAG_PATTERN =
    /<partial\b[^>]*\bname\s*=\s*["']([^"']+)["'][^>]*>/gi;

function buildCustomAttributePattern(attributes: string[]): RegExp | null {
    if (attributes.length === 0) {
        return null;
    }
    const escaped = attributes.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const attrAlternation = escaped.join('|');
    return new RegExp(`<[^>]+\\b(?:${attrAlternation})\\s*=\\s*["']([^"']+)["'][^>]*>`, 'gi');
}

function buildCustomTagNamePattern(tagNames: string[]): RegExp | null {
    if (tagNames.length === 0) {
        return null;
    }
    const escaped = tagNames.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const tagAlternation = escaped.join('|');
    return new RegExp(`<(?:${tagAlternation})\\b[^>]*\\bname\\s*=\\s*["']([^"']+)["'][^>]*>`, 'gi');
}

export function parseAllPartialReferences(
    document: vscode.TextDocument,
    additionalAttributes: string[],
    additionalTagNames: string[]
): PartialReference[] {
    const text = document.getText();
    const results: PartialReference[] = [];

    const patterns: RegExp[] = [CSHARP_HELPER_PATTERN, PARTIAL_TAG_PATTERN];
    const customAttrPattern = buildCustomAttributePattern(additionalAttributes);
    if (customAttrPattern) {
        patterns.push(customAttrPattern);
    }
    const customTagPattern = buildCustomTagNamePattern(additionalTagNames);
    if (customTagPattern) {
        patterns.push(customTagPattern);
    }

    for (const pattern of patterns) {
        pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(text)) !== null) {
            const name = match[1];
            const matchStart = match.index + match[0].lastIndexOf(name);
            const startPos = document.positionAt(matchStart);
            const endPos = document.positionAt(matchStart + name.length);
            results.push({ name, range: new vscode.Range(startPos, endPos) });
        }
    }

    return results;
}

export function parsePartialReferenceAtPosition(
    document: vscode.TextDocument,
    position: vscode.Position,
    additionalAttributes: string[],
    additionalTagNames: string[]
): PartialReference | null {
    const all = parseAllPartialReferences(document, additionalAttributes, additionalTagNames);
    return all.find(ref => ref.range.contains(position)) ?? null;
}
