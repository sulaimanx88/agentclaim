// AgentClaim frontend — no backend, no custodian, no server sessions.
// Wallet access is EIP-1193 only (e.g. MetaMask): the site never sees a seed
// phrase or private key, and every transaction is signed by the user in
// their own wallet.

import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import './style.css';
import { AGENT_CLAIM_ABI, REGISTRY_ABI } from './abi.js';
import {
  CHAINS,
  DEFAULT_CHAIN_ID,
  contractAddressFor,
  getCustomAddress,
  isAddress,
  isConfigured,
  setCustomAddress,
} from './config.js';

const $ = (id) => document.getElementById(id);

// ---------- state ----------
let selectedChainId = DEFAULT_CHAIN_ID;
let account = null; // connected address, or null
let walletChainId = null; // chain the wallet is actually on
let readProvider = null;
let readContract = null;
let registryAddress = null;
let campaignsCache = [];
let claimTarget = null; // campaign being claimed in the dialog

// ---------- helpers ----------
function shortAddress(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';
}

function fmtDate(ts) {
  return new Date(Number(ts) * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function campaignStatus(c, now) {
  const start = Number(c.startTime);
  const end = Number(c.endTime);
  const minted = Number(c.minted);
  const max = Number(c.maxSupply);
  if (minted >= max) return { label: 'Sold out', cls: 'soldout' };
  if (now < start) return { label: 'Upcoming', cls: 'upcoming' };
  if (now > end) return { label: 'Ended', cls: 'ended' };
  return { label: 'Live', cls: 'live' };
}

function explainError(err) {
  const text = (err?.reason || err?.shortMessage || err?.message || '').toString();
  const match = (re) => re.test(text);
  if (match(/user rejected|User denied/i)) return 'Transaction rejected in your wallet.';
  if (match(/NotAgentIdHolder/i)) return 'This wallet does not hold an Agent ID, so it cannot claim.';
  if (match(/CampaignNotLive/i)) return 'This campaign is not live right now.';
  if (match(/SupplyExhausted/i)) return 'This campaign is sold out.';
  if (match(/PerWalletLimitReached/i)) return 'You have already claimed the per-wallet limit for this campaign.';
  if (match(/WrongAnswer/i)) return 'The anti-bot code did not match. Try again — the site fetches it fresh each time.';
  if (match(/InvalidCampaignParams/i)) return 'Those campaign settings are not valid (check supply, limit, and times).';
  if (match(/CreationPaused/i)) return 'Campaign creation is paused right now.';
  if (match(/CampaignNotFound/i)) return 'That campaign does not exist.';
  if (match(/insufficient funds/i)) return 'Not enough native token in your wallet to pay the network gas.';
  return text ? `Something went wrong: ${text.slice(0, 200)}` : 'Something went wrong.';
}

function readContractFor(chainId) {
  const addr = contractAddressFor(chainId);
  if (!addr) return null;
  if (readContract && readProvider?._chainId === chainId) return readContract;
  readProvider = new JsonRpcProvider(CHAINS[chainId].rpcUrl, chainId);
  readProvider._chainId = chainId;
  readContract = new Contract(addr, AGENT_CLAIM_ABI, readProvider);
  return readContract;
}

function resetReadCache() {
  readProvider = null;
  readContract = null;
  registryAddress = null;
}

// ---------- wallet ----------
function hasWallet() {
  return typeof window.ethereum !== 'undefined';
}

async function connectWallet() {
  if (!hasWallet()) {
    setWalletBanner('No wallet detected. Install a wallet extension (for example MetaMask) and try again.');
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    account = accounts[0] || null;
    walletChainId = Number(await window.ethereum.request({ method: 'eth_chainId' }));
    updateWalletUI();
    await refreshAll();
  } catch (err) {
    setWalletBanner(explainError(err));
  }
}

function disconnectWallet() {
  account = null;
  walletChainId = null;
  updateWalletUI();
  refreshAll();
}

async function switchWalletChain(chainId) {
  if (!hasWallet() || !account) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (err) {
    // 4902: chain not added to the wallet yet — add it, then the user retries.
    if (err?.code === 4902) {
      const c = CHAINS[chainId];
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${chainId.toString(16)}`,
          chainName: c.name,
          rpcUrls: [c.rpcUrl],
          nativeCurrency: { name: c.currency, symbol: c.currency, decimals: 18 },
          blockExplorerUrls: [c.explorer],
        }],
      });
    } else {
      setWalletBanner(explainError(err));
    }
  }
}

function updateWalletUI() {
  const btn = $('connect-btn');
  if (account) {
    btn.textContent = `Connected: ${shortAddress(account)} (disconnect)`;
    btn.classList.remove('primary');
    btn.onclick = disconnectWallet;
  } else {
    btn.textContent = 'Connect wallet';
    btn.classList.add('primary');
    btn.onclick = connectWallet;
  }

  if (account && walletChainId && walletChainId !== selectedChainId) {
    setWalletBanner(
      `Your wallet is on chain ${walletChainId}, but you are browsing ${CHAINS[selectedChainId].name}. ` +
        'Switch your wallet network to transact here.',
    );
  } else {
    setWalletBanner('');
  }
}

function setWalletBanner(text) {
  const el = $('wallet-banner');
  if (!text) {
    el.hidden = true;
    return;
  }
  $('wallet-banner-text').textContent = text;
  el.hidden = false;
}

// ---------- deploy-pending state ----------
function updateDeployBanner() {
  const configured = isConfigured(selectedChainId);
  $('deploy-banner').hidden = configured;
  if (!configured) {
    $('deploy-banner-text').textContent =
      `No AgentClaim contract is configured for ${CHAINS[selectedChainId].name} yet.`;
  }
  const info = $('contract-info');
  const addr = contractAddressFor(selectedChainId);
  const custom = isAddress(getCustomAddress());
  if (addr) {
    info.innerHTML =
      `Network: <strong>${CHAINS[selectedChainId].name}</strong> (chain ${selectedChainId}) · ` +
      `Contract: <a href="${CHAINS[selectedChainId].explorer}/address/${addr}" target="_blank" rel="noopener">${shortAddress(addr)}</a>` +
      (custom ? ' · using a custom address entered on this page (demo override)' : '');
  } else {
    info.textContent =
      `Network: ${CHAINS[selectedChainId].name} (chain ${selectedChainId}) · Contract: not configured yet.`;
  }
  $('create-submit').disabled = !configured;
  $('custom-address').value = getCustomAddress();
}

// ---------- campaigns ----------
async function loadCampaigns() {
  const list = $('campaign-list');
  const empty = $('campaign-empty');
  const errorEl = $('campaign-error');
  list.innerHTML = '';
  empty.hidden = true;
  errorEl.hidden = true;
  campaignsCache = [];

  if (!isConfigured(selectedChainId)) {
    empty.textContent = 'No campaigns can load until the contract is deployed and configured for this network.';
    empty.hidden = false;
    return;
  }

  list.innerHTML = '<p class="muted">Loading campaigns…</p>';
  try {
    const contract = readContractFor(selectedChainId);
    const next = Number(await contract.nextCampaignId());
    campaignsCache = [];
    for (let id = 0; id < next; id++) {
      const c = await contract.campaigns(id);
      // Campaign IDs start at 1, so id 0 (and any never-created slot) reads
      // back as the zero struct — skip it instead of rendering an empty card.
      if (
        c.creator === '0x0000000000000000000000000000000000000000' ||
        Number(c.maxSupply) === 0
      ) {
        continue;
      }
      campaignsCache.push({
        id,
        creator: c.creator,
        name: c.name,
        maxSupply: c.maxSupply,
        perWalletLimit: c.perWalletLimit,
        startTime: c.startTime,
        endTime: c.endTime,
        minted: c.minted,
      });
    }
  } catch (err) {
    list.innerHTML = '';
    errorEl.textContent = `Could not load campaigns: ${explainError(err)}`;
    errorEl.hidden = false;
    return;
  }

  list.innerHTML = '';
  if (campaignsCache.length === 0) {
    empty.textContent = 'No campaigns yet on this network. Be the first to create one.';
    empty.hidden = false;
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  // Newest first.
  for (const c of [...campaignsCache].reverse()) {
    list.appendChild(campaignCard(c, now));
  }
  if (account) updateClaimedCounts();
}

function campaignCard(c, now) {
  const st = campaignStatus(c, now);
  const remaining = Number(c.maxSupply) - Number(c.minted);
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="card-head">
      <h3></h3>
      <span class="pill ${st.cls}">${st.label}</span>
    </div>
    <dl>
      <div><dt>Claimed</dt><dd>${c.minted} / ${c.maxSupply} · ${remaining} left</dd></div>
      <div><dt>Per wallet</dt><dd>${c.perWalletLimit}</dd></div>
      <div><dt>Period</dt><dd>${fmtDate(c.startTime)} → ${fmtDate(c.endTime)}</dd></div>
      <div><dt>Creator</dt><dd>${shortAddress(c.creator)}</dd></div>
      <div class="claimed-row" hidden><dt>You claimed</dt><dd class="claimed-count">…</dd></div>
    </dl>
    <button class="btn primary claim-btn">Claim badge</button>
    <p class="claim-note muted small"></p>
  `;
  el.querySelector('h3').textContent = c.name || `Campaign #${c.id}`;
  const btn = el.querySelector('.claim-btn');
  const note = el.querySelector('.claim-note');
  if (st.cls !== 'live') {
    btn.disabled = true;
    note.textContent =
      st.cls === 'upcoming'
        ? `Opens ${fmtDate(c.startTime)}.`
        : st.cls === 'soldout'
          ? 'All badges have been claimed.'
          : `Ended ${fmtDate(c.endTime)}.`;
  } else if (!account) {
    note.textContent = 'Connect your wallet to claim.';
  }
  btn.addEventListener('click', () => openClaimDialog(c));
  el.dataset.campaignId = c.id;
  return el;
}

async function updateClaimedCounts() {
  if (!account || !isConfigured(selectedChainId)) return;
  const contract = readContractFor(selectedChainId);
  for (const c of campaignsCache) {
    const card = document.querySelector(`[data-campaign-id="${c.id}"]`);
    if (!card) continue;
    try {
      const n = await contract.claimedCount(c.id, account);
      const row = card.querySelector('.claimed-row');
      row.hidden = false;
      card.querySelector('.claimed-count').textContent = `${n} / ${c.perWalletLimit}`;
      if (Number(n) >= Number(c.perWalletLimit)) {
        const btn = card.querySelector('.claim-btn');
        btn.disabled = true;
        card.querySelector('.claim-note').textContent = 'You have reached the per-wallet limit for this campaign.';
      }
    } catch {
      // Non-fatal: the count is informational.
    }
  }
}

// ---------- claim flow ----------
async function openClaimDialog(campaign) {
  claimTarget = campaign;
  $('claim-campaign').textContent =
    `${campaign.name || `Campaign #${campaign.id}`} · ${campaign.minted}/${campaign.maxSupply} claimed · limit ${campaign.perWalletLimit} per wallet`;
  $('claim-answer').value = '';
  $('claim-status').textContent = '';
  $('claim-confirm').disabled = true;
  $('claim-dialog-backdrop').hidden = false;

  const holderEl = $('claim-holder');
  if (!account) {
    holderEl.textContent = 'Connect your wallet first to claim.';
    holderEl.className = 'status warn-text';
    return;
  }
  if (walletChainId && walletChainId !== selectedChainId) {
    holderEl.textContent = `Your wallet is on chain ${walletChainId}. Switch it to ${CHAINS[selectedChainId].name} to claim.`;
    holderEl.className = 'status warn-text';
    return;
  }

  holderEl.textContent = 'Checking your Agent ID and fetching your code…';
  holderEl.className = 'status';
  try {
    const contract = readContractFor(selectedChainId);
    if (!registryAddress) registryAddress = await contract.registry();
    const registry = new Contract(registryAddress, REGISTRY_ABI, readProvider);
    const idBalance = await registry.balanceOf(account);
    if (Number(idBalance) === 0) {
      holderEl.textContent = 'This wallet does not hold an Agent ID, so it cannot claim. Claims are only open to Agent ID holders.';
      holderEl.className = 'status warn-text';
      return;
    }
    holderEl.textContent = 'Agent ID confirmed for this wallet.';
    holderEl.className = 'status ok-text';
    const answer = await contract.answerFor(account);
    $('claim-answer').value = String(answer).padStart(4, '0');
    $('claim-confirm').disabled = false;
  } catch (err) {
    holderEl.textContent = explainError(err);
    holderEl.className = 'status error-text';
  }
}

function closeClaimDialog() {
  $('claim-dialog-backdrop').hidden = true;
  claimTarget = null;
}

async function confirmClaim() {
  if (!claimTarget || !account) return;
  const status = $('claim-status');
  const btn = $('claim-confirm');
  btn.disabled = true;
  status.textContent = 'Waiting for your wallet to sign…';
  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddressFor(selectedChainId), AGENT_CLAIM_ABI, signer);
    // Re-fetch the code at signing time so it is always fresh.
    const answer = await contract.answerFor(account);
    const tx = await contract.claim(claimTarget.id, answer);
    status.textContent = `Transaction sent (${shortAddress(tx.hash)}…). Waiting for confirmation…`;
    const receipt = await tx.wait();
    let tokenId = null;
    for (const log of receipt.logs || []) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === 'Claimed') tokenId = parsed.args.tokenId.toString();
      } catch {
        // Not our event; ignore.
      }
    }
    status.textContent = tokenId
      ? `Claimed! Badge #${tokenId} is now in your wallet.`
      : 'Claimed! Your badge is on its way — check My badges in a moment.';
    status.className = 'status ok-text';
    await loadCampaigns();
  } catch (err) {
    status.textContent = explainError(err);
    status.className = 'status error-text';
    btn.disabled = false;
  }
}

