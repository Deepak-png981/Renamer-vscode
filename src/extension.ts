import * as vscode from 'vscode';
import { improveFileNameCommand } from './commands/improveFileName';
import { improveFileNamesInContentDirectory } from './commands/improveFileNamesInContentDirectory';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('renamer.improveFileName', improveFileNameCommand);
    const disposableDir = vscode.commands.registerCommand('renamer.improveContentDirectoryFileNames', improveFileNamesInContentDirectory);
    context.subscriptions.push(disposable);
}

export function deactivate() {}
