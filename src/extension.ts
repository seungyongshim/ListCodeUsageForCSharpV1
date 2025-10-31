import * as vscode from 'vscode';
import { SymbolCache } from './symbolCache';
import { SymbolFinder } from './symbolFinder';
import { UsageFinder } from './usageFinder';
import { findUsagesCommand } from './commands';
import { CSharpUsagesMcpProvider } from './mcp/provider';

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

    // Register internal command for MCP server
    const findUsagesInternalDisposable = vscode.commands.registerCommand(
        'list_code_usages_csharp.findUsagesInternal',
        async (symbolName: string, filePaths?: string[]) => {
            const result = await usageFinder.findAllUsages(symbolName, filePaths);
            return result;
        }
    );
    context.subscriptions.push(findUsagesInternalDisposable);

    // Register MCP server provider
    const mcpProvider = new CSharpUsagesMcpProvider();
    const mcpDisposable = vscode.lm.registerMcpServerDefinitionProvider(
        'csharp-code-usages',
        mcpProvider
    );
    context.subscriptions.push(mcpDisposable);

    outputChannel.appendLine('C# Code Usages extension activated successfully');
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
