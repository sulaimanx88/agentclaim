# Owner Permissions — AgentClaim

*Required by the hackathon rules: contracts must be open-source with disclosed
owner permissions. Permissions such as minting, changing tax rates, pausing
trading, freezing assets, or withdrawing user funds must be clearly documented.*

**Status: FINAL — completed 2026-11-18 from the final contracts
(`contracts/src/AgentClaim.sol`, 200 lines; 18/18 Foundry tests passing).
Only deployment-dependent fields (owner address, verification links) remain
TBD until the contract is deployed.** The full function-level version lives
in `contracts/OWNER_PERMISSIONS.md`; this file is the submission-facing copy.

## Principles (binding)

1. **No user funds are ever held.** Claims are free; the contract receives no
   payment. There is no withdraw function for user funds because there are no
   user funds to withdraw. The only value that ever touches the contract is gas,
   which goes to the network, not to the owner.
2. **No minting beyond supply.** The owner cannot mint badges beyond a
   campaign's declared supply cap, and cannot mint to themselves outside the
   same public `claim()` path available to every Agent ID holder.
3. **No rule changes after campaign start.** Once a campaign is live (start time
   reached), its supply cap, per-wallet limit, and end time are immutable. The
   owner cannot shrink supply, raise limits for insiders, or extend/shorten a
   live campaign.
4. **No pausing of claims to trap users.** One pause exists:
   `setCreationPaused(bool)` — it gates `createCampaign()` ONLY. Claims on
   live campaigns keep working while paused, and the owner can never freeze
   already-minted badges or redirect claims.
5. **No freezing, no blacklisting, no tax, no royalty.** Badges are plain
   ERC-721 NFTs with no royalty mechanism at all: the owner cannot freeze
   transfers, block addresses, impose fees, or set/change any royalty.
6. **No proxy / no upgrade — confirmed.** The contract is deployed
   non-upgradeable (no proxy, no delegatecall to owner-controlled logic), so
   the rules above cannot be changed after deployment.

## Owner powers (exact list — final)

| Function | What it does | When it can be used | Risk if abused |
|---|---|---|---|
| `setCreationPaused(bool)` (`onlyOwner`) | Pauses/unpauses creation of NEW campaigns | Any time | Worst case: no new campaigns can be created until unpaused or ownership renounced. Existing campaigns and claims unaffected. |
| `transferOwnership(address)` (OpenZeppelin `Ownable`) | Hands the pause power to another address | Any time | New owner gains only the pause power above. |
| `renounceOwnership()` (OpenZeppelin `Ownable`) | Permanently gives up the pause power | Any time | None — removes the last owner power. |

That is the complete list: the owner has exactly one operational power (the
creation pause). Campaign parameter validation is enforced by the contract,
not by owner discretion.

## What the owner CANNOT do (explicit)

- Cannot withdraw user funds (none exist).
- Cannot mint beyond a campaign's supply cap.
- Cannot change a live campaign's supply, per-wallet limit, or period.
- Cannot claim on behalf of another wallet.
- Cannot freeze, burn, or seize badges already claimed.
- Cannot change the Agent ID registry address after deployment (confirmed:
  `immutable`, set once in the constructor, `src/AgentClaim.sol:41`).
- Cannot collect or see any user credential (the contract never handles seeds,
  keys, or pairing codes).

## Verification

- Source code verified on BscScan: **TBD (links — pending deployment)**
- Sourcify verification: **TBD (links — pending deployment)**
- Owner address: **TBD (the deployer wallet — pending Markus's decision)**
- Ownership renounced / transferred: **TBD (renouncing after launch is
  recommended to remove even the pause power)**
