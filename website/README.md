# AgentClaim — website

Free-claim frontend for the AgentClaim contract. Anyone can launch a free
claim campaign (badge NFT); only Agent ID holders can claim. Static site, no
backend, no custodian, no server-stored sessions. Wallet access is EIP-1193
only (MetaMask or any injected wallet) — the site never asks for a seed
phrase or private key.

Live: https://agentclaim.vercel.app (also https://agentclaim-musang1.vercel.app)

## Stack

Vite + vanilla JS + ethers v6. Two dependencies total (`vite`, `ethers`).
No framework, no WalletConnect (that would need a project ID and a third
party); injected-wallet connect keeps it simple and reliable.

## Pointing the site at the contract

The contract address is **not** hard-coded. It comes from build-time env
vars, per chain:

| Variable | Meaning |
| --- | --- |
| `VITE_AGENTCLAIM_ADDRESS_97` | AgentClaim on BNB Chain Testnet (chain 97) |
| `VITE_AGENTCLAIM_ADDRESS_56` | AgentClaim on BNB Chain (chain 56) |
| `VITE_AGENTCLAIM_ADDRESS` | Fallback, used on the default chain |
| `VITE_AGENTCLAIM_CHAIN_ID` | Default chain (`97` or `56`; default `97`) |

Set them in the Vercel dashboard (Project `agentclaim` → Settings →
Environment Variables), then redeploy — env vars are baked in at build
time, so a redeploy is required after any change. See `.env.example` for
local development (`cp .env.example .env`, fill in, `npm run dev`).

Until an address is configured for the selected chain, the site shows a
clear "Contract not deployed yet" banner and disables claiming/creating
instead of crashing.

Demo shortcut: the "Contract" panel at the bottom of the page accepts any
AgentClaim address, stored only in that browser's localStorage. Useful for
testing a fresh testnet deploy without redeploying the site.

## Features

- **Campaigns** — lists every campaign from `nextCampaignId` /
  `campaigns(id)`: name, claimed/max supply, remaining, per-wallet limit,
  period, live/upcoming/ended/sold-out status, plus how many the connected
  wallet already claimed.
- **Claim flow** — connect wallet, pick a live campaign. The site checks
  the Agent ID gate (`registry.balanceOf`), fetches the wallet's 4-digit
  code from `answerFor()` and prefills it (read-only field — the user never
  computes anything), then one click sends `claim(campaignId, answer)`.
  The code is re-fetched at signing time so it is always fresh.
- **Create campaign** — form for name, max supply, per-wallet limit, start
  and end times; validates client-side, then sends `createCampaign`.
- **My badges** — badges owned by the connected wallet, found by scanning
  token IDs (`ownerOf`, batched, capped at 1,000) and resolved via
  `tokenCampaign` + `tokenURI` (IPFS metadata supported).
- **Network switching** — BNB Chain Testnet (97) and BNB Chain (56);
  prompts the wallet to switch/add the chain. Reads go through public RPCs;
  writes go through the user's own wallet.
- **Honest copy** — no return promises anywhere. The footer states the
  contract is open-source, non-upgradeable, accepts no payments, and holds
  no user funds. The 4-digit code is described as the lightweight speed
  bump it is, not bot-proofing.

## Develop / build

```bash
npm install
npm run dev      # local dev server
npm run build    # static output in dist/
npm run preview  # serve the production build locally
```

## Deploy

This project is deployed with prebuilt static files via the Vercel REST
API (the API token lives in the Secure Vault under connection
`custom.vercel`; never paste a token anywhere). The deploy script builds
and uploads in one step:

```bash
./deploy.sh
```

What it does: `npm run build`, then `POST /v13/deployments` (team
`musang1`) with the `dist/` files as inline text, target `production`.
It prints the deployment URL when done. SSO protection is disabled on
this project (`ssoProtection: null`) so the public URL works without a
Vercel login — do not re-enable it, or judges will hit a login wall.

Manual equivalent (same API call, no script):

```bash
npm run build
python3 - <<'EOF'
import json, os
files = []
for root, _, names in os.walk('dist'):
    for n in names:
        p = os.path.join(root, n)
        with open(p, 'r', encoding='utf-8') as f:
            files.append({'file': os.path.relpath(p, 'dist'), 'data': f.read()})
json.dump({'name': 'agentclaim', 'files': files, 'target': 'production',
           'projectSettings': {'framework': None}},
          open('/tmp/agentclaim-deploy.json', 'w'))
EOF
python3 ~/workspace/custom-connectors/custom.vercel/bin/vercel_api.py POST \
  "/v13/deployments?teamId=team_dPNHt5zLNjeIuQgimdKsZ28P" @/tmp/agentclaim-deploy.json
```

Note: the `data` field must be the raw file text, NOT base64 — Vercel
serves it verbatim, and base64 content would break the site.

## What is still missing for a live demo

1. **A deployed contract.** The testnet deploy is pending faucet funding
   (see `../contracts/README.md`). Once deployed, set
   `VITE_AGENTCLAIM_ADDRESS_97` in Vercel and redeploy — or paste the
   address in the page's Contract panel for an instant demo.
2. **An Agent ID on the demo wallet** (testnet mock registry or mainnet
   registry), otherwise claims revert with `NotAgentIdHolder` — the site
   shows that state clearly before the user signs anything.
3. **A live campaign** — create one from the site once the contract is
   configured (any wallet can create; claiming needs the Agent ID).

No contract was deployed and no funds were spent from this session.
