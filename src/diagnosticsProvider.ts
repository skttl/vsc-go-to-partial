import * as vscode from 'vscode';
import { parseAllPartialReferences } from './partialParser';
import { resolvePartialUri, getWorkspaceRoot } from './partialResolver';

const DIAGNOSTIC_SOURCE = 'go-to-partial';

export class PartialDiagnosticsProvider {
    private readonly collection: vscode.DiagnosticCollection;

    constructor() {
        this.collection = vscode.languages.createDiagnosticCollection(DIAGNOSTIC_SOURCE);
    }

    async validateDocument(document: vscode.TextDocument): Promise<void> {
        if (!isCshtml(document)) {
            return;
        }

        const config = vscode.workspace.getConfiguration('goToPartial');
        const additionalAttributes = config.get<string[]>('additionalTagHelperAttributes', []);
        const additionalTagNames = config.get<string[]>('additionalPartialTagNames', []);

        const workspaceRoot = getWorkspaceRoot(document.uri);
        if (!workspaceRoot) {
            return;
        }

        const refs = parseAllPartialReferences(document, additionalAttributes, additionalTagNames);
        const diagnostics: vscode.Diagnostic[] = [];

        await Promise.all(
            refs.map(async ref => {
                const resolved = await resolvePartialUri(ref.name, document.uri, workspaceRoot);
                if (!resolved) {
                    const diagnostic = new vscode.Diagnostic(
                        ref.range,
                        `Partial view "${ref.name}" could not be found.`,
                        vscode.DiagnosticSeverity.Warning
                    );
                    diagnostic.source = DIAGNOSTIC_SOURCE;
                    diagnostics.push(diagnostic);
                }
            })
        );

        this.collection.set(document.uri, diagnostics);
    }

    clearDocument(document: vscode.TextDocument): void {
        this.collection.delete(document.uri);
    }

    dispose(): void {
        this.collection.dispose();
    }
}

function isCshtml(document: vscode.TextDocument): boolean {
    return (
        document.languageId === 'razor' ||
        document.languageId === 'aspnetcorerazor' ||
        document.fileName.endsWith('.cshtml')
    );
}
