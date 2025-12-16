<script>
  const {
    open = false,
    title = 'Bist du sicher?',
    message = '',
    confirmLabel = 'OK',
    cancelLabel = 'Abbrechen',
    onConfirm = () => {},
    onCancel = () => {}
  } = $props();

  let dialogEl = $state(null);

  function handleBackdropClick(event) {
    // Dialog ist fullscreen; Klick ausserhalb des Panels trifft den dialog selbst
    if (event.target === dialogEl) {
      onCancel();
    }
  }

  function handleCancel(event) {
    // Native ESC -> cancel event
    event.preventDefault();
    onCancel();
  }
</script>

{#if open}
  <dialog
    class="confirm-dialog"
    open
    bind:this={dialogEl}
    aria-label={title}
    aria-modal="true"
    onclick={handleBackdropClick}
    oncancel={handleCancel}
  >
    <div class="confirm-panel">
      <h2>{title}</h2>
      {#if message}
        <p>{message}</p>
      {/if}

      <div class="buttons">
        <button class="btn-secondary" type="button" onclick={onCancel}>
          {cancelLabel}
        </button>
        <button class="btn-primary" type="button" onclick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </dialog>
{/if}

<style>
  .confirm-dialog {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 40;
  }

  .confirm-dialog::backdrop {
    background: rgba(10, 10, 20, 0.55);
    animation: fadeIn 0.18s ease-out;
  }

  .confirm-panel {
    background: var(--surface, #141821);
    color: var(--text, #f5f5f5);
    border-radius: 1.25rem;
    padding: 1.5rem 1.75rem;
    min-width: min(90vw, 360px);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
    transform-origin: center;
    animation: popIn 0.18s ease-out;
  }

  .confirm-panel h2 {
    font-size: 1.1rem;
    margin: 0 0 0.5rem;
  }

  .confirm-panel p {
    margin: 0 0 1.2rem;
    opacity: 0.85;
    font-size: 0.95rem;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .btn-secondary,
  .btn-primary {
    border-radius: 999px;
    padding: 0.4rem 1.1rem;
    border: none;
    font-size: 0.9rem;
    cursor: pointer;
    transition: transform 0.08s ease-out, box-shadow 0.08s ease-out,
      background 0.12s ease-out;
  }

  .btn-secondary {
    background: #232836;
    color: #e1e4ff;
  }

  .btn-secondary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.35);
  }

  .btn-primary {
    background: #4b7cff;
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.45);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes popIn {
    from {
      opacity: 0;
      transform: scale(0.92) translateY(6px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
