module zeraphim_ascension::lootbox {
    use one::clock::Clock;
    use one::event;
    use std::string::{Self, String};
    use zeraphim_ascension::quest::{Self, UserState};

    public struct LootOpenedEvent has copy, drop {
        user: address,
        reward_type: String,
        reward_amount: u64,
        xp_bonus: u64,
        new_xp: u64,
        new_shards: u64,
        new_tickets: u64,
        timestamp: u64
    }

    public fun open_lootbox(
        user_state: &mut UserState,
        clock: &Clock,
        ctx: &mut tx_context::TxContext
    ) {
        quest::assert_owner(user_state, ctx);
        quest::consume_loot_ticket(user_state);

        let now_seconds = quest::now_seconds(clock);
        let digest = tx_context::digest(ctx);
        let entropy = *vector::borrow(digest, 0) as u64;
        let seed = now_seconds + quest::xp(user_state) + quest::shards(user_state) + quest::quests_completed_total(user_state) + entropy;
        let roll = seed % 100;

        let reward_amount = if (roll < 60) {
            50
        } else if (roll < 90) {
            100
        } else {
            200
        };

        let xp_bonus = if (roll % 7 == 0) { 25 } else { 0 };

        quest::add_shards(user_state, reward_amount);
        if (xp_bonus > 0) {
            quest::add_xp(user_state, xp_bonus);
        };

        event::emit(
            LootOpenedEvent {
                user: quest::owner(user_state),
                reward_type: string::utf8(b"shards"),
                reward_amount,
                xp_bonus,
                new_xp: quest::xp(user_state),
                new_shards: quest::shards(user_state),
                new_tickets: quest::loot_tickets(user_state),
                timestamp: now_seconds
            }
        );
    }
}
