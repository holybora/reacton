# Comprehensive Testing Plan for LLM Comparison App

## Overview
This plan covers unit, integration, and end-to-end testing for the LLM comparison web app, following modern web fullstack best practices.

## Current Test Coverage (✅ 61 tests passing)

### Unit Tests

**Provider Modules** (`src/__tests__/providers/`)
- ✅ OpenAI provider: validateToken + callModel (8 tests)
- ✅ Anthropic provider: validateToken + callModel (7 tests)
- ✅ Google provider: validateToken + callModel (7 tests)
- ✅ Provider registry: getProvider lookup (4 tests)

**Shared Logic** (`src/__tests__/lib/`)
- ✅ Model registry: getModelById, getProviders, getModelsByProvider (5 tests)

**React Components** (`src/__tests__/components/`)
- ✅ ApiTokenInput: border colors, status text, onChange, show/hide (7 tests)
- ✅ ResponsePreview: placeholder, loading, error, iframe rendering (6 tests)

**Custom Hooks** (`src/__tests__/hooks/`)
- ✅ useTokenValidation: debounce, validation states, reset behavior (8 tests)

**Test Results:**
```
Test Suites: 8 passed, 8 total
Tests:       61 passed, 61 total
Time:        3.846s
```

## Missing Test Coverage (To Implement)

### 1. ⏳ API Route Integration Tests (~15 tests)

**Why:** Validates business logic in Next.js route handlers, ensures proper error handling and parallel execution

**Files to create:**
- `src/__tests__/api/validate-token.test.ts` (5 tests)
- `src/__tests__/api/compare.test.ts` (10 tests)

**Key scenarios:**
- Valid/invalid token responses
- Missing parameters (400 errors)
- Provider errors (500 errors)
- Parallel model execution
- Individual model failures

### 2. ⏳ Component Integration Tests (~8 tests)

**Why:** Tests component interactions with hooks and state management

**Files to create:**
- `src/__tests__/components/CardComponent.integration.test.tsx` (4 tests)
- `src/__tests__/app/page.integration.test.tsx` (4 tests)

**Key scenarios:**
- Token validation flow (type → debounce → API call → UI update)
- Compare button enable/disable logic
- Loading states during comparison
- Selective API calls (only providers with tokens)

### 3. ⏳ End-to-End Tests with Playwright (~6 tests)

**Why:** Validates complete user flows in a real browser environment

**Setup:**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

**Files to create:**
- `e2e/token-validation.spec.ts` (3 tests)
- `e2e/compare-flow.spec.ts` (3 tests)
- `playwright.config.ts`

**Key scenarios:**
- Token validation (green/red/yellow borders)
- Compare flow (prompt → tokens → click → results)
- Error handling (auth failures, network errors)
- HTML rendering in iframes

### 4. ⏳ Performance Tests (~2 tests)

**Why:** Ensures debounce efficiency and parallel execution

**Files to create:**
- `src/__tests__/performance/debounce.test.ts` (1 test)
- `src/__tests__/performance/parallel-execution.test.ts` (1 test)

**Key scenarios:**
- Debounce prevents excessive API calls (type 10 chars → 1 call)
- Parallel execution faster than serial (3 models @ 500ms each → ~500ms total, not 1500ms)

### 5. ⏳ Accessibility Tests (~3 tests)

**Why:** Ensures WCAG 2.1 AA compliance

**Setup:**
```bash
npm install -D jest-axe
```

**Files to create:**
- `src/__tests__/a11y/components.test.tsx` (3 tests)

**Key scenarios:**
- No accessibility violations in all component states
- Proper ARIA labels and roles
- Keyboard navigation support

## Implementation Priority

### Phase 1: API Route Tests (High Priority)
**Time:** 2-3 hours
**Value:** High - validates core business logic
**Blockers:** None

### Phase 2: Component Integration Tests (High Priority)
**Time:** 2-3 hours
**Value:** High - ensures UI state management works
**Blockers:** None

### Phase 3: E2E Tests (Medium Priority)
**Time:** 3-4 hours
**Value:** Medium - validates happy paths
**Blockers:** Requires Playwright setup

### Phase 4: Performance Tests (Medium Priority)
**Time:** 1-2 hours
**Value:** Medium - prevents regressions
**Blockers:** None

### Phase 5: Accessibility Tests (Low Priority)
**Time:** 1-2 hours
**Value:** Low - nice-to-have for V1
**Blockers:** Requires jest-axe setup

## Test Execution Commands

```bash
# Unit tests (current)
npm test

# Unit tests with coverage
npm test -- --coverage

# Unit tests in watch mode
npm test -- --watch

# Integration tests only
npm test -- --testPathPattern=integration

# E2E tests (after Phase 3)
npx playwright test

# E2E tests in headed mode
npx playwright test --headed

# Run all tests
npm test && npx playwright test
```

## Coverage Goals

| Category | Current | Target After Plan |
|---|---|---|
| Unit Tests | 61 | 61 (maintain) |
| Integration Tests | 0 | 15 |
| E2E Tests | 0 | 6 |
| Performance Tests | 0 | 2 |
| Accessibility Tests | 0 | 3 |
| **Total Tests** | **61** | **87** |
| **Code Coverage** | ~70% | 85%+ |

## CI/CD Integration (Future)

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test -- --coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npx playwright test
```

## Best Practices Followed

✅ **Test Isolation:** Each test is independent, no shared state
✅ **Mock External Dependencies:** fetch, providers mocked
✅ **Fast Unit Tests:** All 61 tests run in <4 seconds
✅ **Descriptive Names:** "returns 400 for missing provider"
✅ **AAA Pattern:** Arrange-Act-Assert
✅ **Jest Setup:** Proper config with setupFilesAfterEnv
✅ **TypeScript:** Full type safety in tests

⏳ **Coverage Thresholds:** Add to jest.config.ts
⏳ **CI/CD Pipeline:** GitHub Actions workflow
⏳ **Visual Regression:** Playwright screenshots

## Summary

**Current state:** ✅ 61 unit tests covering providers, hooks, components
**Next steps:** Add 26 integration/E2E/performance/a11y tests
**Total after plan:** 87 tests with 85%+ code coverage
**Estimated effort:** 10-14 hours for all phases

This ensures production-ready quality with comprehensive coverage across all layers of the stack.
