import * as vscode from 'vscode';

/**
 * Cache for symbol positions to improve performance
 */
export class SymbolCache {
    private cache = new Map<string, { position: vscode.Position; version: number }>();

    constructor() {
        // Invalidate cache when document changes
        vscode.workspace.onDidChangeTextDocument((e) => {
            this.invalidate(e.document.uri.fsPath);
        });
    }

    getCachedPosition(filePath: string, symbolName: string, documentVersion: number): vscode.Position | undefined {
        const key = `${filePath}:${symbolName}`;
        const cached = this.cache.get(key);
        
        if (cached && cached.version === documentVersion) {
            return cached.position;
        }
        
        return undefined;
    }

    setCachedPosition(filePath: string, symbolName: string, position: vscode.Position, documentVersion: number): void {
        const key = `${filePath}:${symbolName}`;
        this.cache.set(key, { position, version: documentVersion });
    }

    invalidate(filePath: string): void {
        const keysToDelete: string[] = [];
        
        for (const key of this.cache.keys()) {
            if (key.startsWith(filePath + ':')) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    clear(): void {
        this.cache.clear();
    }
}
