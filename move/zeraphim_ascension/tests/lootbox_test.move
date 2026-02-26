#[test_only]
module zeraphim_ascension::lootbox_test {
    use one::clock;
    use one::test_scenario;
    use zeraphim_ascension::lootbox;
    use zeraphim_ascension::quest;

    const ALICE: address = @0x121;

    #[test]
    #[expected_failure(abort_code = 5, location = quest)]
    fun open_lootbox_requires_ticket() {
        let mut scenario = test_scenario::begin(ALICE);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        quest::init_user(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ALICE);

        let mut user_state = test_scenario::take_from_sender<quest::UserState>(&scenario);
        lootbox::open_lootbox(&mut user_state, &clock, test_scenario::ctx(&mut scenario));

        abort
    }

    #[test]
    fun open_lootbox_consumes_ticket_and_gives_reward() {
        let mut scenario = test_scenario::begin(ALICE);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        quest::init_user(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ALICE);

        let mut user_state = test_scenario::take_from_sender<quest::UserState>(&scenario);
        quest::complete_quest(&mut user_state, 2, &clock, test_scenario::ctx(&mut scenario));
        let before_tickets = quest::loot_tickets(&user_state);
        let before_shards = quest::shards(&user_state);

        lootbox::open_lootbox(&mut user_state, &clock, test_scenario::ctx(&mut scenario));
        assert!(quest::loot_tickets(&user_state) + 1 == before_tickets, 300);
        assert!(quest::shards(&user_state) >= before_shards + 50, 301);
        test_scenario::return_to_sender(&scenario, user_state);

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
