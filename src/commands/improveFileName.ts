import * as vscode from 'vscode';
import * as path from 'path';
import { renameFileViaApi } from '../api/renamerApi';
import { renameFile } from '../utils/fileOperations';
import { supportedFileTypes } from './supportedFileTypes';

export const improveFileNameCommand = async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No file is currently open.');
        return;
    }

    const document = editor.document;
    const currentFilePath = document.fileName;
    const fileName = path.basename(currentFilePath);
    const fileContent = document.getText();
    const fileExtension = path.extname(fileName);

    const config = vscode.workspace.getConfiguration('renameit');
    const namingConvention = config.get<string>('namingConvention', 'camelCase');

    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: "Renaming file...",
            cancellable: false
        }, async (progress) => {

            try {
                if(supportedFileTypes.includes(fileExtension)) {
                const data = await renameFileViaApi({fileName, fileContent}, namingConvention);
                const initialSuggestedName = data.renamedFiles[fileName].suggested_name;

                const suggestedName = path.extname(initialSuggestedName) !== fileExtension
                    ? initialSuggestedName + fileExtension
                    : initialSuggestedName;
                
                if(suggestedName === fileName){
                    vscode.window.showInformationMessage('File name is already correct.');
                    return;
                }

                const result = await vscode.window.showInformationMessage(
                    `Current file name: ${fileName}\nSuggested file name: ${suggestedName}`,
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
                    await renameFile(currentFilePath, suggestedName);
                } else if (result?.title === '🔄 Retry') {
                    improveFileNameCommand();
                } else {
                    vscode.window.showInformationMessage('File renaming cancelled.');
                }
            }else{
                vscode.window.showInformationMessage('File type not supported.');
            }
            } catch (error: any) {
                if (error.response && error.response.status === 429) {
                    vscode.window.showErrorMessage("Too many requests. Please try again later.");
                } else {
                    vscode.window.showErrorMessage(error.message || 'An unknown error occurred.');
                }
            }

        });
    } catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(error.message);
        } else {
            vscode.window.showErrorMessage('An unknown error occurred.');
        }
    }
};
