# AgentClaim — Gas Estimate

Measured 2026-11-18. All gas figures are **real receipts from live execution**
on a local anvil chain (same bytecode and optimizer settings as the production
build: solc 0.8.24, optimizer on, 200 runs), not estimates. Costs use the
**live BSC mainnet gas price** fetched at measurement time.

## Live inputs (2026-11-18 ~22:55 WIB)

| Input | Value | Source |
|---|---|---|
| Mainnet gas price | **0.05 gwei** (`0x2faf080` = 50,000,000 wei) | `eth_gasPrice`, confirmed identical on 3 independent RPCs (dataseed, publicnode, blastapi) |
| Testnet gas price | 0.12 gwei (`0x7270e00`) | `eth_gasPrice`, BSC testnet publicnode |
| Native token price | **$582.92** | CoinGecko spot price at measurement time (USD context only) |

Gas price moves; the 1 gwei column below is a conservative 20x scenario.

## Measured gas

| Operation | Gas used | Cost @ 0.05 gwei (native) | ≈ USD | Cost @ 1 gwei (native) |
|---|---:|---:|---:|---:|
| Deploy `AgentClaim` | 1,788,691 | 0.00008943 | $0.0521 | 0.00178869 |
| Deploy `MockAgentIdRegistry` (testnet only) | 130,927 | 0.00000655 | $0.0038 | 0.00013093 |
| `createCampaign` ("Demo Badge", supply 100) | 169,577 | 0.00000848 | $0.0049 | 0.00016958 |
| `claim` — first claim, cold storage | 159,314 | 0.00000797 | $0.0046 | 0.00015931 |
| `claim` — same wallet again, warm storage | 108,014 | 0.00000540 | $0.0031 | 0.00010801 |
| `claim` — different wallet, cold storage | 142,214 | 0.00000711 | $0.0041 | 0.00014221 |
| `setCreationPaused` | 46,921 | 0.00000235 | $0.0014 | 0.00004692 |

Formula: `cost = gas × gas price`. Example (deploy):
`1,788,691 × 50,000,000 wei = 89,434,550,000,000 wei = 0.00008943 native`.

## Demo totals

| Scenario | Total gas | Cost @ 0.05 gwei | ≈ USD | Cost @ 1 gwei |
|---|---:|---:|---:|---:|
| **Mainnet demo**: deploy + 1 campaign + 3 claims | 2,367,810 | 0.00011839 | **$0.069** | 0.00236781 ($1.38) |
| **Testnet demo**: mock deploy + deploy + 1 campaign + 3 claims (at testnet 0.12 gwei) | 2,498,737 | 0.00029985 | $0.175 | — |

So a full mainnet launch (deploy + demo campaign + a few claims) costs
**under $0.07 at current gas prices**, and under $1.40 even if gas spikes to
1 gwei. A single claim costs a claimer roughly **half a US cent**.

## Caveats

- Gas varies slightly with inputs: longer campaign names / base URIs cost a
  little more calldata; a claim's first write to a fresh storage slot costs
  more than a repeat claim (108k–159k range above). The figures here are
  representative, not exact for every call.
- Mainnet gas price is the live value at measurement time and can spike
  during congestion; budget the 1 gwei column as the planning number.
- No other on-chain costs exist: claims are free (no payment in the
  contract), and there are no keeper, oracle, or subscription fees.
