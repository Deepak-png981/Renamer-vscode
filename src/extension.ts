import * as CircularJSON from 'circular-json';
import * as vscode from 'vscode';
import { improveFileNameCommand } from './commands/improveFileName';
import * as path from 'path';
import { renameFileViaApi } from './api/renamerApi';
import { renameFile } from './utils/fileOperations';
import { supportedFileTypes } from './commands/supportedFileTypes';
import { GitExtension, Repository } from './types/git';
import * as fs from 'fs';

const outputChannel = vscode.window.createOutputChannel('ReNameIt Logs');

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('renamer.improveFileName', improveFileNameCommand);
    context.subscriptions.push(disposable);

    outputChannel.appendLine('ReNameIt extension started...'); // Log to Output Panel
    vscode.window.showInformationMessage('ReNameIt extension started...');
    console.log('ReNameIt extension started...');

    // Get the Git extension
    const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');
    if (!gitExtension) {
        vscode.window.showErrorMessage('The built-in Git extension is not available.');
        console.log('The built-in Git extension is not available.');
        return;
    }

    // Ensure Git extension is activated
    if (!gitExtension.isActive) {
        gitExtension.activate().then(() => {
            vscode.window.showInformationMessage('Git extension activated.');
            console.log('Git extension activated.');
            handleGitRepositories();
        });
    } else {
        handleGitRepositories(); // Handle repositories if Git extension is already active
    }
}

async function handleGitRepositories() {
    const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;
    if (!gitExtension) {
        vscode.window.showErrorMessage('Unable to access the Git API.');
        console.log('Unable to access the Git API.');
        return;
    }

    const gitApi = gitExtension.getAPI(1);
    const repos = gitApi.repositories;
    if (gitApi.repositories.length === 0) {
        vscode.window.showErrorMessage('No Git repositories found.');
        console.log('No Git repositories found.');
        return;
    }
    // const changes = await repos[0].diffWithHEAD();
    const repo = repos[0];
    const changes: any = repo.state.workingTreeChanges.concat(repo.state.indexChanges);
    for (const change of changes) {
        const filePath = change.resourceUri.fsPath; 
        const diff = await repo.diffWithHEAD(filePath);  
        outputChannel.appendLine(`File: ${filePath}\nDiff:\n${diff}`);
    }

    // Detect repositories
    gitApi.repositories.forEach((repo) => {
        vscode.window.showInformationMessage(`Repo detected: ${repo.rootUri.fsPath}`);
        console.log(`Repo detected: ${repo.rootUri.fsPath}`);
        handleRepositoryStateChange(repo);
    });

    // Listen for newly opened repositories
    gitApi.onDidOpenRepository((repo) => {
        vscode.window.showInformationMessage(`Repo opened: ${repo.rootUri.fsPath}`);
        console.log(`Repo opened: ${repo.rootUri.fsPath}`);
        handleRepositoryStateChange(repo);
    });
}

function writeToFile(fileName: string, data: any) {
    const workspacePath = 'E:/Random Project/renamer-vscode-extension';
    
    const filePath = path.join(workspacePath, fileName);
    outputChannel.appendLine(`Writing to ${filePath}`);
    
    try {
        const filteredData = data;

        outputChannel.appendLine('Starting CircularJSON.stringify...');

        const jsonData = CircularJSON.stringify(filteredData, null, 2);
        
        outputChannel.appendLine('Finished CircularJSON.stringify.');

        fs.writeFile(filePath, jsonData, (err) => {
            if (err) {
                outputChannel.appendLine(`Error writing to ${filePath}: ${err.message}`);
            } else {
                outputChannel.appendLine(`Successfully wrote to ${filePath}`);
            }
        });
    } catch (error) {
        outputChannel.appendLine(`Error during JSON.stringify: ${error}`);
        vscode.window.showErrorMessage(`Error during JSON.stringify: ${error}`);
    }
}


async function handleRepositoryStateChange(repo: Repository) {
    const stagedFiles = repo.state.indexChanges;

    outputChannel.appendLine(`Number of staged files: ${stagedFiles.length}`);

    if (stagedFiles.length > 0) {
        writeToFile('stagedFiles.json', stagedFiles);

        await handleFileRenamingBeforeCommit(stagedFiles);
    } else {
        console.log('No staged files detected.');
        vscode.window.showInformationMessage('No staged files detected.');
    }
}

async function handleFileRenamingBeforeCommit(stagedFiles: any) {
    const config = vscode.workspace.getConfiguration('renameit');
    const namingConvention = config.get<string>('namingConvention', 'camelCase');

    for (const file of stagedFiles) {
        // Use file.resourceUri to get the file path
        const filePath = file.resourceUri.fsPath;
        const fileName = path.basename(filePath);
        const fileExtension = path.extname(fileName);

        
        vscode.window.showInformationMessage(`Processing file: ${fileName} with extension: ${fileExtension}`);

        if (supportedFileTypes.includes(fileExtension)) {
            console.log(`File is supported: ${fileName}`);
            vscode.window.showInformationMessage(`File is supported: ${fileName}`);

            const document = await vscode.workspace.openTextDocument(file.resourceUri);
            const fileContent = document.getText();

            const data = await renameFileViaApi(fileName, fileContent, namingConvention);
            const initialSuggestedName = data.renamedFiles[fileName].suggested_name;

            const suggestedName = path.extname(initialSuggestedName) !== fileExtension
                ? initialSuggestedName + fileExtension
                : initialSuggestedName;

            console.log(`Suggested name for ${fileName}: ${suggestedName}`);
            vscode.window.showInformationMessage(`Suggested name for ${fileName}: ${suggestedName}`);

            const result = await vscode.window.showInformationMessage(
                `Staged file: ${fileName}\nSuggested new name: ${suggestedName}`,
                { modal: true },
                {
                    title: '✅ Accept Suggestion',
                    isCloseAffordance: false
                },
                {
                    title: '❌ Deny',
                    isCloseAffordance: true
                }
            );

            if (result?.title === '✅ Accept Suggestion') {
                await renameFile(filePath, suggestedName);
                await vscode.commands.executeCommand('git.stage', vscode.Uri.file(suggestedName));
                await vscode.commands.executeCommand('git.unstage', file.resourceUri);
                console.log(`File renamed to ${suggestedName} and restaged.`);
                vscode.window.showInformationMessage(`File renamed to ${suggestedName} and restaged.`);
            } else {
                vscode.window.showInformationMessage('Proceeding with the original file name.');
                console.log('Proceeding with the original file name.');
            }
        } else {
            console.log(`File extension not supported for: ${fileName}`);
            vscode.window.showInformationMessage(`File extension not supported for: ${fileName}`);
        }
    }
}

export function deactivate() {
    console.log('ReNameIt extension deactivated.');
}
