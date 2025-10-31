#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ErrorCode
} from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP Server for C# Code Usages
 * This server provides tools for finding C# code usages
 */
class CSharpUsagesMcpServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'csharp-code-usages',
                version: '0.1.0'
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );

        this.setupHandlers();
    }

    private setupHandlers(): void {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'find_csharp_usages',
                        description: 'Find all usages of a C# symbol (class, method, property, etc.) in the workspace. Returns detailed information about where the symbol is used.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                symbolName: {
                                    type: 'string',
                                    description: 'The name of the C# symbol to find usages for (e.g., "Add", "Calculator", "JsonConvert")'
                                },
                                filePaths: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    description: 'Optional: Specific file paths to search in. If not provided, searches entire workspace.'
                                }
                            },
                            required: ['symbolName']
                        }
                    }
                ]
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name !== 'find_csharp_usages') {
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${request.params.name}`
                );
            }

            const args = request.params.arguments;
            if (!args || typeof args !== 'object') {
                throw new McpError(
                    ErrorCode.InvalidParams,
                    'Invalid arguments'
                );
            }

            const symbolName = (args as any).symbolName;
            if (!symbolName || typeof symbolName !== 'string') {
                throw new McpError(
                    ErrorCode.InvalidParams,
                    'symbolName is required and must be a string'
                );
            }

            const filePaths = (args as any).filePaths as string[] | undefined;

            try {
                // Call VS Code extension command
                const result = await this.findUsages(symbolName, filePaths);
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                throw new McpError(
                    ErrorCode.InternalError,
                    `Failed to find usages: ${errorMessage}`
                );
            }
        });
    }

    private async findUsages(symbolName: string, filePaths?: string[]): Promise<any> {
        // In a real implementation, this would communicate with the VS Code extension
        // For now, we'll use a placeholder that expects the extension to handle this
        
        // This is a simplified version - in production, you'd need to:
        // 1. Use VS Code API to execute commands
        // 2. Or use IPC to communicate with the extension
        // 3. Or use a shared service
        
        throw new Error('This server must be run within VS Code extension context');
    }

    async start(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        
        console.error('C# Code Usages MCP server running on stdio');
    }
}

// Start the server
const server = new CSharpUsagesMcpServer();
server.start().catch((error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
});
