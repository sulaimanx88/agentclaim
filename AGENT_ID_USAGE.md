# How AgentClaim Uses Agent ID

*Submission-ready description of the Agent ID integration. This is the core of
the Innovation Award's "Agent ID Application Depth" dimension (30% of the
judging score).*

## One-line summary

Agent ID is AgentClaim's **access control**: every claim is gated on-chain by
whether the caller's address holds an Agent ID. Without an Agent ID, a claim is
impossible — not discouraged, not paywalled, *impossible at the contract level*.

## The registry

AgentClaim reads the official Agent ID registry on BSC:

- **Address:** `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`
- **Contract:** SPACE ID Agent ID — ERC-721, symbol `AI`, non-transferable
- **Eligibility check:** `balanceOf(address) > 0` means the address holds an
  Agent ID (per the hackathon announcement's own definition).

The registry address is passed to the constructor and stored `immutable`
(`IAgentIdRegistry public immutable registry;` — `src/AgentClaim.sol:41`).
It cannot be changed after deployment by anyone, owner included
(see OWNER_PERMISSIONS.md).

## Where Agent ID sits in the flow

### 1. Claim gating (core — the product does not work without it)

`claim()` — the single most important function in the system — begins with an
on-chain Agent ID check:

```
require(agentIdRegistry.balanceOf(msg.sender) > 0, "Agent ID required");
```

- The check runs **on-chain, inside the transaction**, against the live
  registry. It is not an off-chain allowlist, not a frontend filter, and not a
  signed message — there is no way to bypass it by calling the contract
  directly, because the contract itself enforces it.
- A non-holder's transaction reverts. No badge is minted, no state changes.
- Because Agent ID is non-transferable and one-per-user, the gate is also a
  **Sybil-resistant identity primitive**: one human, one Agent ID, one
  per-wallet claim allowance. A bot farm cannot mint fresh Agent IDs to
  multiply claims the way it can mint fresh wallets.

### 2. Per-wallet claim limits are per-Agent-ID-holder, not per-address

Campaigns set a per-wallet claim limit (e.g. 1 badge per wallet). Combined
with the Agent ID gate, this limit is meaningful: it bounds claims per *person*
(one Agent ID per user), not just per address. Without the Agent ID gate, a
per-wallet limit would be trivially bypassed by generating new addresses.

### 3. Campaign discovery / eligibility display (frontend)

The frontend calls the same `balanceOf` check (read-only) to show a visitor
whether their connected wallet is eligible *before* they spend gas on a claim
attempt. This is a UX convenience only — the contract remains the enforcement
point, so a misleading frontend cannot grant a claim to a non-holder.

### 4. Anti-bot answer (simple, on-chain)

`answerFor(address)` is a public view returning a deterministic 4-digit code
(`keccak256(address, contract) % 10000`, `src/AgentClaim.sol:108`). The
frontend reads the code for the connected wallet and passes it to `claim()`,
which reverts on a wrong answer. It composes with the Agent ID gate (both
checks run in the same transaction) and needs no off-chain server, CAPTCHA
provider, or user credential. Honest limitation, stated in the contracts
README: it is a lightweight speed bump against naive bots, not sybil
resistance — anyone can read the answer on-chain, so it must never be
marketed as more. The real Sybil defence is the Agent ID gate itself
(one non-transferable ID per user).

## What Agent ID is NOT used for

- **Not a wallet lookup tool.** AgentClaim never resolves an Agent ID name to
  display someone else's wallet, holdings, or activity. The hackathon rules
  explicitly prohibit packaging Agent ID as a "look up other people's wallets
  by name" tool, and AgentClaim does not do it.
- **Not a payment rail.** Claims are free; Agent ID is not used to move or
  authorize funds.
- **Not an off-chain identity check.** No server stores Agent ID ownership, no
  login session is derived from it, and no QR-code / pairing-code flow exists.

## Why this is a genuine integration (not a checkbox)

| Test | AgentClaim |
|---|---|
| Remove Agent ID — does the product still work? | No. The entire point is "only Agent ID holders can claim". Without the gate it is a generic mint page. |
| Is the check on-chain or cosmetic? | On-chain, in `claim()`, enforced by the contract. |
| Does Agent ID change the economics? | Yes — it converts a per-wallet limit into a per-person limit, which is what makes free campaigns defensible against Sybil farming. |
| Is there a real user need? | Yes — every Agent ID project today re-implements this same gate from scratch (dozens of near-identical claim contracts exist on BSC). A shared factory with the gate built in is the reusable primitive they all need. |

## Contract references (TBD — fill in after deployment)

- AgentClaim contract address (single contract = factory + badge NFT): **TBD**
  (pending deployment)
- Registry constant in source: `src/AgentClaim.sol:41`
  (`IAgentIdRegistry public immutable registry;`)
- Key functions: `createCampaign` (`:121`), `claim` (`:154`),
  `answerFor` (`:108`), `setCreationPaused` (`:180`)
- BscScan verified-source links: **TBD** (pending deployment)
