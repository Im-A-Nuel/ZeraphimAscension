module zeraphim_ascension::types {
    const E_INVALID_QUEST_ID: u64 = 3;
    const E_QUEST_COOLDOWN_ACTIVE: u64 = 4;
    const E_NO_LOOT_TICKETS: u64 = 5;
    const E_WINGS_ALREADY_MINTED: u64 = 6;
    const E_WINGS_NOT_MINTED: u64 = 7;
    const E_WINGS_MAX_TIER: u64 = 8;
    const E_INSUFFICIENT_SHARDS: u64 = 9;
    const E_EVOLVE_REQUIREMENTS_NOT_MET: u64 = 10;
    const E_NOT_OWNER: u64 = 11;

    const PATH_VALOR: u8 = 0;
    const PATH_WISDOM: u8 = 1;
    const PATH_GRACE: u8 = 2;
    const QUEST_COUNT: u64 = 6;
    const MAX_WINGS_TIER: u8 = 3;
    const DAY_SECONDS: u64 = 86400;

    public fun err_invalid_quest_id(): u64 { E_INVALID_QUEST_ID }
    public fun err_quest_cooldown_active(): u64 { E_QUEST_COOLDOWN_ACTIVE }
    public fun err_no_loot_tickets(): u64 { E_NO_LOOT_TICKETS }
    public fun err_wings_already_minted(): u64 { E_WINGS_ALREADY_MINTED }
    public fun err_wings_not_minted(): u64 { E_WINGS_NOT_MINTED }
    public fun err_wings_max_tier(): u64 { E_WINGS_MAX_TIER }
    public fun err_insufficient_shards(): u64 { E_INSUFFICIENT_SHARDS }
    public fun err_evolve_requirements_not_met(): u64 { E_EVOLVE_REQUIREMENTS_NOT_MET }
    public fun err_not_owner(): u64 { E_NOT_OWNER }

    public fun path_valor(): u8 { PATH_VALOR }
    public fun path_wisdom(): u8 { PATH_WISDOM }
    public fun path_grace(): u8 { PATH_GRACE }
    public fun quest_count(): u64 { QUEST_COUNT }
    public fun max_wings_tier(): u8 { MAX_WINGS_TIER }
    public fun day_seconds(): u64 { DAY_SECONDS }

    public fun calculate_level(xp: u64): u16 {
        let mut level = 0;
        let mut threshold = 100;
        let mut remaining = xp;

        while (remaining >= threshold) {
            remaining = remaining - threshold;
            threshold = threshold + 100;
            level = level + 1;
        };

        level
    }
}
