
## 목적

C# 프로젝트에서 `list_code_usages` 도구가 실패하는 근본 원인을 해결하고, `vscode.executeReferenceProvider` API를 올바르게 활용하여 Node.js/Python과 동일한 수준의 심볼 검색 기능을 제공합니다.

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

