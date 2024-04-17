<script lang="ts">
  import { SendStatus } from "$lib/runes/sends.svelte";
  import { CheckCircle, Clock, Icon, XCircle } from "svelte-hero-icons";

  const { status }: { status: SendStatus } = $props();

  enum StatusGroup {
    SCHEDULED,
    COMPLETED,
    ERROR,
  }

  const statusToGroup = {
    [SendStatus.SCHEDULED]: StatusGroup.SCHEDULED,
    [SendStatus.COMPLETED]: StatusGroup.COMPLETED,
    [SendStatus.NOT_ENOUGH_ALLOWANCE]: StatusGroup.ERROR,
    [SendStatus.NOT_ENOUGH_BALANCE]: StatusGroup.ERROR,
    [SendStatus.OTHER_FAIL]: StatusGroup.ERROR,
  };

  const statusToIcon = {
    [SendStatus.SCHEDULED]: Clock,
    [SendStatus.COMPLETED]: CheckCircle,
    [SendStatus.NOT_ENOUGH_BALANCE]: XCircle,
    [SendStatus.NOT_ENOUGH_ALLOWANCE]: XCircle,
    [SendStatus.OTHER_FAIL]: XCircle,
  };

  const statusToText = {
    [SendStatus.SCHEDULED]: "Scheduled",
    [SendStatus.COMPLETED]: "Completed",
    [SendStatus.NOT_ENOUGH_ALLOWANCE]: "Fail: Not enough allowance",
    [SendStatus.NOT_ENOUGH_BALANCE]: "Fail: Not enough balance",
    [SendStatus.OTHER_FAIL]: "Other fail",
  };

  const statusToClass = {
    [StatusGroup.SCHEDULED]: "text-yellow-600 bg-warning/10 border border-warning/25",
    [StatusGroup.COMPLETED]: "text-green-600 bg-success/10 border border-success/25",
    [StatusGroup.ERROR]: "text-red-600 bg-error/10 border border-error/25",
  };

  const statusGroup = statusToGroup[status];
  const statusIcon = statusToIcon[status];
  const statusText = statusToText[status];
  const statusClass = statusToClass[statusGroup];
</script>

<div class="badge h-auto px-3 py-1.5 font-medium {statusClass}">
  <Icon src={statusIcon} class="mr-1 h-5 w-5" />

  {statusText}
</div>
