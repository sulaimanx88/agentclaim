# AgentClaim — Owner Permissions

Short version: **the owner has exactly one operational power** — pausing the
creation of NEW campaigns in an emergency. Everything else is either
impossible by construction or available to everyone.

## What the owner CAN do

| Power | Function | Effect |
|---|---|---|
| Pause / unpause new campaign creation | `setCreationPaused(bool)` (`onlyOwner`) | While paused, `createCampaign()` reverts. Claims on existing campaigns keep working; nothing already live is affected. |
| Transfer ownership | `transferOwnership(address)` (OpenZeppelin `Ownable`) | Hands the single power above to another address. One-step transfer (this contract uses plain `Ownable`, not `Ownable2Step`). |
| Renounce ownership | `renounceOwnership()` (OpenZeppelin `Ownable`) | Permanently gives up the pause power. After this, nobody can pause creation. |

## What the owner CANNOT do

- **Withdraw user funds — there are none, and no function exists to do it.**
  Claims are free: no function is payable, `receive()` and `fallback()`
  revert on any native-token transfer, and the contract has no `withdraw`,
  `sweep`, or selfdestruct path. The contract balance is always 0 by
  construction.
- **Mint badges beyond supply.** The only mint path is `claim()`, which
  enforces `minted < maxSupply` and the per-wallet limit for every caller,
  owner included. There is no owner mint function.
- **Change claim rules after a campaign starts.** Campaign parameters
  (`maxSupply`, `perWalletLimit`, `startTime`, `endTime`, `name`) are set
  once in `createCampaign()` and there is no setter, editor, or admin update
  function for them. Not even the campaign creator can change them.
- **Pause or block claims.** The pause flag gates `createCampaign()` only.
  `claim()` has no pause check; the owner cannot stop, censor, or redirect
  claims on a live campaign.
- **Change the Agent ID registry.** The registry address is `immutable`,
  set once in the constructor. The gate cannot be re-pointed to a fake
  registry later.
- **Change badge metadata.** The base URI is set once in the constructor;
  there is no setter. `tokenURI` is fixed for the life of the contract.
- **Upgrade the contract.** There is no proxy and no upgrade mechanism.
  The deployed bytecode is final.
- **Seize or burn badges.** Standard ERC-721 ownership applies; the owner
  has no transfer, burn, or freeze power over anyone's badges.
- **Delete campaigns.** There is no delete function. A campaign's record is
  permanent; at worst its period ends and no further claims are possible.

## Trust summary

Deploying this contract requires trusting the deployer for exactly one
thing: that they will not abuse the creation-pause (the worst case is that
no NEW campaigns can be created until they unpause or renounce). All funds,
supply, timing, and eligibility rules are enforced by code the owner cannot
override. Renouncing ownership after launch removes even the pause power.
