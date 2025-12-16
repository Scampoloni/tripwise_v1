<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let { trips = [], height = 320 } = $props();

  const STATUS_LABELS = {
    planned: 'Geplant',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    mixed: 'Gemischt'
  };

  let container;
  let globe = null;
  let destroyed = false;

  let paletteCache = null;
  let paletteObserver = null;

  const normalizedHeight = () => Math.max(200, Number(height) || 320);

  function clampByte(n) {
    return Math.max(0, Math.min(255, Math.round(n)));
  }

  function parseRgbString(value) {
    const v = String(value || '').trim();
    const m = v.match(/^rgba?\(([^)]+)\)$/i);
    if (!m) return null;
    const parts = m[1].split(',').map((p) => p.trim());
    if (parts.length < 3) return null;
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    if (![r, g, b].every((x) => Number.isFinite(x))) return null;
    return { r: clampByte(r), g: clampByte(g), b: clampByte(b) };
  }

  function parseHexColor(value) {
    const v = String(value || '').trim();
    const m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    const hex = m[1];
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }

  function parseColor(value) {
    return parseHexColor(value) || parseRgbString(value);
  }

  function mixColors(colorA, colorB, weightA = 0.5) {
    const a = parseColor(colorA);
    const b = parseColor(colorB);
    if (!a || !b) return colorA || colorB || '#e5e7eb';
    const w = Math.max(0, Math.min(1, Number(weightA) || 0.5));
    const r = clampByte(a.r * w + b.r * (1 - w));
    const g = clampByte(a.g * w + b.g * (1 - w));
    const bch = clampByte(a.b * w + b.b * (1 - w));
    return `rgb(${r}, ${g}, ${bch})`;
  }

  function readCssVar(name, fallback) {
    if (!browser) return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function getPalette() {
    if (paletteCache) return paletteCache;

    const success = readCssVar('--success', '#22c55e');
    const warning = readCssVar('--warning', '#f97316');
    const primaryHover = readCssVar('--primary-hover', '#3b82f6');
    const text = readCssVar('--text', '#0f172a');

    const planned = mixColors(primaryHover, text, 0.75);
    const mixed = mixColors(primaryHover, warning, 0.55);

    paletteCache = {
      planned,
      active: success,
      completed: warning,
      mixed,
      fallback: '#e5e7eb'
    };

    return paletteCache;
  }

  function statusToColor(status) {
    const palette = getPalette();
    return palette?.[status] || palette.fallback;
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
        hasPlanned: false,
        hasCompleted: false,
        count: 0
      };

      entry.trips.push(t);
      entry.count += 1;
      entry.hasActive = entry.hasActive || t.status === 'active';
      entry.hasPlanned = entry.hasPlanned || t.status === 'planned';
      entry.hasCompleted = entry.hasCompleted || t.status === 'completed';

      grouped.set(key, entry);
    }

    return Array.from(grouped.values()).map((entry) => {
      const count = entry.trips.length;
      const topTrip = entry.trips[0];
      const aggregateStatus = entry.hasActive
        ? 'active'
        : entry.hasPlanned && entry.hasCompleted
          ? 'mixed'
          : entry.hasPlanned
            ? 'planned'
            : 'completed';
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
          .backgroundColor('rgba(0, 0, 0, 0)')
          .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
          .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
          .showAtmosphere(true)
          .atmosphereColor(readCssVar('--primary', '#3a7bff'))
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
                  `<span style="color:var(--text);">${name}</span>`+
                  (range ? `<span style="color:var(--text-secondary);">(${range})</span>` : '')+
                  `<span style="color:${color};font-size:12px;">${label}</span>`+
                `</div>`;
              })
              .join('');

            const moreText = more > 0
              ? `<div style="color:var(--text-secondary);">+${more} weitere</div>`
              : '';

            return `
              <div style="
                background: var(--surface-elev, var(--surface));
                border: 1px solid var(--border);
                border-radius: var(--radius-sm);
                padding: 8px 12px;
                font-family: inherit;
                box-shadow: var(--shadow-soft);
                max-width: 240px;
              ">
                <div style="font-weight: 700; color: var(--text); font-size: 14px; margin-bottom:4px;">${d.name}</div>
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

        // Recompute colors on theme changes (light/dark/auto)
        paletteObserver = new MutationObserver(() => {
          paletteCache = null;
          updatePoints();
        });
        paletteObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme']
        });

        updatePoints();
      } catch (err) {
        console.error('WorldGlobe init failed', err);
      }
    })();

    return () => {
      active = false;
      destroyed = true;
      resizeObserver?.disconnect();
      paletteObserver?.disconnect?.();
      paletteObserver = null;
      paletteCache = null;
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
    border-radius: var(--radius-lg);
    background: radial-gradient(
      circle at 20% 0%,
      color-mix(in oklab, var(--surface) 82%, var(--primary) 18%),
      var(--surface-soft) 55%,
      var(--bg) 100%
    );
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
    border-radius: var(--radius-lg);
  }

  .world-globe__empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    color: color-mix(in oklab, var(--text-secondary) 90%, transparent);
    pointer-events: none;
    text-align: center;
    padding: 0.75rem;
  }
</style>
