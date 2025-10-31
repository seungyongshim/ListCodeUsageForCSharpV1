# Test list_code_usages tool
# This script demonstrates the usage of list_code_usages in both Node.js and C# projects

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "list_code_usages Tool Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Node.js - find usages of 'add' function
Write-Host "[Test 1] Node.js - Finding usages of 'add' function" -ForegroundColor Yellow
Write-Host "Expected: Should find usages in mathUtils.js (definition), calculator.js, app.js, and sum function" -ForegroundColor Gray
Write-Host "Location: sample/nodejs/" -ForegroundColor Gray
Write-Host "Note: Use list_code_usages tool with symbolName='add' and filePaths=['z:\2025\ListCodeUsageForCSharpV1\sample\nodejs\mathUtils.js']" -ForegroundColor Magenta
Write-Host ""

# Test 2: Node.js - find usages of 'Calculator' class
Write-Host "[Test 2] Node.js - Finding usages of 'Calculator' class" -ForegroundColor Yellow
Write-Host "Expected: Should find instantiation in app.js" -ForegroundColor Gray
Write-Host "Location: sample/nodejs/" -ForegroundColor Gray
Write-Host "Note: Use list_code_usages tool with symbolName='Calculator' and filePaths=['z:\2025\ListCodeUsageForCSharpV1\sample\nodejs\calculator.js']" -ForegroundColor Magenta
Write-Host ""

# Test 3: C# - find usages of 'Add' method
Write-Host "[Test 3] C# - Finding usages of 'Add' method" -ForegroundColor Yellow
Write-Host "Expected: Should find usages in MathUtils.cs (definition), Calculator.cs, Program.cs, and Sum method" -ForegroundColor Gray
Write-Host "Location: sample/csharp/" -ForegroundColor Gray
Write-Host "Note: Use list_code_usages tool with symbolName='Add' and filePaths=['z:\2025\ListCodeUsageForCSharpV1\sample\csharp\MathUtils.cs']" -ForegroundColor Magenta
Write-Host ""

# Test 4: C# - find usages of 'Calculator' class
Write-Host "[Test 4] C# - Finding usages of 'Calculator' class" -ForegroundColor Yellow
Write-Host "Expected: Should find instantiation in Program.cs" -ForegroundColor Gray
Write-Host "Location: sample/csharp/" -ForegroundColor Gray
Write-Host "Note: Use list_code_usages tool with symbolName='Calculator' and filePaths=['z:\2025\ListCodeUsageForCSharpV1\sample\csharp\Calculator.cs']" -ForegroundColor Magenta
Write-Host ""

# Test 5: C# - find usages of external library method (JsonConvert)
Write-Host "[Test 5] C# - Finding usages of 'JsonConvert' from Newtonsoft.Json (External Library)" -ForegroundColor Yellow
Write-Host "Expected: ISSUE - list_code_usages may not work correctly for external library symbols" -ForegroundColor Red
Write-Host "Location: sample/csharp/JsonHelper.cs uses JsonConvert.SerializeObject and JsonConvert.DeserializeObject" -ForegroundColor Gray
Write-Host "Note: This tests whether list_code_usages can find usages of symbols from NuGet packages" -ForegroundColor Magenta
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "How to use this test:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Open VS Code with this workspace" -ForegroundColor White
Write-Host "2. Use GitHub Copilot Chat to invoke list_code_usages tool" -ForegroundColor White
Write-Host "3. Compare the results between Node.js and C# projects" -ForegroundColor White
Write-Host "4. Check if external library references are handled correctly" -ForegroundColor White
Write-Host ""

Write-Host "Example Copilot prompts:" -ForegroundColor Green
Write-Host "  - 'Find all usages of the add function in the nodejs sample'" -ForegroundColor Gray
Write-Host "  - 'Find all usages of the Add method in the csharp sample'" -ForegroundColor Gray
Write-Host "  - 'Find all usages of JsonConvert in the csharp sample'" -ForegroundColor Gray
Write-Host ""
