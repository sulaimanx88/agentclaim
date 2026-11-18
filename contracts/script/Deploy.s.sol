// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AgentClaim} from "../src/AgentClaim.sol";
import {MockAgentIdRegistry} from "./MockAgentIdRegistry.sol";

/// @title Deploy AgentClaim
/// @notice Deploys AgentClaim on BSC mainnet (chainId 56) or BSC testnet
///         (chainId 97). Mainnet deploys use the real Agent ID registry;
///         testnet deploys use a fresh MockAgentIdRegistry unless REGISTRY
///         is set explicitly.
///
/// Env vars:
///   PRIVATE_KEY  Deployer key. NEVER a funded production key for testnet:
///                use a fresh throwaway keypair funded from a public faucet.
///   REGISTRY     (optional) Agent ID registry address override.
///   BASE_URI     (optional) Badge metadata base URI, default "".
///
/// Examples:
///   forge script script/Deploy.s.sol --rpc-url bsc_testnet --broadcast
///   forge script script/Deploy.s.sol --rpc-url bsc --broadcast --verify
contract Deploy is Script {
    /// @notice Agent ID registry on BSC mainnet.
    address public constant MAINNET_REGISTRY = 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        string memory baseURI = vm.envOr("BASE_URI", string(""));
        address registryEnv = vm.envOr("REGISTRY", address(0));

        address registry;
        MockAgentIdRegistry mock;
        if (block.chainid == 56) {
            // Mainnet: real registry, unless explicitly overridden.
            registry = registryEnv == address(0) ? MAINNET_REGISTRY : registryEnv;
        } else {
            // Testnet / local: mock registry unless REGISTRY is set.
            if (registryEnv != address(0)) {
                registry = registryEnv;
            } else {
                vm.startBroadcast(deployerKey);
                mock = new MockAgentIdRegistry();
                vm.stopBroadcast();
                registry = address(mock);
                console.log("MockAgentIdRegistry deployed at:", registry);
            }
        }

        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Registry:", registry);
        console.log("Base URI:", baseURI);

        vm.startBroadcast(deployerKey);
        AgentClaim agentClaim = new AgentClaim(registry, baseURI);
        // Testnet demo convenience: give the deployer a mock Agent ID so the
        // demo claim flow works immediately. No-op on mainnet (mock is null).
        if (address(mock) != address(0)) {
            mock.grant(deployer, 1);
        }
        vm.stopBroadcast();

        console.log("AgentClaim deployed at:", address(agentClaim));
    }
}
