# Soroban Contract Testing Guidelines

This document outlines the testing framework and best practices for the `rent-escrow` contract.

## Running Tests

To run the contract tests locally, use:

```bash
cargo test --features testutils
```

The `--features testutils` flag is required to enable mock environments and test utilities.

## Test Structure

- `src/lib.rs`: Contains the `mod test` and `mod testutils` declarations.
- `src/testutils.rs`: Contains common setup logic like `setup_test_env()` which initializes a mock environment and registers the contract.
- `src/test.rs`: Contains the actual test cases.

## Best Practices

1. **Mock All Auths**: Use `env.mock_all_auths()` in your test setup to bypass manual signature generation for every call unless testing specific authorization logic.
2. **Address Generation**: Use `Address::generate(&env)` for creating dummy user accounts.
3. **Ledger state**: Use `env.ledger().set(...)` to simulate specific block numbers, timestamps, or sequences if your contract depends on time-based logic.
4. **Client Pattern**: Use the generated `<ContractName>Client` for interacting with your contract in tests.

## Continuous Integration

The GitHub Action in `.github/workflows/contract-tests.yml` automatically runs these tests on every push to the `main` branch.
