# C# Code Usages Finder - 구현 계획

## 프로젝트 개요
C# 프로젝트에서 `list_code_usages` 도구 실패 문제를 해결하고, MCP 서버로 GitHub Copilot과 통합하는 VS Code 확장 개발

## Phase 1: 프로젝트 초기 설정 (1일차)

### 1.1 프로젝트 구조 생성
- [ ] 프로젝트 루트 디렉토리 생성 (`list_code_usages_csharp/`)
- [ ] `package.json` 생성 (VS Code 확장 매니페스트)
- [ ] `tsconfig.json` 생성 (TypeScript 설정)
- [ ] `src/` 디렉토리 생성
- [ ] `.vscode/launch.json` 생성 (디버깅 설정)
- [ ] `.gitignore` 생성

### 1.2 의존성 설치
- [ ] `npm init -y` 실행
- [ ] `@types/vscode` 설치 (devDependencies)
- [ ] `@types/node` 설치 (devDependencies)
- [ ] `typescript` 설치 (devDependencies)
- [ ] `@vscode/vsce` 설치 (devDependencies)
- [ ] `@modelcontextprotocol/sdk` 설치 (dependencies)

### 1.3 빌드 스크립트 설정
- [ ] `package.json`에 `compile` 스크립트 추가
- [ ] `package.json`에 `watch` 스크립트 추가
- [ ] `package.json`에 `package` 스크립트 추가
- [ ] 첫 빌드 테스트 (`npm run compile`)

## Phase 2: 핵심 기능 구현 - 심볼 찾기 (1-2일차)

### 2.1 SymbolFinder 구현 (`src/symbolFinder.ts`)
- [ ] `SymbolFinder` 클래스 생성
- [ ] `findSymbolPosition()` 메서드 구현
- [ ] 전략 1: `findInDocument()` - 텍스트 기반 검색 구현
  - [ ] 메서드 패턴 매칭 (예: `public int Add(`)
  - [ ] 프로퍼티 패턴 매칭
  - [ ] 클래스 패턴 매칭
  - [ ] 인터페이스 패턴 매칭
- [ ] 전략 2: `executeWorkspaceSymbolProvider` 통합
  - [ ] Workspace Symbol 검색 호출
  - [ ] `findBestMatch()` - 결과 필터링 구현
- [ ] 전략 3: `executeDocumentSymbolProvider` 통합
  - [ ] Document Symbol 검색 호출
  - [ ] `findSymbolRecursive()` - 재귀 검색 구현

### 2.2 캐싱 시스템 구현 (`src/symbolCache.ts`)
- [ ] `SymbolCache` 클래스 생성
- [ ] `getCachedPosition()` 메서드 구현
- [ ] `setCachedPosition()` 메서드 구현
- [ ] `invalidate()` 메서드 구현
- [ ] 파일 변경 감지 이벤트 연결 (`onDidChangeTextDocument`)

### 2.3 단위 테스트 작성
- [ ] 테스트 프레임워크 설정 (Jest 또는 Mocha)
- [ ] `SymbolFinder` 테스트 케이스 작성
  - [ ] 같은 파일 내 메서드 검색 테스트
  - [ ] 클래스 검색 테스트
  - [ ] 실패 케이스 테스트

## Phase 3: 참조 찾기 구현 (2일차)

### 3.1 UsageFinder 구현 (`src/usageFinder.ts`)
- [ ] `Usage` 인터페이스 정의
- [ ] `UsageFinder` 클래스 생성
- [ ] `findAllUsages()` 메서드 구현
  - [ ] `SymbolFinder`로 위치 찾기
  - [ ] `executeReferenceProvider` 호출
  - [ ] 결과를 `Usage[]`로 변환
- [ ] Definition vs Reference 구분 로직 추가

### 3.2 통합 테스트
- [ ] `sample/csharp` 프로젝트로 테스트
  - [ ] `Add` 메서드: 5 usages 확인
  - [ ] `Calculator` 클래스: 4 usages 확인
  - [ ] Cross-file 참조 확인

## Phase 4: VS Code 확장 통합 (2-3일차)

### 4.1 Extension 진입점 구현 (`src/extension.ts`)
- [ ] `activate()` 함수 구현
- [ ] `deactivate()` 함수 구현
- [ ] `UsageFinder` 인스턴스 생성
- [ ] 명령 등록 (`list_code_usages_csharp.findUsages`)
- [ ] 진행 상황 UI 표시 (`withProgress`)
- [ ] 에러 처리 및 사용자 알림