// ---------- create campaign ----------
async function submitCreate(event) {
  event.preventDefault();
  const status = $('create-status');
  status.textContent = '';
  status.className = 'status';

  if (!isConfigured(selectedChainId)) {
    status.textContent = 'The contract is not configured for this network yet.';
    status.className = 'status error-text';
    return;
  }
  if (!account) {
    status.textContent = 'Connect your wallet first.';
    status.className = 'status error-text';
    return;
  }
  if (walletChainId && walletChainId !== selectedChainId) {
    status.textContent = `Your wallet is on chain ${walletChainId}. Switch it to ${CHAINS[selectedChainId].name} first.`;
    status.className = 'status error-text';
    return;
  }

  const name = $('create-name').value.trim();
  const maxSupply = BigInt($('create-supply').value);
  const perWalletLimit = BigInt($('create-limit').value);
  const startTime = Math.floor(new Date($('create-start').value).getTime() / 1000);
  const endTime = Math.floor(new Date($('create-end').value).getTime() / 1000);

  if (!name || maxSupply < 1n || perWalletLimit < 1n || perWalletLimit > maxSupply) {
    status.textContent = 'Check the fields: a name, supply of at least 1, and a per-wallet limit between 1 and the supply.';
    status.className = 'status error-text';
    return;
  }
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    status.textContent = 'The end time must be after the start time.';
    status.className = 'status error-text';
    return;
  }

  const btn = $('create-submit');
  btn.disabled = true;
  status.textContent = 'Waiting for your wallet to sign…';
  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddressFor(selectedChainId), AGENT_CLAIM_ABI, signer);
    const tx = await contract.createCampaign(name, maxSupply, perWalletLimit, startTime, endTime);
    status.textContent = 'Transaction sent. Waiting for confirmation…';
    const receipt = await tx.wait();
    let campaignId = null;
    for (const log of receipt.logs || []) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === 'CampaignCreated') campaignId = parsed.args.campaignId.toString();
      } catch {
        // Not our event; ignore.
      }
    }
    status.textContent = campaignId
      ? `Campaign created with ID ${campaignId}. It is now listed under Campaigns.`
      : 'Campaign created. It is now listed under Campaigns.';
    status.className = 'status ok-text';
    event.target.reset();
    await loadCampaigns();
  } catch (err) {
    status.textContent = explainError(err);
    status.className = 'status error-text';
  } finally {
    btn.disabled = false;
  }
}

