// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {MyTokenV1} from "./MyTokenV1.sol";

/// @title MyToken ERC20 V2
/// @dev Same storage as V1; adds version() for lab verification.
contract MyTokenV2 is MyTokenV1 {
    function version() public pure returns (string memory) {
        return "V2";
    }
}
