# list_code_usages Tool - Node.js vs C# vs Python 동작 비교

## 프로젝트 개요

이 프로젝트는 VS Code의 `list_code_usages` 도구가 Node.js, C#, Python 프로젝트에서 어떻게 다르게 동작하는지 테스트하고 문서화하기 위해 만들어졌습니다.

## Node.js vs C# vs Python 비교표

| 항목 | Node.js | C# | Python | 상태 |
|------|---------|-----|--------|------|
| **함수/메서드 검색** | ✅ `add` 함수 검색 가능 | ❌ `Add` 메서드 검색 불가 | ✅ `add` 함수 검색 가능 | Python 완전 지원 |
| **클래스 검색** | ✅ `Calculator` 검색 가능 | ✅ `Calculator` 검색 가능 | ✅ `Calculator` 검색 가능 | 모두 지원 |
| **Cross-file 참조** | ✅ 전체 프로젝트 검색 | ❌ 같은 파일만 검색 | ✅ 전체 프로젝트 검색 | C#만 제한 |
| **외부 라이브러리 - 타입** | ⚠️ `_` (lodash): 1515 usages | ❌ `JsonConvert` 검색 불가 | ❌ `np`, `datetime` 검색 불가 | 라이브러리 타입 미지원 |
| **외부 라이브러리 - 함수** | ✅ `moment`: 3 usages | ❌ 메서드 검색 불가 | ✅ `process_array`: 3 usages | C#만 미지원 |
| **검색 범위** | 프로젝트 전체 + node_modules | 단일 파일 | 프로젝트 전체 | C#만 제한 |
| **도구 지원 여부** | ✅ 완전 지원 | ⚠️ 제한적 지원 | ✅ 완전 지원 | - |

## 중요 참고사항

### Python 지원 확인 (Pylance 설치 완료)
Python은 **Pylance 언어 서버 설치 후 완전히 지원**됩니다.

**테스트 결과:**
- ✅ 함수/클래스 검색 완벽 지원 (8 usages for `add`, 3 usages for `Calculator`)
- ✅ Cross-file 참조 완벽 지원 (app.py, calculator.py 등 전체 프로젝트 검색)
- ✅ 사용자 정의 함수 검색 가능 (`process_array`: 3 usages, `calculate_mean`: 3 usages)
- ❌ 외부 라이브러리 모듈/별칭 미지원 (`np`, `numpy`, `datetime`, `timedelta` Symbol not found)
  - numpy 패키지 설치 후에도 동일한 결과 (모듈 레벨 심볼은 검색 불가)
  - 사용자 정의 함수는 외부 라이브러리 사용 여부와 관계없이 정상 검색

**필수 확장:**
```vscode-extensions
ms-python.python,ms-python.vscode-pylance
```

## 테스트 결과 상세

### ✅ Node.js - 정상 동작
```javascript
// 'add' 함수 검색: 3 usages 발견
- mathUtils.js: definition
- mathUtils.js: sum 함수 내부 사용
- mathUtils.js: export

// 'Calculator' 클래스 검색: 4 usages 발견 (cross-file 포함)
- calculator.js: definition, export
- app.js: import, instantiation

// 외부 라이브러리 'moment' 검색: 3 usages 발견
- externalLibHelper.js: import
- externalLibHelper.js: formatDate 함수에서 사용
- externalLibHelper.js: addDays 함수에서 사용
```

### ⚠️ Node.js - 외부 라이브러리 과다 검색
```javascript
// '_' (lodash) 검색: 1515 usages 발견!
→ node_modules/@types/lodash 내의 모든 타입 정의 포함
→ 실제 사용처(externalLibHelper.js)뿐만 아니라
   TypeScript 타입 정의 파일까지 모두 검색됨
```

### ❌ C# - 제한적 동작
```csharp
// 'Add' 메서드 검색
→ Symbol 'Add' not found

// 'MathUtils' 클래스 검색: 1 usage 발견 (definition만)
→ Calculator.cs, Program.cs의 사용은 찾지 못함

// 'JsonConvert' (외부 라이브러리) 검색
→ Symbol 'JsonConvert' not found
```

### ✅ Python - 완전 지원 (Pylance 설치 후)
```python
// 'add' 함수 검색: 8 usages 발견 (cross-file 포함)
- math_utils.py: definition, sum_list 함수 내부 사용
- calculator.py: import, add 메서드에서 사용, add_and_multiply에서 사용
- app.py: import, 두 번의 직접 호출, Calculator 사용

// 'Calculator' 클래스 검색: 3 usages 발견 (cross-file 포함)
- calculator.py: definition
- app.py: import, instantiation

// 'process_array' 함수 검색: 3 usages 발견
- external_lib_helper.py: definition
- app.py: import, 직접 호출

// 'calculate_mean' 함수 검색: 3 usages 발견
- external_lib_helper.py: definition
- app.py: import, 직접 호출

// 'np' (numpy 별칭) 검색
→ Symbol 'np' not found (numpy 패키지 설치 후에도 동일)
// 'numpy', 'datetime', 'timedelta' 검색
→ Symbol not found (모듈 레벨 심볼은 검색 불가)

# Python은 사용자 정의 함수/클래스 검색 완벽 지원
# 외부 라이브러리 사용 여부와 관계없이 사용자 정의 함수는 정상 검색
# 외부 라이브러리의 모듈/별칭은 미지원 (패키지 설치 여부 무관)
# 필수 확장: ms-python.python, ms-python.vscode-pylance
```

