import * as vscode from 'vscode';
import { SymbolCache } from './symbolCache';
import { SymbolFinder } from './symbolFinder';
import { UsageFinder } from './usageFinder';
import { AdvancedAnalyzer } from './advancedAnalyzer';
import { findUsagesCommand } from './commands';

let outputChannel: vscode.OutputChannel;
let usageFinder: UsageFinder;
let advancedAnalyzer: AdvancedAnalyzer;

export function activate(context: vscode.ExtensionContext) {
    console.log('C# Code Usages extension is now active');

    // Create output channel
    outputChannel = vscode.window.createOutputChannel('C# Code Usages');
    context.subscriptions.push(outputChannel);

    // Initialize components
    const cache = new SymbolCache();
    const symbolFinder = new SymbolFinder(cache);
    usageFinder = new UsageFinder(symbolFinder);
    advancedAnalyzer = new AdvancedAnalyzer();

    // Register commands
    const findUsagesCommandDisposable = vscode.commands.registerCommand(
        'list_code_usages_csharp.findUsages',
        () => findUsagesCommand(usageFinder, outputChannel)
    );
    context.subscriptions.push(findUsagesCommandDisposable);

    // Register diagnostic test command
    const testDiagnosticCommand = vscode.commands.registerCommand(
        'list_code_usages_csharp.testDiagnostic',
        async () => {
            outputChannel.clear();
            outputChannel.show();
            outputChannel.appendLine('=== Testing C# Language Server Capabilities ===\n');
            
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                outputChannel.appendLine('❌ No active editor');
                return;
            }
            
            const uri = editor.document.uri;
            const position = editor.selection.active;
            
            outputChannel.appendLine(`File: ${uri.fsPath}`);
            outputChannel.appendLine(`Position: Line ${position.line + 1}, Column ${position.character + 1}\n`);
            
            // Test Call Hierarchy
            outputChannel.appendLine('Testing Call Hierarchy...');
            try {
                const callItems = await vscode.commands.executeCommand<any[]>(
                    'vscode.prepareCallHierarchy',
                    uri,
                    position
                );
                if (callItems && callItems.length > 0) {
                    outputChannel.appendLine(`✓ Call Hierarchy supported: ${callItems[0].name}`);
                } else {
                    outputChannel.appendLine('⚠ Call Hierarchy: No items returned');
                }
            } catch (error) {
                outputChannel.appendLine(`❌ Call Hierarchy: ${error}`);
            }
            
            // Test Type Hierarchy
            outputChannel.appendLine('\nTesting Type Hierarchy...');
            try {
                const typeItems = await vscode.commands.executeCommand<any[]>(
                    'vscode.prepareTypeHierarchy',
                    uri,
                    position
                );
                if (typeItems && typeItems.length > 0) {
                    outputChannel.appendLine(`✓ Type Hierarchy supported: ${typeItems[0].name}`);
                } else {
                    outputChannel.appendLine('⚠ Type Hierarchy: No items returned');
                }
            } catch (error) {
                outputChannel.appendLine(`❌ Type Hierarchy: ${error}`);
            }
            
            // Test Implementation Provider
            outputChannel.appendLine('\nTesting Implementation Provider...');
            try {
                const impls = await vscode.commands.executeCommand<vscode.Location[]>(
                    'vscode.executeImplementationProvider',
                    uri,
                    position
                );
                if (impls && impls.length > 0) {
                    outputChannel.appendLine(`✓ Implementation Provider: Found ${impls.length} implementation(s)`);
                } else {
                    outputChannel.appendLine('⚠ Implementation Provider: No results');
                }
            } catch (error) {
                outputChannel.appendLine(`❌ Implementation Provider: ${error}`);
            }
            
            // Test Reference Provider
            outputChannel.appendLine('\nTesting Reference Provider...');
            try {
                const refs = await vscode.commands.executeCommand<vscode.Location[]>(
                    'vscode.executeReferenceProvider',
                    uri,
                    position
                );
                if (refs && refs.length > 0) {
                    outputChannel.appendLine(`✓ Reference Provider: Found ${refs.length} reference(s)`);
                } else {
                    outputChannel.appendLine('⚠ Reference Provider: No results');
                }
            } catch (error) {
                outputChannel.appendLine(`❌ Reference Provider: ${error}`);
            }
            
            outputChannel.appendLine('\n=== Test Complete ===');
        }
    );
    context.subscriptions.push(testDiagnosticCommand);

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
    const tool = vscode.lm.registerTool('find_symbol_usages', {
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

    // Tool 2: Find Implementations
    const implementationsTool = vscode.lm.registerTool('find_implementations', {
        invoke: async (options, token) => {
            const symbolName = options.input.symbolName;
            const filePaths = options.input.filePaths;

            if (!symbolName || typeof symbolName !== 'string') {
                throw new Error('symbolName is required and must be a string');
            }

            try {
                // Find symbol location first
                const location = await symbolFinder.findSymbolPosition(symbolName, filePaths);
                if (!location) {
                    throw new Error(`Symbol '${symbolName}' not found`);
                }

                // Find implementations
                const info = await advancedAnalyzer.findImplementations(
                    location.uri,
                    location.range.start
                );

                if (!info) {
                    return new vscode.LanguageModelToolResult([
                        new vscode.LanguageModelTextPart(`No implementations found for '${symbolName}'`)
                    ]);
                }

                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify({
                        symbolName: info.symbolName,
                        totalCount: info.implementations.length,
                        implementations: info.implementations.map(impl => ({
                            file: impl.uri.fsPath,
                            line: impl.range.start.line + 1,
                            column: impl.range.start.character + 1
                        }))
                    }, null, 2))
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
                invocationMessage: `Finding implementations of '${symbolName}'...`
            };
        }
    });
    context.subscriptions.push(implementationsTool);

    // Note: We don't need a separate MCP server process since we're providing
    // the functionality directly via Language Model Tools above.
    // External MCP servers run in separate processes and can't access VS Code APIs.
    // Our tool is already available to Copilot via vscode.lm.registerTool.

    outputChannel.appendLine('C# Code Usages extension activated successfully');
    outputChannel.appendLine('Language Model Tools registered:');
    outputChannel.appendLine('  - find_symbol_usages (Find all references to a symbol)');
    outputChannel.appendLine('  - find_implementations (Find all implementations of an interface/abstract member)');
    outputChannel.appendLine('Tools are now available to GitHub Copilot');
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
