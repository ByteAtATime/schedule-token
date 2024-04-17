const Web3 = require("web3");

const FROM_ADDRESS = "0x598cb95773D9b66a27a5780DB5EED2d018685879";
const CONTRACT_ADDRESS = "0x773404ded49e80e23e814dd0db32066d445f5337";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const web3 = new Web3.Web3("https://rpc.sepolia.org");
const contract = new web3.eth.Contract(
  [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "newInterval",
          type: "uint256",
        },
      ],
      name: "ExecutionIntervalChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "receiver",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "token",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "releaseTime",
          type: "uint256",
        },
      ],
      name: "Scheduled",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "receiver",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "token",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "enum TokenSender.Status",
          name: "status",
          type: "uint8",
        },
      ],
      name: "Sent",
      type: "event",
    },
    {
      inputs: [{ internalType: "address", name: "_address", type: "address" }],
      name: "addressSendLength",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "allSends",
      outputs: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "address", name: "receiver", type: "address" },
        { internalType: "address", name: "token", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "uint256", name: "releaseTime", type: "uint256" },
        {
          internalType: "enum TokenSender.Status",
          name: "status",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "executeScheduledSends",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "executionInterval",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "nextScheduledSendId",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_receiver", type: "address" },
        { internalType: "address", name: "_token", type: "address" },
        { internalType: "uint256", name: "_amount", type: "uint256" },
        { internalType: "uint256", name: "_releaseTime", type: "uint256" },
      ],
      name: "scheduleSend",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "scheduledSends",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "", type: "address" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      name: "sendsByAddress",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_interval", type: "uint256" }],
      name: "setExecutionInterval",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  CONTRACT_ADDRESS,
);

const gasPrice = web3.eth.getGasPrice();

gasPrice.then((getPrice) => {
  const transaction = {
    from: FROM_ADDRESS,
    to: CONTRACT_ADDRESS,
    data: contract.methods.executeScheduledSends().encodeABI(),
    gas: "3000000",
    gasPrice: getPrice,
  };

  const sign = web3.eth.accounts.signTransaction(transaction, PRIVATE_KEY);

  sign.then((signed) => {
    const sentTx = web3.eth.sendSignedTransaction(
      signed.raw || signed.rawTransaction,
    );
  });
});
