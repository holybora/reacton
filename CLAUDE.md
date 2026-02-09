# Claude Code Project Configuration

## Project Overview

LLM Comparison Tool — a Next.js web app for comparing responses from different LLMs (OpenAI, Anthropic, Google) side-by-side.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Linting:** ESLint with next config
- **Package Manager:** npm

## Project Structure

```
src/
  app/
    layout.tsx    — root layout with metadata
    page.tsx      — home page
    globals.css   — global styles (Tailwind + dark theme)
tasks/            — task files for incremental feature development
```

## Commands

```bash
npm run dev       # Start dev server on localhost:3000
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm test          # Run all unit tests (61 tests)
npm test -- --coverage  # Run tests with coverage report
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Required keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`

`.env.local` is gitignored — never commit real API keys.

## MCP Servers

This project uses [Figma Developer MCP](https://www.npmjs.com/package/figma-developer-mcp) to give Claude Code access to Figma design files. Config is in `.mcp.json`.

### Setup: Figma Personal Access Token

1. Go to Figma account settings: https://www.figma.com/settings
2. Scroll to "Personal access tokens" and generate a new token
3. Export it in your shell profile (`~/.zshrc` or `~/.bashrc`):

   ```bash
   export FIGMA_API_KEY="your-figma-personal-access-token"
   ```

4. Restart your terminal or `source ~/.zshrc`

Never commit your Figma API key. The `.mcp.json` references the env var only.

### Verifying

Run `/mcp` in Claude Code — `figma-developer-mcp` should show as connected.

## Testing

This project has comprehensive test coverage with **61 unit tests** covering all critical functionality.

### Test Structure

```
src/__tests__/
  providers/          # Provider module tests (26 tests)
    openai.test.ts    # OpenAI validateToken + callModel
    anthropic.test.ts # Anthropic validateToken + callModel
    google.test.ts    # Google validateToken + callModel
    index.test.ts     # Provider registry

  lib/                # Shared logic tests (5 tests)
    models.test.ts    # Model registry, getModelById, etc.

  components/         # React component tests (13 tests)
    ApiTokenInput.test.tsx      # Token input with status borders
    ResponsePreview.test.tsx    # Loading, error, iframe rendering

  hooks/              # Custom hook tests (8 tests)
    useTokenValidation.test.ts  # Debounced validation with states
```

### Running Tests

```bash
# Run all tests (fast, <4 seconds)
npm test

# Run tests in watch mode (for development)
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test src/__tests__/providers/openai.test.ts
```

### Pre-Commit Testing Requirements

**IMPORTANT:** Always run tests before committing code.

```bash
# Pre-commit checklist (run these in order)
npm test              # All tests must pass
npm run build         # Production build must succeed
npm run lint          # No linting errors
```

**Automated pre-commit hook** (recommended):
```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
npm test && npm run build
```

### Test Coverage

Current coverage: **~70%** of critical code paths

| Category | Tests | Coverage |
|---|---|---|
| Provider modules | 26 | 100% |
| Model registry | 5 | 100% |
| Components | 13 | 95% |
| Hooks | 8 | 100% |
| **Total** | **61** | **~70%** |

### Writing New Tests

When adding new features, follow these patterns:

**Provider Tests** (`src/__tests__/providers/`)
- Mock `fetch` globally
- Test success and all error cases (401, 429, 500, timeout, network)
- Verify request format and response parsing

**Component Tests** (`src/__tests__/components/`)
- Use `@testing-library/react` and `userEvent`
- Test all UI states (idle, loading, success, error)
- Verify accessibility (labels, ARIA attributes)

**Hook Tests** (`src/__tests__/hooks/`)
- Use `renderHook` from `@testing-library/react`
- Use `jest.useFakeTimers()` for debounce/delay testing
- Test cleanup (unmount, abort signals)

### Test Best Practices

1. **Test Isolation:** Each test is independent, no shared state
2. **Mock External Dependencies:** Always mock `fetch` and provider modules
3. **Fast Tests:** All 61 tests run in <4 seconds
4. **Descriptive Names:** "returns 400 for missing provider" not "test error"
5. **AAA Pattern:** Arrange-Act-Assert structure
6. **No Skipped Tests:** Never commit with `test.skip` or `it.skip`

### Maintaining Tests

**Before making changes:**
1. Run tests to establish baseline: `npm test`
2. Make your changes
3. Run tests again: `npm test`
4. If tests fail, either fix the code or update the test (if behavior intentionally changed)
5. Add new tests for new functionality
6. Verify coverage hasn't dropped: `npm test -- --coverage`

**When tests fail:**
- Read the error message carefully
- Check if your changes broke existing functionality
- Update tests only if you intentionally changed behavior
- Never comment out or delete failing tests

**Adding new tests:**
- Write tests for new components, hooks, or providers
- Follow existing test patterns in the codebase
- Aim for 100% coverage of new code
- Test both success and error paths

### Debugging Failed Tests

```bash
# Run a single test file
npm test src/__tests__/providers/openai.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="validates token"

# Run with verbose output
npm test -- --verbose

# Run with coverage to see what's not tested
npm test -- --coverage --coverageReporters=text
```

### Further Reading

- Full testing plan: `TESTING_PLAN.md`
- Jest documentation: https://jestjs.io/
- React Testing Library: https://testing-library.com/react