## 프로젝트 구조

```
ListCodeUsageForCSharpV1/
├── sample/
│   ├── nodejs/              # Node.js 테스트 프로젝트
│   │   ├── mathUtils.js     # add, multiply, sum 함수 정의
│   │   ├── calculator.js    # Calculator 클래스, mathUtils 사용
│   │   ├── app.js          # 메인 프로그램
│   │   ├── externalLibHelper.js  # lodash, moment 사용
│   │   └── package.json    # Node.js 프로젝트 설정
│   │
│   ├── csharp/             # C# 테스트 프로젝트
│   │   ├── MathUtils.cs    # Add, Multiply, Sum 정적 메서드 정의
│   │   ├── Calculator.cs   # Calculator 클래스, MathUtils 사용
│   │   ├── Program.cs      # 메인 프로그램
│   │   ├── JsonHelper.cs   # Newtonsoft.Json 사용
│   │   └── ListCodeUsagesSample.csproj  # C# 프로젝트 파일
│   │
│   ├── python/             # Python 테스트 프로젝트
│   │   ├── math_utils.py   # add, multiply, sum_list 함수 정의
│   │   ├── calculator.py   # Calculator 클래스
│   │   ├── app.py         # 메인 프로그램
│   │   ├── external_lib_helper.py  # numpy 사용
│   │   └── requirements.txt  # Python 의존성
│   │
│   └── test-instructions.ps1  # 테스트 가이드 스크립트
│
└── README.md               # 이 파일
```

## 테스트 방법

### PowerShell 테스트 가이드 실행
```powershell
.\sample\test-instructions.ps1
```

### GitHub Copilot으로 테스트

| 테스트 | 명령 예시 | 예상 결과 |
|--------|----------|----------|
| Node.js 함수 | `Find all usages of add in sample/nodejs/mathUtils.js` | ✅ 여러 파일에서 검색 |
| C# 메서드 | `Find all usages of Add in sample/csharp/MathUtils.cs` | ❌ Symbol not found |
| C# 클래스 | `Find all usages of MathUtils in sample/csharp/` | ⚠️ Definition만 검색 |
| C# 외부 라이브러리 | `Find all usages of JsonConvert in sample/csharp/JsonHelper.cs` | ❌ Symbol not found |
| Python 함수 | `Find all usages of add in sample/python/math_utils.py` | ✅ 8 usages (cross-file) |
| Python 클래스 | `Find all usages of Calculator in sample/python/calculator.py` | ✅ 3 usages (cross-file) |
| Python 외부 라이브러리 | `Find all usages of np in sample/python/external_lib_helper.py` | ❌ Symbol not found |

## 샘플 코드 실행

| 언어 | 실행 명령 | 위치 |
|------|----------|------|
| Node.js | `node app.js` | `sample/nodejs/` |
| C# | `dotnet run` | `sample/csharp/` |
| Python | `python app.py` | `sample/python/` |

## 결론

### 요약표

| 기능 | Node.js | C# | Python |
|------|---------|-----|--------|
| 전체 평가 | ✅ 완전 지원 | ⚠️ 부분 지원 | ✅ 완전 지원 |
| 함수/메서드 검색 | ✅ | ❌ | ✅ |
| 클래스 검색 | ✅ | ✅ | ✅ |
| 프로젝트 전체 검색 | ✅ | ❌ | ✅ |
| 외부 라이브러리 심볼 검색 | ✅ (일부 과다) | ❌ | ❌ (타입/별칭 미지원) |
| node_modules 필터링 | ❌ | N/A | N/A |
| **필요 확장** | TypeScript/JavaScript (내장) | C# Dev Kit (선택) | **Pylance (필수)** |

### 권장사항

1. **C# 메서드 지원 추가** - 메서드, 프로퍼티, 필드 등 멤버 심볼 검색 지원 필요
2. **Cross-file 참조 구현** - C#에서 Roslyn API를 활용한 프로젝트 전체 검색
3. **외부 라이브러리 지원 개선** - C#의 NuGet 패키지, Python의 import 모듈/별칭(np, datetime) 검색 지원
4. **Node.js node_modules 필터링** - 타입 정의 파일 제외 옵션 필요 (과다 검색 방지)
5. **Python 외부 라이브러리 모듈 지원** - numpy, pandas, datetime 등의 모듈 및 별칭(np, pd) 검색 지원

## 추가 정보

| 항목 | 내용 |
|------|------|
| 작성일 | 2025년 10월 31일 |
| 테스트 환경 | VS Code + GitHub Copilot |
| 언어 버전 | Node.js (JavaScript), .NET 6.0, Python 3.x |
| 관련 도구 | `list_code_usages`, Roslyn, TypeScript Language Service, Pylance |
| 지원 언어 | Node.js/TypeScript ✅, C# ⚠️ (제한적), Python ✅ (Pylance 필수) |
| **필요 확장** | Python: `ms-python.python` + `ms-python.vscode-pylance` |
