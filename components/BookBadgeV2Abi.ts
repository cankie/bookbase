// ABI for BookBadgeV2 — ONLY the contract interface, no JSX here.
const abi = [
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "author", "type": "string" },
      { "internalType": "string", "name": "isbn", "type": "string" },
      { "internalType": "string", "name": "place", "type": "string" },
      { "internalType": "string", "name": "mood", "type": "string" },
      { "internalType": "string", "name": "timeLabel", "type": "string" },
      { "internalType": "string", "name": "fragment", "type": "string" },
      { "internalType": "string", "name": "photoUri", "type": "string" },
      { "internalType": "string", "name": "coverUri", "type": "string" },
      { "internalType": "uint64", "name": "finishedAt", "type": "uint64" }
    ],
    "name": "logBook",
    "outputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default abi;
