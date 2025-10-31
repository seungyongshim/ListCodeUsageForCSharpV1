# Roslyn 특화 기능 활용 가능성

## VS Code C# 언어 서버가 제공하는 추가 API

### 1. 현재 사용 중인 기능
- ✅ `vscode.executeReferenceProvider` - 참조 찾기
- ✅ `vscode.executeDefinitionProvider` - 정의 찾기
- ✅ `vscode.executeWorkspaceSymbolProvider` - 워크스페이스 심볼 검색

### 2. 추가로 활용 가능한 Roslyn 기반 기능

#### 2.1 타입 계층 구조 (Type Hierarchy)
```typescript
// 인터페이스 구현체 또는 기본 클래스 찾기
const typeHierarchy = await vscode.commands.executeCommand<vscode.TypeHierarchyItem[]>(
    'vscode.prepareTypeHierarchy',
    uri,
    position
);

// 하위 타입 찾기
const subtypes = await vscode.commands.executeCommand(
    'vscode.provideSubtypes',
    typeHierarchyItem
);

// 상위 타입 찾기
const supertypes = await vscode.commands.executeCommand(
    'vscode.provideSupertypes',
    typeHierarchyItem
);
```

**활용 예시:**
- 인터페이스의 모든 구현체 찾기
- 추상 클래스를 상속한 모든 클래스 찾기
- 상속 계층 시각화

#### 2.2 호출 계층 구조 (Call Hierarchy)
```typescript
// 메서드 호출 계층 준비
const callHierarchy = await vscode.commands.executeCommand<vscode.CallHierarchyItem[]>(
    'vscode.prepareCallHierarchy',
    uri,
    position
);

// 이 메서드를 호출하는 곳 찾기 (incoming calls)
const incomingCalls = await vscode.commands.executeCommand<vscode.CallHierarchyIncomingCall[]>(
    'vscode.provideIncomingCalls',
    callHierarchyItem
);

// 이 메서드가 호출하는 곳 찾기 (outgoing calls)
const outgoingCalls = await vscode.commands.executeCommand<vscode.CallHierarchyOutgoingCall[]>(
    'vscode.provideOutgoingCalls',
    callHierarchyItem
);
```

**활용 예시:**
- 메서드 호출 체인 분석
- 사용되지 않는 메서드 찾기
- 리팩토링 영향 범위 분석

#### 2.3 구현 찾기 (Implementation Provider)
```typescript
// 인터페이스/추상 메서드의 구현 찾기
const implementations = await vscode.commands.executeCommand<vscode.Location[]>(
    'vscode.executeImplementationProvider',
    uri,
    position
);
```

**활용 예시:**
- 인터페이스 메서드의 실제 구현체 모두 찾기
- 추상 메서드의 오버라이드 찾기

#### 2.4 선언 찾기 (Declaration Provider)
```typescript
// 심볼의 선언 위치 찾기 (정의와 다를 수 있음)
const declarations = await vscode.commands.executeCommand<vscode.Location[]>(
    'vscode.executeDeclarationProvider',
    uri,
    position
);
```

#### 2.5 문서 심볼 (Document Symbols)
```typescript
// 파일 내 모든 심볼의 계층 구조
const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    'vscode.executeDocumentSymbolProvider',
    uri
);
```

**활용 예시:**
- 클래스 내 모든 멤버 목록
- 네임스페이스 구조 분석
- 심볼 종류별 필터링 (클래스, 메서드, 프로퍼티 등)

#### 2.6 코드 렌즈 (Code Lens)
```typescript
// 코드 렌즈 정보 (참조 수 등)
const codeLenses = await vscode.commands.executeCommand<vscode.CodeLens[]>(
    'vscode.executeCodeLensProvider',
    uri
);
```

**활용 예시:**
- 각 심볼의 참조 수 빠르게 확인
- 테스트 커버리지 정보

#### 2.7 서명 도움말 (Signature Help)
```typescript
// 메서드 오버로드 정보
const signatureHelp = await vscode.commands.executeCommand<vscode.SignatureHelp>(
    'vscode.executeSignatureHelpProvider',
    uri,
    position,
    triggerCharacter
);
```

**활용 예시:**
- 메서드의 모든 오버로드 찾기
- 매개변수 정보 분석

#### 2.8 심볼 리네임 (Rename Provider)
```typescript
// 심볼 이름 변경 가능 여부 및 영향 범위
const workspaceEdit = await vscode.commands.executeCommand<vscode.WorkspaceEdit>(
    'vscode.executeDocumentRenameProvider',
    uri,
    position,
    newName
);
```

**활용 예시:**
- 리팩토링 영향 범위 미리 확인
- 안전한 이름 변경

#### 2.9 Hover 정보
```typescript
// 심볼의 타입 정보, 문서 주석 등
const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    position
);
```

**활용 예시:**
- 타입 정보 추출
- XML 문서 주석 읽기

### 3. Roslyn 특화 확장 가능성

