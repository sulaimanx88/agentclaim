// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Minimal interface of the Agent ID registry (ERC-721).
/// @dev Only balanceOf is needed: an address holds an Agent ID iff
///      balanceOf(address) > 0. No name-to-address lookup exists anywhere
///      in this project, by design.
interface IAgentIdRegistry {
    function balanceOf(address owner) external view returns (uint256);
}

/// @title AgentClaim
/// @notice Free-claim factory for badge campaigns gated by Agent ID ownership.
///
/// Anyone can create a campaign (a badge drop). Claims are FREE: no payment
/// is accepted anywhere in this contract, and there are no user funds to
/// withdraw. A claim succeeds only if the caller:
///   (a) holds at least one Agent ID in the registry,
///   (b) claims while the campaign is live (startTime <= now <= endTime),
///   (c) supply remains (minted < maxSupply),
///   (d) is under the per-wallet limit for that campaign, and
///   (e) passes the correct deterministic anti-bot answer for their address.
///
/// Each successful claim mints one ERC-721 badge for that campaign.
///
/// Design (see README.md for the full rationale):
///  - Single contract manages all campaigns by ID. No per-campaign clones:
///    campaigns share identical logic, one deployment serves every campaign,
///    and there is no proxy/clone surface to audit.
///  - Badges are ERC-721 (one token per claim), the standard for collectible
///    badges: best wallet / marketplace display, simple per-token metadata.
///  - Anti-bot answer is a deterministic 4-digit code derived from the
///    claimer's address, readable via the public `answerFor` view. It is a
///    lightweight speed bump against naive bots, NOT strong bot-proofing:
///    anyone can read the answer on-chain. It must never be presented as
///    real sybil resistance.
contract AgentClaim is ERC721, Ownable {
    IAgentIdRegistry public immutable registry;

    string private _baseTokenURI;

    uint256 public nextCampaignId = 1;
    uint256 public nextTokenId = 1;

    /// @notice When true, no NEW campaigns can be created. Existing
    ///         campaigns and claims are unaffected. This is the owner's
    ///         only operational power (see OWNER_PERMISSIONS.md).
    bool public creationPaused;

    struct Campaign {
        address creator;
        string name;
        uint256 maxSupply;
        uint256 perWalletLimit;
        uint256 startTime;
        uint256 endTime;
        uint256 minted;
    }

    mapping(uint256 campaignId => Campaign) public campaigns;
    mapping(uint256 campaignId => mapping(address claimer => uint256)) public claimedCount;
    mapping(uint256 tokenId => uint256 campaignId) public tokenCampaign;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string name,
        uint256 maxSupply,
        uint256 perWalletLimit,
        uint256 startTime,
        uint256 endTime
    );
    event Claimed(uint256 indexed campaignId, address indexed claimer, uint256 indexed tokenId);
    event CreationPausedSet(bool paused);

    error NotAgentIdHolder();
    error CampaignNotFound();
    error CampaignNotLive();
    error SupplyExhausted();
    error PerWalletLimitReached();
    error WrongAnswer();
    error InvalidCampaignParams();
    error InvalidRegistry();
    error CreationPaused();
    error NoPaymentsAccepted();

    /// @param registry_ Address of the Agent ID registry contract.
    ///        On BSC mainnet (chainId 56) this is
    ///        0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F.
    /// @param baseTokenURI_ Base URI prepended to token IDs in tokenURI().
    ///        May be empty; metadata hosting is off-chain and optional.
    constructor(address registry_, string memory baseTokenURI_)
        ERC721("AgentClaim Badge", "ACBADGE")
        Ownable(msg.sender)
    {
        if (registry_ == address(0)) revert InvalidRegistry();
        registry = IAgentIdRegistry(registry_);
        _baseTokenURI = baseTokenURI_;
    }

    /// @notice Deterministic anti-bot answer for an address: a 4-digit code
    ///         (0-9999) derived from the address and this contract's address.
    ///         Public on purpose: the website / claimer reads it, then passes
    ///         it to claim(). A bot that does not bother to read it fails.
    function answerFor(address user) public view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(user, address(this)))) % 10000;
    }

    /// @notice Create a new free-claim campaign. Permissionless: anyone can
    ///         launch a campaign. Campaign rules are immutable once created:
    ///         there is no function that edits them afterwards.
    /// @param name Human-readable campaign name (must be non-empty).
    /// @param maxSupply Total badges that can ever be claimed in this campaign.
    /// @param perWalletLimit Max badges one address can claim in this campaign.
    /// @param startTime Unix timestamp when claims open.
    /// @param endTime Unix timestamp when claims close (inclusive).
    /// @return campaignId The new campaign's ID (starts at 1, increments).
    function createCampaign(
        string calldata name,
        uint256 maxSupply,
        uint256 perWalletLimit,
        uint256 startTime,
        uint256 endTime
    ) external returns (uint256 campaignId) {
        if (creationPaused) revert CreationPaused();
        if (
            bytes(name).length == 0 || maxSupply == 0 || perWalletLimit == 0 || perWalletLimit > maxSupply
                || startTime >= endTime || endTime <= block.timestamp
        ) revert InvalidCampaignParams();

        campaignId = nextCampaignId++;
        campaigns[campaignId] = Campaign({
            creator: msg.sender,
            name: name,
            maxSupply: maxSupply,
            perWalletLimit: perWalletLimit,
            startTime: startTime,
            endTime: endTime,
            minted: 0
        });

        emit CampaignCreated(campaignId, msg.sender, name, maxSupply, perWalletLimit, startTime, endTime);
    }

    /// @notice Claim one badge from a campaign. Free: this function is
    ///         non-payable and reverts if value is sent with the call.
    /// @param campaignId The campaign to claim from.
    /// @param answer The caller's anti-bot answer; must equal
    ///               answerFor(msg.sender).
    /// @return tokenId The newly minted badge token ID.
    function claim(uint256 campaignId, uint256 answer) external returns (uint256 tokenId) {
        Campaign storage c = campaigns[campaignId];
        if (c.creator == address(0)) revert CampaignNotFound();
        if (block.timestamp < c.startTime || block.timestamp > c.endTime) {
            revert CampaignNotLive();
        }
        if (c.minted >= c.maxSupply) revert SupplyExhausted();
        if (claimedCount[campaignId][msg.sender] >= c.perWalletLimit) {
            revert PerWalletLimitReached();
        }
        if (answer != answerFor(msg.sender)) revert WrongAnswer();
        if (registry.balanceOf(msg.sender) == 0) revert NotAgentIdHolder();

        c.minted += 1;
        claimedCount[campaignId][msg.sender] += 1;

        tokenId = nextTokenId++;
        tokenCampaign[tokenId] = campaignId;
        _safeMint(msg.sender, tokenId);

        emit Claimed(campaignId, msg.sender, tokenId);
    }

    /// @notice Emergency brake: pause / unpause creation of NEW campaigns.
    ///         Claims on existing campaigns keep working while paused.
    ///         This is the owner's only operational power.
    function setCreationPaused(bool paused) external onlyOwner {
        creationPaused = paused;
        emit CreationPausedSet(paused);
    }

    /// @notice tokenURI = baseTokenURI + tokenId (OpenZeppelin ERC721 default).
    ///         Frontends can resolve tokenId -> campaignId via tokenCampaign().
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Claims are free: the contract accepts no payments, ever.
    receive() external payable {
        revert NoPaymentsAccepted();
    }

    /// @notice Rejects any direct native-token transfer and unknown calls.
    fallback() external payable {
        revert NoPaymentsAccepted();
    }
}
