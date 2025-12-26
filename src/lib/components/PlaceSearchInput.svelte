<script context="module">
  let placeSearchInputIdCounter = 0;
</script>

<script>
  // Props
  export let label = 'Reiseziel';
  export let placeholder = 'Stadt oder Ort eingeben';
  export let initialValueName = '';
  export let onSelect = () => {};

  // Stable unique id across SSR+client hydration (depends on render order)
  const inputId = `place-search-input-${++placeSearchInputIdCounter}`;

  let query = initialValueName || '';
  let results = [];
  let loading = false;
  let error = '';
  let showDropdown = false;
  let hasSearched = false;

  let debounceTimer;
  let lastInitialValue = initialValueName;

  $: if (initialValueName !== lastInitialValue) {
    query = initialValueName;
    lastInitialValue = initialValueName;
  }

  function handleInput(event) {
    query = event.target.value;
    error = '';
    hasSearched = false;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (!query || query.trim().length < 2) {
      results = [];
      showDropdown = false;
      return;
    }

    debounceTimer = setTimeout(() => {
      searchPlaces(query.trim());
    }, 400);
  }

  async function searchPlaces(q) {
    loading = true;
    showDropdown = true;
    hasSearched = true;
    results = [];
    error = '';

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
        q
      )}`;

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();

      results = data.map((item) => {
        const addr = item.address || {};
        const country =
          addr.country ||
          addr.country_code?.toUpperCase() ||
          extractCountryFromDisplayName(item.display_name);

        return {
          raw: item,
          name: formatPlaceName(item),
          lat: Number(item.lat),
          lon: Number(item.lon),
          country
        };
      });
    } catch (err) {
      console.error('PlaceSearchInput search error', err);
      error = 'Fehler bei der Ortssuche';
      results = [];
    } finally {
      loading = false;
    }
  }

  function extractCountryFromDisplayName(displayName) {
    if (!displayName || typeof displayName !== 'string') return '';
    const parts = displayName.split(',');
    const last = parts[parts.length - 1];
    return last ? last.trim() : '';
  }

  function formatPlaceName(item) {
    // Versuch, Stadt + Land schoen anzuzeigen
    const addr = item.address || {};
    const cityLike =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.hamlet ||
      addr.suburb ||
      null;

    const country =
      addr.country ||
      addr.country_code?.toUpperCase() ||
      extractCountryFromDisplayName(item.display_name);

    if (cityLike && country) return `${cityLike}, ${country}`;
    if (item.display_name) return item.display_name;
    return cityLike || country || '';
  }

  function handleSelect(place) {
    query = place.name;
    showDropdown = false;
    results = [];
    error = '';
    hasSearched = true;

    onSelect({
      name: place.name,
      lat: place.lat,
      lon: place.lon,
      country: place.country
    });
  }

  function handleBlur() {
    // kleines Delay, damit Klick auf einen Vorschlag noch durch geht
    setTimeout(() => {
      showDropdown = false;
    }, 150);
  }
</script>

<div class="place-input">
  {#if label}
    <label class="place-input__label" for={inputId}>{label}</label>
  {/if}

  <div class="place-input__field-wrapper">
    <input
      class="place-input__field"
      id={inputId}
      type="text"
      bind:value={query}
      placeholder={placeholder}
      on:input={handleInput}
      on:focus={() => (showDropdown = results.length > 0)}
      on:blur={handleBlur}
      autocomplete="off"
    />

    {#if loading}
      <div class="place-input__status">Suche...</div>
    {/if}
  </div>

  {#if showDropdown}
    <div class="place-input__dropdown">
      {#if error}
        <div class="place-input__empty">{error}</div>
      {:else if results.length === 0 && hasSearched}
        <div class="place-input__empty">Keine Treffer</div>
      {:else}
        {#each results as place}
          <button
            type="button"
            class="place-input__item"
            on:mousedown|preventDefault={() => handleSelect(place)}
          >
            <div class="place-input__item-name">{place.name}</div>
            {#if place.country}
              <div class="place-input__item-sub">{place.country}</div>
            {/if}
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .place-input {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .place-input__label {
    font-weight: 600;
    font-size: 0.95rem;
    color: color-mix(in oklab, var(--text) 78%, var(--text-secondary) 22%);
    margin-bottom: 0.25rem;
  }

  .place-input__field-wrapper {
    position: relative;
  }

  .place-input__field {
    width: 100%;
    border-radius: 1rem;
    border: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
    background: color-mix(in oklab, var(--surface) 94%, var(--secondary) 6%);
    color: var(--text);
    padding: 0.75rem 0.9rem;
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    outline: none;
  }

  .place-input__field:hover {
    border-color: color-mix(in oklab, var(--primary) 26%, var(--border));
  }

  .place-input__field:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 28%, transparent);
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
  }

  .place-input__status {
    position: absolute;
    right: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem;
    color: var(--text-secondary);
    pointer-events: none;
  }

  .place-input__dropdown {
    position: absolute;
    z-index: 20;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.4rem;
    background: var(--surface);
    border-radius: 1rem;
    border: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
    box-shadow: var(--shadow-elevated);
    overflow: hidden;
    max-height: 260px;
    display: flex;
    flex-direction: column;
  }

  .place-input__item {
    text-align: left;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    border-bottom: 1px solid color-mix(in oklab, var(--border) 60%, transparent);
    transition: background 0.15s;
  }

  .place-input__item:last-child {
    border-bottom: none;
  }

  .place-input__item:hover {
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
  }

  .place-input__item-name {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text);
  }

  .place-input__item-sub {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .place-input__empty {
    padding: 1rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-align: center;
  }

  :global([data-theme='dark']) .place-input__field {
    background: color-mix(in oklab, var(--surface) 65%, var(--surface-soft) 35%);
    border-color: color-mix(in oklab, var(--border) 65%, transparent);
  }

  :global([data-theme='dark']) .place-input__dropdown {
    background: color-mix(in oklab, var(--surface) 88%, var(--surface-soft) 12%);
    border-color: color-mix(in oklab, var(--border) 70%, transparent);
  }

  :global([data-theme='dark']) .place-input__item:hover {
    background: color-mix(in oklab, var(--surface) 75%, var(--primary-soft-bg) 25%);
  }
</style>
