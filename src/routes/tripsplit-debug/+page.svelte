<script lang="ts">
  import { tripSplitGroups, createGroup } from '$lib/stores/tripSplit.js';
  import type { TripSplitGroup } from '$lib/types/tripSplit';

  let newGroupName = '';
  let groupsSnapshot: TripSplitGroup[] = [];

  $: groupsSnapshot = ($tripSplitGroups ?? []) as TripSplitGroup[];
  $: console.log('TripSplit Debug, groups', groupsSnapshot);

  function handleCreateGroup() {
    const name = newGroupName.trim();
    if (!name) return;
    createGroup(name);
    newGroupName = '';
  }
</script>

<section>
  <h1>TripSplit Debug</h1>

  <div>
    <input
      placeholder="Gruppenname"
      bind:value={newGroupName}
    />
    <button on:click={handleCreateGroup}>Gruppe erstellen</button>
  </div>

  <pre>{JSON.stringify(groupsSnapshot, null, 2)}</pre>
</section>
