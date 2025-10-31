# 외부 라이브러리 심볼 테스트

## 테스트 단계

1. **F5**를 눌러 디버깅 시작
2. 새 창에서 `sample/csharp` 폴더 열기
3. Copilot 채팅에서 다음 명령 실행:

```
@workspace Find all usages of SerializeObject in sample/csharp/JsonHelper.cs
```

## 예상 결과

### ✅ 성공 시
```json
{
  "symbolName": "SerializeObject",
  "totalCount": 3,
  "usages": [
    {
      "file": "z:\\2025\\ListCodeUsageForCSharpV1\\sample\\csharp\\JsonHelper.cs",
      "line": 14,
      "column": 28,
      "text": "return JsonConvert.SerializeObject(obj);",
      "isDefinition": false
    },
    {
      "file": "z:\\2025\\ListCodeUsageForCSharpV1\\sample\\csharp\\JsonHelper.cs",
      "line": 25,
      "column": 28,
      "text": "return JsonConvert.SerializeObject(obj, Formatting.Indented);",
      "isDefinition": false
    },
    // ... 외부 라이브러리 정의 포함
  ]
}
```

### ❌ 실패 시
```
Symbol 'SerializeObject' not found
```

## 디버깅 로그 확인

출력 창 > GitHub Copilot Language Server에서 다음 로그 확인:

```
[DefinitionProvider] Searching for 'SerializeObject' in 1 files
[DefinitionProvider] Found 'SerializeObject' at JsonHelper.cs:14:28
[DefinitionProvider] Got 1 definitions
[DefinitionProvider] ✓ Found definition: [NuGet 패키지 경로]/JsonConvert.cs:XXX
```

## 추가 테스트

### 테스트 1: JsonConvert 클래스
```
@workspace Find all usages of JsonConvert in sample/csharp/JsonHelper.cs
```

### 테스트 2: DeserializeObject 메서드
```
@workspace Find all usages of DeserializeObject in sample/csharp/JsonHelper.cs
```

### 테스트 3: Formatting enum
```
@workspace Find all usages of Formatting in sample/csharp/JsonHelper.cs
```
