import * as vscode from 'vscode';
import { SymbolCache } from './symbolCache';

/**
 * Finds the position of a symbol in a C# file using multiple strategies
 */
export class SymbolFinder {
    private cache: SymbolCache;

    constructor(cache: SymbolCache) {
        this.cache = cache;
    }

    /**
     * Find the position of a symbol using multiple strategies
     */
    async findSymbolPosition(
        symbolName: string,
        filePaths?: string[]
    ): Promise<vscode.Location | undefined> {
        const config = vscode.workspace.getConfiguration('csharpCodeUsages');
        const strategies = config.get<string[]>('searchStrategies', ['definition', 'workspace', 'document', 'text']);

        console.log(`[SymbolFinder] Searching for '${symbolName}' using strategies: ${strategies.join(', ')}`);

        for (const strategy of strategies) {
            let result: vscode.Location | undefined;

            console.log(`[SymbolFinder] Trying strategy: ${strategy}`);

            switch (strategy) {
                case 'definition':
                    result = await this.findUsingDefinitionProvider(symbolName, filePaths);
                    break;
                case 'workspace':
                    result = await this.findUsingWorkspaceSymbols(symbolName, filePaths);
                    break;
                case 'document':
                    result = await this.findUsingDocumentSymbols(symbolName, filePaths);
                    break;
                case 'text':
                    result = await this.findUsingTextSearch(symbolName, filePaths);
                    break;
            }

            if (result) {
                console.log(`[SymbolFinder] ✓ Strategy '${strategy}' found symbol at ${result.uri.fsPath}:${result.range.start.line + 1}`);
                return result;
            } else {
                console.log(`[SymbolFinder] ✗ Strategy '${strategy}' did not find symbol`);
            }
        }

        return undefined;
    }

    /**
     * Strategy 1: Use definition provider from usage locations
     * This works for external libraries (NuGet packages) that are referenced in the code
     */
    private async findUsingDefinitionProvider(
        symbolName: string,
        filePaths?: string[]
    ): Promise<vscode.Location | undefined> {
        const files = filePaths || await this.getAllCSharpFiles();
        console.log(`[DefinitionProvider] Searching for '${symbolName}' in ${files.length} files`);

        for (const filePath of files) {
            try {
                const uri = vscode.Uri.file(filePath);
                const document = await vscode.workspace.openTextDocument(uri);
                const text = document.getText();

                // Find all occurrences of symbolName in the text
                const regex = new RegExp(`\\b${symbolName}\\b`, 'g');
                let match;
                let matchCount = 0;

                while ((match = regex.exec(text)) !== null) {
                    matchCount++;
                    const position = document.positionAt(match.index);
                    console.log(`[DefinitionProvider] Found '${symbolName}' at ${filePath}:${position.line + 1}:${position.character + 1}`);

                    // Try to get definition from this position
                    const definitions = await vscode.commands.executeCommand<vscode.Location[]>(
                        'vscode.executeDefinitionProvider',
                        uri,
                        position
                    );

                    console.log(`[DefinitionProvider] Got ${definitions?.length || 0} definitions`);

                    if (definitions && definitions.length > 0) {
                        // Found definition! Return the first one
                        console.log(`[DefinitionProvider] ✓ Found definition: ${definitions[0].uri.fsPath}:${definitions[0].range.start.line + 1}`);
                        console.log(`[DefinitionProvider] URI scheme: ${definitions[0].uri.scheme}, path: ${definitions[0].uri.path}`);
                        return definitions[0];
                    }
                }

                if (matchCount > 0) {
                    console.log(`[DefinitionProvider] Found ${matchCount} occurrences in ${filePath}, but no definitions`);
                }
            } catch (error) {
                console.error(`Definition provider search failed for ${filePath}:`, error);
            }
        }

        console.log(`[DefinitionProvider] ✗ Symbol '${symbolName}' not found in any file`);
        return undefined;
    }

