<script lang="ts">
  import { createAccount } from "@byteatatime/wagmi-svelte";
  import { createSends, SendStatus } from "$lib/runes/sends.svelte";
  import DisplaySend from "./_components/DisplaySend.svelte";

  const account = $derived.by(createAccount());

  const sends = $derived.by(createSends(() => account.address));

  const scheduledSends = $derived(sends.filter(send => send.status === SendStatus.SCHEDULED));
  const previousSends = $derived(sends.filter(send => send.status !== SendStatus.SCHEDULED));

  $inspect(previousSends);
</script>

<div class="flex flex-grow flex-col items-center px-4 py-8">
  <div class="container max-w-screen-md rounded-3xl bg-base-100 p-8">
    <h1 class="text-4xl font-bold">Sends</h1>

    <a href="/schedule" class="btn btn-primary my-4 w-full">Schedule</a>

    <h2 class="text-xl">Scheduled</h2>

    {#each scheduledSends as send}
      <DisplaySend {send} />
    {/each}

    <h2 class="mt-6 text-xl">History</h2>

    {#each previousSends as send}
      <DisplaySend {send} />
    {/each}
  </div>
</div>
