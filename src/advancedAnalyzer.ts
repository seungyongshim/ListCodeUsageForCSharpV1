import * as vscode from 'vscode';

/**
 * Type hierarchy information
 */
export interface TypeHierarchyInfo {
    typeName: string;
    supertypes: vscode.TypeHierarchyItem[];
    subtypes: vscode.TypeHierarchyItem[];
}

/**
 * Call hierarchy information
 */
export interface CallHierarchyInfo {
    methodName: string;
    incomingCalls: vscode.CallHierarchyIncomingCall[];
    outgoingCalls: vscode.CallHierarchyOutgoingCall[];
}

/**
 * Implementation information
 */
export interface ImplementationInfo {
    symbolName: string;
    implementations: vscode.Location[];
}

/**
 * Advanced analyzer using additional VS Code LSP APIs
 */
export class AdvancedAnalyzer {
    /**
     * Get type hierarchy (for interfaces/classes)
     * Shows inheritance and implementation relationships
     */
    async analyzeTypeHierarchy(
        uri: vscode.Uri,
        position: vscode.Position
    ): Promise<TypeHierarchyInfo | undefined> {
        try {
            // Prepare type hierarchy
            const items = await vscode.commands.executeCommand<vscode.TypeHierarchyItem[]>(
                'vscode.prepareTypeHierarchy',
                uri,
                position
            );

            if (!items || items.length === 0) {
                return undefined;
            }

            const item = items[0];
            
            // Get supertypes (base classes, interfaces)
            const supertypes = await vscode.commands.executeCommand<vscode.TypeHierarchyItem[]>(
                'vscode.provideSupertypes',
                item
            ) || [];

            // Get subtypes (derived classes, implementations)
            const subtypes = await vscode.commands.executeCommand<vscode.TypeHierarchyItem[]>(
                'vscode.provideSubtypes',
                item
            ) || [];

            return {
                typeName: item.name,
                supertypes,
                subtypes
            };
        } catch (error) {
            console.error('Type hierarchy analysis failed:', error);
            return undefined;
        }
    }

    /**
     * Get call hierarchy (for methods)
     * Shows who calls this method and what it calls
     */
    async analyzeCallHierarchy(
        uri: vscode.Uri,
        position: vscode.Position
    ): Promise<CallHierarchyInfo | undefined> {
        try {
            // Prepare call hierarchy
            const items = await vscode.commands.executeCommand<vscode.CallHierarchyItem[]>(
                'vscode.prepareCallHierarchy',
                uri,
                position
            );

            if (!items || items.length === 0) {
                return undefined;
            }

            const item = items[0];

            // Get incoming calls (who calls this method)
            const incomingCalls = await vscode.commands.executeCommand<vscode.CallHierarchyIncomingCall[]>(
                'vscode.provideIncomingCalls',
                item
            ) || [];

            // Get outgoing calls (what this method calls)
            const outgoingCalls = await vscode.commands.executeCommand<vscode.CallHierarchyOutgoingCall[]>(
                'vscode.provideOutgoingCalls',
                item
            ) || [];

            return {
                methodName: item.name,
                incomingCalls,
                outgoingCalls
            };
        } catch (error) {
            console.error('Call hierarchy analysis failed:', error);
            return undefined;
        }
    }

