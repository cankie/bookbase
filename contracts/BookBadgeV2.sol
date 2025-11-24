// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * BookBadgeV2 — on-chain "reading memory capsule"
 *
 * Soulbound-ish ERC721:
 *  - Mint only (non-transferable), via _update override
 *  - Stores full reading context on-chain
 */
contract BookBadgeV2 is ERC721, Ownable {
    struct BookLog {
        string title;
        string author;
        string isbn;
        string place;       // 🏞️ Home / Plane / Park
        string mood;        // 🌙 Peaceful / Curious / Heartbroken
        string timeLabel;   // 🕰️ Morning / Midnight / Summer 2024
        string fragment;    // 📷 Quote / thought text
        string photoUri;    // link to a photo (ipfs/http). optional
        string coverUri;    // book cover URI
        uint64 finishedAt;  // unix seconds
    }

    uint256 public nextId;
    mapping(uint256 => BookLog) private _logs;

    event BookLogged(address indexed reader, uint256 indexed tokenId, string title);

    constructor() ERC721("BookBase Badge V2", "BOOKV2") Ownable(msg.sender) {}

    function logBook(
        string memory title,
        string memory author,
        string memory isbn,
        string memory place,
        string memory mood,
        string memory timeLabel,
        string memory fragment,
        string memory photoUri,
        string memory coverUri,
        uint64 finishedAt
    ) external returns (uint256 tokenId) {
        require(bytes(title).length > 0, "title required");

        tokenId = ++nextId;
        _safeMint(msg.sender, tokenId);

        _logs[tokenId] = BookLog({
            title: title,
            author: author,
            isbn: isbn,
            place: place,
            mood: mood,
            timeLabel: timeLabel,
            fragment: fragment,
            photoUri: photoUri,
            coverUri: coverUri,
            finishedAt: finishedAt == 0 ? uint64(block.timestamp) : finishedAt
        });

        emit BookLogged(msg.sender, tokenId, title);
    }

    // Soulbound: block transfers after mint (allow minting and potential future burn to 0)
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: non-transferable");
        }
        return super._update(to, tokenId, auth);
    }

    // Internal existence check for OZ v5
    function _tokenExists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function getBook(uint256 tokenId) external view returns (BookLog memory) {
        require(_tokenExists(tokenId), "no token");
        return _logs[tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return nextId;
    }
}
