# C# Code Usages Finder

A VS Code extension that finds all usages of C# symbols (classes, methods, properties, etc.) with seamless GitHub Copilot integration via Model Context Protocol (MCP).

## Features

- 🔍 **Find C# Code Usages**: Quickly locate all references to any C# symbol
- 🤖 **GitHub Copilot Integration**: Use natural language to find code usages via MCP
- 🚀 **Multiple Search Strategies**: Workspace symbols, document symbols, and text-based search
- ⚡ **Smart Caching**: Fast repeated searches with intelligent cache invalidation
- 📊 **Detailed Results**: Shows file paths, line numbers, and code context
- 🎯 **Definition Marking**: Clearly identifies definition vs. usage locations

## Installation

### From VSIX (Local Install)

1. Download or build the `.vsix` file
2. In VS Code, open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Run `Extensions: Install from VSIX...`
4. Select the downloaded `.vsix` file

### Building from Source

```bash
git clone <repository-url>
cd list-code-usages-csharp
npm install
npm run compile
npm run package
```

This will create a `.vsix` file in the root directory.

## Usage

### Manual Search

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run `Find C# Code Usages`
3. Enter the symbol name (e.g., `Add`, `Calculator`, `JsonConvert`)
4. View results in the Output panel

### With GitHub Copilot

Simply ask Copilot in natural language:

- "Find usages of the Add method"
- "Where is Calculator class used?"
- "Show me all usages of JsonConvert"

The extension automatically provides a `find_csharp_usages` tool to Copilot via MCP.

## Example

For a C# project with this code:

```csharp
public class Calculator
{
    public int Add(int a, int b) => a + b;
}

// Usage in Program.cs
var calc = new Calculator();
var result = calc.Add(5, 3);
```

Running "Find usages of Add" will show:

```
Found 5 usage(s) of 'Add':

Definition: Calculator.cs:3

Calculator.cs:
  [DEF] Line 3: public int Add(int a, int b) => a + b;

Program.cs:
       Line 7: var result = calc.Add(5, 3);
       Line 8: var sum = calc.Add(10, 20);
```

## Configuration

Configure the extension in VS Code settings:

```json
{
  "csharpCodeUsages.enableCache": true,
  "csharpCodeUsages.searchStrategies": ["workspace", "document", "text"],
  "csharpCodeUsages.enableMcpServer": true
}
```

### Settings

- `csharpCodeUsages.enableCache`: Enable/disable symbol position caching (default: `true`)
- `csharpCodeUsages.searchStrategies`: Order of search strategies to try (default: `["workspace", "document", "text"]`)
- `csharpCodeUsages.enableMcpServer`: Enable/disable MCP server for Copilot integration (default: `true`)

## MCP Integration

This extension registers an MCP server that provides the `find_csharp_usages` tool to GitHub Copilot.

### Verifying MCP Registration

1. Open Command Palette
2. Run `MCP: List Servers`
3. Look for "C# Code Usages" in the list

### MCP Tool Schema

```json
{
  "name": "find_csharp_usages",
  "description": "Find all usages of a C# symbol",
  "inputSchema": {
    "type": "object",
    "properties": {
      "symbolName": {
        "type": "string",
        "description": "The name of the C# symbol"
      },
      "filePaths": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Optional: Specific files to search"
      }
    },
    "required": ["symbolName"]
  }
}
```

## How It Works

The extension uses a multi-strategy approach to find symbols:

1. **Workspace Symbol Provider**: Uses VS Code's built-in C# language server
2. **Document Symbol Provider**: Searches specific files for detailed symbol information
3. **Text-based Search**: Falls back to regex patterns for maximum compatibility

Once the symbol is found, it uses the Reference Provider to locate all usages.

## Requirements

- VS Code 1.96.0 or later
- C# extension (for language server support)
- .NET SDK (for C# project support)

## Troubleshooting

### Symbol Not Found

- Ensure the C# language server is running (check status bar)
- Try building your project first (`dotnet build`)
- Check that the symbol name is spelled correctly

### MCP Server Not Listed

- Verify `csharpCodeUsages.enableMcpServer` is `true`
- Restart VS Code
- Check the extension is activated (open a C# file)

### Performance Issues

- Enable caching: `"csharpCodeUsages.enableCache": true`
- Reduce search strategies to only what you need
- Use `filePaths` parameter to narrow search scope

## Known Limitations

- External library symbols (like `JsonConvert`) may show limited results if source is not available
- Very large projects (1000+ files) may experience slower initial searches
- Requires C# language server to be active

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Changelog

### 0.1.0

- Initial release
- Basic symbol search functionality
- GitHub Copilot integration via MCP
- Multi-strategy symbol finding
- Smart caching system
