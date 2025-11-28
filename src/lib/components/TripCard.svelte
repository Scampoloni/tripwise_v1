<script>
  import {
    calculatePercentUsed,
    calculateDaysRemaining
  } from '$lib/utils/calculations.js';
  import { browser } from '$app/environment';
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';

  // Trip kommt von aussen, kein Runes-$props
  export let trip;

  const dispatch = createEventDispatcher();

  // Sicherstellen, dass wir immer ein Array haben
  $: expenses = Array.isArray(trip?.expenses) ? trip.expenses : [];

  // Budget: bevorzugt trip.budget, sonst totalBudget, sonst 0
  $: rawBudget =
    typeof trip?.budget === 'number' && Number.isFinite(trip.budget)
      ? trip.budget
      : Number(trip?.budget ?? trip?.totalBudget ?? 0) || 0;

  $: cardBudget = rawBudget > 0 ? rawBudget : 0;

  // Ausgaben: Summe aller amount Werte
  $: cardSpent = expenses.reduce((sum, exp) => {
    const amount = Number(exp?.amount ?? 0);
    const s = Number.isFinite(sum) ? sum : 0;
    const v = Number.isFinite(amount) ? amount : 0;
    return s + v;
  }, 0);

  $: cardSpent = Number.isFinite(cardSpent) ? cardSpent : 0;

  // Prozent
  $: percentUsed = calculatePercentUsed(cardSpent, cardBudget);

  // Tage uebrig
  $: daysRemaining = 0;
  $: if (browser && trip?.endDate) {
    daysRemaining = calculateDaysRemaining(trip.endDate);
  }

  // Farbe fuer Prozent
  $: statusColor =
    percentUsed >= 100
      ? 'var(--danger)'
      : percentUsed >= 80
      ? 'var(--warning)'
      : 'var(--success)';

  // Initialen fuer Avatar
  function getInitials(name) {
    const trimmed = (name ?? '').trim();
    if (!trimmed) return 'TR';
    const parts = trimmed.split(' ');
    if (parts.length === 1) {
      return trimmed.slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  $: displayDestination = trip?.destinationName ?? trip?.destination ?? '';
  $: initials = getInitials(displayDestination || trip?.name || '');

  function handleCardClick() {
    const id = trip?.id ?? trip?._id;
    if (!id) return;
    goto(`/trips/${id}`);
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  }

  function handleDeleteClick(event) {
    event?.stopPropagation?.();
    dispatch('delete', trip);
  }

  // Debug: kannst du spaeter wieder entfernen
  $: console.log('TRIPCARD LIST DATA', {
    id: trip?.id,
    name: trip?.name,
    budget: cardBudget,
    spent: cardSpent,
    rawBudget: trip?.budget,
    totalBudget: trip?.totalBudget,
    expensesCount: expenses.length
  });
</script>

<div
  class="trip-card"
  role="button"
  tabindex="0"
  on:click={handleCardClick}
  on:keydown={handleKeydown}
>
  <button
    class="delete-btn"
    type="button"
    aria-label="Trip loeschen"
    on:click|stopPropagation={handleDeleteClick}
  >
    ✕
  </button>

  <div class="trip-inner">
    <div class="trip-avatar">
      <span>{initials}</span>
    </div>

    <div class="trip-main">
      <div class="trip-header">
        <div class="trip-title-block">
          <h3>{trip?.name}</h3>
          {#if displayDestination}
            <p class="trip-destination">{displayDestination}</p>
          {/if}
        </div>
        <div class="trip-percentage" style={`color:${statusColor}`}>
          {Number.isFinite(percentUsed) ? `${percentUsed}%` : '--'}
        </div>
      </div>

      <div class="budget-bar">
        <div
          class="budget-progress"
          style={`width:${Math.min(percentUsed || 0, 100)}%; background:${statusColor}`}
        ></div>
      </div>

      <div class="trip-footer">
        <div class="budget-info">
          <span class="spent">
            {cardSpent.toFixed(0)}
          </span>
          <span class="separator">/</span>
          <span class="total">
            {cardBudget.toFixed(0)} {trip?.currency}
          </span>
        </div>

        <div class="trip-meta">
          {#if daysRemaining > 0}
            <span class="days">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
            </span>
          {:else}
            <span class="days completed">Completed</span>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>


<style>
  .trip-card {
    position: relative;
    background: var(--surface);
    color: var(--text);
    border-radius: 1rem;
    padding: 1.1rem 1.1rem;
    border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition:
      background 0.2s,
      box-shadow 0.2s,
      transform 0.15s,
      border-color 0.2s;
  }

  .trip-card:hover {
    background: color-mix(in oklab, var(--surface) 88%, var(--primary-soft-bg) 12%);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border-color: color-mix(in oklab, var(--primary) 45%, var(--border));
  }

  .trip-card:focus-visible {
    outline: 3px solid color-mix(in oklab, var(--primary) 55%, transparent);
    outline-offset: 3px;
  }

  .trip-inner {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .trip-avatar {
    flex: 0 0 48px;
    height: 48px;
    border-radius: 999px;
    background: color-mix(in oklab, var(--primary-soft-bg) 70%, var(--surface) 30%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: var(--primary);
    font-size: 0.95rem;
  }

  .trip-main {
    flex: 1 1 0;
    min-width: 0;
  }

  .trip-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 0.8rem;
  }

  .trip-title-block h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .trip-destination {
    margin: 0.15rem 0 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .trip-percentage {
    font-weight: 600;
    font-size: 1rem;
  }

  .budget-bar {
    margin-bottom: 0.6rem;
    height: 0.4rem;
    background: color-mix(in oklab, var(--text-secondary) 18%, transparent);
    border-radius: 999px;
    overflow: hidden;
  }

  .budget-progress {
    height: 100%;
    border-radius: 999px;
    transition: width 0.45s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  .trip-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.86rem;
  }

  .budget-info {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }

  .spent {
    font-weight: 600;
    color: var(--text);
  }

  .separator {
    color: var(--text-secondary);
  }

  .total {
    color: color-mix(in oklab, var(--text) 75%, var(--text-secondary) 25%);
  }

  .trip-meta {
    color: color-mix(in oklab, var(--text) 70%, var(--text-secondary) 30%);
    font-weight: 500;
  }

  .days.completed {
    color: var(--success);
  }

  .delete-btn {
    position: absolute;
    top: 0.55rem;
    right: 0.6rem;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    border: 1px solid color-mix(in oklab, var(--border) 65%, transparent);
    background: var(--surface);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    cursor: pointer;
    opacity: 0;
    transition:
      opacity 0.15s,
      background 0.15s,
      color 0.15s,
      transform 0.15s;
    z-index: 2;
  }

  .trip-card:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    background: color-mix(in oklab, var(--danger) 18%, var(--surface) 82%);
    color: var(--danger);
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    .trip-card {
      padding: 0.9rem;
    }
  }
</style>
