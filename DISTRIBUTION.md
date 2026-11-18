# AgentClaim — Distribution Plan

**Goal:** ≥30 REAL Agent ID holder addresses interacting with the AgentClaim
contracts during the submission period (18 Nov – 9 Dec 2026, 08:00 UTC).
**Hard rule:** no fake accounts, no bots, no mass registration — any of that is
instant disqualification. Every user must be a genuine Agent ID holder who
chooses to claim.

**Status of this doc:** written 2026-11-18, before contracts are deployed.
Estimates are honest ranges, not promises. Channels marked UNVERIFIED need a
manual check before use.

**Counting note:** Markus's own two wallets (layman88.ai, nur88.ai) count as
2 of the 30. We need **28+ other real Agent ID holders**.

---

## 1. Agent ID ecosystem discovery surfaces (highest intent)

These are where Agent ID holders already go looking for free claims. They are
the highest-intent traffic available — a visitor here already holds an Agent ID
and is actively hunting.

### 1a. UnityTool Agent Radar — unitytool.app (AUTO-INDEXED, no submission)

**How listing works (verified 2026-11-18 from the public repo
`PigCanFly1001/unitytool-agent-radar`, 116 stars):** Agent Radar is a real-time
on-chain indexer. It follows every wallet holding an Agent ID on BSC and
automatically lists any project those wallets interact with — there is **no
submission form and no manual listing step**. Projects are ranked by distinct
Agent ID wallets in the selected window, with a live activity feed.

**What this means for AgentClaim:**
- The moment real Agent ID holders start claiming, the project appears on the
  board automatically. Early genuine activity is the listing mechanism.
- The board ranks by distinct agent wallets, so each new real claimer pushes
  AgentClaim up the ranking — a flywheel, but only if the first claimers are real.
- Share links work as distribution: every project gets
  `unitytool.app/project/0x…`, which renders a preview card when pasted into
  Telegram / Discord / X. Use this link (not just our own site) in posts — it
  shows live on-chain activity and doubles as third-party proof the claims are real.
