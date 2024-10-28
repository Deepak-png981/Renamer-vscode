import * as vscode from 'vscode';
import * as path from 'path';
import { renameFile } from '../utils/fileOperations';
import { improveFileNameCommand } from '../commands/improveFileName';
export const promptUserForFileRename = async (currentFilePath: string, originalFileName: string, suggestedName: string): Promise<void> => {
    const fileExtension = path.extname(originalFileName);
    const finalSuggestedName = path.extname(suggestedName) !== fileExtension
        ? suggestedName + fileExtension
        : suggestedName;

    if (finalSuggestedName === originalFileName) {
        vscode.window.showInformationMessage('File name is already correct.');
        return;
    }

    const result = await vscode.window.showInformationMessage(
        `Current file name: ${originalFileName}\nSuggested file name: ${finalSuggestedName}`,
        { modal: true },
        {
            title: "✅ Accept Suggestion",
            isCloseAffordance: false
        },
        {
            title: "🔄 Retry",
            isCloseAffordance: false
        },
        {
            title: "❌ Deny",
            isCloseAffordance: true
        }
    );

    if (result?.title === '✅ Accept Suggestion') {
        await renameFile(currentFilePath, finalSuggestedName);
        vscode.window.showInformationMessage(`File renamed to ${finalSuggestedName}`);
    } else if (result?.title === '🔄 Retry') {
        improveFileNameCommand();
    } else {
        vscode.window.showInformationMessage('File renaming cancelled.');
    }
};
