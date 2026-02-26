module zeraphim_ascension::wings {
    use one::clock::Clock;
    use one::event;
    use zeraphim_ascension::quest::{Self, UserState};
    use zeraphim_ascension::types;

    public struct WingsMintedEvent has copy, drop {
        user: address,
        tier: u8,
        timestamp: u64
    }

    public struct WingsEvolvedEvent has copy, drop {
        user: address,
        from_tier: u8,
        to_tier: u8,
        shards_spent: u64,
        new_shards: u64,
        timestamp: u64
    }

    public fun mint_wings(
        user_state: &mut UserState,
        clock: &Clock,
        ctx: &mut tx_context::TxContext
    ) {
        quest::assert_owner(user_state, ctx);
        assert!(quest::wings_tier(user_state) == 0, types::err_wings_already_minted());

        quest::set_wings_tier(user_state, 1);

        event::emit(
            WingsMintedEvent {
                user: quest::owner(user_state),
                tier: quest::wings_tier(user_state),
                timestamp: quest::now_seconds(clock)
            }
        );
    }

    public fun evolve_wings(
        user_state: &mut UserState,
        clock: &Clock,
        ctx: &mut tx_context::TxContext
    ) {
        quest::assert_owner(user_state, ctx);

        let from_tier = quest::wings_tier(user_state);
        assert!(from_tier > 0, types::err_wings_not_minted());
        assert!(from_tier < types::max_wings_tier(), types::err_wings_max_tier());

        let shards_spent = if (from_tier == 1) {
            assert!(
                quest::quests_completed_total(user_state) >= 3,
                types::err_evolve_requirements_not_met()
            );
            quest::spend_shards(user_state, 200);
            quest::set_wings_tier(user_state, 2);
            200
        } else if (from_tier == 2) {
            assert!(
                quest::quests_completed_total(user_state) >= 8,
                types::err_evolve_requirements_not_met()
            );
            quest::spend_shards(user_state, 500);
            quest::set_wings_tier(user_state, 3);
            500
        } else {
            abort types::err_wings_max_tier()
        };

        event::emit(
            WingsEvolvedEvent {
                user: quest::owner(user_state),
                from_tier,
                to_tier: quest::wings_tier(user_state),
                shards_spent,
                new_shards: quest::shards(user_state),
                timestamp: quest::now_seconds(clock)
            }
        );
    }
}
