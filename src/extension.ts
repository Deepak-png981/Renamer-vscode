import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios'; // Assuming axios is installed for HTTP requests

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('renamer.improveFileName', async () => {
        // Get the current active text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No file is currently open.');
            return;
        }

        const document = editor.document;
        const currentFilePath = document.fileName; // Full file path
        const fileName = path.basename(currentFilePath); // Get the file name
        const fileContent = document.getText(); // Get the file content
        const fileExtension = path.extname(fileName); // Get the file extension

        // Prepare the data to send to the API
        const payload = {
            fileName: fileName,
            fileContent: fileContent,
            debug: "true"
        };

        // Function to handle the rename logic
        const handleRename = async () => {
            try {
                // Send the data to the API and get the response
                const response = await axios.post('https://renamer-app.vercel.app/api/runBinary', payload);
                const data = response.data;

                // Extract the suggested file name
                let suggestedName = data.renamedFiles[fileName].suggested_name;

                // Ensure the file doesn't get a double extension like '.md.md'
                if (path.extname(suggestedName) !== fileExtension) {
                    suggestedName += fileExtension;
                }

                // Show the prompt to the user
                const result = await vscode.window.showInformationMessage(
                    `Current file name: ${fileName}\nSuggested file name: ${suggestedName}`,
                    { modal: true },
                    'Accept', 'Deny', 'Retry'
                );

                if (result === 'Accept') {
                    // User accepted the new name
                    const newFilePath = path.join(path.dirname(currentFilePath), suggestedName);

                    // Rename the file
                    fs.rename(currentFilePath, newFilePath, (err) => {
                        if (err) {
                            vscode.window.showErrorMessage(`Error renaming file: ${err.message}`);
                        } else {
                            vscode.window.showInformationMessage(`File renamed to: ${suggestedName}`);
                        }
                    });
                } else if (result === 'Retry') {
                    // User requested a retry
                    handleRename(); // Retry the renaming process
                } else {
                    // User denied the rename, do nothing
                    vscode.window.showInformationMessage('File renaming cancelled.');
                }

            } catch (error) {
                vscode.window.showErrorMessage(`Error contacting API: ${error}`);
            }
        };

        // Start the renaming process
        handleRename();
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
