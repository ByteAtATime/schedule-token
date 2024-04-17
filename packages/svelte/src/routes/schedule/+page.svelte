<script lang="ts">
  import { goto } from "$app/navigation";
  import { AddressInput, IntegerInput } from "$lib/components/scaffold-eth/inputs";
  import { createDeployedContractInfo } from "$lib/runes/deployedContractInfo.svelte";
  import { createScaffoldWriteContract } from "$lib/runes/scaffoldWriteContract.svelte";
  import { createAccount, createReadContract, createWriteContract } from "@byteatatime/wagmi-svelte";
  import { type Address, erc20Abi } from "viem";

  let recipient = $state<Address | undefined>(undefined);
  let token = $state<Address | undefined>(undefined);
  let amount = $state("0");

  let sendTimestampString = $state("");
  let sendTimestamp = $derived(new Date(sendTimestampString));
  let timestampError = $derived(sendTimestamp < new Date() ? "Timestamp must be in the future" : null);

  const account = $derived.by(createAccount());
  const { data: tokenSender } = $derived.by(createDeployedContractInfo("TokenSender"));

  const { data: allowance, refetch: refetchAllowance } = $derived.by(
    createReadContract(() => ({
      address: token,
      args: [account.address, tokenSender?.address] as any, // we ignore the type because both parameters are garanteed to be defined if `enabled` is true
      enabled: token && recipient && tokenSender && account.address,
      functionName: "allowance",
      abi: erc20Abi,
    })),
  );

  const needsToApprove = $derived.by(() => {
    if (!allowance) return true; // default to approve button
    return BigInt(amount) > BigInt(allowance);
  });

  const { isLoading: approveLoading, writeContractAsync: writeApprove } = $derived.by(createWriteContract());

  const approve = async () => {
    if (!token || !recipient || !tokenSender) return;

    await writeApprove({
      address: token,
      functionName: "approve",
      args: [tokenSender?.address, BigInt(amount)],
      abi: erc20Abi,
    });

    refetchAllowance();
  };

  const { isMining: scheduleLoading, writeContractAsync: writeSchedule } = $derived.by(
    createScaffoldWriteContract("TokenSender"),
  );

  const schedule = async () => {
    if (!recipient || !token || !sendTimestamp || !tokenSender) return;

    await writeSchedule({
      functionName: "scheduleSend",
      args: [recipient, token, BigInt(amount), BigInt(sendTimestamp.getTime() / 1000)],
    });

    goto("/");
  };
</script>

<div class="flex items-center justify-center px-4 py-8">
  <div class="container flex max-w-screen-md flex-col rounded-3xl bg-base-100 p-8">
    <h1 class="text-4xl font-bold">Schedule token send</h1>

    <label class="form-control w-full">
      <input class="absolute left-0 top-0 h-0 w-0" aria-hidden />

      <div class="label"><span class="label-text">Recipient</span></div>

      <AddressInput value="" bind:address={recipient} />
    </label>

    <label class="form-control w-full">
      <input class="absolute left-0 top-0 h-0 w-0" aria-hidden />

      <div class="label"><span class="label-text">Token</span></div>

      <AddressInput value="" bind:address={token} />
    </label>

    <label class="form-control w-full">
      <input class="absolute left-0 top-0 h-0 w-0" aria-hidden />

      <div class="label"><span class="label-text">Amount (wei)</span></div>

      <IntegerInput bind:value={amount} />
    </label>

    <label class="form-control w-full">
      <input class="absolute left-0 top-0 h-0 w-0" aria-hidden />

      <div class="label"><span class="label-text">Allowance</span></div>

      <div
        class="flex rounded-full border-2 border-base-300 bg-base-200 text-accent"
        class:border-error={timestampError}
      >
        <input
          bind:value={sendTimestampString}
          type="datetime-local"
          class="input input-ghost h-[2.2rem] min-h-[2.2rem] w-full border px-4 font-medium text-gray-400 placeholder:text-accent/50 focus-within:border-transparent focus:bg-transparent focus:text-gray-400 focus:outline-none"
        />
      </div>

      {#if timestampError}
        <p class="mt-1 text-xs text-error">{timestampError}</p>
      {/if}
    </label>

    {#if needsToApprove}
      <button class="btn btn-primary mt-4" onclick={approve} disabled={approveLoading}>Approve</button>
    {:else}
      <button class="btn btn-primary mt-4" onclick={schedule} disabled={scheduleLoading}>Schedule</button>
    {/if}
  </div>
</div>
