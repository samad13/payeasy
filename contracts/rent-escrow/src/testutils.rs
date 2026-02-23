#![cfg(test)]

use soroban_sdk::{Env, Address, testutils::Address as _};
use crate::{RentContract, RentContractClient};

pub fn setup_test_env() -> (Env, Address, RentContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, RentContract);
    let client = RentContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    (env, user, client)
}
