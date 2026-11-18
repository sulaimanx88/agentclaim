# AgentClaim

A free-claim factory gated by Agent ID. Anyone can launch a free claim
campaign — a badge NFT that only Agent ID holders can claim.

Built for the **Agent ID Hackathon** (Innovation Award). Submission period:
18 Nov – 9 Dec 2026.

**Status (2026-11-18):** **LIVE on BNB Chain mainnet.** Contract deployed
(`0xef9B77D0F8f9Bea2058483dD0330caB823D4ad1C`), source-verified on Sourcify
(exact match), 18/18 Foundry tests passing (`contracts/`), website live at
https://agentclaim.vercel.app, demo campaign #1 ("AgentClaim Genesis Badge")
live with test claims verified from two Agent ID wallets.

> **No returns promised.** AgentClaim badges are free collectibles. There is no
> token sale, no yield, no earnings — claiming costs only network gas.

## What it is

AgentClaim lets any project launch a free claim campaign in minutes, with the
audience restricted on-chain to Agent ID holders:

- **Campaigns** — a creator defines a badge (name, artwork, supply cap),
  a per-wallet claim limit, and a start/end window.
- **Agent ID gate** — `claim()` only succeeds if the caller's address holds an
  Agent ID (the caller must own at least one Agent ID NFT). No Agent ID, no claim.
- **Free claims** — claiming costs only gas. The contract holds no user funds
  and there is no payment step anywhere in the flow.
- **Simple anti-bot answer** — a public on-chain view `answerFor(address)`
  returns a deterministic 4-digit code (`keccak256(address, contract) %
  10000`); the claimer passes it to `claim()`. It is a lightweight speed bump
  against naive bots, not sybil resistance — see AGENT_ID_USAGE.md.

## How it works

1. A creator launches a campaign: badge metadata, supply cap, per-wallet
   limit, campaign period.
2. An Agent ID holder visits the campaign page and clicks Claim.
3. The contract checks, on-chain, that the caller holds an Agent ID
   (`balanceOf(caller) > 0` on the Agent ID registry). If the check fails, the
   transaction reverts — nothing is charged except gas for the failed call.
4. If the check passes and the campaign still has supply and the wallet is
   under its per-wallet limit, the badge NFT is minted to the caller.

There is no allowlist, no off-chain approval, and no server in the claim path:
eligibility is a single on-chain read against the Agent ID registry.

## How to launch a campaign

1. Connect a wallet on BSC.
2. Fill in the campaign form: badge name, supply cap, per-wallet limit,
   start/end time.
3. Confirm the `createCampaign` transaction (gas only — no listing fee).
   Campaign rules are immutable once created.
4. Share the campaign page link. Claimers need only an Agent ID + gas.

## How to claim

1. Open a live campaign page.
2. Connect the wallet that holds your Agent ID.
3. Click Claim and confirm the transaction (gas only).
4. The badge NFT appears in your wallet.

If you don't hold an Agent ID, the claim transaction reverts. Agent IDs are
claimed inside the Binance app (Wallet > homepage banner > Agent ID) — that
process is run by Binance, not by AgentClaim.

## Contracts (BSC)

| Contract | Address | Status |
|---|---|---|
| Agent ID registry (SPACE ID Agent ID, ERC-721) | `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` | Live (Binance/SPACE ID) |
| AgentClaim (single contract: campaigns + badge NFT) | `0xef9B77D0F8f9Bea2058483dD0330caB823D4ad1C` | Live — one contract serves all campaigns; no per-campaign clones |

AgentClaim is deployed on BSC, source-verified (Sourcify exact match;
BscScan syncs Sourcify), and open-source (required by the hackathon rules).

## Links

- Website: https://agentclaim.vercel.app (live, connected to the deployed contract)
- Source code: https://github.com/sulaimanx88/agentclaim (this repo)
- BscScan (contracts): https://bscscan.com/address/0xef9B77D0F8f9Bea2058483dD0330caB823D4ad1C
- Distribution plan: [DISTRIBUTION.md](./DISTRIBUTION.md)
- Agent ID integration: [AGENT_ID_USAGE.md](./AGENT_ID_USAGE.md)
- Owner permissions: [OWNER_PERMISSIONS.md](./OWNER_PERMISSIONS.md)
- Submission checklist: [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md)
- Hackathon announcement:
  https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf

## Safety notes

- AgentClaim never asks for a seed phrase, private key, API secret, or pairing
  code. Claims happen through the user's own wallet; the user sees and confirms
  every transaction.
- The contract holds no user funds. There is nothing to withdraw and nothing
  to lose beyond gas.
- Owner permissions are minimal and documented in
  [OWNER_PERMISSIONS.md](./OWNER_PERMISSIONS.md).
- No "Binance" or "BNB" in the project name, token names, or domain
  (hackathon red line — no brand impersonation).
- Agent ID is used only as an access-control check. AgentClaim does not look
  up, display, or expose other people's wallets by name.
