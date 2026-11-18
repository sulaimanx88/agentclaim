# AgentClaim — Contracts

Free-claim factory gated by Agent ID. Anyone can launch a free claim campaign
(a badge drop); only Agent ID holders can claim, subject to supply caps,
per-wallet limits, campaign periods, and a simple on-chain anti-bot answer.

Built with Foundry + OpenZeppelin Contracts v5.4.0. Solidity 0.8.24.

## Repo structure

```
contracts/
├── src/
│   └── AgentClaim.sol            # The whole system: campaigns + badge NFT
├── script/
│   ├── Deploy.s.sol              # Deploy to BSC mainnet (56) / testnet (97)
│   └── MockAgentIdRegistry.sol   # TEST-ONLY registry stand-in (testnet/local)
├── test/
│   └── AgentClaim.t.sol          # 18 tests, all passing
├── abi/
│   ├── AgentClaim.json           # ABI for the website builder
│   └── MockAgentIdRegistry.json  # ABI for the testnet mock
├── foundry.toml
├── README.md                     # this file
├── OWNER_PERMISSIONS.md          # exactly what the owner can / cannot do
└── GAS_ESTIMATE.md               # measured gas + live-price cost table
```

## How it works

- **Agent ID gate.** The registry (an ERC-721) is passed to the constructor
  and stored `immutable`. An address holds an Agent ID iff
  `registry.balanceOf(address) > 0`. `claim()` checks this on every call, so
  an ID transferred away before claiming no longer qualifies. There is no
  name-to-address lookup anywhere in this project, by design.
- **Campaigns.** `createCampaign(name, maxSupply, perWalletLimit, startTime,
  endTime)` is permissionless — anyone can launch one. Rules are immutable
  once created: no function edits a campaign afterwards.
- **Claims.** `claim(campaignId, answer)` mints one ERC-721 badge. It reverts
  unless: the caller holds an Agent ID, the campaign is live, supply remains,
  the caller is under the per-wallet limit, and `answer ==
  answerFor(msg.sender)`.
- **Anti-bot answer.** `answerFor(address)` is a public view returning a
  deterministic 4-digit code (`keccak256(address, contract) % 10000`). The
  website reads it and the claimer passes it back. It is a lightweight speed
  bump against naive bots, NOT strong bot-proofing or sybil resistance —
  anyone can read the answer on-chain. It must never be marketed as more.
- **Free, always.** No function is payable; `receive()` and `fallback()`
  revert. The contract can never hold user funds, so there is nothing to
  withdraw and no withdraw function exists.

## Design choices (and why)

1. **Single contract, campaigns by ID — no per-campaign clones.**
   Campaigns share identical logic and differ only in stored parameters, so
   one deployment serves every campaign. Minimal-proxy clones would add a
   deployment transaction per campaign, a second contract to audit, and
   delegatecall surface — with zero benefit here, since campaigns need no
   isolated code or balances. One contract also means one address for the
   frontend and one verification.
2. **Badges are ERC-721, not ERC-1155.** Each claim is a distinct collectible
   badge; ERC-721 is the standard wallets and marketplaces display best, and
   per-token metadata is a plain `tokenURI` (`baseURI + tokenId`). ERC-1155
   would only pay off for fungible multi-copy editions, which these badges
   are not. `tokenCampaign(tokenId)` maps any badge back to its campaign.
3. **OpenZeppelin ERC-721 + Ownable, no upgradeability.** Audited base
   contracts; the contract is deliberately non-upgradeable so campaign rules
   and the registry can never be swapped out from under claimers.
4. **Registry address is a constructor parameter, immutable afterwards.**
   The deploy script passes the real registry on mainnet and deploys the
   mock on testnet/local. Nothing can re-point the gate later.
5. **Owner power is a single emergency brake** (`setCreationPaused`), which
   stops NEW campaign creation only — existing campaigns and claims keep
   working. See OWNER_PERMISSIONS.md for the full list.

## Build / test

```bash
forge build
forge test -vv
```

18 tests, all passing (2026-11-18). Covered: non-holder reverts, holder
succeeds, per-wallet limit, wrong answer reverts, supply cap, claims before
start / after end revert, exact boundary timestamps succeed, bad campaign
params revert, unknown campaign reverts, pause blocks creation but not
claims, only-owner pause, direct payments rejected, claim-with-value
rejected, answer determinism + range (incl. fuzz), live-balance gate
(ID moved away before claiming reverts).

## Deploy

```bash
# Testnet (needs a funded throwaway key; see below)
PRIVATE_KEY=0x... forge script script/Deploy.s.sol --rpc-url bsc_testnet --broadcast

# Mainnet (DO NOT run without explicit approval; script defaults to the real
# registry on chainId 56)
PRIVATE_KEY=0x... forge script script/Deploy.s.sol --rpc-url bsc --broadcast --verify
```

Env vars: `PRIVATE_KEY` (required), `REGISTRY` (optional override),
`BASE_URI` (optional badge metadata base URI, default `""`).

### Testnet status (2026-11-18)

NOT deployed yet — blocked on faucet funding. A fresh throwaway keypair was
generated for the testnet deploy; its address is
`0x0fd62B4681bc3b457f677284Cc6088049b4494f3` (balance 0, verified on-chain).
The private key lives in `.throwaway-testnet-key.json` (mode 600,
git-ignored, testnet-only — never fund it with real value). The public BSC
testnet faucet requires solving an hCaptcha in a browser, which this build
session cannot do. To finish: fund that address from the faucet (0.01 test
native token is far more than enough — the full demo costs ~0.0003 at
testnet gas prices), then run the testnet command above.

## Security notes

- Not externally audited. Treat as hackathon-grade: the surface is small
  (one contract, no payments, no upgrades, no external calls except a
  read-only `balanceOf` on the registry), but a review pass is still
  recommended before mainnet use.
- The anti-bot answer is public by design; it deters only bots that do not
  read the chain. Do not rely on it for high-value drops.
- Campaign creators are untrusted: anyone can create a campaign, so the
  website should make clear that AgentClaim does not endorse campaigns.