### 4.2 명령 구현 (`src/commands.ts`)
- [ ] `findUsagesCommand()` 함수 구현
- [ ] 현재 파일 자동 감지
- [ ] 결과 포맷팅
- [ ] Output Channel 출력 옵션 추가

### 4.3 package.json 설정
- [ ] `activationEvents` 설정 (`onLanguage:csharp`)
- [ ] `contributes.commands` 설정
- [ ] `contributes.configuration` 설정
  - [ ] `enableCache` 옵션
  - [ ] `searchStrategies` 옵션

### 4.4 로컬 테스트
- [ ] F5로 Extension Development Host 실행
- [ ] 명령 팔레트에서 명령 테스트
- [ ] `sample/csharp` 프로젝트에서 실제 검색 테스트
- [ ] 에러 케이스 테스트

## Phase 5: MCP 서버 구현 (3-4일차)

### 5.1 MCP 서버 정의 프로바이더 (`src/mcp/provider.ts`)
- [ ] `registerMcpServer()` 함수 구현
- [ ] `McpServerDefinitionProvider` 구현
  - [ ] `provideMcpServerDefinitions()` 구현
  - [ ] `resolveMcpServerDefinition()` 구현
- [ ] `vscode.lm.registerMcpServerDefinitionProvider()` 호출
- [ ] 환경 변수 설정 (워크스페이스 경로 등)

### 5.2 MCP 서버 구현 (`src/mcp/server.ts`)
- [ ] MCP SDK 임포트
- [ ] `Server` 인스턴스 생성
- [ ] `ListToolsRequestSchema` 핸들러 구현
  - [ ] `find_csharp_usages` 도구 정의
  - [ ] Input schema 정의
- [ ] `CallToolRequestSchema` 핸들러 구현
  - [ ] 파라미터 파싱
  - [ ] VS Code 명령 호출
  - [ ] 결과 JSON 변환
  - [ ] 에러 처리
- [ ] Stdio transport 설정
- [ ] `main()` 함수 구현

### 5.3 package.json MCP 설정
- [ ] `contributes.mcpServerDefinitionProviders` 추가
- [ ] MCP 서버 ID 및 라벨 설정
- [ ] `enableMcpServer` 설정 옵션 추가

### 5.4 MCP 서버 테스트
- [ ] MCP 서버 독립 실행 테스트
- [ ] Stdio 통신 테스트
- [ ] 도구 목록 조회 테스트
- [ ] 도구 호출 테스트 (실제 검색)

## Phase 6: GitHub Copilot 통합 테스트 (4-5일차)

### 6.1 확장 설치 및 등록
- [ ] VSIX 빌드 (`npm run package`)
- [ ] 로컬 설치 테스트
- [ ] MCP 서버 등록 확인
  - [ ] MCP: List Servers 명령 실행
  - [ ] "C# Code Usages" 서버 확인

### 6.2 GitHub Copilot Agent 테스트
- [ ] Agent Mode 활성화
- [ ] "Find usages of Add" 명령 테스트
- [ ] MCP 도구 자동 호출 확인
- [ ] 결과 표시 확인
- [ ] 외부 라이브러리 검색 테스트 (`JsonConvert`)

### 6.3 통합 시나리오 테스트
- [ ] 메서드 검색 → 리팩토링 제안
- [ ] 클래스 검색 → 사용처 분석
- [ ] 외부 라이브러리 → API 사용법 확인

## Phase 7: 성능 최적화 및 UX 개선 (5-6일차)

### 7.1 성능 최적화
- [ ] 캐시 히트율 측정
- [ ] 검색 전략 우선순위 최적화
- [ ] 타임아웃 설정 추가
- [ ] 대형 프로젝트 테스트 (100+ 파일)

### 7.2 UX 개선
- [ ] 진행 상황 표시 개선
- [ ] 검색 결과 UI 개선
- [ ] 에러 메시지 개선
- [ ] 설정 옵션 검증

### 7.3 에러 처리 강화
- [ ] Language Server 없음 감지
- [ ] 심볼 못 찾음 케이스 처리
- [ ] 타임아웃 처리
- [ ] MCP 통신 오류 처리

