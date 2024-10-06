import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';

export const renameFile = async (currentFilePath: string, suggestedName: string) => {
    const newFilePath = path.join(path.dirname(currentFilePath), suggestedName);

    fs.rename(currentFilePath, newFilePath, (err) => {
        if (err) {
            vscode.window.showErrorMessage(`Error renaming file: ${err.message}`);
        } else {
            vscode.window.showInformationMessage(`File renamed to: ${suggestedName}`);
        }
    });
};
