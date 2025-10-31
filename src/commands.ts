import * as vscode from 'vscode';
import { UsageFinder } from './usageFinder';

/**
 * Command handler for finding C# code usages
 */
export async function findUsagesCommand(
    usageFinder: UsageFinder,
    outputChannel: vscode.OutputChannel
): Promise<void> {
    try {
        // Get symbol name from user
        const symbolName = await vscode.window.showInputBox({
            prompt: 'Enter the symbol name to find usages',
            placeHolder: 'e.g., Add, Calculator, JsonConvert'
        });

        if (!symbolName) {
            return;
        }

        // Get current file path (optional context)
        const activeEditor = vscode.window.activeTextEditor;
        const currentFilePath = activeEditor?.document.uri.fsPath;
        const filePaths = currentFilePath && currentFilePath.endsWith('.cs') 
            ? [currentFilePath] 
            : undefined;

        // Find usages with progress indicator
        const result = await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Finding usages of '${symbolName}'...`,
                cancellable: false
            },
            async (progress) => {
                progress.report({ increment: 0 });
                
                const usageResult = await usageFinder.findAllUsages(symbolName, filePaths);
                
                progress.report({ increment: 100 });
                return usageResult;
            }
        );

        // Show results
        outputChannel.clear();
        outputChannel.appendLine(usageFinder.formatResult(result));
        outputChannel.show();

        // Show info message
        vscode.window.showInformationMessage(
            `Found ${result.totalCount} usage(s) of '${symbolName}'`
        );

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error finding usages: ${errorMessage}`);
        console.error('Error in findUsagesCommand:', error);
    }
}

/**
 * Find usages programmatically (for MCP server)
 */
export async function findUsagesProgrammatic(
    usageFinder: UsageFinder,
    symbolName: string,
    filePaths?: string[]
): Promise<string> {
    try {
        const result = await usageFinder.findAllUsages(symbolName, filePaths);
        return usageFinder.formatResultAsJson(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to find usages: ${errorMessage}`);
    }
}