## Phase 8: 문서화 및 배포 준비 (6-7일차)

### 8.1 문서 작성
- [ ] `README.md` 작성
  - [ ] 기능 설명
  - [ ] 설치 방법
  - [ ] 사용 방법
  - [ ] MCP 통합 가이드
  - [ ] 트러블슈팅
- [ ] `CHANGELOG.md` 작성
- [ ] 코드 주석 보완

### 8.2 예제 및 스크린샷
- [ ] 사용 예제 GIF 제작
- [ ] GitHub Copilot 통합 데모
- [ ] 비교 표 (Before/After)

### 8.3 배포 준비
- [ ] 라이선스 파일 추가 (MIT)
- [ ] `.vscodeignore` 설정
- [ ] 최종 VSIX 빌드
- [ ] 테스트 체크리스트 완료

## Phase 9: Marketplace 배포 (선택 사항)

### 9.1 Publisher 설정
- [ ] Azure DevOps 계정 생성
- [ ] Personal Access Token 생성
- [ ] Publisher 등록

### 9.2 배포
- [ ] `vsce publish` 실행
- [ ] Marketplace 등록 확인
- [ ] 설치 테스트

### 9.3 홍보
- [ ] GitHub 리포지토리 공개
- [ ] 블로그 포스트 작성
- [ ] Reddit/Stack Overflow 공유

## Phase 10: 고급 기능 (선택 사항)

### 10.1 외부 라이브러리 강화
- [ ] NuGet 패키지 메타데이터 직접 읽기
- [ ] 소스 링크 지원
- [ ] XML 문서 주석 표시

### 10.2 다른 언어 지원 검토
- [ ] F# 지원 가능성 검토
- [ ] VB.NET 지원 가능성 검토

### 10.3 MCP 서버 독립 배포
- [ ] npm 패키지로 분리
- [ ] CLI 인터페이스 추가
- [ ] Claude Desktop 통합 가이드

## 테스트 체크리스트

### 기본 기능
- [ ] 메서드 검색 (같은 파일)
- [ ] 메서드 검색 (다른 파일)
- [ ] 클래스 검색
- [ ] 인터페이스 검색
- [ ] 프로퍼티 검색
- [ ] 외부 라이브러리 심볼 검색 (`JsonConvert`)

### MCP 통합
- [ ] MCP 서버 등록 확인
- [ ] 도구 목록 조회
- [ ] GitHub Copilot에서 도구 호출
- [ ] 자연어 질문 → 자동 검색

### 에러 케이스
- [ ] 존재하지 않는 심볼
- [ ] Language Server 없음
- [ ] 빈 프로젝트
- [ ] 대형 프로젝트 (성능)

### 성능
- [ ] 첫 검색: < 500ms
- [ ] 캐시된 검색: < 50ms
- [ ] 100+ 파일 프로젝트: < 1s

## 성공 기준

### Must Have (필수)
- [x] `Add` 메서드 검색 성공 (5 usages)
- [ ] Cross-file 참조 검색 성공
- [ ] MCP 서버 등록 및 GitHub Copilot 통합
- [ ] 기본 에러 처리

### Should Have (권장)
- [ ] `JsonConvert` 외부 라이브러리 검색 성공
- [ ] 캐싱 시스템 작동
- [ ] 진행 상황 UI 표시
- [ ] 설정 옵션 제공

### Could Have (선택)
- [ ] Marketplace 배포
- [ ] MCP 서버 독립 배포
- [ ] 다른 언어 지원

## 예상 소요 시간

- Phase 1-2: 1-2일 (프로젝트 설정 + 심볼 찾기)
- Phase 3-4: 1-2일 (참조 찾기 + VS Code 확장)
- Phase 5-6: 2-3일 (MCP 서버 + Copilot 통합)
- Phase 7-8: 1-2일 (최적화 + 문서화)
- **총 예상 시간: 5-9일**

## 현재 진행 상황

- [x] 설계 문서 작성 (`확장도구.md`)
- [x] 실행 계획 작성 (`plan.md`)
- [ ] 프로젝트 초기 설정 (다음 단계)

---

**작성일**: 2025년 10월 31일  
**버전**: 1.0  
**다음 작업**: Phase 1.1 - 프로젝트 구조 생성
