import * as vscode from 'vscode';

/**
 * MCP Server Definition Provider for C# Code Usages
 */
export class CSharpUsagesMcpProvider implements vscode.McpServerDefinitionProvider<vscode.McpStdioServerDefinition> {
    async provideMcpServerDefinitions(): Promise<vscode.McpStdioServerDefinition[]> {
        const config = vscode.workspace.getConfiguration('csharpCodeUsages');
        const enabled = config.get<boolean>('enableMcpServer', true);

        if (!enabled) {
            return [];
        }

        const extensionPath = vscode.extensions.getExtension('your-publisher-name.list-code-usages-csharp')?.extensionPath;
        if (!extensionPath) {
            return [];
        }

        const serverScript = vscode.Uri.joinPath(vscode.Uri.file(extensionPath), 'out', 'mcp', 'server.js');

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
