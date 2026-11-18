// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AgentClaim} from "../src/AgentClaim.sol";

/// @notice Creates the demo campaign on the deployed AgentClaim contract.
/// @dev Env: AGENTCLAIM_ADDRESS (deployed contract), PRIVATE_KEY (EOA owner key).
///      Campaign: "AgentClaim Genesis Badge", maxSupply 1000, 1/wallet,
///      live immediately, closes 31 Dec 2026 23:59:59 WIB (1798736399).
contract CreateCampaign is Script {
    function run() external {
        address claimAddr = vm.envAddress("AGENTCLAIM_ADDRESS");
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        AgentClaim c = AgentClaim(payable(claimAddr));

        console.log("Contract:", claimAddr);
        console.log("Creator:", vm.addr(deployerKey));
        console.log("Next campaign ID:", c.nextCampaignId());

        vm.startBroadcast(deployerKey);
        uint256 campaignId = c.createCampaign(
            "AgentClaim Genesis Badge",
            1000,
            1,
            block.timestamp,
            1798736399
        );
        vm.stopBroadcast();

        console.log("Campaign created, ID:", campaignId);
    }
}