- Icons/socials on the board come from GMGN data (optional API key on the
  operator's side); we cannot control that directly. What we CAN control: a
  verified contract on BscScan + Sourcify, and a real official site linked from
  the contract metadata, so the project looks legitimate to anyone checking.

**What to do:** nothing to submit. Deploy verified contracts, launch the first
campaign, get the first real claimers via the channels below, then share the
`/project/0x…` link everywhere.

**Who:** Muse prepares the link + post text; Markus posts from his own accounts.
**Realistic reach:** 10–20 Agent ID holders over the 3-week window IF the
project reaches the visible part of the board (top ~30 by agent wallets).
Not guaranteed — the board is crowded with new mints daily, and most projects
sit at 1–5 agent wallets. The flywheel only starts after the first ~5–10
claimers arrive from other channels.

### 1b. AgentID Hub — agentidhub.eth.limo (CURATED, no public submission found)

**How listing works (verified 2026-11-18 by reading the site):** a curated,
Chinese-language directory of Agent ID projects. The homepage says the list is
"auto-generated from the directory" (列表由目录自动生成) and "the directory
keeps being supplemented" (目录持续补充). Each listing carries the maintainer's
own on-chain re-verification (Sourcify match, minted counts, deadlines) and a
risk verdict. **No submission form, no contact address, and no maintainer
social link were found on the homepage or the free-mint page (`/free.html`).**

**What this means for AgentClaim:**
- Listing is at the maintainer's discretion; we cannot submit directly.
- The maintainer clearly discovers projects on-chain and via their official
  sites/socials — every listed project has a working official site and a
  verifiable contract. So the path in is: deploy a verified contract, ship a
  real site that links the contract, and be findable.
- The "免费可打" (free mints) section is exactly where AgentClaim's launch
  campaign belongs — it lists gas-only free claims with deadlines. A listing
  there puts us in front of the Hub's most active free-claim audience.

**What to do:**
1. After launch, check the Hub's project detail pages for any maintainer
   contact (X / Telegram / email) — **UNVERIFIED, needs a manual look**.
2. If a contact is found, Markus (or Muse drafting for him) sends ONE polite
   message in English/Chinese with: project name, site, contract address,
   "free, gas-only, Agent ID-gated" — and asks for a listing. One message only;
   no follow-up spam.
3. If no contact is found, do nothing — rely on on-chain discoverability.

**Who:** Muse drafts the outreach message; Markus sends it (his name, his account).
**Realistic reach:** 5–15 Agent ID holders if listed in "免费可打"; 0 if not
listed. The Hub's audience is exactly free-claim hunters, so conversion is
high — but listing is not in our control.

### 1c. WhaleCalls — whalecalls.club/monitor (AUTO-INDEXED)

Another on-chain monitor the hunter watch already uses. Same mechanics as
UnityTool: projects appear from on-chain activity, no submission. No extra
action needed beyond launching and getting real activity.

---

## 2. Telegram groups Markus follows

### 2a. Airdrop Finder (Telegram channel, run by Setya)

**Important structural fact:** this is a **channel**, not a group — only the
admin (Setya) posts. Markus cannot post there himself. The only path is asking
Setya to feature the project.

**Status: NEEDS MARKUS TO CHECK.** Whether Setya accepts project submissions /
promo posts is unverified. Do NOT spam the channel or DM-blast.

**What to do (only if Markus is comfortable):** Markus sends ONE message to
Setya (he knows him from the fastmint kit) explaining AgentClaim is his own
hackathon entry — a free claim tool for Agent ID holders, gas-only, no token
sale — and asks whether Setya would consider sharing it. Accept a no gracefully.

**Who:** Markus only (personal relationship; Muse drafts the message if asked).
**Realistic reach:** 5–15 Agent ID holders if featured (channel audience is
airdrop hunters; a meaningful share hold Agent IDs). 0 if not featured.

### 2b. UangDroid (Telegram group)

**Status: NEEDS MARKUS TO CHECK GROUP RULES.** Whether self-promo / project
posts are allowed is unverified. Many Indonesian airdrop groups ban unsolicited
project promo or restrict it to certain days/threads.

**What to do:** Markus reads the pinned rules (or asks an admin) BEFORE posting
anything. If promo is allowed: ONE post, in Indonesian, with the site link,
contract address, "gratis, cuma gas, khusus pemegang Agent ID", and the
UnityTool `/project/` link as proof. No reposts, no bumping, no cross-posting
the same text to multiple groups in one day.

**Who:** Markus posts (his group membership); Muse drafts the post text.
**Realistic reach:** 3–10 Agent ID holders if promo is allowed and the post
lands well. UangDroid members skew toward vAPI/agentic-wallet quests, so a
decent share hold Agent IDs — but most are passive readers.

---

## 3. Facebook page Lay Mar (1,679 followers)

**What it is:** Markus's own page (facebook.com/laymar678), Professional mode,
" Kreator digital", 1,679 followers, Stars + affiliate monetization active.
Fully under his control — no permission needed.

**What to post:** 2–3 posts over the window (launch day, mid-window reminder,
final-days reminder), in Indonesian, each with:
- What AgentClaim is in one line (free claim badge, khusus pemegang Agent ID)
- The site link + contract address
- "Gratis, cuma bayar gas" — and NEVER any earnings/returns language
- A screenshot of the claim page (not a wallet screenshot)

**Honest expectation:** Facebook followers are a general audience, not
crypto-native Agent ID holders. Most followers do not hold an Agent ID and
cannot claim even if interested. This channel is good for legitimacy and for
reaching the small overlap — it is NOT the main driver of the 30.

**Who:** Markus posts (his page); Muse drafts text + can prepare the graphic brief.
**Realistic reach:** 1–5 Agent ID holders. Low, but free and fully controlled.

---

## 4. Other free, legitimate channels (verified)

### 4a. X + the official Agent Ecosystem Promotion Award — BLOCKED for now

The hackathon itself runs a promotion award: post original content on X about a
participating project with **#BinanceWalletHackathon** and **#AgenticWallet**,
submit the X link via Binance's campaign survey; 20 winners share 2,000 USDC.
Posting about AgentClaim there would reach the exact right audience AND is an
official, encouraged channel.

**Blocker:** Markus's X accounts @Layman88ai and @muse6ai are both suspended;
@muse6ai's appeal is pending. @marwanoj must stay quiet (evasion risk). So X
posting is unavailable unless the @muse6ai appeal succeeds. Do NOT create a
fresh X account to post — that risks another suspension and looks like the
fake-account behavior the hackathon bans.

**If the appeal succeeds:** one launch thread + one mid-window update, with the
two hashtags, submitted to the survey. Realistic reach if posted: 5–15 Agent ID
holders (hackathon hashtag traffic is small but perfectly targeted).

### 4b. DappBay (dappbay.bnbchain.org) — free self-listing

BNB Chain's official dApp discovery hub. It is an open platform: developers
list their own dApps (site states developers provide their own descriptions).
Listing is free and gives a permanent discovery page. Low Agent-ID-specific
traffic, but legitimate and zero-cost.

**Who:** Muse prepares the listing materials; Markus submits (needs his wallet/
account for the listing form — TBD once the form is opened).
**Realistic reach:** 0–3 Agent ID holders. Long-tail, not a driver.

### 4c. DappRadar — free submit via Developer Dashboard

DappRadar accepts free dApp submissions (account on the Developer Dashboard →
"Submit Dapp" form: name, category, site URL, contract addresses). Same profile
as DappBay: legitimate, free, low targeted traffic.

**Who:** Muse prepares materials; Markus submits.
**Realistic reach:** 0–3 Agent ID holders.

### 4d. Binance Square — UNVERIFIED, optional

The hackathon announcement itself was published on Binance Square, and Square
is where Binance Wallet users read ecosystem news. Posting about the project
there is plausibly allowed from a Binance account, but post rules, reach, and
whether project self-promo is welcome are **unverified — needs Markus to check
in the app**. Do not assume.

**Realistic reach if allowed:** 2–8 Agent ID holders (Square readers are
Binance users; Agent ID holders are a subset).

### 4e. Binance Web3 Wallet dApp self-listing — stretch, likely too slow

Binance Open Platform offers dApp self-listing into the Web3 Wallet Discover
tab (review within ~7 business days, requires Web3 Wallet SDK integration +
self-test checklist). Getting listed would be the highest-reach channel of all,
but the integration + review timeline (7+ business days, plus SDK work) likely
does not fit the 21-day window. Note as a post-hackathon step, not a
distribution dependency.

### 4f. Direct word-of-mouth to known Agent ID holders — small but real

Markus personally knows other Agent ID hunters through the groups above. A
personal "coba claim gratis di proyek hackathon gue" to a handful of real
contacts he already talks to is legitimate (they are real holders, free choice).
Cap: only people he already knows; never cold-DM strangers with the link.

**Realistic reach:** 2–5 Agent ID holders.

---

## 5. Reach summary (honest math)

| Channel | Realistic Agent ID holders | Control |
|---|---|---|
| UnityTool Agent Radar (auto, flywheel) | 10–20 | Indirect — needs first claimers |
| AgentID Hub "免费可打" (if listed) | 5–15 | None — curator decides |
| Airdrop Finder (if Setya features it) | 5–15 | Ask once |
| UangDroid (if promo allowed) | 3–10 | Rules check first |
| Facebook Lay Mar | 1–5 | Full |
| X + hashtags (if appeal succeeds) | 5–15 | Blocked now |
| DappBay / DappRadar | 0–6 combined | Full |
| Binance Square (if allowed) | 2–8 | Unverified |
| Personal word-of-mouth | 2–5 | Full |
| Markus's own 2 wallets | 2 | Full |

**Bottom line:** the 30 is reachable WITHOUT any single channel carrying it —
the realistic base case (UnityTool flywheel + one Telegram channel + Facebook +
word-of-mouth + own wallets) lands around 25–45. The two swing factors are (1)
getting the first 5–10 real claimers fast so UnityTool ranking kicks in, and
(2) whether Airdrop Finder / the Hub pick the project up. If both swings miss,
we land near 20–25 and fall short — so the first week is the decisive week.

---

## 6. Outreach checklist (priority order)

Do these in order. Nothing in week 1 requires waiting for anything else.

### Day 0 — launch day (contracts live + verified)
- [ ] 1. Verify contracts on BscScan + Sourcify; confirm the official site
      links the contract addresses (this is what makes us discoverable AND
      listable everywhere).
- [ ] 2. Markus claims with both wallets (layman88 + nur88) — 2 addresses on
      the board, and the first on-chain activity for UnityTool/WhaleCalls to index.
- [ ] 3. Muse drafts the launch post (ID + EN versions, short): site link,
      contract, "gratis cuma gas, khusus Agent ID", UnityTool `/project/` link.
- [ ] 4. Markus posts launch on Facebook Lay Mar.
- [ ] 5. Markus checks UangDroid pinned rules; if promo allowed, posts once.

### Days 1–3 — first claimers
- [ ] 6. Markus messages Setya (Airdrop Finder) — one polite ask, accept a no.
- [ ] 7. Markus tells 3–5 real contacts he already knows (word-of-mouth).
- [ ] 8. Check UnityTool board: confirm AgentClaim appears and the
      `/project/0x…` link works; share that link (not just our site) in the
      Facebook post comments / any follow-up.
- [ ] 9. Check AgentID Hub detail pages for a maintainer contact; if found,
      send one listing request.

### Days 4–7 — broaden
- [ ] 10. Submit DappBay + DappRadar listings (Muse prepares, Markus submits).
- [ ] 11. Markus checks Binance Square rules in-app; post if allowed.
- [ ] 12. Count distinct Agent ID interactors on-chain. If <10 by day 7,
      escalate: second Facebook post + ask Setya once more ONLY if he replied
      positively the first time (never pester).

### Week 2 — sustain
- [ ] 13. Mid-window Facebook reminder post (new angle: how many claimed so far,
      real number only).
- [ ] 14. If @muse6ai appeal succeeds: post X thread with #BinanceWalletHackathon
      + #AgenticWallet, submit link to the Binance survey.
- [ ] 15. Recount interactors. Target: ≥20 by end of week 2 (leaves buffer).

### Week 3 — close
- [ ] 16. Final-days Facebook reminder.
- [ ] 17. Final on-chain count before 9 Dec 08:00 UTC; record the number for
      the submission.
- [ ] 18. Submit the hackathon entry (see SUBMISSION_CHECKLIST.md).

### Never do
- Never buy followers, engagement, or "users".
- Never create extra wallets/accounts to inflate interactions.
- Never pay anyone to claim or to post (paid shilling of a free claim looks
  like manufactured volume and risks disqualification).
- Never DM strangers the claim link.
- Never repost the same promo into a group that said no / has no-promo rules.
- Never promise returns, earnings, or future token value anywhere.
