#[test_only]
module zeraphim_ascension::quest_test {
    use one::clock;
    use one::test_scenario;
    use zeraphim_ascension::quest;

    const ALICE: address = @0x111;

    #[test]
    fun init_user_creates_state() {
        let mut scenario = test_scenario::begin(ALICE);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        quest::init_user(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ALICE);

        let user_state = test_scenario::take_from_sender<quest::UserState>(&scenario);
        assert!(quest::xp(&user_state) == 0, 100);
        assert!(quest::shards(&user_state) == 0, 101);
        assert!(quest::wings_tier(&user_state) == 0, 102);
        test_scenario::return_to_sender(&scenario, user_state);

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun complete_quest_updates_rewards() {
        let mut scenario = test_scenario::begin(ALICE);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        quest::init_user(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ALICE);

        let mut user_state = test_scenario::take_from_sender<quest::UserState>(&scenario);
        quest::complete_quest(&mut user_state, 0, &clock, test_scenario::ctx(&mut scenario));
        assert!(quest::xp(&user_state) > 0, 200);
        assert!(quest::shards(&user_state) > 0, 201);
        assert!(quest::loot_tickets(&user_state) > 0, 202);
        assert!(quest::quests_completed_total(&user_state) == 1, 203);
        test_scenario::return_to_sender(&scenario, user_state);

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
