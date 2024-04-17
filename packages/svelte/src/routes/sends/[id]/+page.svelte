<script lang="ts">
  import { page } from "$app/stores";
  import SendStatus from "$lib/components/SendStatus.svelte";
  import { Address } from "$lib/components/scaffold-eth";
  import {
    createSend,
    amountToNumber,
    calculateRelativeTimestamp,
    SendStatus as SendStatusEnum,
  } from "$lib/runes/sends.svelte";
  import { createToken } from "$lib/runes/token.svelte";

  const sendId = $derived(BigInt($page.params.id));

  const { send, isError } = $derived.by(createSend(() => sendId));
  const token = $derived.by(createToken(() => send?.token));
</script>

<div class="flex flex-grow flex-col items-center px-4 py-8">
  <div class="container max-w-screen-md rounded-3xl bg-base-300 p-8">
    <h1 class="mb-4 text-3xl font-bold">Send Details</h1>

    {#if isError}
      <div class="text-xl font-bold text-red-600">Error: Send not found</div>
    {:else if !send}
      <div class="loading" />
    {:else}
      <div class="grid grid-cols-[150px_1fr] gap-y-4">
        <div class="text-gray-400">ID</div>
        <div>{send.id}</div>

        <div class="text-gray-400">Status</div>
        <div>
          <SendStatus status={send.status} />
        </div>

        <div class="text-gray-400">Amount</div>
        <div>
          {#if token.decimals}
            {amountToNumber(send.amount, token.decimals, 4).toFixed(4)}
          {/if}
        </div>

        <div class="text-gray-400">Timestamp</div>
        <div>
          {#if send.status === SendStatusEnum.SCHEDULED}
            Scheduled to send {calculateRelativeTimestamp(send.timestamp)}
          {:else}
            {send.timestamp.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          {/if}
        </div>

        <div class="divider col-span-2" />

        <div class="text-gray-400">From</div>
        <div><Address address={send.from} /></div>

        <div class="text-gray-400">To</div>
        <div><Address address={send.to} /></div>

        <div class="divider col-span-2" />

        <div class="text-gray-400">Token</div>
        <div>{token.name} ({token.symbol})</div>

        <div class="text-gray-400">Token Address</div>
        <div><Address address={token.address} /></div>
      </div>
    {/if}
  </div>
</div>
