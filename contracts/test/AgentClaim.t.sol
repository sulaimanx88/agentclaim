// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentClaim} from "../src/AgentClaim.sol";

/// @notice Minimal stand-in for the Agent ID registry: only balanceOf,
///         controllable by the test. Mirrors the real registry's gate
///         semantics (holds an Agent ID iff balanceOf > 0).
contract MockAgentIdRegistry {
    mapping(address => uint256) public balanceOf;

    function setBalance(address user, uint256 amount) external {
        balanceOf[user] = amount;
    }
}

contract AgentClaimTest is Test {
    AgentClaim public claim;
    MockAgentIdRegistry public registry;

    address public holder = address(0xA11CE);
    address public holder2 = address(0xB0B);
    address public holder3 = address(0xC3C);
    address public nonHolder = address(0xDEAD);

    uint256 public constant START = 1_000_000;
    uint256 public constant END = 2_000_000;

    function setUp() public {
        registry = new MockAgentIdRegistry();
        claim = new AgentClaim(address(registry), "https://agentclaim.example/badges/");

        registry.setBalance(holder, 1);
        registry.setBalance(holder2, 2); // multiple IDs still count as holder
        registry.setBalance(holder3, 1);
        // nonHolder deliberately left at 0.

        vm.warp(START + 100); // inside the campaign period
    }

    function _createCampaign(uint256 maxSupply, uint256 perWalletLimit) internal returns (uint256) {
        return claim.createCampaign("Demo Badge", maxSupply, perWalletLimit, START, END);
    }

    // ---- Required: non-holder claim REVERTS ----

    function test_NonHolderClaimReverts() public {
        uint256 id = _createCampaign(10, 1);
        uint256 answer = claim.answerFor(nonHolder);
        vm.prank(nonHolder);
        vm.expectRevert(AgentClaim.NotAgentIdHolder.selector);
        claim.claim(id, answer);
    }

    // ---- Required: holder claim SUCCEEDS ----

    function test_HolderClaimSucceeds() public {
        uint256 id = _createCampaign(10, 1);
        uint256 answer = claim.answerFor(holder);
        vm.prank(holder);
        uint256 tokenId = claim.claim(id, answer);

        assertEq(claim.ownerOf(tokenId), holder);
        assertEq(claim.tokenCampaign(tokenId), id);
        assertEq(claim.claimedCount(id, holder), 1);
        assertEq(claim.balanceOf(holder), 1);
    }

    // ---- Required: per-wallet limit enforced ----

    function test_PerWalletLimitEnforced() public {
        uint256 id = _createCampaign(10, 2);
        uint256 answer = claim.answerFor(holder);

        vm.startPrank(holder);
        claim.claim(id, answer);
        claim.claim(id, answer); // 2nd claim OK (limit is 2)
        vm.expectRevert(AgentClaim.PerWalletLimitReached.selector);
        claim.claim(id, answer); // 3rd claim must revert
        vm.stopPrank();
    }

    // ---- Required: wrong anti-bot answer REVERTS ----

    function test_WrongAnswerReverts() public {
        uint256 id = _createCampaign(10, 1);
        uint256 correct = claim.answerFor(holder);
        uint256 wrong = (correct + 1) % 10000;
        vm.prank(holder);
        vm.expectRevert(AgentClaim.WrongAnswer.selector);
        claim.claim(id, wrong);
    }

    // ---- Required: supply cap enforced ----

    function test_SupplyCapEnforced() public {
        uint256 id = _createCampaign(2, 1);

        uint256 answer1 = claim.answerFor(holder);
        vm.prank(holder);
        claim.claim(id, answer1);

        uint256 answer2 = claim.answerFor(holder2);
        vm.prank(holder2);
        claim.claim(id, answer2);

        // Supply exhausted: a third, otherwise-eligible holder must revert.
        uint256 answer3 = claim.answerFor(holder3);
        vm.prank(holder3);
        vm.expectRevert(AgentClaim.SupplyExhausted.selector);
        claim.claim(id, answer3);
    }

    // ---- Required: claims outside the period REVERT ----

    function test_ClaimBeforeStartReverts() public {
        uint256 id = _createCampaign(10, 1);
        uint256 answer = claim.answerFor(holder);
        vm.warp(START - 1); // one second before open
        vm.prank(holder);
        vm.expectRevert(AgentClaim.CampaignNotLive.selector);
        claim.claim(id, answer);
    }

    function test_ClaimAfterEndReverts() public {
        uint256 id = _createCampaign(10, 1);
        uint256 answer = claim.answerFor(holder);
        vm.warp(END + 1); // one second after close
        vm.prank(holder);
        vm.expectRevert(AgentClaim.CampaignNotLive.selector);
        claim.claim(id, answer);
    }

    function test_ClaimAtExactBoundariesSucceeds() public {
        uint256 id = _createCampaign(10, 2);
        uint256 answer = claim.answerFor(holder);

        vm.warp(START); // exactly at open
        vm.prank(holder);
        claim.claim(id, answer);

        vm.warp(END); // exactly at close (inclusive)
        vm.prank(holder);
        claim.claim(id, answer);
    }

    // ---- Campaign creation validation ----

    function test_CreateCampaignRejectsBadParams() public {
        vm.expectRevert(AgentClaim.InvalidCampaignParams.selector);
        claim.createCampaign("x", 0, 1, START, END); // zero supply

        vm.expectRevert(AgentClaim.InvalidCampaignParams.selector);
        claim.createCampaign("x", 10, 0, START, END); // zero per-wallet limit

        vm.expectRevert(AgentClaim.InvalidCampaignParams.selector);
        claim.createCampaign("x", 2, 3, START, END); // limit > supply

        vm.expectRevert(AgentClaim.InvalidCampaignParams.selector);
        claim.createCampaign("x", 10, 1, END, START); // start >= end

        vm.expectRevert(AgentClaim.InvalidCampaignParams.selector);
        claim.createCampaign("", 10, 1, START, END); // empty name

        vm.expectRevert(AgentClaim.InvalidCampaignParams.selector);
        claim.createCampaign("x", 10, 1, START - 1000, START); // already ended
    }

    function test_ClaimOnUnknownCampaignReverts() public {
        uint256 answer = claim.answerFor(holder);
        vm.prank(holder);
        vm.expectRevert(AgentClaim.CampaignNotFound.selector);
        claim.claim(999, answer);
    }

    // ---- Owner powers: pause blocks creation only, never claims ----

    function test_PauseBlocksCreationButNotClaims() public {
        uint256 id = _createCampaign(10, 1);

        claim.setCreationPaused(true);
        assertTrue(claim.creationPaused());

        vm.expectRevert(AgentClaim.CreationPaused.selector);
        claim.createCampaign("Blocked", 10, 1, START, END);

        // Existing campaign claims still work while creation is paused.
        uint256 answer = claim.answerFor(holder);
        vm.prank(holder);
        claim.claim(id, answer);

        claim.setCreationPaused(false);
        uint256 id2 = claim.createCampaign("Unblocked", 10, 1, START, END);
        assertEq(id2, id + 1);
    }

    function test_OnlyOwnerCanPause() public {
        vm.prank(nonHolder);
        vm.expectRevert();
        claim.setCreationPaused(true);
    }

    // ---- No payments accepted ----

    function test_RejectsDirectPayments() public {
        vm.deal(holder, 1 ether);
        vm.prank(holder);
        (bool ok,) = address(claim).call{value: 1 ether}("");
        assertFalse(ok, "direct native-token transfer must revert");
        assertEq(address(claim).balance, 0);
    }

    function test_ClaimWithValueReverts() public {
        uint256 id = _createCampaign(10, 1);
        vm.deal(holder, 1 ether);
        vm.prank(holder);
        (bool ok,) = address(claim).call{value: 1 ether}(
            abi.encodeWithSelector(AgentClaim.claim.selector, id, claim.answerFor(holder))
        );
        assertFalse(ok, "claim() with value must revert (non-payable)");
    }

    // ---- Anti-bot answer properties ----

    function test_AnswerForIsDeterministicAndBounded() public view {
        uint256 a = claim.answerFor(holder);
        uint256 b = claim.answerFor(holder);
        assertEq(a, b);
        assertLt(a, 10000);
    }

    function testFuzz_AnswerForAlwaysInRange(address user) public view {
        assertLt(claim.answerFor(user), 10000);
    }

    function test_AnswerIsPerAddress() public view {
        // Different addresses (almost surely) get different answers;
        // at minimum the function must not return a constant.
        assertTrue(
            claim.answerFor(holder) != claim.answerFor(holder2) || claim.answerFor(holder) != claim.answerFor(holder3)
        );
    }

    // ---- Registry gate reads live balance ----

    function test_HolderWhoTransfersIdAwayCannotClaim() public {
        uint256 id = _createCampaign(10, 1);
        uint256 answer = claim.answerFor(holder);
        registry.setBalance(holder, 0); // ID moved away before claiming
        vm.prank(holder);
        vm.expectRevert(AgentClaim.NotAgentIdHolder.selector);
        claim.claim(id, answer);
    }
}
