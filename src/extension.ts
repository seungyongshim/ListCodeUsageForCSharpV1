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

    // Register test command for external library symbols
    const testExternalLibCommand = vscode.commands.registerCommand(
        'list_code_usages_csharp.testExternalLib',
        async () => {
            outputChannel.clear();
            outputChannel.show();
            outputChannel.appendLine('=== Testing External Library Symbol ===\n');
            
            try {
                // 1. JsonHelper.cs 파일 열기
                const filePath = 'z:\\2025\\ListCodeUsageForCSharpV1\\sample\\csharp\\JsonHelper.cs';
                const uri = vscode.Uri.file(filePath);
                const document = await vscode.workspace.openTextDocument(uri);
                
                outputChannel.appendLine(`Opened file: ${filePath}`);
                
                // 2. "SerializeObject" 텍스트 찾기
                const text = document.getText();
                const searchText = 'SerializeObject';
                const index = text.indexOf(searchText);
                
                if (index === -1) {
                    outputChannel.appendLine(`❌ '${searchText}' not found in file`);
                    return;
                }
                
                const position = document.positionAt(index);
                outputChannel.appendLine(`Found '${searchText}' at line ${position.line + 1}, column ${position.character + 1}\n`);
                
                // 3. Definition Provider 호출
                outputChannel.appendLine('Calling vscode.executeDefinitionProvider...');
                const definitions = await vscode.commands.executeCommand<vscode.Location[]>(
                    'vscode.executeDefinitionProvider',
                    uri,
                    position
                );
                
                if (!definitions || definitions.length === 0) {
                    outputChannel.appendLine('❌ No definitions found');
                    return;
                }
                
                outputChannel.appendLine(`✓ Found ${definitions.length} definition(s):`);
                for (const def of definitions) {
                    outputChannel.appendLine(`  - URI: ${def.uri.toString()}`);
                    outputChannel.appendLine(`    Scheme: ${def.uri.scheme}`);
                    outputChannel.appendLine(`    Path: ${def.uri.path}`);
                    outputChannel.appendLine(`    FsPath: ${def.uri.fsPath}`);
                    outputChannel.appendLine(`    Range: ${def.range.start.line + 1}:${def.range.start.character + 1}\n`);
                }
                
                // 4. Reference Provider 호출
                const firstDef = definitions[0];
                outputChannel.appendLine('Calling vscode.executeReferenceProvider...');
                try {
                    const references = await vscode.commands.executeCommand<vscode.Location[]>(
                        'vscode.executeReferenceProvider',
                        firstDef.uri,
                        firstDef.range.start
                    );
                    
                    if (!references || references.length === 0) {
                        outputChannel.appendLine('❌ No references found');
                        return;
                    }
                    
                    outputChannel.appendLine(`✓ Found ${references.length} reference(s):`);
                    for (const ref of references) {
                        const doc = await vscode.workspace.openTextDocument(ref.uri);
                        const line = doc.lineAt(ref.range.start.line);
                        outputChannel.appendLine(`  - ${ref.uri.fsPath}:${ref.range.start.line + 1}:${ref.range.start.character + 1}`);
                        outputChannel.appendLine(`    ${line.text.trim()}`);
                    }
                    
                    outputChannel.appendLine('\n✅ Test completed successfully!');
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    outputChannel.appendLine(`❌ Reference Provider failed: ${errorMsg}`);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`❌ Test failed: ${errorMsg}`);
            }
        }
    );
    context.subscriptions.push(testExternalLibCommand);

    // Register Language Model Tool for GitHub Copilot
    // Note: Language Model Tools must be registered in code, not in package.json
    const tool = vscode.lm.registerTool('find_csharp_usages', {
        // Tool invocation handler
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
        // Optional: Prepare invocation message
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
