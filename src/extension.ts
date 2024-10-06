import * as vscode from 'vscode';
import { improveFileNameCommand } from './commands/improveFileName';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('renamer.improveFileName', improveFileNameCommand);
    context.subscriptions.push(disposable);
}

export function deactivate() {}
