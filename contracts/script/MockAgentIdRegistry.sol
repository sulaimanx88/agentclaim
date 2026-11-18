// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockAgentIdRegistry
/// @notice TEST-ONLY stand-in for the Agent ID registry, used on testnet and
///         local chains where the real registry does not exist.
/// @dev NEVER deploy this on mainnet: on mainnet the real registry address
///      must be passed to AgentClaim instead. This mock exists only so the
///      demo flow (create campaign -> claim) can be exercised on testnet.
contract MockAgentIdRegistry {
    mapping(address => uint256) public balanceOf;

    event Granted(address indexed user, uint256 amount);

    /// @notice Give `user` a fake Agent ID balance (testnet demo only).
    function grant(address user, uint256 amount) external {
        balanceOf[user] = amount;
        emit Granted(user, amount);
    }
}
