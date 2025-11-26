<!-- src/lib/components/StatCard.svelte -->
<script>
  const { label, value, icon } = $props();
</script>
<div class="stat card">
  <div class="icon">{icon}</div>
  <div class="meta">
    <span class="label">{label}</span>
    <span class="value">{value}</span>
  </div>
</div>
<style>
.stat{ display:flex; gap:.75rem; align-items:center; padding:1rem }
.icon{ width:40px; height:40px; display:grid; place-items:center; border-radius:12px;
       background: var(--primary-soft-bg); color: var(--primary); font-size:1.1rem; }
.label{ color:var(--text-secondary); font-size:.85rem; text-transform:uppercase; letter-spacing:.06em }
.value{ font-size:1.6rem; font-weight:700 }
.stat:hover{ transform:translateY(-2px); transition:transform .2s }
</style>
