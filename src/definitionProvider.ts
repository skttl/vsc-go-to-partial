import * as vscode from 'vscode';
import { parsePartialReferenceAtPosition } from './partialParser';
import { resolvePartialUri, getWorkspaceRoot } from './partialResolver';

export class PartialDefinitionProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Definition | null> {
        const config = vscode.workspace.getConfiguration('goToPartial');
        const additionalAttributes = config.get<string[]>('additionalTagHelperAttributes', []);
        const additionalTagNames = config.get<string[]>('additionalPartialTagNames', []);

        const ref = parsePartialReferenceAtPosition(document, position, additionalAttributes, additionalTagNames);
        if (!ref) {
            return null;
        }

        const workspaceRoot = getWorkspaceRoot(document.uri);
        if (!workspaceRoot) {
            vscode.window.showErrorMessage('Go To Partial: no workspace folder found.');
            return null;
        }

        const resolved = await resolvePartialUri(ref.name, document.uri, workspaceRoot);
        if (!resolved) {
            vscode.window.showErrorMessage(
                `Go To Partial: could not resolve "${ref.name}". File not found in any search path.`
            );
            return null;
        }

        return new vscode.Location(resolved, new vscode.Position(0, 0));
    }
}
