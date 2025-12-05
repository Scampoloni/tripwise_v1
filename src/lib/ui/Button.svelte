<script lang="ts">
  export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
  export type ButtonSize = 'sm' | 'md';

  export let variant: ButtonVariant = 'primary';
  export let size: ButtonSize = 'md';
  export let disabled = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

<button
  class={`tw-button tw-button--${variant} tw-button--${size}`}
  {type}
  {disabled}
  {...$$restProps}
>
  <slot />
</button>

<style>
  .tw-button {
    border: none;
    cursor: pointer;
    font: inherit;
    border-radius: var(--tw-radius-control);
    padding: 0.4rem 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    transition:
      background-color 150ms ease,
      color 150ms ease,
      box-shadow 150ms ease,
      transform 80ms ease;
    white-space: nowrap;
  }

  .tw-button--md {
    padding: 0.5rem 1.1rem;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .tw-button--sm {
    padding: 0.3rem 0.75rem;
    font-size: 0.85rem;
    font-weight: 500;
  }

  /* Variants */

  .tw-button--primary {
    background: var(--tw-accent);
    color: #ffffff;
    box-shadow: var(--tw-shadow-soft);
  }

  .tw-button--primary:hover:not(:disabled) {
    background: #0063cc;
  }

  .tw-button--primary:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
  }

  .tw-button--secondary {
    background: var(--tw-bg-card);
    color: var(--tw-text);
    border: 1px solid var(--tw-border-subtle);
  }

  .tw-button--secondary:hover:not(:disabled) {
    background: #f8f8fb;
  }

  .tw-button--secondary:active:not(:disabled) {
    transform: translateY(1px);
  }

  .tw-button--ghost {
    background: transparent;
    color: var(--tw-accent);
    padding-left: 0;
    padding-right: 0;
  }

  .tw-button--ghost:hover:not(:disabled) {
    text-decoration: underline;
    background: transparent;
  }

  .tw-button--ghost:active:not(:disabled) {
    transform: translateY(1px);
  }

  /* Disabled */

  .tw-button:disabled {
    cursor: default;
    opacity: 0.55;
    box-shadow: none;
  }
</style>