    /**
     * Find all implementations of an interface or abstract method
     */
    async findImplementations(
        uri: vscode.Uri,
        position: vscode.Position
    ): Promise<ImplementationInfo | undefined> {
        try {
            const implementations = await vscode.commands.executeCommand<vscode.Location[]>(
                'vscode.executeImplementationProvider',
                uri,
                position
            );

            if (!implementations || implementations.length === 0) {
                return undefined;
            }

            // Get symbol name from hover
            const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
                'vscode.executeHoverProvider',
                uri,
                position
            );

            const symbolName = hovers && hovers.length > 0 
                ? this.extractSymbolName(hovers[0])
                : 'Unknown';

            return {
                symbolName,
                implementations
            };
        } catch (error) {
            console.error('Implementation search failed:', error);
            return undefined;
        }
    }

    /**
     * Get hover information (type info, documentation)
     */
    async getHoverInfo(
        uri: vscode.Uri,
        position: vscode.Position
    ): Promise<vscode.Hover[]> {
        try {
            return await vscode.commands.executeCommand<vscode.Hover[]>(
                'vscode.executeHoverProvider',
                uri,
                position
            ) || [];
        } catch (error) {
            console.error('Hover provider failed:', error);
            return [];
        }
    }

    /**
     * Get signature help (method overloads)
     */
    async getSignatureHelp(
        uri: vscode.Uri,
        position: vscode.Position
    ): Promise<vscode.SignatureHelp | undefined> {
        try {
            return await vscode.commands.executeCommand<vscode.SignatureHelp>(
                'vscode.executeSignatureHelpProvider',
                uri,
                position,
                '('
            );
        } catch (error) {
            console.error('Signature help failed:', error);
            return undefined;
        }
    }

    /**
     * Get code lenses (reference counts, etc.)
     */
    async getCodeLenses(uri: vscode.Uri): Promise<vscode.CodeLens[]> {
        try {
            return await vscode.commands.executeCommand<vscode.CodeLens[]>(
                'vscode.executeCodeLensProvider',
                uri
            ) || [];
        } catch (error) {
            console.error('Code lens provider failed:', error);
            return [];
        }
    }

    /**
     * Extract symbol name from hover information
     */
    private extractSymbolName(hover: vscode.Hover): string {
        if (hover.contents.length === 0) {
            return 'Unknown';
        }

        const content = hover.contents[0];
        if (typeof content === 'string') {
            return content.split(/\s+/)[0];
        } else {
            // MarkdownString
            const text = content.value;
            const match = text.match(/\b(\w+)\b/);
            return match ? match[1] : 'Unknown';
        }
    }

    /**
     * Format type hierarchy as string
     */
    formatTypeHierarchy(info: TypeHierarchyInfo): string {
        const lines: string[] = [];
        
        lines.push(`Type: ${info.typeName}`);
        lines.push('');

        if (info.supertypes.length > 0) {
            lines.push('Supertypes (base classes/interfaces):');
            for (const item of info.supertypes) {
                lines.push(`  - ${item.name} (${item.kind})`);
                lines.push(`    ${item.uri.fsPath}:${item.range.start.line + 1}`);
            }
            lines.push('');
        }

        if (info.subtypes.length > 0) {
            lines.push('Subtypes (derived classes/implementations):');
            for (const item of info.subtypes) {
                lines.push(`  - ${item.name} (${item.kind})`);
                lines.push(`    ${item.uri.fsPath}:${item.range.start.line + 1}`);
            }
        }

        return lines.join('\n');
    }

    /**
     * Format call hierarchy as string
     */
    formatCallHierarchy(info: CallHierarchyInfo): string {
        const lines: string[] = [];
        
        lines.push(`Method: ${info.methodName}`);
        lines.push('');

        if (info.incomingCalls.length > 0) {
            lines.push(`Incoming Calls (${info.incomingCalls.length} callers):`);
            for (const call of info.incomingCalls) {
                lines.push(`  - ${call.from.name}`);
                for (const range of call.fromRanges) {
                    lines.push(`    ${call.from.uri.fsPath}:${range.start.line + 1}`);
                }
            }
            lines.push('');
        }

        if (info.outgoingCalls.length > 0) {
            lines.push(`Outgoing Calls (${info.outgoingCalls.length} callees):`);
            for (const call of info.outgoingCalls) {
                lines.push(`  - ${call.to.name}`);
                for (const range of call.fromRanges) {
                    lines.push(`    ${call.to.uri.fsPath}:${range.start.line + 1}`);
                }
            }
        }

        return lines.join('\n');
    }

    /**
     * Format implementations as string
     */
    formatImplementations(info: ImplementationInfo): string {
        const lines: string[] = [];
        
        lines.push(`Symbol: ${info.symbolName}`);
        lines.push(`Found ${info.implementations.length} implementation(s):`);
        lines.push('');

        for (const impl of info.implementations) {
            lines.push(`  - ${impl.uri.fsPath}:${impl.range.start.line + 1}`);
        }

        return lines.join('\n');
    }
}