// ---------- my badges ----------
// No indexer: enumerate token IDs and check ownership. Fine at hackathon
// scale; the scan is capped so a huge collection cannot hang the page.
const BADGE_SCAN_CAP = 1000;

async function loadBadges() {
  const list = $('badge-list');
  const empty = $('badge-empty');
  const errorEl = $('badge-error');
  list.innerHTML = '';
  empty.hidden = true;
  errorEl.hidden = true;

  if (!isConfigured(selectedChainId)) {
    empty.textContent = 'No badges can load until the contract is deployed and configured for this network.';
    empty.hidden = false;
    return;
  }
  if (!account) {
    empty.textContent = 'Connect your wallet to see your badges.';
    empty.hidden = false;
    return;
  }

  list.innerHTML = '<p class="muted">Scanning for your badges…</p>';
  try {
    const contract = readContractFor(selectedChainId);
    const total = Number(await contract.nextTokenId());
    const scan = Math.min(total, BADGE_SCAN_CAP);
    const owned = [];
    // Batch ownerOf calls 20 at a time.
    for (let i = 1; i < scan; i += 20) {
      const batch = [];
      for (let id = i; id < Math.min(i + 20, scan); id++) {
        batch.push(
          contract.ownerOf(id).then((o) => ({ id, owner: o })).catch(() => null),
        );
      }
      for (const r of await Promise.all(batch)) {
        if (r && r.owner.toLowerCase() === account.toLowerCase()) owned.push(r.id);
      }
    }
    list.innerHTML = '';
    if (owned.length === 0) {
      empty.textContent = 'No badges yet. Claim one from a live campaign.';
      empty.hidden = false;
      return;
    }
    for (const id of owned.reverse()) {
      list.appendChild(await badgeCard(contract, id));
    }
  } catch (err) {
    list.innerHTML = '';
    errorEl.textContent = `Could not load badges: ${explainError(err)}`;
    errorEl.hidden = false;
  }
}

