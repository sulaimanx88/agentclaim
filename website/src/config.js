// AgentClaim configuration.
//
// The contract address is NOT hard-coded. Set it per chain with env vars at
// build/deploy time (Vercel dashboard: Project -> Settings -> Environment
// Variables, then redeploy), or paste an address in the site's "Contract"
// panel for a quick demo (stored only in this browser's localStorage).
//
//   VITE_AGENTCLAIM_ADDRESS_97   AgentClaim on BNB Chain Testnet (chain 97)
//   VITE_AGENTCLAIM_ADDRESS_56   AgentClaim on BNB Chain (chain 56)
//   VITE_AGENTCLAIM_ADDRESS      Fallback address (used on the default chain)
//   VITE_AGENTCLAIM_CHAIN_ID     Default chain (97 or 56; default 97)
//
// Until an address is configured for the selected chain, the site shows a
// clear "deploy pending" state instead of failing.

export const CHAINS = {
  97: {
    id: 97,
    name: 'BNB Chain Testnet',
    rpcUrl: 'https://bsc-testnet.publicnode.com',
    explorer: 'https://testnet.bscscan.com',
    currency: 'tBNB',
  },
  56: {
    id: 56,
    name: 'BNB Chain',
    rpcUrl: 'https://bsc.publicnode.com',
    explorer: 'https://bscscan.com',
    currency: 'BNB',
  },
};

export const DEFAULT_CHAIN_ID =
  Number(import.meta.env.VITE_AGENTCLAIM_CHAIN_ID) === 56 ? 56 : 97;

const ENV_ADDRESSES = {
  97:
    import.meta.env.VITE_AGENTCLAIM_ADDRESS_97 ||
    (DEFAULT_CHAIN_ID === 97 ? import.meta.env.VITE_AGENTCLAIM_ADDRESS : '') ||
    '',
  56:
    import.meta.env.VITE_AGENTCLAIM_ADDRESS_56 ||
    (DEFAULT_CHAIN_ID === 56 ? import.meta.env.VITE_AGENTCLAIM_ADDRESS : '') ||
    '',
};

const CUSTOM_KEY = 'agentclaim.customAddress';

export function getCustomAddress() {
  try {
    return (localStorage.getItem(CUSTOM_KEY) || '').trim();
  } catch {
    return '';
  }
}

export function setCustomAddress(address) {
  try {
    if (address) localStorage.setItem(CUSTOM_KEY, address.trim());
    else localStorage.removeItem(CUSTOM_KEY);
  } catch {
    // localStorage unavailable (private mode); custom address just won't persist.
  }
}

function isAddress(value) {
  return /^0x[0-9a-fA-F]{40}$/.test(value || '');
}

// Effective contract address for a chain: a custom (demo) address wins over
// the build-time env address. Returns '' when nothing is configured.
export function contractAddressFor(chainId) {
  const custom = getCustomAddress();
  if (isAddress(custom)) return custom;
  const env = (ENV_ADDRESSES[chainId] || '').trim();
  return isAddress(env) ? env : '';
}

export function isConfigured(chainId) {
  return contractAddressFor(chainId) !== '';
}

export { isAddress };
