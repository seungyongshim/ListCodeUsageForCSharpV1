# C# Code Usages Finder - 빠른 테스트 가이드

## 🚀 빠른 시작 (3단계)

### 1단계: 확장 설치

```powershell
# VS Code에서 VSIX 설치
code --install-extension list-code-usages-csharp-0.1.0.vsix
```

또는 VS Code UI에서:
1. `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
2. `list-code-usages-csharp-0.1.0.vsix` 선택

### 2단계: 테스트 프로젝트 열기

```powershell
# sample/csharp 폴더를 새 창으로 열기
code sample/csharp
```

### 3단계: 검색 실행

**방법 1: 수동 검색**
```
1. Ctrl+Shift+P
2. "Find C# Code Usages" 입력
3. "Add" 입력
4. Output 패널 확인
```

**방법 2: GitHub Copilot**
```
Chat에 입력: "Find usages of Add method"
```

## 📋 테스트 시나리오

### ✅ 시나리오 1: 메서드 검색
```
심볼: Add
예상 결과: MathUtils.cs와 Calculator.cs에서 여러 usage 발견
확인 사항: Definition 표시, cross-file 참조
```

### ✅ 시나리오 2: 클래스 검색
```
심볼: Calculator
예상 결과: Calculator.cs (정의) + Program.cs (사용)
확인 사항: Definition과 usage 구분
```

### ✅ 시나리오 3: 정적 클래스 검색
```
심볼: MathUtils
예상 결과: Calculator.cs, Program.cs에서 사용
확인 사항: 정적 메서드 호출 검색
```

## 🤖 GitHub Copilot 테스트

### 테스트 질문들:

1. **기본 검색**
   ```
   "Find usages of Add method"
   ```

2. **클래스 검색**
   ```
   "Where is Calculator class used?"
   ```

3. **분석 요청**
   ```
   "Show me all usages of MathUtils and explain what it does"
   ```

### MCP 서버 확인

```
Command Palette → MCP: List Servers
→ "C# Code Usages" 가 목록에 있어야 함
```

## 🧪 F5 디버깅 테스트

개발 모드로 테스트하려면:

```
1. 이 워크스페이스에서 F5 누르기
2. 새 VS Code 창(Extension Development Host)에서
   sample/csharp 폴더 열기
3. 위의 테스트 시나리오 실행
4. Output Channel에서 로그 확인
```

## ⚙️ 설정 테스트

`settings.json`에서 설정 변경 테스트:

```json
{
  // 캐싱 비활성화 테스트
  "csharpCodeUsages.enableCache": false,
  
  // 특정 전략만 사용 테스트
  "csharpCodeUsages.searchStrategies": ["document"],
  
  // MCP 서버 비활성화 테스트
  "csharpCodeUsages.enableMcpServer": false
}
```

## 📊 예상 결과

### Add 메서드
```
Found X usage(s) of 'Add':

Definition: MathUtils.cs:3

MathUtils.cs:
  [DEF] Line 3: public static int Add(int a, int b)

Calculator.cs:
       Line X: return MathUtils.Add(a, b);

Program.cs:
       Line X: var result = calc.Add(5, 3);
```

### Calculator 클래스
```
Found X usage(s) of 'Calculator':

Definition: Calculator.cs:3

Calculator.cs:
  [DEF] Line 3: public class Calculator

Program.cs:
       Line X: var calc = new Calculator();
```

## 🐛 문제 해결

### "Symbol not found" 에러
```
1. C# extension 설치 확인
2. dotnet build 실행
3. Language Server 활성화 확인 (상태바)
```

### MCP 서버 미표시
```
1. csharpCodeUsages.enableMcpServer = true 확인
2. VS Code 재시작
3. C# 파일 열어서 확장 활성화
```

### 검색이 느림
```
1. csharpCodeUsages.enableCache = true 설정
2. 첫 검색은 느릴 수 있음 (정상)
3. 반복 검색은 빨라야 함
```

## ✅ 성공 체크리스트

- [ ] VSIX 설치 성공
- [ ] 확장 활성화 확인 (C# 파일 열었을 때)
- [ ] Add 메서드 검색 성공
- [ ] Calculator 클래스 검색 성공
- [ ] Output Channel에 결과 표시
- [ ] GitHub Copilot에서 자연어 질문 성공
- [ ] MCP 서버 목록에 "C# Code Usages" 표시

## 📞 도움이 필요하면

1. `Developer: Toggle Developer Tools` (F12)에서 콘솔 로그 확인
2. Output 패널에서 "C# Code Usages" 채널 확인
3. Extension Host 로그 확인

---

**준비 완료!** 위 단계들을 따라 테스트해보세요. 🚀