async function badgeCard(contract, tokenId) {
  const el = document.createElement('article');
  el.className = 'card badge';
  let campaignName = `Campaign #?`;
  let imageUrl = null;
  try {
    const campaignId = await contract.tokenCampaign(tokenId);
    const c = await contract.campaigns(campaignId);
    campaignName = c.name || `Campaign #${campaignId}`;
  } catch {
    // Leave the placeholder.
  }
  try {
    const uri = await contract.tokenURI(tokenId);
    if (uri) {
      const metaUrl = uri.startsWith('ipfs://')
        ? uri.replace('ipfs://', 'https://ipfs.io/ipfs/')
        : uri;
      const meta = await (await fetch(metaUrl)).json();
      if (meta?.image) {
        imageUrl = meta.image.startsWith('ipfs://')
          ? meta.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
          : meta.image;
      }
    }
  } catch {
    // Metadata is optional; the badge still shows without it.
  }
  el.innerHTML = `
    ${imageUrl ? `<img class="badge-img" alt="" />` : '<div class="badge-img placeholder">🎟️</div>'}
    <h3></h3>
    <dl>
      <div><dt>Badge</dt><dd>#${tokenId}</dd></div>
      <div><dt>Campaign</dt><dd class="badge-campaign"></dd></div>
    </dl>
    <a class="btn ghost" target="_blank" rel="noopener">View on explorer</a>
  `;
  if (imageUrl) el.querySelector('img').src = imageUrl;
  el.querySelector('h3').textContent = `Badge #${tokenId}`;
  el.querySelector('.badge-campaign').textContent = campaignName;
  el.querySelector('a').href =
    `${CHAINS[selectedChainId].explorer}/token/${contractAddressFor(selectedChainId)}?a=${tokenId}`;
  return el;
}

