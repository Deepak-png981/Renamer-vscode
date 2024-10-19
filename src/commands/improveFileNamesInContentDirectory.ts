import * as vscode from 'vscode';
import * as path from 'path';
import { renameFile } from '../utils/fileOperations';
import { supportedFileTypes } from './supportedFileTypes';
import * as fs from 'fs';
import { renameFileViaApi } from '../api/renamerApi';
import { RenameDirPayload } from '../types';

export const improveFileNamesInContentDirectory = async () => {
    const folderUri = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        openLabel: 'Select Content Directory'
    });

    if (!folderUri || folderUri.length === 0) {
        vscode.window.showErrorMessage('No folder selected.');
        return;
    }

    const directoryPath = folderUri[0].fsPath;

    const files = fs.readdirSync(directoryPath).filter(file => supportedFileTypes.includes(path.extname(file)));
    if (files.length === 0) {
        vscode.window.showInformationMessage('No supported files in the selected directory.');
        return;
    }

    const fileDetails = files.map(fileName => {
        const filePath = path.join(directoryPath, fileName);
        const content = fs.readFileSync(filePath, 'utf-8');
        return { fileName, content };
    });    

    const contentDirectory: RenameDirPayload = { contentDirectory: { files: fileDetails } };


    const config = vscode.workspace.getConfiguration('renameit');
    const namingConvention = config.get<string>('namingConvention', 'camelCase');

    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: "Improving file names in directory...",
            cancellable: false
        }, async (progress) => {

            try {
                const data = await renameFileViaApi(contentDirectory, namingConvention , true);
                const renamedFiles = data.renamedFiles;

                for (const oldFileName in renamedFiles) {
                    const suggestedName = renamedFiles[oldFileName].suggested_name;
                    const newFileName = path.basename(suggestedName);
                    const oldFilePath = path.join(directoryPath, oldFileName);

                    if (suggestedName !== oldFileName) {
                        await renameFile(oldFilePath, newFileName);
                    }
                }

                vscode.window.showInformationMessage(`File renaming in directory complete.`);
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
