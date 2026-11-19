# AgentClaim — Hackathon Submission Checklist

Source: official Binance announcement,
https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf
(read 2026-11-18). Award target: **Agent Application Innovation Award**
(29,000 USDC pool across top 10; 1st 10,000 / 2nd 6,000 / 3rd 4,000 /
4th 3,000 / 5th 2,000 / 6th–10th 800 each). Winners also get one eligibility
spot to claim a two-digit Agent ID (higher rank = priority pick).

## Key dates (all 2026)

| Milestone | Time |
|---|---|
| Submission period | 18 Nov 08:00 UTC – **9 Dec 08:00 UTC** (= 15:00 WIB) |
| Internal review | 9 Dec 08:00 UTC – 17 Dec 08:00 UTC |
| Public review | 17 Dec 08:00 UTC – 20 Dec 08:00 UTC |
| Reward distribution | Within 14 business days after public review ends, to the reward address given at submission |

No registration needed before submitting. Each team may submit **one project only**.

## Eligibility requirements (all must hold)

- [x] Product **live** before submission, deployed on BNB Chain.
      (Deployed 2026-11-18; website live; demo campaign #1 live; test claims
      verified from two Agent ID wallets.)
- [ ] **≥30 Agent ID holder addresses** interacted with the submitted
      contract(s) **during the submission period** (18 Nov – 9 Dec).
      Only submitted contract addresses count; interacting addresses must hold
      an Agent ID. (See DISTRIBUTION.md for the plan to reach 30.)
- [x] Contracts **source-verified and open-source on BscScan**.
      (Sourcify exact match, creation + runtime, 2026-11-18; BscScan syncs
      Sourcify — direct BscScan confirmation still pending.)
- [ ] Agent ID **actively used** in the product (not decorative).
- [ ] Owner permissions **disclosed** (see OWNER_PERMISSIONS.md).
- [ ] No safety red-line violation (see below).
- [ ] Active Binance account maintained (rewards are not distributed to users
      who delete/deactivate their Binance Wallet or account).

## Submission materials

Per the announcement: submit "project name, website, contract address(es),
Agent ID usage description, and other required materials" during the
submission period.

- [ ] Project name: **AgentClaim**
- [x] Website URL: **https://agentclaim.vercel.app** (live)
- [x] Contract addresses (BSC): **0xef9B77D0F8f9Bea2058483dD0330caB823D4ad1C**
      — single contract (campaigns + badge NFT)
- [x] Agent ID usage description: [AGENT_ID_USAGE.md](./AGENT_ID_USAGE.md)
- [x] Owner permissions disclosure: [OWNER_PERMISSIONS.md](./OWNER_PERMISSIONS.md)
- [x] BscScan verified-source links:
      https://bscscan.com/address/0xef9B77D0F8f9Bea2058483dD0330caB823D4ad1C
      (Sourcify exact match; direct BscScan confirmation pending)
- [x] Public source-code repo link: https://github.com/sulaimanx88/agentclaim
      (created 2026-11-19 ~00:05 WIB; all 32 files verified in place via the
      public GitHub API; MIT license; About set with website + topics)
- [ ] Reward receiving address: **TBD** (decide with Markus — which wallet
      receives USDC if we win)
- [ ] Submission form / portal link: **TBD — NOT in the announcement text.**
      The announcement says to submit the materials during the submission
      period but the fetched text contains no submission URL. **Must locate the
      official submission form/portal before the deadline** (check the
      announcement page for a linked form, Binance Square post, or Wallet
      Agentic Hub page). Do not submit through any unofficial link.
- [ ] Any "other required materials": **TBD** — confirm against the actual
      submission form once found (may include demo video, team info, etc.).

## Judging (Innovation Award, 100 points)

| Dimension | Weight |
|---|---|
| Agent ID Application Depth | 30% |
| Practicality & Feasibility | 25% |
| Product Completion | 25% |
| Innovation | 20% |

Panel: Binance Wallet, BNB Chain, and related technical/ecosystem
representatives. Ties are broken by Agent ID integration depth, then product
completion. Panel scores are final; Binance reserves the right to verify
eligibility, materials, and results.

## Safety red lines (ANY violation = immediate disqualification)

- **No web-based QR-code login for Agentic Wallet.** No scanning QR codes or
  entering pairing codes on third-party sites; no storing user login sessions
  on servers to place orders on their behalf.
- **No bypassing user transaction confirmation.** For any operation involving
  user assets, skills/prompts must not attempt to bypass confirmation. Users
  must see and confirm actions themselves.
- **No unauthorized asset transfers.** No scheduled collection, automatic
  transfers to fixed addresses, bundled extra transfers, or soliciting
  unlimited approvals without user knowledge.
- **Open-source contracts + disclosed owner permissions.** Minting, tax-rate
  changes, pausing trading, freezing assets, withdrawing user funds — all must
  be clearly documented.
- **No Binance brand impersonation.** Project names, token names, and domains
  must not use "Binance" / "BNB".
- **No collection of sensitive credentials.** No seed phrases, private keys,
  API secrets, or pairing codes.
- **No promised returns.** Terms like "passive income" / "automatic
  money-making" are prohibited in external messaging.
- **Trading products must display risk warnings** (AgentClaim involves no
  trading — N/A, but keep the rule in mind if any trading feature is added).
- **Agent ID must not be packaged as a "look up other people's wallets by
  name" tool.**
- **No abnormal behavior:** malicious volume manipulation, illegitimate mass
  account registration for interactions, or market manipulation — Binance
  reserves the right to disqualify. (Cheating can also be reported by others
  to audit@binance.com during the event through the end of public review.)

## Pre-submission verification (day before deadline)

- [ ] On-chain count of distinct Agent ID interactors ≥ 30 (verify via the
      registry + contract events, not via frontend analytics).
- [ ] All submitted contract addresses match the verified sources.
- [ ] Website live, claim flow works end-to-end from a fresh Agent ID wallet.
- [ ] No "Binance"/"BNB" in name, token names, or domain.
- [ ] No returns language anywhere (site, README, posts).
- [ ] No credential collection anywhere in the product.
- [ ] Owner permissions doc matches the final deployed bytecode.
