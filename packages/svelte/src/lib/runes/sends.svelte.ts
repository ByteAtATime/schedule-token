import { createReadContracts } from "@byteatatime/wagmi-svelte";
import { createScaffoldReadContract } from "./scaffoldReadContract.svelte";
import { isAddress, type Address } from "viem";
import { createDeployedContractInfo } from "./deployedContractInfo.svelte";

// should be kept in sync with `Status` enum in TokenSender.sol
export enum SendStatus {
  SCHEDULED = 0,
  COMPLETED,
  NOT_ENOUGH_ALLOWANCE,
  NOT_ENOUGH_BALANCE,
  OTHER_FAIL,
}

export type Send = {
  id: bigint;
  from: Address;
  to: Address;
  token: Address;
  amount: bigint;
  timestamp: Date;
  status: SendStatus;
};

const arrayToSend = (data: readonly [bigint, string, string, string, bigint, number, number]): Send => {
  if (!isAddress(data[1]) || !isAddress(data[2]) || !isAddress(data[3])) throw new Error("Invalid address");

  return {
    id: data[0],
    from: data[1],
    to: data[2],
    token: data[3],
    amount: data[4],
    timestamp: new Date(Number(data[5]) * 1000),
    status: data[6],
  };
};

export const createSends = (_address: () => Address | undefined) => {
  const address = $derived(_address instanceof Function ? _address() : _address);

  const amount = $derived.by(
    createScaffoldReadContract(() => ({
      contractName: "TokenSender",
      functionName: "addressSendLength",
      args: [address],
    })),
  );

  const { data: tokenSenderContract } = $derived.by(createDeployedContractInfo("TokenSender"));

  const sendsIndexesRead = $derived.by(
    createReadContracts(() => ({
      contracts: Array.from({ length: Number(amount.data) }, (_, i) => ({
        address: tokenSenderContract?.address,
        abi: tokenSenderContract?.abi,
        functionName: "sendsByAddress",
        args: [address, i],
      })),
    })),
  );

  const sendsRead = $derived.by(
    createReadContracts(() => ({
      contracts: sendsIndexesRead.data
        ?.map(send => send.result)
        .map(sendIndex => ({
          address: tokenSenderContract?.address,
          abi: tokenSenderContract?.abi,
          functionName: "allSends",
          args: [sendIndex],
        })),
    })),
  );

  const sends = $derived(
    sendsRead.data
      ?.map(send => send.result as [bigint, string, string, string, bigint, bigint, number])
      .map(arrayToSend),
  );

  return () => sends ?? [];
};

export const createSend = (_id: () => bigint | undefined) => {
  const sendId = $derived(_id instanceof Function ? _id() : _id);

  const { data: rawSend, failureCount } = $derived.by(
    createScaffoldReadContract(() => ({
      contractName: "TokenSender",
      functionName: "allSends",
      args: [sendId],
    })),
  );

  return () => ({ send: rawSend && arrayToSend(rawSend), isError: failureCount > 0 });
};

export const amountToNumber = (amount: bigint, decimals: number, precision: number) => {
  if (!amount || !decimals) {
    return 0;
  }

  const bigIntDivision = Math.floor((decimals - precision) / 2); // divide by bigint first to avoid precision errors with Number()
  const numberDivision = decimals - bigIntDivision;

  return Number(amount / 10n ** BigInt(bigIntDivision)) / 10 ** numberDivision;
};

export function calculateRelativeTimestamp(futureDate: Date): string {
  const currentDate = new Date();
  const timeDifference = futureDate.getTime() - currentDate.getTime();

  if (timeDifference < 0) {
    return " !! overdue !! ";
  }

  // Convert milliseconds to seconds
  const secondsDifference = Math.floor(timeDifference / 1000);

  const timeUnits = [
    { unit: "year", divisor: 31536000 },
    { unit: "month", divisor: 2592000 },
    { unit: "day", divisor: 86400 },
    { unit: "hour", divisor: 3600 },
    { unit: "minute", divisor: 60 },
    { unit: "second", divisor: 1 },
  ];

  for (const { unit, divisor } of timeUnits) {
    if (secondsDifference >= divisor) {
      const value = Math.floor(secondsDifference / divisor);
      return `in ${value} ${unit}${value === 1 ? "" : "s"}`;
    }
  }

  return "in less than a second";
}
