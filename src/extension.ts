import * as vscode from 'vscode';
import { PartialDefinitionProvider } from './definitionProvider';
import { PartialDiagnosticsProvider } from './diagnosticsProvider';

const DOCUMENT_SELECTOR: vscode.DocumentSelector = [
    { language: 'razor' },
    { language: 'aspnetcorerazor' },
];

export function activate(context: vscode.ExtensionContext): void {
    const definitionProvider = new PartialDefinitionProvider();
    const diagnosticsProvider = new PartialDiagnosticsProvider();

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(DOCUMENT_SELECTOR, definitionProvider)
    );

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((doc: vscode.TextDocument) =>
            diagnosticsProvider.validateDocument(doc)
        )
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) =>
            diagnosticsProvider.validateDocument(e.document)
        )
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument((doc: vscode.TextDocument) =>
            diagnosticsProvider.clearDocument(doc)
        )
    );

    context.subscriptions.push({
        dispose: () => diagnosticsProvider.dispose(),
    });

    vscode.workspace.textDocuments.forEach((doc: vscode.TextDocument) =>
        diagnosticsProvider.validateDocument(doc)
    );
}

export function deactivate(): void {
    // nothing to clean up — subscriptions handle disposal
}
