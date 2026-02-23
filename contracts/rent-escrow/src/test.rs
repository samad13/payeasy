#![cfg(test)]

use crate::testutils::setup_test_env;
use soroban_sdk::symbol_short;

#[test]
fn test_hello() {
    let (_env, _user, client) = setup_test_env();

    let words = client.hello(&symbol_short!("Dev"));
    assert_eq!(words, symbol_short!("Hello"));
}

#[test]
fn test_mock_environment() {
    let (env, user, _client) = setup_test_env();
    
    // Verify user address generation and environment state
    assert!(user.to_string().len() > 0);
    assert_eq!(env.ledger().sequence(), 0);
}
