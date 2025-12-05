<script lang="ts">
  export let type: string = 'text';
  export let placeholder: string = '';
  export let value: string | number | null = '';
  export let disabled = false;
</script>

<div class="tw-input-wrapper">
  <input
    class="tw-input"
    {type}
    {placeholder}
    bind:value
    {disabled}
    {...$$restProps}
  />
</div>

<style>
  .tw-input-wrapper {
    display: inline-flex;
    width: 100%;
  }

  .tw-input {
    width: 100%;
    box-sizing: border-box;
    font: inherit;
    padding: 0.45rem 0.75rem;
    border-radius: var(--tw-radius-control);
    border: 1px solid var(--tw-border-subtle);
    background: #ffffff;
    color: var(--tw-text);
    outline: none;
    transition:
      border-color 140ms ease,
      box-shadow 140ms ease,
      background-color 140ms ease;
  }

  .tw-input::placeholder {
    color: var(--tw-text-muted);
  }

  .tw-input:focus-visible {
    border-color: var(--tw-accent);
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.25);
    background: #ffffff;
  }

  .tw-input:disabled {
    background: #f5f5f7;
    color: var(--tw-text-muted);
  }
</style>
