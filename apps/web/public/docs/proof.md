# Proof of Integration - Zeraphim: Ascension

## Package ID

```
PACKAGE_ID: 0xa045ef60a21249618db0ce3bb1e9aaa5e54d79549a67ab96865b9d387f20e0ab
```

**Deploy Transaction:** `ADCX58EPsGZfeWtZLqqQik7ez17UfvYBci52EHBrxJFv`

**Explorer:** https://onescan.cc/testnet/txblock/ADCX58EPsGZfeWtZLqqQik7ez17UfvYBci52EHBrxJFv

**Modules:** quest, lootbox, wings, types

## Transaction Proofs

### 0. Initialize User

- TX Hash: `CTT8Hs355CU6vKBV46RCi1kTKNaMZeEznuJgL4FgmTEY`
- Explorer: https://onescan.cc/testnet/txblock/CTT8Hs355CU6vKBV46RCi1kTKNaMZeEznuJgL4FgmTEY
- Description: Created UserState resource (0x7e3ee4aba4b9341c0398c06882b502d23314df1c6152d951ee7837b779483b52)

### 1. Complete Quest

- TX Hash: `6Zcf3LQDLWwgs8zNRS3zVRaDRhUo2APL6oC8pcfQyi14`
- Explorer: https://onescan.cc/testnet/txblock/6Zcf3LQDLWwgs8zNRS3zVRaDRhUo2APL6oC8pcfQyi14
- Event: QuestCompletedEvent
- Rewards: 110 XP, 70 Shards, 1 Loot Ticket, Streak +1

### 2. Open Lootbox

- TX Hash: `2ffRuy4hXTgzfjx3XA9qwTNyjbFEGWzNrMFBpXyd75gw`
- Explorer: https://onescan.cc/testnet/txblock/2ffRuy4hXTgzfjx3XA9qwTNyjbFEGWzNrMFBpXyd75gw
- Event: LootOpenedEvent
- Rewards: +50 Shards (common), +25 XP Bonus
- Total: 135 XP, 120 Shards

### 3. Mint Wings

- TX Hash: `wsyhk48srmxwMak7FvYcAdyXoPZhkWekciKePFT9iRE`
- Explorer: https://onescan.cc/testnet/txblock/wsyhk48srmxwMak7FvYcAdyXoPZhkWekciKePFT9iRE
- Event: WingsMintedEvent
- Result: Wings Tier 1 minted

## Notes

- Network: OneChain Testnet
- RPC: https://rpc-testnet.onelabs.cc:443
- Explorer: https://onescan.cc/testnet
- Deployer: 0x1c103cebc31ff3c4fd769cdc132ee4e2d486c3f1b58bfae7c32d28fae6c8c15d
- VRF-grade randomness = roadmap (current: pseudo-random for MVP)
- All events properly emitted and indexed
- Full game loop demonstrated: init → quest → lootbox → wings