    /**
     * Strategy 2: Use workspace symbol provider
     */
    private async findUsingWorkspaceSymbols(
        symbolName: string,
        filePaths?: string[]
    ): Promise<vscode.Location | undefined> {
        try {
            const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
                'vscode.executeWorkspaceSymbolProvider',
                symbolName
            );

            if (!symbols || symbols.length === 0) {
                return undefined;
            }

            // Find best match
            const bestMatch = this.findBestMatch(symbols, symbolName, filePaths);
            return bestMatch ? bestMatch.location : undefined;
        } catch (error) {
            console.error('Workspace symbol search failed:', error);
            return undefined;
        }
    }

    /**
     * Strategy 3: Use document symbol provider
     */
    private async findUsingDocumentSymbols(
        symbolName: string,
        filePaths?: string[]
    ): Promise<vscode.Location | undefined> {
        const files = filePaths || await this.getAllCSharpFiles();

        for (const filePath of files) {
            try {
                const uri = vscode.Uri.file(filePath);
                const document = await vscode.workspace.openTextDocument(uri);

                // Check cache first
                const enableCache = vscode.workspace.getConfiguration('csharpCodeUsages').get<boolean>('enableCache', true);
                if (enableCache) {
                    const cachedPosition = this.cache.getCachedPosition(filePath, symbolName, document.version);
                    if (cachedPosition) {
                        return new vscode.Location(uri, cachedPosition);
                    }
                }

                const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                    'vscode.executeDocumentSymbolProvider',
                    uri
                );

                if (symbols) {
                    const position = this.findSymbolRecursive(symbols, symbolName);
                    if (position) {
                        // Cache the result
                        if (enableCache) {
                            this.cache.setCachedPosition(filePath, symbolName, position, document.version);
                        }
                        return new vscode.Location(uri, position);
                    }
                }
            } catch (error) {
                console.error(`Document symbol search failed for ${filePath}:`, error);
            }
        }

        return undefined;
    }

    /**
     * Strategy 4: Text-based search with pattern matching
     */
    private async findUsingTextSearch(
        symbolName: string,
        filePaths?: string[]
    ): Promise<vscode.Location | undefined> {
        const files = filePaths || await this.getAllCSharpFiles();

        for (const filePath of files) {
            try {
                const uri = vscode.Uri.file(filePath);
                const document = await vscode.workspace.openTextDocument(uri);
                const text = document.getText();

                // Pattern for methods: public/private/protected/internal + return type + method name
                const methodPattern = new RegExp(
                    `(?:public|private|protected|internal|static|virtual|override|async)\\s+(?:\\w+\\s+)*${symbolName}\\s*\\(`,
                    'gm'
                );

                // Pattern for classes/interfaces
                const typePattern = new RegExp(
                    `(?:public|private|protected|internal)\\s+(?:class|interface|struct|enum)\\s+${symbolName}\\b`,
                    'gm'
                );

                // Pattern for properties
                const propertyPattern = new RegExp(
                    `(?:public|private|protected|internal)\\s+(?:\\w+\\s+)+${symbolName}\\s*\\{`,
                    'gm'
                );

                const patterns = [methodPattern, typePattern, propertyPattern];

                for (const pattern of patterns) {
                    const match = pattern.exec(text);
                    if (match) {
                        const position = document.positionAt(match.index);
                        return new vscode.Location(uri, position);
                    }
                }
            } catch (error) {
                console.error(`Text search failed for ${filePath}:`, error);
            }
        }

        return undefined;
    }

    /**
     * Find best matching symbol from a list
     */
    private findBestMatch(
        symbols: vscode.SymbolInformation[],
        symbolName: string,
        filePaths?: string[]
    ): vscode.SymbolInformation | undefined {
        // Exact match first
        let matches = symbols.filter(s => s.name === symbolName);

        // If file paths specified, prefer those files
        if (filePaths && filePaths.length > 0 && matches.length > 0) {
            const fileMatches = matches.filter(s =>
                filePaths.some(fp => s.location.uri.fsPath === fp)
            );
            if (fileMatches.length > 0) {
                matches = fileMatches;
            }
        }

        // Return first match (could be improved with better heuristics)
        return matches.length > 0 ? matches[0] : undefined;
    }

    /**
     * Recursively search for symbol in document symbol tree
     */
    private findSymbolRecursive(
        symbols: vscode.DocumentSymbol[],
        symbolName: string
    ): vscode.Position | undefined {
        for (const symbol of symbols) {
            if (symbol.name === symbolName) {
                return symbol.selectionRange.start;
            }

            if (symbol.children && symbol.children.length > 0) {
                const result = this.findSymbolRecursive(symbol.children, symbolName);
                if (result) {
                    return result;
                }
            }
        }

        return undefined;
    }

    /**
     * Get all C# files in workspace
     */
    private async getAllCSharpFiles(): Promise<string[]> {
        const files = await vscode.workspace.findFiles('**/*.cs', '**/obj/**');
        return files.map(f => f.fsPath);
    }
}