#### 3.1 고급 심볼 분석 도구
```typescript
const advancedTool = vscode.lm.registerTool('analyze_csharp_type_hierarchy', {
    invoke: async (options, token) => {
        const typeName = options.input.typeName;
        
        // 1. 타입 찾기
        const symbols = await findSymbol(typeName);
        
        // 2. 타입 계층 구조 분석
        const hierarchy = await analyzeTypeHierarchy(symbols[0]);
        
        // 3. 모든 구현체/상속 클래스 찾기
        const implementations = await findAllImplementations(hierarchy);
        
        return {
            type: typeName,
            implementations: implementations,
            callPaths: await analyzeCallPaths(implementations)
        };
    }
});
```

#### 3.2 메서드 사용 패턴 분석
```typescript
const patternTool = vscode.lm.registerTool('analyze_method_usage_patterns', {
    invoke: async (options, token) => {
        const methodName = options.input.methodName;
        
        // 1. 메서드 찾기
        const method = await findMethod(methodName);
        
        // 2. 호출 계층 분석
        const callHierarchy = await buildCallHierarchy(method);
        
        // 3. 사용 패턴 통계
        return {
            totalCalls: callHierarchy.incomingCalls.length,
            callers: groupByFile(callHierarchy.incomingCalls),
            unusedParameters: await detectUnusedParameters(method),
            overloads: await findOverloads(method)
        };
    }
});
```

#### 3.3 리팩토링 영향 분석
```typescript
const impactTool = vscode.lm.registerTool('analyze_refactoring_impact', {
    invoke: async (options, token) => {
        const symbolName = options.input.symbolName;
        
        // 1. 심볼 찾기
        const symbol = await findSymbol(symbolName);
        
        // 2. 모든 참조 찾기
        const references = await findAllReferences(symbol);
        
        // 3. 타입 계층 영향 분석
        const typeImpact = await analyzeTypeHierarchyImpact(symbol);
        
        // 4. 호출 체인 영향 분석
        const callImpact = await analyzeCallChainImpact(symbol);
        
        return {
            directReferences: references.length,
            affectedTypes: typeImpact.affectedTypes,
            affectedMethods: callImpact.affectedMethods,
            riskLevel: calculateRiskLevel(references, typeImpact, callImpact)
        };
    }
});
```

### 4. 구현 우선순위

#### Phase 1: 기본 확장 (현재)
- ✅ Reference Provider
- ✅ Definition Provider
- ✅ Workspace Symbol Provider

#### Phase 2: 계층 구조 분석
- [ ] Type Hierarchy Provider
- [ ] Implementation Provider
- [ ] Call Hierarchy Provider

#### Phase 3: 고급 분석
- [ ] 사용 패턴 분석
- [ ] 리팩토링 영향 분석
- [ ] 코드 품질 메트릭

### 5. 실제 활용 예시

#### 5.1 "이 인터페이스를 구현하는 모든 클래스 찾기"
```
@workspace Find all implementations of IDisposable interface
```

#### 5.2 "이 메서드를 직/간접적으로 호출하는 모든 곳 찾기"
```
@workspace Analyze call hierarchy for SaveData method
```

#### 5.3 "이 클래스를 상속한 모든 클래스와 그들의 사용처 찾기"
```
@workspace Find all subclasses of BaseController and their usages
```

#### 5.4 "리팩토링 시 영향받는 코드 분석"
```
@workspace Analyze impact of renaming UserService class
```

### 6. Python과의 차이점

| 기능 | C# (Roslyn) | Python (Pylance) | 차이 이유 |
|------|-------------|------------------|-----------|
| Type Hierarchy | ✅ 완벽 지원 | ⚠️ 제한적 | C#은 정적 타입 |
| Call Hierarchy | ✅ 완벽 지원 | ⚠️ 제한적 | Roslyn의 의미 분석 |
| Implementation | ✅ 완벽 지원 | ❌ 제한적 | 인터페이스 개념 차이 |
| 외부 라이브러리 | ✅ 메타데이터 | ⚠️ 타입 스텁 의존 | .dll vs .pyi |
| 정확도 | 99%+ | 80-90% | 정적 vs 동적 타이핑 |

### 7. 권장 사항

**즉시 구현 가능:**
1. ✅ Type Hierarchy Provider - 인터페이스/상속 분석
2. ✅ Implementation Provider - 구현체 찾기
3. ✅ Call Hierarchy Provider - 호출 체인 분석

**향후 고려:**
- 리팩토링 영향 분석 도구
- 코드 품질 메트릭 (순환 복잡도 등)
- 사용되지 않는 코드 감지

### 8. 결론

Roslyn 기반 C# 언어 서버는 Python보다 **훨씬 더 많은 정보**를 제공합니다:
- 정적 타입 시스템의 이점
- 컴파일 타임 의미 분석
- 메타데이터 기반 외부 라이브러리 지원

현재 `find_symbol_usages`는 기본 기능만 사용하고 있지만, 위의 API들을 추가로 활용하면 **매우 강력한 C# 분석 도구**를 만들 수 있습니다! 🚀
