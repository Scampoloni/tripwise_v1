<script lang="ts">
  /**
   * ListRow – Apple HIG-inspired list row component
   * 
   * Usage:
   * <ListRow>
   *   <span slot="content">Main content</span>
   *   <span slot="actions">Action buttons</span>
   * </ListRow>
   */
  
  export let divider: boolean = true;
  export let clickable: boolean = false;
  export let active: boolean = false;
</script>

<div 
  class="list-row"
  class:list-row--divider={divider}
  class:list-row--clickable={clickable}
  class:list-row--active={active}
>
  <div class="list-row__content">
    <slot name="content">
      <slot />
    </slot>
  </div>
  
  {#if $$slots.actions}
    <div class="list-row__actions">
      <slot name="actions" />
    </div>
  {/if}
</div>

<style>
  .list-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--tw-space-md);
    padding: var(--tw-space-sm) 0;
    min-height: 44px; /* Apple touch target */
  }

  .list-row--divider {
    border-bottom: 1px solid var(--tw-border-subtle);
  }

  .list-row--divider:last-child {
    border-bottom: none;
  }

  .list-row--clickable {
    cursor: pointer;
    padding: var(--tw-space-sm) var(--tw-space-md);
    margin: 0 calc(-1 * var(--tw-space-md));
    border-radius: var(--tw-radius-control);
    transition: background-color var(--tw-transition-fast);
  }

  .list-row--clickable:hover {
    background: var(--tw-bg-subtle);
  }

  .list-row--clickable:active {
    background: var(--tw-border-subtle);
  }

  .list-row--active {
    background: var(--tw-active-bg);
    border: 1px solid var(--tw-active-border);
    border-radius: var(--tw-radius-control);
    margin: 0 calc(-1 * var(--tw-space-md) - 1px);
    padding: var(--tw-space-sm) var(--tw-space-md);
  }

  .list-row--active .list-row__content,
  .list-row--active :global(*) {
    color: var(--tw-text);
  }

  .list-row--active:hover {
    background: var(--tw-active-bg);
  }

  .list-row__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--tw-space-xs);
  }

  .list-row__actions {
    display: flex;
    align-items: center;
    gap: var(--tw-space-sm);
    flex-shrink: 0;
  }
</style>
