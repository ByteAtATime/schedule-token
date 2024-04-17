<script lang="ts">
  import { Address } from "$lib/components/scaffold-eth";
  import { type Send, SendStatus, amountToNumber, calculateRelativeTimestamp } from "$lib/runes/sends.svelte";
  import { createToken } from "$lib/runes/token.svelte";
  import { ArrowTopRightOnSquare, Icon } from "svelte-hero-icons";

  const { send }: { send: Send } = $props();

  const isScheduled = $derived(send.status === SendStatus.SCHEDULED);

  const token = $derived.by(createToken(() => send.token));
</script>

<div class="mt-2 flex gap-x-2">
  {#if isScheduled}
    Sending
  {:else}
    Sent
  {/if}

  {#if token.decimals}
    {amountToNumber(send.amount, token.decimals, 4).toFixed(4)}
  {:else}
    ...
  {/if}
  {token.symbol} to <Address address={send.to} />

  {#if send.status === SendStatus.SCHEDULED}
    {calculateRelativeTimestamp(send.timestamp)}
  {:else}
    at {send.timestamp.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    })}
  {/if}

  <a class="link flex items-baseline gap-x-0.5 text-blue-500" href="/sends/{send.id}"
    >Link <Icon src={ArrowTopRightOnSquare} class="h-4 w-4" /></a
  >
</div>
