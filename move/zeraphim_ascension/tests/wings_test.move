#[test_only]
module zeraphim_ascension::wings_test {
    use one::clock;
    use one::test_scenario;
    use zeraphim_ascension::quest;
    use zeraphim_ascension::wings;

    const ALICE: address = @0x131;

    #[test]
    #[expected_failure(abort_code = 7, location = wings)]
    fun evolve_requires_mint() {
        let mut scenario = test_scenario::begin(ALICE);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        quest::init_user(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ALICE);

        let mut user_state = test_scenario::take_from_sender<quest::UserState>(&scenario);
        wings::evolve_wings(&mut user_state, &clock, test_scenario::ctx(&mut scenario));

        abort
    }

    #[test]
    fun mint_and_evolve_wings() {
        let mut scenario = test_scenario::begin(ALICE);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        quest::init_user(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ALICE);

        let mut user_state = test_scenario::take_from_sender<quest::UserState>(&scenario);

        let mut quest_id = 0;
        while (quest_id < 6) {
            quest::complete_quest(&mut user_state, quest_id, &clock, test_scenario::ctx(&mut scenario));
            quest_id = quest_id + 1;
        };

        wings::mint_wings(&mut user_state, &clock, test_scenario::ctx(&mut scenario));
        wings::evolve_wings(&mut user_state, &clock, test_scenario::ctx(&mut scenario));

        assert!(quest::wings_tier(&user_state) == 2, 400);
        assert!(quest::shards(&user_state) >= 0, 401);
        test_scenario::return_to_sender(&scenario, user_state);

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
