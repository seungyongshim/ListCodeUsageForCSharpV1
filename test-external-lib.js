// 외부 라이브러리 심볼 테스트 스크립트
const vscode = require('vscode');

async function testExternalLibrarySymbol() {
    console.log('=== Testing External Library Symbol ===');
    
    // 1. JsonHelper.cs 파일 열기
    const filePath = 'z:\\2025\\ListCodeUsageForCSharpV1\\sample\\csharp\\JsonHelper.cs';
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    
    console.log(`Opened file: ${filePath}`);
    
    // 2. "SerializeObject" 텍스트 찾기
    const text = document.getText();
    const searchText = 'SerializeObject';
    const index = text.indexOf(searchText);
    
    if (index === -1) {
        console.log(`❌ '${searchText}' not found in file`);
        return;
    }
    
    const position = document.positionAt(index);
    console.log(`Found '${searchText}' at line ${position.line + 1}, column ${position.character + 1}`);
    
    // 3. Definition Provider 호출
    console.log('Calling vscode.executeDefinitionProvider...');
    const definitions = await vscode.commands.executeCommand(
        'vscode.executeDefinitionProvider',
        uri,
        position
    );
    
    if (!definitions || definitions.length === 0) {
        console.log('❌ No definitions found');
        return;
    }
    
    console.log(`✓ Found ${definitions.length} definition(s):`);
    for (const def of definitions) {
        console.log(`  - URI: ${def.uri.toString()}`);
        console.log(`    Scheme: ${def.uri.scheme}`);
        console.log(`    Path: ${def.uri.path}`);
        console.log(`    FsPath: ${def.uri.fsPath}`);
        console.log(`    Range: ${def.range.start.line + 1}:${def.range.start.character + 1}`);
    }
    
    // 4. Reference Provider 호출
    const firstDef = definitions[0];
    console.log('\nCalling vscode.executeReferenceProvider...');
    try {
        const references = await vscode.commands.executeCommand(
            'vscode.executeReferenceProvider',
            firstDef.uri,
            firstDef.range.start
        );
        
        if (!references || references.length === 0) {
            console.log('❌ No references found');
            return;
        }
        
        console.log(`✓ Found ${references.length} reference(s):`);
        for (const ref of references) {
            console.log(`  - ${ref.uri.fsPath}:${ref.range.start.line + 1}:${ref.range.start.character + 1}`);
        }
    } catch (error) {
        console.log(`❌ Reference Provider failed: ${error.message}`);
    }
}

// 익스포트
module.exports = { testExternalLibrarySymbol };
