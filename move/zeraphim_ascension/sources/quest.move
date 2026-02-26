module zeraphim_ascension::quest {
    use one::clock::{Self, Clock};
    use one::event;
    use zeraphim_ascension::types;

    public struct UserState has key, store {
        id: object::UID,
        owner: address,
        xp: u64,
        level: u16,
        shards: u64,
        loot_tickets: u64,
        quests_completed_total: u64,
        streak_count: u16,
        last_quest_day: u64,
        last_quest_time: u64,
        wings_tier: u8,
        quest_last_completed_at: vector<u64>
    }

    public struct QuestCompletedEvent has copy, drop {
        user: address,
        quest_id: u64,
        path: u8,
        xp_gained: u64,
        shards_gained: u64,
        ticket_gained: u64,
        new_xp: u64,
        new_shards: u64,
        new_tickets: u64,
        quests_completed_total: u64,
        new_streak: u16,
        timestamp: u64
    }

    fun path_for(quest_id: u64): u8 {
        if (quest_id == 0 || quest_id == 1) {
            types::path_valor()
        } else if (quest_id == 2 || quest_id == 3) {
            types::path_wisdom()
        } else {
            types::path_grace()
        }
    }

    fun cooldown_for(quest_id: u64): u64 {
        if (quest_id == 0) {
            120
        } else if (quest_id == 1) {
            180
        } else if (quest_id == 2) {
            90
        } else if (quest_id == 3) {
            150
        } else if (quest_id == 4) {
            60
        } else {
            75
        }
    }

    fun xp_reward_for(quest_id: u64): u64 {
        if (quest_id == 0) {
            80
        } else if (quest_id == 1) {
            110
        } else if (quest_id == 2) {
            120
        } else if (quest_id == 3) {
            150
        } else if (quest_id == 4) {
            70
        } else {
            95
        }
    }

    fun shards_reward_for(quest_id: u64): u64 {
        if (quest_id == 0) {
            45
        } else if (quest_id == 1) {
            70
        } else if (quest_id == 2) {
            35
        } else if (quest_id == 3) {
            50
        } else if (quest_id == 4) {
            30
        } else {
            40
        }
    }

    fun tickets_reward_for(quest_id: u64): u64 {
        if (quest_id == 5) {
            2
        } else {
            1
        }
    }

    #[allow(lint(self_transfer))]
    public fun init_user(ctx: &mut tx_context::TxContext) {
        let owner = tx_context::sender(ctx);
        let mut cooldown_slots = vector::empty<u64>();
        let mut idx = 0;
        while (idx < types::quest_count()) {
            vector::push_back(&mut cooldown_slots, 0);
            idx = idx + 1;
        };

        transfer::public_transfer(
            UserState {
                id: object::new(ctx),
                owner,
                xp: 0,
                level: 0,
                shards: 0,
                loot_tickets: 0,
                quests_completed_total: 0,
                streak_count: 0,
                last_quest_day: 0,
                last_quest_time: 0,
                wings_tier: 0,
                quest_last_completed_at: cooldown_slots
            },
            owner
        );
    }

    public fun complete_quest(
        user_state: &mut UserState,
        quest_id: u64,
        clock: &Clock,
        ctx: &mut tx_context::TxContext
    ) {
        assert!(quest_id < types::quest_count(), types::err_invalid_quest_id());
        assert_owner(user_state, ctx);

        let now_seconds = now_seconds(clock);
        let current_day = now_seconds / types::day_seconds();

        let last_quest_time = *vector::borrow(&user_state.quest_last_completed_at, quest_id);
        let cooldown = cooldown_for(quest_id);
        assert!(
            last_quest_time == 0 || now_seconds >= last_quest_time + cooldown,
            types::err_quest_cooldown_active()
        );
        *vector::borrow_mut(&mut user_state.quest_last_completed_at, quest_id) = now_seconds;

        if (user_state.quests_completed_total == 0) {
            user_state.streak_count = 1;
        } else if (user_state.last_quest_day == current_day) {
        } else if (user_state.last_quest_day + 1 == current_day) {
            user_state.streak_count = user_state.streak_count + 1;
        } else {
            user_state.streak_count = 1;
        };

        user_state.last_quest_day = current_day;
        user_state.last_quest_time = now_seconds;

        let xp_gained = xp_reward_for(quest_id);
        let shards_gained = shards_reward_for(quest_id);
        let ticket_gained = tickets_reward_for(quest_id);

        user_state.xp = user_state.xp + xp_gained;
        user_state.shards = user_state.shards + shards_gained;
        user_state.loot_tickets = user_state.loot_tickets + ticket_gained;
        user_state.quests_completed_total = user_state.quests_completed_total + 1;
        user_state.level = types::calculate_level(user_state.xp);

        event::emit(
            QuestCompletedEvent {
                user: user_state.owner,
                quest_id,
                path: path_for(quest_id),
                xp_gained,
                shards_gained,
                ticket_gained,
                new_xp: user_state.xp,
                new_shards: user_state.shards,
                new_tickets: user_state.loot_tickets,
                quests_completed_total: user_state.quests_completed_total,
                new_streak: user_state.streak_count,
                timestamp: now_seconds
            }
        );
    }

    public fun owner(user_state: &UserState): address {
        user_state.owner
    }

    public fun xp(user_state: &UserState): u64 {
        user_state.xp
    }

    public fun level(user_state: &UserState): u16 {
        user_state.level
    }

    public fun shards(user_state: &UserState): u64 {
        user_state.shards
    }

    public fun loot_tickets(user_state: &UserState): u64 {
        user_state.loot_tickets
    }

    public fun quests_completed_total(user_state: &UserState): u64 {
        user_state.quests_completed_total
    }

    public fun streak_count(user_state: &UserState): u16 {
        user_state.streak_count
    }

    public fun wings_tier(user_state: &UserState): u8 {
        user_state.wings_tier
    }

    public(package) fun assert_owner(user_state: &UserState, ctx: &tx_context::TxContext) {
        assert!(user_state.owner == tx_context::sender(ctx), types::err_not_owner());
    }

    public(package) fun now_seconds(clock: &Clock): u64 {
        clock::timestamp_ms(clock) / 1000 + 1
    }

    public(package) fun consume_loot_ticket(user_state: &mut UserState) {
        assert!(user_state.loot_tickets > 0, types::err_no_loot_tickets());
        user_state.loot_tickets = user_state.loot_tickets - 1;
    }

    public(package) fun add_shards(user_state: &mut UserState, amount: u64) {
        user_state.shards = user_state.shards + amount;
    }

    public(package) fun spend_shards(user_state: &mut UserState, amount: u64) {
        assert!(user_state.shards >= amount, types::err_insufficient_shards());
        user_state.shards = user_state.shards - amount;
    }

    public(package) fun add_xp(user_state: &mut UserState, amount: u64) {
        user_state.xp = user_state.xp + amount;
        user_state.level = types::calculate_level(user_state.xp);
    }

    public(package) fun set_wings_tier(user_state: &mut UserState, tier: u8) {
        user_state.wings_tier = tier;
    }
}
