# Changelog

All notable changes to the "C# Code Usages Finder" extension will be documented in this file.

## [0.1.0] - 2025-10-31

### Added
- Initial release
- Find all usages of C# symbols (classes, methods, properties, etc.)
- GitHub Copilot integration via Model Context Protocol (MCP)
- Multi-strategy symbol search:
  - Workspace symbol provider
  - Document symbol provider
  - Text-based pattern matching
- Smart caching system for improved performance
- Output panel showing detailed results
- Configuration options for customization
- MCP server definition provider
- Internal command API for programmatic access

### Features
- Support for finding usages across entire workspace
- File path filtering for focused searches
- Definition vs. usage differentiation
- Sorted results by file and line number
- Progress indicators for long-running searches
- Error handling and user-friendly messages

### Known Issues
- External library symbols may show limited results
- Large projects may experience slower initial searches
- Requires active C# language server
