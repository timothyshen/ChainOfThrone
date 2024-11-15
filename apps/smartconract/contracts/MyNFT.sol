// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 public nextTokenId;

    // Constructor that initializes the ERC721 contract and sets the owner
    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {}

    function mint(address to) public onlyOwner {
        _safeMint(to, nextTokenId);
        nextTokenId++;
    }
}
