
## 목적

C# 프로젝트에서 `list_code_usages` 도구가 실패하는 근본 원인을 해결하고, `vscode.executeReferenceProvider` API를 올바르게 활용하여 Node.js/Python과 동일한 수준의 심볼 검색 기능을 제공합니다.

## ✅ 해결 완료 (2025-10-31)

### 문제: MCP 서버 아키텍처 오류

**증상:**
```
Error: MPC -32603: MCP server running in separate process cannot access VS Code APIs directly.
```

**근본 원인:**
- MCP 서버를 **별도 Node.js 프로세스**로 실행 (`src/mcp/server.ts`)
- 별도 프로세스에서는 VS Code API(`vscode.commands.executeCommand` 등) 접근 불가능

**해결 방법:**
MCP 서버를 별도 프로세스로 실행하지 말고, **Language Model Tool**로 직접 등록:

```typescript
// ❌ 잘못된 방법: 별도 프로세스 MCP 서버
vscode.lm.registerMcpServerDefinitionProvider('id', provider);

// ✅ 올바른 방법: Language Model Tool 직접 등록
const tool = vscode.lm.registerTool('find_csharp_usages', {
    invoke: async (options, token) => {
        // VS Code API 직접 사용 가능!
        const references = await vscode.commands.executeCommand(
            'vscode.executeReferenceProvider',
            uri,
            position
        );
        // ...
    }
});
```

**변경사항:**
1. ✅ `src/extension.ts`: MCP provider 제거, Language Model Tool만 사용
2. ✅ `package.json`: `mcpServerDefinitionProviders` 제거
3. ✅ `esbuild.js`: `src/mcp/server.ts` 빌드 제거
4. ⚠️ `src/mcp/server.ts`, `src/mcp/provider.ts`: 더 이상 사용하지 않음 (삭제 가능)

### MCP 확장 vs Language Model Tool 비교

| 항목 | MCP 확장 샘플 | Language Model Tool |
|------|--------------|---------------------|
| **용도** | 외부 MCP 서버 정의 제공 | VS Code 확장 기능을 도구로 노출 |
| **실행 위치** | 별도 프로세스 | 확장 프로세스 내 |
| **VS Code API** | ❌ 접근 불가 | ✅ 접근 가능 |
| **예시** | Gist에서 가져온 서버 | `find_csharp_usages` 도구 |
| **등록 방법** | `registerMcpServerDefinitionProvider` | `vscode.lm.registerTool` |

## 근본 원인 분석

### list_code_usages의 작동 방식
```typescript
// 현재 list_code_usages의 추정 흐름
1. symbolName을 받음 (예: "Add")
2. filePath에서 심볼 정의 위치를 찾음 ← 여기서 실패!
3. vscode.executeReferenceProvider(uri, position)를 호출
4. 참조 목록 반환
```


### 꼭 참고해야 하는 링크
* https://github.com/microsoft/vscode-extension-samples/blob/main/mcp-extension-sample/src/extension.ts
  - ✅ 확인 완료: MCP 확장도 일반 VS Code API 사용 가능
  - 중요: `registerMcpServerDefinitionProvider`는 **외부 서버 정의용**
  - 우리 케이스: `vscode.lm.registerTool` 사용이 올바른 방법

## 테스트 방법

1. **확장 빌드:**
   ```powershell
   npm run compile
   ```

2. **F5로 디버깅 시작**

3. **Copilot 채팅에서 테스트:**
   ```
   @workspace Find all usages of Add in sample/csharp/MathUtils.cs
   ```

4. **예상 결과:**
   - Tool `find_csharp_usages` 호출
   - VS Code API로 심볼 검색 성공
   - 모든 참조 위치 반환