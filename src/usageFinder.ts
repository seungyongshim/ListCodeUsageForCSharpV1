import * as vscode from 'vscode';
import { SymbolFinder } from './symbolFinder';

/**
 * Represents a single usage of a symbol
 */
export interface Usage {
    file: string;
    line: number;
    column: number;
    text: string;
    isDefinition: boolean;
}

/**
 * Result of finding usages
 */
export interface UsageResult {
    symbolName: string;
    totalCount: number;
    usages: Usage[];
    definitionLocation?: vscode.Location;
}

/**
 * Finds all usages of a C# symbol
 */
export class UsageFinder {
    private symbolFinder: SymbolFinder;

    constructor(symbolFinder: SymbolFinder) {
        this.symbolFinder = symbolFinder;
    }

    /**
     * Find all usages of a symbol
     */
    async findAllUsages(
        symbolName: string,
        filePaths?: string[]
    ): Promise<UsageResult> {
        // Step 1: Find the symbol definition
        const location = await this.symbolFinder.findSymbolPosition(symbolName, filePaths);
        
        if (!location) {
            throw new Error(`Symbol '${symbolName}' not found`);
        }

        console.log(`[UsageFinder] Found symbol definition at ${location.uri.toString()}`);
        console.log(`[UsageFinder] URI scheme: ${location.uri.scheme}, fsPath: ${location.uri.fsPath}`);

        // Step 2: Find all references
        // Note: For external library symbols (e.g., csharp-metadata:// scheme),
        // the reference provider should still work with the metadata URI
        const references = await vscode.commands.executeCommand<vscode.Location[]>(
            'vscode.executeReferenceProvider',
            location.uri,
            location.range.start
        );

        console.log(`[UsageFinder] Found ${references?.length || 0} references`);

        if (!references) {
            return {
                symbolName,
                totalCount: 0,
                usages: [],
                definitionLocation: location
            };
        }

        // Step 3: Convert to Usage objects
        const usages: Usage[] = [];
        
        for (const ref of references) {
            const document = await vscode.workspace.openTextDocument(ref.uri);
            const line = document.lineAt(ref.range.start.line);
            
            const isDefinition = this.isDefinitionLocation(ref, location);
            
            usages.push({
                file: ref.uri.fsPath,
                line: ref.range.start.line + 1, // 1-indexed
                column: ref.range.start.character + 1, // 1-indexed
                text: line.text.trim(),
                isDefinition
            });
        }

        // Sort by file, then line
        usages.sort((a, b) => {
            const fileCompare = a.file.localeCompare(b.file);
            if (fileCompare !== 0) return fileCompare;
            return a.line - b.line;
        });

        return {
            symbolName,
            totalCount: usages.length,
            usages,
            definitionLocation: location
        };
    }

    /**
     * Check if a reference is the definition location
     */
    private isDefinitionLocation(ref: vscode.Location, definition: vscode.Location): boolean {
        // Compare URIs using toString() to handle special schemes like csharp-metadata://
        return ref.uri.toString() === definition.uri.toString() &&
               ref.range.start.line === definition.range.start.line &&
               ref.range.start.character === definition.range.start.character;
    }

    /**
     * Format usage result as string
     */
    formatResult(result: UsageResult): string {
        const lines: string[] = [];
        
        lines.push(`Found ${result.totalCount} usage(s) of '${result.symbolName}':`);
        lines.push('');

        if (result.definitionLocation) {
            const defUri = result.definitionLocation.uri.fsPath;
            const defLine = result.definitionLocation.range.start.line + 1;
            lines.push(`Definition: ${defUri}:${defLine}`);
            lines.push('');
        }

        let currentFile = '';
        for (const usage of result.usages) {
            if (usage.file !== currentFile) {
                currentFile = usage.file;
                lines.push(`\n${currentFile}:`);
            }
            
            const marker = usage.isDefinition ? '[DEF]' : '     ';
            lines.push(`  ${marker} Line ${usage.line}: ${usage.text}`);
        }

        return lines.join('\n');
    }

    /**
     * Format result as JSON
     */
    formatResultAsJson(result: UsageResult): string {
        return JSON.stringify(result, null, 2);
    }
}