// ---------- navigation / wiring ----------
function showView(name) {
  for (const el of document.querySelectorAll('.view')) el.hidden = true;
  $(`view-${name}`).hidden = false;
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === name);
  }
  if (name === 'badges') loadBadges();
  if (name === 'campaigns') loadCampaigns();
}

async function refreshAll() {
  updateDeployBanner();
  await loadCampaigns();
  if (!$('view-badges').hidden) await loadBadges();
}

function onChainSelected(chainId) {
  selectedChainId = chainId;
  resetReadCache();
  updateWalletUI();
  refreshAll();
  if (account && walletChainId && walletChainId !== chainId) {
    // Offer the switch; the user still confirms it in their wallet.
    switchWalletChain(chainId);
  }
}

function init() {
  $('chain-select').value = String(selectedChainId);
  $('chain-select').addEventListener('change', (e) => onChainSelected(Number(e.target.value)));

  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  }
  $('brand-home').addEventListener('click', (e) => {
    e.preventDefault();
    showView('campaigns');
  });

  $('connect-btn').addEventListener('click', connectWallet);
  $('create-form').addEventListener('submit', submitCreate);
  $('claim-confirm').addEventListener('click', confirmClaim);
  $('claim-cancel').addEventListener('click', closeClaimDialog);
  $('claim-dialog-backdrop').addEventListener('click', (e) => {
    if (e.target === $('claim-dialog-backdrop')) closeClaimDialog();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeClaimDialog();
  });

  $('custom-save').addEventListener('click', () => {
    const value = $('custom-address').value.trim();
    const status = $('custom-status');
    if (value && !isAddress(value)) {
      status.textContent = 'That does not look like a valid 0x address.';
      status.className = 'status error-text';
      return;
    }
    setCustomAddress(value);
    status.textContent = value
      ? 'Custom address applied for this browser.'
      : 'Custom address cleared; using the configured address.';
    status.className = 'status ok-text';
    resetReadCache();
    refreshAll();
  });
  $('custom-clear').addEventListener('click', () => {
    $('custom-address').value = '';
    setCustomAddress('');
    $('custom-status').textContent = 'Custom address cleared; using the configured address.';
    $('custom-status').className = 'status ok-text';
    resetReadCache();
    refreshAll();
  });

  if (hasWallet()) {
    window.ethereum.on('accountsChanged', (accounts) => {
      account = accounts[0] || null;
      updateWalletUI();
      refreshAll();
    });
    window.ethereum.on('chainChanged', (hex) => {
      walletChainId = Number(hex);
      updateWalletUI();
      refreshAll();
    });
    // Silent reconnect if the wallet already authorised this site.
    window.ethereum.request({ method: 'eth_accounts' })
      .then(async (accounts) => {
        if (accounts[0]) {
          account = accounts[0];
          walletChainId = Number(await window.ethereum.request({ method: 'eth_chainId' }));
          updateWalletUI();
        }
      })
      .catch(() => {})
      .finally(() => refreshAll());
  } else {
    refreshAll();
  }

  updateDeployBanner();
}

init();
