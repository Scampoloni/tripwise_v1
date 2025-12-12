<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let { trips = [], height = 320 } = $props();

  const STATUS_COLORS = {
    planned: '#3b82f6',
    active: '#22c55e',
    completed: '#f97316'
  };

  const STATUS_LABELS = {
    planned: 'Geplant',
    active: 'Aktiv',
    completed: 'Abgeschlossen'
  };

  let container;
  let globe = null;
  let destroyed = false;

  const normalizedHeight = () => Math.max(200, Number(height) || 320);

  function statusToColor(status) {
    return STATUS_COLORS[status] || '#e5e7eb';
  }

  function statusLabel(status) {
    return STATUS_LABELS[status] || 'Trip';
  }

  function buildPointData(list) {
    if (!Array.isArray(list)) return [];

    const grouped = new Map();

    for (const t of list) {
      if (!Number.isFinite(t?.lat) || !Number.isFinite(t?.lon)) continue;
      const key = `${t.lat.toFixed(3)}|${t.lon.toFixed(3)}`;
      const entry = grouped.get(key) || {
        lat: t.lat,
        lng: t.lon,
        trips: [],
        hasActive: false,
        count: 0
      };

      entry.trips.push(t);
      entry.count += 1;
      entry.hasActive = entry.hasActive || t.status === 'active';

      grouped.set(key, entry);
    }

    return Array.from(grouped.values()).map((entry) => {
      const count = entry.trips.length;
      const topTrip = entry.trips[0];
      const aggregateStatus = entry.hasActive ? 'active' : 'planned'; // planned & completed both blau
      return {
        lat: entry.lat,
        lng: entry.lng,
        status: aggregateStatus,
        name:
          count > 1
            ? `${topTrip?.destinationName || topTrip?.title || 'Reise'} (${count}×)`
            : topTrip?.destinationName || topTrip?.title || 'Unbenannter Trip',
        trips: entry.trips,
        count
      };
    });
  }

  function updatePoints() {
    if (!globe || destroyed) return;
    const points = buildPointData(trips);
    globe.pointsData(points);
  }

  onMount(() => {
    if (!browser) return;
    destroyed = false;

    let active = true;
    let resizeObserver = null;

    (async () => {
      try {
        const Globe = (await import('globe.gl')).default;

        if (!active || destroyed || !container) return;

        const width = container.clientWidth || 600;
        const targetHeight = normalizedHeight();

        globe = Globe()
          .width(width)
          .height(targetHeight)
          .backgroundColor('rgba(2, 6, 23, 0)')
          .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
          .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
          .showAtmosphere(true)
          .atmosphereColor('#38bdf8')
          .atmosphereAltitude(0.15)
          .showGraticules(true)
          .pointAltitude(0.02)
          .pointRadius((d) => 0.4 + Math.min(0.35, (d.count - 1) * 0.08))
          .pointColor((d) => statusToColor(d.status))
          .pointLabel((d) => {
            const trips = (d.trips || []).slice(0, 5);
            const more = Math.max(0, (d.trips?.length || 0) - trips.length);
            const list = trips
              .map((t) => {
                const name = t?.name || t?.title || t?.destinationName || 'Trip';
                const from = t?.startDate ? new Date(t.startDate).toLocaleDateString('de-CH') : '';
                const to = t?.endDate ? new Date(t.endDate).toLocaleDateString('de-CH') : '';
                const range = from && to ? `${from} – ${to}` : from || to || '';
                const label = statusLabel(t.status);
                const color = statusToColor(t.status);
                return `<div style="display:flex;gap:6px;align-items:center;">`+
                  `<span style="color:${color};font-weight:700;">●</span>`+
                  `<span style="color:#e2e8f0;">${name}</span>`+
                  (range ? `<span style="color:#94a3b8;">(${range})</span>` : '')+
                  `<span style="color:${color};font-size:12px;">${label}</span>`+
                `</div>`;
              })
              .join('');

            const moreText = more > 0 ? `<div style="color:#94a3b8;">+${more} weitere</div>` : '';

            return `
              <div style="
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid rgba(51, 65, 85, 0.8);
                border-radius: 6px;
                padding: 8px 12px;
                font-family: system-ui, sans-serif;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                max-width: 240px;
              ">
                <div style="font-weight: 700; color: #e2e8f0; font-size: 14px; margin-bottom:4px;">${d.name}</div>
                <div style="color: ${statusToColor(d.status)}; font-size: 12px; margin-bottom:6px;">
                  ${statusLabel(d.status)} • ${d.count} Besuch${d.count === 1 ? '' : 'e'}
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">${list}${moreText}</div>
              </div>
            `;
          })
          (container);

        // Auto-rotate
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.3;
        globe.controls().enableZoom = true;
        globe.controls().minDistance = 150;
        globe.controls().maxDistance = 450;

        // Handle resize
        resizeObserver = new ResizeObserver(() => {
          if (globe && container && !destroyed) {
            globe.width(container.clientWidth);
            globe.height(normalizedHeight());
          }
        });
        resizeObserver.observe(container);

        updatePoints();
      } catch (err) {
        console.error('WorldGlobe init failed', err);
      }
    })();

    return () => {
      active = false;
      destroyed = true;
      resizeObserver?.disconnect();
      if (globe) {
        globe._destructor?.();
        globe = null;
      }
    };
  });

  // Reaktiv auf trips-Änderungen reagieren
  $effect(() => {
    // Access trips.length to create a dependency on trips changes
    const tripCount = trips?.length ?? 0;
    if (globe && !destroyed) {
      updatePoints();
    }
  });
</script>

<div class="world-globe" style={`height:${normalizedHeight()}px`}>
  <div 
    class="world-globe__canvas" 
    bind:this={container}
  ></div>
  {#if !trips || trips.length === 0}
    <p class="world-globe__empty">Noch keine Trips mit Koordinaten</p>
  {/if}
</div>

<style>
  .world-globe {
    position: relative;
    width: 100%;
    border-radius: 1rem;
    background: radial-gradient(circle at 20% 0%, #0f172a, #020617 55%, #000000 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .world-globe__canvas {
    width: 100%;
    height: 100%;
    max-width: 100%;
  }

  .world-globe__canvas :global(canvas) {
    border-radius: 1rem;
  }

  .world-globe__empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    color: rgba(148, 163, 184, 0.9);
    pointer-events: none;
    text-align: center;
    padding: 0.75rem;
  }
</style>
