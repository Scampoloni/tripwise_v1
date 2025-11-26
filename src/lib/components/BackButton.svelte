<script>
  import { goto } from "$app/navigation";

  export let label = "Zurück";
  export let defaultHref = "/";

  function handleClick() {
    // Wenn es eine History gibt, einen Schritt zurueck
    if (typeof history !== "undefined" && history.length > 1) {
      history.back();
    } else {
      // Fallback, falls Seite direkt aufgerufen wurde
      goto(defaultHref);
    }
  }
</script>

<button
  type="button"
  class="back-button"
  aria-label={label}
  onclick={handleClick}
>
  <span class="icon" aria-hidden="true">
    <svg viewBox="0 0 20 20" role="presentation">
      <path d="M12.5 4.5 6 10l6.5 5.5" />
      <path d="M6.4 10H15.5" />
    </svg>
  </span>
  <span class="label">{label}</span>
</button>

<style>
  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 1.1rem 0.5rem 0.95rem;
    border-radius: 999px;
    border: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
    background: color-mix(in oklab, var(--surface) 92%, var(--surface-soft) 8%);
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text);
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.15s ease;
  }

  .back-button:hover {
    background: color-mix(in oklab, var(--surface) 88%, var(--primary-soft-bg) 12%);
    border-color: color-mix(in oklab, var(--primary) 35%, var(--border));
    box-shadow: 0 14px 26px color-mix(in oklab, #0f172a 12%, transparent);
    transform: translateY(-1px);
  }

  .back-button:focus-visible {
    outline: 3px solid var(--focus, rgba(58, 123, 255, 0.4));
    outline-offset: 2px;
  }

  .back-button:active {
    transform: translateY(0);
    box-shadow: 0 8px 18px color-mix(in oklab, #0f172a 10%, transparent);
  }

  .icon {
    width: 1.1rem;
    height: 1.1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
  }

  .icon svg {
    width: 100%;
    height: 100%;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .label {
    white-space: nowrap;
  }

  :global([data-theme='dark']) .back-button {
    background: color-mix(in oklab, var(--surface) 70%, var(--surface-soft) 30%);
    border-color: color-mix(in oklab, var(--border) 65%, transparent);
    color: color-mix(in oklab, var(--text) 90%, var(--primary-contrast));
  }

  :global([data-theme='dark']) .back-button:hover {
    background: color-mix(in oklab, var(--surface) 60%, var(--primary-soft-bg) 40%);
    border-color: color-mix(in oklab, var(--primary) 45%, transparent);
    box-shadow: 0 20px 40px color-mix(in oklab, var(--primary) 25%, transparent);
  }

  @media (max-width: 520px) {
    .back-button {
      padding: 0.45rem 0.9rem;
      font-size: 0.9rem;
      gap: 0.35rem;
    }
  }
</style>
