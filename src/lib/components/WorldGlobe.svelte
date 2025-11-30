<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  export let trips = [];
  export let height = 320;

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
  let renderer = null;
  let scene = null;
  let camera = null;
  let globe = null;
  let controls = null;
  let animationFrameId = null;
  let resizeHandler = null;
  let ready = false;
  let destroyed = false;
  let animationActive = false;

  const normalizedHeight = () => Math.max(200, Number(height) || 320);

  function statusToColor(status) {
    return STATUS_COLORS[status] || '#e5e7eb';
  }

  function statusLabel(status) {
    return STATUS_LABELS[status] || 'Trip';
  }

  function buildPointData(list) {
    if (!Array.isArray(list)) return [];
    return list
      .filter((t) => Number.isFinite(t?.lat) && Number.isFinite(t?.lon))
      .map((t) => ({
        lat: t.lat,
        lng: t.lon,
        status: t.status,
        name: t.destinationName || t.title || 'Unbenannter Trip'
      }));
  }

  function updatePoints() {
    if (!ready || !globe || destroyed) return;

    if (typeof globe.pointsData !== 'function') {
      console.warn('WorldGlobe missing pointsData API, skipping update');
      return;
    }

    const points = buildPointData(trips);
    if (points.length === 0) {
      globe.pointsData([]);
      return;
    }

    globe.pointsData(points);

    if (typeof globe.pointAltitude === 'function') {
      globe.pointAltitude(0.02);
    }
    if (typeof globe.pointRadius === 'function') {
      globe.pointRadius(0.6);
    }
    if (typeof globe.pointColor === 'function') {
      globe.pointColor((d) => statusToColor(d.status));
    }
    if (typeof globe.pointLabel === 'function') {
      globe.pointLabel((d) => `${d.name}\n${statusLabel(d.status)}`);
    }
  }

  function cleanup() {
    try {
      destroyed = true;
      animationActive = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (typeof window !== 'undefined' && resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
      }
      controls?.dispose?.();
      controls = null;
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement?.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer = null;
      }
      scene = null;
      camera = null;
      globe = null;
      ready = false;
    } catch (err) {
      console.error('WorldGlobe cleanup failed', err);
    }
  }

  onMount(() => {
    if (!browser) return;
    destroyed = false;

    let active = true;

    (async () => {
      try {
        const [threeMod, globeMod, controlsMod] = await Promise.all([
          import('three'),
          import('three-globe'),
          import('three/examples/jsm/controls/OrbitControls.js')
        ]);

        if (!active || destroyed || !container) return;

        const THREE = threeMod;
        const { default: ThreeGlobe } = globeMod;
        const { OrbitControls } = controlsMod;

        const width = container.clientWidth || 600;
        const targetHeight = normalizedHeight();

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio((typeof window !== 'undefined' && window.devicePixelRatio) || 1);
        renderer.setSize(width, targetHeight);
        renderer.setClearColor(0x020617, 1);
        container.appendChild(renderer.domElement);

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(45, width / targetHeight, 0.1, 1000);
        camera.position.z = 260;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
        dirLight.position.set(30, 30, 30);
        scene.add(ambientLight);
        scene.add(dirLight);

        globe = new ThreeGlobe()
          .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
          .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
          .showAtmosphere(true)
          .atmosphereColor('#38bdf8')
          .atmosphereAltitude(0.15)
          .showGraticules(true);
        scene.add(globe);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.minDistance = 150;
        controls.maxDistance = 450;

        const animate = () => {
          if (!animationActive || destroyed) return;
          animationFrameId = requestAnimationFrame(animate);
          if (globe) {
            globe.rotation.y += 0.0005;
          }
          controls?.update?.();
          renderer?.render?.(scene, camera);
        };
        animationActive = true;
        animate();

        resizeHandler = () => {
          if (!renderer || !camera || !container || destroyed) return;
          const w = container.clientWidth || width;
          const h = normalizedHeight();
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };

        if (typeof window !== 'undefined') {
          window.addEventListener('resize', resizeHandler);
        }

        ready = true;
        updatePoints();
      } catch (err) {
        console.error('WorldGlobe init failed', err);
      }
    })();

    return () => {
      active = false;
      destroyed = true;
      cleanup();
    };
  });

  $: if (ready) {
    updatePoints();
  }
</script>

<div class="world-globe" style={`height:${normalizedHeight()}px`}>
  <div class="world-globe__canvas" bind:this={container}></div>
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
