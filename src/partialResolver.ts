import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const CSHTML_EXT = '.cshtml';

export async function resolvePartialUri(
    partialName: string,
    currentFileUri: vscode.Uri,
    workspaceRoot: string
): Promise<vscode.Uri | null> {
    if (isTildePath(partialName)) {
        return resolveTildePath(partialName, workspaceRoot);
    }
    return resolveByConvention(partialName, currentFileUri, workspaceRoot);
}

function isTildePath(name: string): boolean {
    return name.startsWith('~/') || name.startsWith('~\\');
}

async function resolveTildePath(name: string, workspaceRoot: string): Promise<vscode.Uri | null> {
    const relative = name.slice(2).replace(/\//g, path.sep);
    const candidates = [
        path.join(workspaceRoot, relative),
        path.join(workspaceRoot, ensureCshtml(relative)),
    ];
    return firstExisting(candidates);
}

async function resolveByConvention(
    name: string,
    currentFileUri: vscode.Uri,
    workspaceRoot: string
): Promise<vscode.Uri | null> {
    const currentDir = path.dirname(currentFileUri.fsPath);
    const projectRoot = detectProjectRoot(currentFileUri.fsPath, workspaceRoot);
    const areaShared = detectAreaSharedPath(currentFileUri.fsPath, projectRoot);

    const searchDirs: string[] = [
        currentDir,
        path.join(projectRoot, 'Views', 'Shared'),
        path.join(projectRoot, 'Views', 'Partials'),
        path.join(projectRoot, 'Pages', 'Shared'),
    ];

    if (projectRoot !== workspaceRoot) {
        searchDirs.push(
            path.join(workspaceRoot, 'Views', 'Shared'),
            path.join(workspaceRoot, 'Views', 'Partials'),
            path.join(workspaceRoot, 'Pages', 'Shared')
        );
    }

    if (areaShared) {
        searchDirs.push(areaShared);
    }

    const candidates: string[] = [];
    for (const dir of searchDirs) {
        candidates.push(path.join(dir, name));
        candidates.push(path.join(dir, ensureCshtml(name)));
    }

    return firstExisting(candidates);
}

function detectProjectRoot(currentFilePath: string, workspaceRoot: string): string {
    let dir = path.dirname(currentFilePath);
    while (dir.length >= workspaceRoot.length) {
        if (
            fs.existsSync(path.join(dir, 'Views')) ||
            fs.existsSync(path.join(dir, 'Pages')) ||
            fs.existsSync(path.join(dir, 'wwwroot'))
        ) {
            return dir;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            break;
        }
        dir = parent;
    }
    return workspaceRoot;
}

function detectAreaSharedPath(currentFilePath: string, workspaceRoot: string): string | null {
    const normalized = currentFilePath.replace(/\\/g, '/');
    const areasIndex = normalized.toLowerCase().indexOf('/areas/');
    if (areasIndex === -1) {
        return null;
    }
    const afterAreas = normalized.slice(areasIndex + '/areas/'.length);
    const slashAfterName = afterAreas.indexOf('/');
    if (slashAfterName === -1) {
        return null;
    }
    const areaName = afterAreas.slice(0, slashAfterName);
    return path.join(workspaceRoot, 'Areas', areaName, 'Views', 'Shared');
}

function ensureCshtml(name: string): string {
    return name.endsWith(CSHTML_EXT) ? name : name + CSHTML_EXT;
}

async function firstExisting(candidates: string[]): Promise<vscode.Uri | null> {
    for (const candidate of candidates) {
        const uri = vscode.Uri.file(candidate);
        try {
            await vscode.workspace.fs.stat(uri);
            return uri;
        } catch {
            // not found, try next
        }
    }
    return null;
}

export function getWorkspaceRoot(fileUri: vscode.Uri): string | null {
    const folder = vscode.workspace.getWorkspaceFolder(fileUri);
    if (folder) {
        return folder.uri.fsPath;
    }
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return null;
}
