import * as vscode from 'vscode';
import { SymbolCache } from './symbolCache';
import { SymbolFinder } from './symbolFinder';
import { UsageFinder } from './usageFinder';
import { findUsagesCommand } from './commands';

let outputChannel: vscode.OutputChannel;
let usageFinder: UsageFinder;

export function activate(context: vscode.ExtensionContext) {
    console.log('C# Code Usages extension is now active');

    // Create output channel
    outputChannel = vscode.window.createOutputChannel('C# Code Usages');
    context.subscriptions.push(outputChannel);

    // Initialize components
    const cache = new SymbolCache();
    const symbolFinder = new SymbolFinder(cache);
    usageFinder = new UsageFinder(symbolFinder);

    // Register commands
    const findUsagesCommandDisposable = vscode.commands.registerCommand(
        'list_code_usages_csharp.findUsages',
        () => findUsagesCommand(usageFinder, outputChannel)
    );
    context.subscriptions.push(findUsagesCommandDisposable);

    // Register Language Model Tool for GitHub Copilot
    const tool = vscode.lm.registerTool('find_csharp_usages', {
        invoke: async (options, token) => {
            const symbolName = options.input.symbolName;
            const filePaths = options.input.filePaths;

            if (!symbolName || typeof symbolName !== 'string') {
                throw new Error('symbolName is required and must be a string');
            }

            try {
                const result = await usageFinder.findAllUsages(symbolName, filePaths);
                
                if (!result) {
                    return new vscode.LanguageModelToolResult([
                        new vscode.LanguageModelTextPart(`Symbol '${symbolName}' not found`)
                    ]);
                }

                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify(result, null, 2))
                ]);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(`Error: ${errorMessage}`)
                ]);
            }
        },
        prepareInvocation: async (options, token) => {
            const symbolName = options.input.symbolName;
            return {
                invocationMessage: `Finding usages of '${symbolName}'...`
            };
        }
    });
    context.subscriptions.push(tool);

    // Note: We don't need a separate MCP server process since we're providing
    // the functionality directly via Language Model Tools above.
    // External MCP servers run in separate processes and can't access VS Code APIs.
    // Our tool is already available to Copilot via vscode.lm.registerTool.

    outputChannel.appendLine('C# Code Usages extension activated successfully');
    outputChannel.appendLine('Language Model Tool registered: find_csharp_usages');
    outputChannel.appendLine('Tool is now available to GitHub Copilot');
}

export function deactivate() {
    console.log('C# Code Usages extension is now deactivated');
}

/**
 * Get UsageFinder instance (for MCP server)
 */
export function getUsageFinder(): UsageFinder {
    return usageFinder;
}
