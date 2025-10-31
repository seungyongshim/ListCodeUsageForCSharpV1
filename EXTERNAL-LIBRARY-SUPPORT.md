# 외부 라이브러리 심볼 검색 지원

## 개요

`find_csharp_usages` 도구는 **Definition Provider 전략**을 사용하여 외부 라이브러리(NuGet 패키지) 심볼도 검색할 수 있습니다.

## 요구사항

### 필수 VS Code 확장

외부 라이브러리 심볼 검색을 위해서는 **C# 언어 서버**가 필요합니다:

```
ms-dotnettools.csharp
```

또는

```
ms-dotnettools.csdevkit
```

### 프로젝트 설정

1. **프로젝트 빌드**: NuGet 패키지가 복원되어야 합니다
   ```powershell
   dotnet build
   ```

2. **Language Server 활성화**: C# 파일을 열면 자동으로 활성화됩니다

## 작동 원리

### Definition Provider 전략

```typescript
// 1. 파일에서 심볼 이름을 텍스트로 검색
const regex = new RegExp(`\\b${symbolName}\\b`, 'g');
while ((match = regex.exec(text)) !== null) {
    const position = document.positionAt(match.index);
    
    // 2. VS Code Definition Provider 호출
    const definitions = await vscode.commands.executeCommand(
        'vscode.executeDefinitionProvider',
        uri,
        position
    );
    
    // 3. 외부 라이브러리 DLL의 메타데이터도 정의로 인식
    if (definitions && definitions.length > 0) {
        return definitions[0]; // ✓ 외부 라이브러리 정의 반환
    }
}
```

### 검색 전략 순서

기본 설정:
```json
{
  "csharpCodeUsages.searchStrategies": [
    "definition",   // ← 외부 라이브러리 지원!
    "workspace",
    "document",
    "text"
  ]
}
```

- **definition**: F12(Go to Definition)와 동일한 방식으로 작동
  - ✅ 외부 라이브러리 (NuGet 패키지) 지원
  - ✅ 메타데이터 파일(.dll) 정의도 인식
  - ✅ C# Language Server의 모든 기능 활용

- **workspace**: 워크스페이스 심볼 검색
  - ❌ 외부 라이브러리 미지원
  - ✅ 프로젝트 내 소스 코드만

- **document**: 파일 내 심볼 검색
- **text**: 텍스트 패턴 매칭

## 테스트 예시

### 외부 라이브러리 심볼 검색

```csharp
using Newtonsoft.Json;

public class JsonHelper
{
    public static string Serialize(object obj)
    {
        return JsonConvert.SerializeObject(obj);  // ← 외부 라이브러리 메서드
    }
}
```

**Copilot 채팅에서 테스트:**
```
@workspace Find all usages of SerializeObject in sample/csharp/JsonHelper.cs
```

**예상 결과:**
```json
{
  "symbolName": "SerializeObject",
  "totalCount": 2,
  "usages": [
    {
      "file": "z:\\2025\\ListCodeUsageForCSharpV1\\sample\\csharp\\JsonHelper.cs",
      "line": 14,
      "column": 34,
      "text": "return JsonConvert.SerializeObject(obj);",
      "isDefinition": false
    },
    {
      "file": "z:\\2025\\ListCodeUsageForCSharpV1\\sample\\csharp\\JsonHelper.cs",
      "line": 26,
      "column": 34,
      "text": "return JsonConvert.SerializeObject(obj, Formatting.Indented);",
      "isDefinition": false
    }
  ],
  "definitionLocation": {
    "uri": "csharp:/metadata/.../Newtonsoft.Json.dll",
    "range": { ... }
  }
}
```

### Definition Location URI 스킴

외부 라이브러리 정의의 URI는 특별한 스킴을 사용합니다:

- `csharp:/metadata/...`: C# 메타데이터 (DLL decompiled)
- `file://...`: 소스 코드 파일

## 수동 테스트 명령

VS Code Command Palette (F1)에서:
```
Test External Library Symbol Detection
```

이 명령은 다음을 수행합니다:
1. `JsonHelper.cs`에서 `SerializeObject` 검색
2. Definition Provider 호출
3. Reference Provider 호출
4. 결과를 Output 창에 표시

## 트러블슈팅

### "Symbol not found" 오류

**원인 1: C# Language Server 미설치**
```
해결: C# 확장 설치
code --install-extension ms-dotnettools.csharp
```

**원인 2: 프로젝트 빌드 안 됨**
```powershell
cd sample/csharp
dotnet build
```

**원인 3: Language Server 초기화 중**
```
해결: C# 파일을 열고 몇 초 대기
     (하단 상태바에서 "Ready" 확인)
```

**원인 4: Definition 전략 비활성화**
```json
// settings.json
{
  "csharpCodeUsages.searchStrategies": [
    "definition",  // ← 이게 있어야 함!
    "workspace",
    "document",
    "text"
  ]
}
```

### Reference Provider 실패

Definition은 찾았지만 Reference가 없는 경우:

```
원인: OmniSharp가 메타데이터 URI에서 Reference 검색 미지원
해결: 현재는 정의 위치만 제공됩니다.
```

## 제한사항

1. **Reference Provider 제한**
   - 외부 라이브러리 정의 위치는 찾을 수 있음
   - 하지만 그 메타데이터 URI에서 Reference Provider 호출 시 실패할 수 있음
   - 이는 C# Language Server의 제한사항

2. **Performance**
   - Definition Provider는 각 파일의 모든 심볼 출현 위치에서 호출됨
   - 대규모 프로젝트에서는 느릴 수 있음
   - 해결: filePaths 파라미터로 검색 범위 제한

## 향후 개선 방안

1. **MCP Reflection Server 통합**
   - NuGet 패키지 심볼을 Roslyn으로 직접 분석
   - `mcp_reflectionmcp_find_nuget_symbol` 도구 활용

2. **캐싱**
   - Definition 결과 캐싱으로 성능 개선
   - SymbolCache에 외부 라이브러리 정의 저장

3. **더 나은 에러 메시지**
   - C# Language Server 상태 확인
   - 사용자에게 구체적인 해결 방법 제시
