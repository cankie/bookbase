// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
 * BookBadge
 *
 * - Soulbound-ish ERC721: cannot transfer once minted
 * - Each mint = "I read this book" log
 * - Stores basic book info on-chain
 *
 * logBook(...) mints a new token to msg.sender with their reading data.
 */

contract BookBadge is ERC721, Ownable {
    struct BookLog {
        string title;
        string author;
        string isbn;
        string notes;
        string uri;        // e.g. cover image / metadata URL
        uint64 finishedAt; // unix timestamp when finished
    }

    uint256 public nextId;
    mapping(uint256 => BookLog) private _logs;

    event BookLogged(
        address indexed reader,
        uint256 indexed tokenId,
        string title,
        string isbn
    );

    constructor() ERC721("BookBase Badge", "BOOKBASE") Ownable(msg.sender) {}

    // user calls this to mint their reading badge
    function logBook(
        string memory title,
        string memory author,
        string memory isbn,
        string memory notes,
        string memory uri,
        uint64 finishedAt
    ) external returns (uint256 tokenId) {
        require(bytes(title).length > 0, "title required");

        tokenId = ++nextId;

        // mint NFT to the caller
        _safeMint(msg.sender, tokenId);

        // store their book log
        _logs[tokenId] = BookLog({
            title: title,
            author: author,
            isbn: isbn,
            notes: notes,
            uri: uri,
            finishedAt: finishedAt == 0
                ? uint64(block.timestamp)
                : finishedAt
        });

        emit BookLogged(msg.sender, tokenId, title, isbn);
    }

    // prevent transfers = make it "soulbound-ish"
    // This overrides ERC721's internal transfer/update hook.
    // We only allow:
    // - mint (from == 0x0 to user)
    // - burn (to == 0x0 if you ever add burn later; right now we don't expose burn)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // If token already exists and this is not minting (from == 0)
        // AND not burning (to == 0), block it.
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: non-transferable");
        }

        return super._update(to, tokenId, auth);
    }

    // helper: internal existence check for newer OZ
    function _tokenExists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // read back the info for a given tokenId
    function getBook(
        uint256 tokenId
    ) external view returns (BookLog memory) {
        require(_tokenExists(tokenId), "no token");
        return _logs[tokenId];
    }

    // optional metadata URI hook (what marketplaces/readers pull as tokenURI)
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_tokenExists(tokenId), "no token");

        string memory u = _logs[tokenId].uri;
        if (bytes(u).length > 0) {
            return u;
        }
        // fallback: empty string if none set
        return "";
    }
}
