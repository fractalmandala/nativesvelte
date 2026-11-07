<script>
  let count = $state(0);
  let history = $state([]);

  function change(delta) {
    const next = count + delta;
    count = next;
    history = [next, ...history].slice(0, 5);
  }
</script>

<div class="flex-1 bg-zinc-100 p-6 pt-16 gap-6">
  <h1 class="text-2xl font-bold text-zinc-900">NSH Svelte Counter</h1>

  <div class="bg-white rounded-2xl p-6 items-center gap-2 shadow">
    <p class="text-sm text-zinc-500">Current value</p>
    <p class="text-6xl font-bold {count < 0 ? 'text-red-600' : 'text-zinc-900'}">
      {count}
    </p>
  </div>

  <div class="flex-row gap-3 justify-center">
    <button
      class="bg-red-600 rounded-xl px-6 py-3 items-center active:opacity-75"
      onclick={() => change(-1)}
    >
      <span class="text-white font-bold text-lg">−1</span>
    </button>
    <button
      class="bg-emerald-600 rounded-xl px-6 py-3 items-center active:opacity-75"
      onclick={() => change(1)}
    >
      <span class="text-white font-bold text-lg">+1</span>
    </button>
  </div>

  <div class="gap-2">
    <p class="text-sm text-zinc-500">
      Recent taps: <span class="font-bold text-zinc-800">{history.length}</span>
    </p>
    {#each history as val}
      <p class="text-base text-zinc-700">• {val}</p>
    {/each}
  </div>
</div>
