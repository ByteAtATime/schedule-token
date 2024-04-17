import { createReadContract } from "@byteatatime/wagmi-svelte";
import { erc20Abi, type Address } from "viem";

export const createToken = (_address: () => Address | undefined) => {
  const address = $derived(_address instanceof Function ? _address() : _address);

  const tokenName = $derived.by(
    createReadContract(() => ({
      address: address,
      functionName: "name",
      abi: erc20Abi,
    })),
  );

  const tokenSymbol = $derived.by(
    createReadContract(() => ({
      address: address,
      functionName: "symbol",
      abi: erc20Abi,
    })),
  );

  const decimals = $derived.by(
    createReadContract(() => ({
      address: address,
      functionName: "decimals",
      abi: erc20Abi,
    })),
  );

  return () => ({
    address,
    name: tokenName.data,
    symbol: tokenSymbol.data,
    decimals: decimals.data,
  });
};
