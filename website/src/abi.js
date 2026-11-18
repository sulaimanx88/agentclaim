// Minimal ABI: only the AgentClaim functions the site uses.
// Full ABI: ../contracts/abi/AgentClaim.json
export const AGENT_CLAIM_ABI = [
  'function answerFor(address user) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function campaigns(uint256 campaignId) view returns (address creator, string name, uint256 maxSupply, uint256 perWalletLimit, uint256 startTime, uint256 endTime, uint256 minted)',
  'function claim(uint256 campaignId, uint256 answer) returns (uint256 tokenId)',
  'function claimedCount(uint256 campaignId, address claimer) view returns (uint256)',
  'function createCampaign(string name, uint256 maxSupply, uint256 perWalletLimit, uint256 startTime, uint256 endTime) returns (uint256 campaignId)',
  'function creationPaused() view returns (bool)',
  'function name() view returns (string)',
  'function nextCampaignId() view returns (uint256)',
  'function nextTokenId() view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function registry() view returns (address)',
  'function symbol() view returns (string)',
  'function tokenCampaign(uint256 tokenId) view returns (uint256 campaignId)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'event CampaignCreated(uint256 indexed campaignId, address indexed creator, string name, uint256 maxSupply, uint256 perWalletLimit, uint256 startTime, uint256 endTime)',
  'event Claimed(uint256 indexed campaignId, address indexed claimer, uint256 indexed tokenId)',
];

// The Agent ID registry is an ERC-721. The site only needs balanceOf to
// check whether the connected wallet holds an Agent ID.
export const REGISTRY_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
];
