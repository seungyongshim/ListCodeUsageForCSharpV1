import * as vscode from 'vscode';
import { UsageFinder } from '../usageFinder';

/**
 * MCP Server Definition Provider for C# Code Usages
 * This provider runs the MCP server as a separate process via stdio
 */
export class CSharpUsagesMcpProvider implements vscode.McpServerDefinitionProvider<vscode.McpStdioServerDefinition> {
    private usageFinder: UsageFinder;

    constructor(usageFinder: UsageFinder) {
        this.usageFinder = usageFinder;
    }

    async provideMcpServerDefinitions(): Promise<vscode.McpStdioServerDefinition[]> {
        const config = vscode.workspace.getConfiguration('csharpCodeUsages');
        const enabled = config.get<boolean>('enableMcpServer', true);

        if (!enabled) {
            return [];
        }

        // Get the current extension context
        const extension = vscode.extensions.getExtension('seungyongshim.list-code-usages-csharp');
        if (!extension) {
            console.error('Extension not found. Make sure publisher name matches package.json');
            return [];
        }

        const serverScript = vscode.Uri.joinPath(vscode.Uri.file(extension.extensionPath), 'out', 'mcp', 'server.js');

        return [
            new vscode.McpStdioServerDefinition(
                'C# Code Usages',
                process.execPath, // Node.js executable
                [serverScript.fsPath],
                undefined,
                '0.1.0'
            )
        ];
    }

    async resolveMcpServerDefinition(
        definition: vscode.McpStdioServerDefinition,
        token: vscode.CancellationToken
    ): Promise<vscode.McpStdioServerDefinition> {
        // Add workspace folder as environment variable
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            const env = {
                WORKSPACE_PATH: workspaceFolders[0].uri.fsPath
            };
            
            return new vscode.McpStdioServerDefinition(
                definition.label,
                definition.command,
                definition.args,
                env,
                definition.version
            );
        }

        return definition;
    }
}

/**
 * Register MCP Server Definition Provider
 */
export function registerMcpServer(context: vscode.ExtensionContext): void {
    const provider = new CSharpUsagesMcpProvider();
    
    const disposable = vscode.lm.registerMcpServerDefinitionProvider(
        'csharp-code-usages',
        provider
    );
    
    context.subscriptions.push(disposable);
}
