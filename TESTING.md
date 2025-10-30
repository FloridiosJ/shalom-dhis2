# Testing Documentation

This document describes the testing infrastructure and how to run tests for the Shalom DHIS2 project.

## Overview

The project includes comprehensive test suites for both the web frontend and backend services, with a focus on the Reports & Analytics functionality.

## Test Coverage

### Web Frontend Tests (Unit Tests)

**Location:** `web/src/services/reports.test.js`

**Coverage:** 89.18% of `reports.js` service

**Test Framework:** Vitest + Testing Library

The unit tests cover all service methods in `web/src/services/reports.js`:
- ✅ `getGlobalStats` - Fetching global statistics
- ✅ `getStatsByPeriod` - Fetching statistics by period with filters
- ✅ `getTopDiagnostics` - Getting top diagnostics with various filters
- ✅ `getTopMedications` - Getting top medications
- ✅ `getConsultationsEvolution` - Getting consultation evolution over time
- ✅ `getStatsByDispensaire` - Getting statistics by dispensaire
- ✅ `exportReport` - Exporting reports in CSV/PDF format
- ✅ GraphQL error handling
- ✅ Network error handling

**Total Tests:** 25 unit tests

### Backend Integration Tests

**Location:** `backend/src/__tests__/reports.resolvers.integration.test.js`

**Test Framework:** Jest

The integration tests validate the business logic of GraphQL resolvers for analytics:

#### Query Resolvers Tested:
- ✅ `topDiagnostics` - Aggregation logic, structured/unstructured data, filters
- ✅ `topMedications` - Duration parsing, aggregation, filters
- ✅ `consultationsEvolution` - Period formatting, date range calculations
- ✅ `dispensaireStats` - Statistics aggregation, category grouping
- ✅ `reports` - Global and dispensaire-specific statistics

#### Mutation Resolvers Tested:
- ✅ `exportReport` - Data transformation, format validation, error handling

#### Additional Test Categories:
- ✅ Authentication and authorization validation
- ✅ Filter application (dates, dispensaireId, limit)
- ✅ Edge cases (empty data, invalid parameters, null values)
- ✅ Percentage calculations
- ✅ Data aggregation logic

**Total Tests:** 32 integration tests

## Running Tests

### Web Frontend Tests

```bash
cd web

# Run tests once
npm test -- --run

# Run tests in watch mode
npm test

# Run tests with coverage report
npm run test:coverage -- --run

# Run tests with UI
npm run test:ui
```

### Backend Tests

```bash
cd backend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Run All Tests

From the project root:

```bash
# Web tests
cd web && npm test -- --run && cd ..

# Backend tests
cd backend && npm test && cd ..
```

## Test Structure

### Web Unit Tests Structure

```javascript
describe('Service Method', () => {
  beforeEach(() => {
    // Setup mocks
  });

  it('should handle success case', async () => {
    // Test implementation
  });

  it('should handle error case', async () => {
    // Test implementation
  });
});
```

### Backend Integration Tests Structure

```javascript
describe('Resolver Logic', () => {
  it('should validate business logic', () => {
    // Test core logic without database
  });

  it('should handle edge cases', () => {
    // Test edge cases
  });
});
```

## Coverage Goals

- ✅ **Web services/reports.js:** 89.18% (target: >80%)
- ✅ **Backend resolvers:** Comprehensive logic coverage through integration tests

## Continuous Integration

Tests are designed to be run in CI/CD pipelines:

1. **Fast execution:** Complete test suite runs in approximately 2 seconds
2. **No external dependencies:** Tests use mocks and fixtures
3. **Deterministic:** Tests produce consistent results
4. **Isolated:** Each test is independent

## Test Scenarios Covered

### Success Cases
- ✅ Fetching data with valid parameters
- ✅ Applying various filters (dates, dispensaire, limit)
- ✅ Data aggregation and transformation
- ✅ Export generation (CSV, PDF)

### Error Cases
- ✅ GraphQL errors
- ✅ Network errors
- ✅ Authentication failures
- ✅ Invalid parameters
- ✅ Missing data
- ✅ Unsupported formats

### Edge Cases
- ✅ Empty result sets
- ✅ Null/undefined values
- ✅ Division by zero
- ✅ Invalid date formats
- ✅ Mixed structured/unstructured data
- ✅ Large datasets (pagination)

## Mocking Strategy

### Web Tests
- **Axios:** Mocked to simulate GraphQL API responses
- **localStorage:** Mocked for authentication token storage

### Backend Tests
- **Database models:** Tested logic without actual database connections
- **Export utilities:** Logic validation without file generation

## Adding New Tests

### For Web Services

1. Create/update test file in `web/src/services/[service].test.js`
2. Import the service and mock dependencies
3. Write test cases for each method
4. Ensure >80% coverage

Example:
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import myService from './myService.js';

describe('MyService', () => {
  it('should work correctly', async () => {
    // Test implementation
  });
});
```

### For Backend Resolvers

1. Create/update test file in `backend/src/__tests__/[resolver].test.js`
2. Test business logic and edge cases
3. Validate filter application
4. Test authentication/authorization

Example:
```javascript
import { describe, it, expect } from '@jest/globals';

describe('My Resolver Logic', () => {
  it('should calculate correctly', () => {
    // Test implementation
  });
});
```

## Best Practices

1. **Test behavior, not implementation:** Focus on what the code does, not how
2. **Use descriptive test names:** Clearly state what is being tested
3. **Keep tests isolated:** Each test should be independent
4. **Mock external dependencies:** Don't rely on databases or APIs
5. **Test edge cases:** Include error conditions and boundary values
6. **Maintain coverage:** Aim for >80% code coverage
7. **Run tests frequently:** Use watch mode during development

## Troubleshooting

### Tests failing with module errors
- Ensure all dependencies are installed: `npm install`
- Check that mock paths are correct

### Coverage not generating
- Install coverage package: `npm install -D @vitest/coverage-v8` (web) or jest with coverage support (backend)
- Run with coverage flag: `npm run test:coverage`

### Tests timing out
- Increase timeout in test configuration
- Check for unresolved promises
- Ensure mocks are properly configured

## Performance Benchmarks

- **Web unit tests:** 25 tests, total ~900ms (including setup/teardown)
- **Backend integration tests:** 32 tests, total ~210ms
- **Total test suite:** ~1.2s for all 57 tests (excluding npm startup overhead)

## Future Enhancements

- [ ] Add E2E tests with Playwright/Cypress
- [ ] Add mutation testing
- [ ] Add visual regression tests
- [ ] Increase coverage to 95%+
- [ ] Add performance benchmarks for large datasets
- [ ] Add contract testing for GraphQL schema

## Support

For questions about testing:
1. Check this documentation
2. Review existing test files for examples
3. Consult the team lead

## References

- [Vitest Documentation](https://vitest.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [GraphQL Testing Best Practices](https://www.apollographql.com/docs/apollo-server/testing/testing/)
