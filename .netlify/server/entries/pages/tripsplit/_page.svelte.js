import { W as store_get, Y as ensure_array_like, U as attr_class, V as attr, X as unsubscribe_stores } from "../../../chunks/index2.js";
import { w as writable } from "../../../chunks/index.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { e as escape_html } from "../../../chunks/context.js";
const tripSplitGroups = writable([]);
const tripSplitLoading = writable(false);
function computeBalances(group) {
  const map = {};
  for (const p of group.participants) {
    map[p.id] = 0;
  }
  for (const e of group.expenses) {
    if (!e) continue;
    if (typeof map[e.paidBy] !== "number") {
      map[e.paidBy] = 0;
    }
    map[e.paidBy] += e.amount;
    for (const split of e.splits || []) {
      if (typeof map[split.participantId] !== "number") {
        map[split.participantId] = 0;
      }
      map[split.participantId] -= split.share;
    }
  }
  const balances = Object.entries(map).map(([participantId, net]) => ({
    participantId,
    net
  }));
  return balances;
}
function computeSettlements(balances) {
  const creditors = [];
  const debtors = [];
  for (const b of balances) {
    if (b.net > 0.01) {
      creditors.push({ participantId: b.participantId, amount: b.net });
    } else if (b.net < -0.01) {
      debtors.push({ participantId: b.participantId, amount: -b.net });
    }
  }
  const settlements = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);
    if (amount > 0.01) {
      settlements.push({
        fromParticipantId: debtor.participantId,
        toParticipantId: creditor.participantId,
        amount: Math.round(amount * 100) / 100
        // auf Rappen runden
      });
    }
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }
  return settlements;
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const groups = store_get($$store_subs ??= {}, "$tripSplitGroups", tripSplitGroups) ?? [];
    const isLoading = store_get($$store_subs ??= {}, "$tripSplitLoading", tripSplitLoading);
    let newGroupName = "";
    let selectedGroupId = null;
    const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;
    const activeParticipants = selectedGroup?.participants ?? [];
    let newParticipantName = "";
    let newParticipantEmail = "";
    let newExpenseDescription = "";
    let newExpenseAmount = "";
    let newExpenseCurrency = "CHF";
    let newExpensePaidBy = "";
    const balances = selectedGroup ? computeBalances(selectedGroup) : [];
    const settlements = balances.length > 0 ? computeSettlements(balances) : [];
    const visibleParticipants = activeParticipants.slice(0, 3);
    const hasMoreParticipants = activeParticipants.length > 3;
    const activeExpenses = selectedGroup?.expenses ?? [];
    const visibleExpenses = activeExpenses.slice(0, 3);
    const hasMoreExpenses = activeExpenses.length > 3;
    const canCreateGroup = newGroupName.trim().length > 0;
    const canAddParticipant = newParticipantName.trim().length > 0;
    const expenseAmountValue = (() => {
      const parsed = Number.parseFloat(newExpenseAmount);
      return Number.isFinite(parsed) ? parsed : 0;
    })();
    const canAddExpense = newExpenseDescription.trim().length > 0 && expenseAmountValue > 0 && Boolean(newExpensePaidBy);
    function getParticipantName(group, participantId) {
      const p = group.participants.find((x) => x.id === participantId);
      return p ? p.name : "Unbekannt";
    }
    $$renderer2.push(`<section class="page-shell svelte-w05ah6" data-animate="fadeUp"><header class="page-header card-surface header-centered svelte-w05ah6"><div class="page-headings svelte-w05ah6"><h1 class="svelte-w05ah6">TripSplit</h1> <p class="page-subtitle svelte-w05ah6">Gruppenausgaben planen, Splits berechnen</p></div></header> `);
    if (isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading-state svelte-w05ah6"><p>Gruppen werden geladen...</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="page-body svelte-w05ah6"><section class="card-surface svelte-w05ah6"><span class="card-label svelte-w05ah6">Gruppen</span> `);
      if (groups.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="empty-hint svelte-w05ah6">Noch keine Gruppen vorhanden.</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="item-list svelte-w05ah6"><!--[-->`);
        const each_array = ensure_array_like(groups);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let group = each_array[$$index];
          $$renderer2.push(`<div${attr_class("list-item svelte-w05ah6", void 0, { "active": selectedGroupId === group.id })}><button type="button" class="item-main svelte-w05ah6"><span class="item-icon svelte-w05ah6">`);
          Icon($$renderer2, { name: "users", size: 18 });
          $$renderer2.push(`<!----></span> <span class="item-label svelte-w05ah6">${escape_html(group.name)}</span></button> <button type="button" class="item-action item-action-delete svelte-w05ah6" title="Gruppe löschen">`);
          Icon($$renderer2, { name: "trash", size: 16 });
          $$renderer2.push(`<!----></button></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--> <div class="new-group-form svelte-w05ah6"><input class="text-input svelte-w05ah6" placeholder="Neue Gruppe, z. B. WG Spanien"${attr("value", newGroupName)}/> <button class="pill pill-cta svelte-w05ah6" type="button"${attr("disabled", !canCreateGroup, true)}>+ Gruppe erstellen</button></div></section> `);
      if (selectedGroup) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<section class="card-surface svelte-w05ah6"><div class="content-header svelte-w05ah6"><h2 class="content-title svelte-w05ah6">${escape_html(selectedGroup.name)}</h2> <p class="content-meta svelte-w05ah6">${escape_html(selectedGroup.participants.length)} ${escape_html(selectedGroup.participants.length === 1 ? "Teilnehmer" : "Teilnehmer:innen")} • ${escape_html(selectedGroup.expenses.length)} ${escape_html(selectedGroup.expenses.length === 1 ? "Ausgabe" : "Ausgaben")}</p></div></section> <div class="two-column-grid svelte-w05ah6"><section class="card-surface svelte-w05ah6"><span class="card-label svelte-w05ah6">Teilnehmer</span> `);
        if (activeParticipants.length === 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="empty-hint svelte-w05ah6">Noch keine Teilnehmer hinzugefügt.</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="item-list svelte-w05ah6"><!--[-->`);
          const each_array_1 = ensure_array_like(visibleParticipants);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let p = each_array_1[$$index_1];
            $$renderer2.push(`<div class="list-item svelte-w05ah6"><div class="item-main-info svelte-w05ah6"><span class="item-icon svelte-w05ah6">`);
            Icon($$renderer2, { name: "user", size: 18 });
            $$renderer2.push(`<!----></span> <div class="item-details svelte-w05ah6"><span class="item-label svelte-w05ah6">${escape_html(p.name)}</span> `);
            if (p.email) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<span class="item-sublabel svelte-w05ah6">${escape_html(p.email)}</span>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--></div></div> <button type="button" class="item-action item-action-delete svelte-w05ah6" title="Teilnehmer löschen">`);
            Icon($$renderer2, { name: "trash", size: 16 });
            $$renderer2.push(`<!----></button></div>`);
          }
          $$renderer2.push(`<!--]--></div> `);
          if (hasMoreParticipants && true) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="show-more-btn svelte-w05ah6">Weitere Teilnehmer anzeigen (${escape_html(activeParticipants.length - 3)})</button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--> <div class="form-row svelte-w05ah6"><input class="text-input svelte-w05ah6" placeholder="Name"${attr("value", newParticipantName)}/> <input class="text-input svelte-w05ah6" placeholder="E-Mail (optional)"${attr("value", newParticipantEmail)}/> <button class="pill pill-cta svelte-w05ah6" type="button"${attr("disabled", !canAddParticipant, true)}>+ Hinzufügen</button></div></section> <section class="card-surface svelte-w05ah6"><span class="card-label svelte-w05ah6">Ausgaben</span> `);
        if (activeExpenses.length === 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="empty-hint svelte-w05ah6">Noch keine Ausgaben erfasst.</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="item-list svelte-w05ah6"><!--[-->`);
          const each_array_2 = ensure_array_like(visibleExpenses);
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let e = each_array_2[$$index_2];
            $$renderer2.push(`<div class="list-item svelte-w05ah6"><div class="item-main-info svelte-w05ah6"><span class="item-icon svelte-w05ah6">`);
            Icon($$renderer2, { name: "receipt", size: 18 });
            $$renderer2.push(`<!----></span> <div class="item-details svelte-w05ah6"><span class="item-label svelte-w05ah6">${escape_html(e.description)}</span> <span class="item-sublabel svelte-w05ah6">${escape_html(e.amount.toFixed(2))} ${escape_html(e.currency)} • ${escape_html(getParticipantName(selectedGroup, e.paidBy))}</span></div></div> <button type="button" class="item-action item-action-delete svelte-w05ah6" title="Ausgabe löschen">`);
            Icon($$renderer2, { name: "trash", size: 16 });
            $$renderer2.push(`<!----></button></div>`);
          }
          $$renderer2.push(`<!--]--></div> `);
          if (hasMoreExpenses && true) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="show-more-btn svelte-w05ah6">Weitere Ausgaben anzeigen (${escape_html(activeExpenses.length - 3)})</button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--> <div class="form-row svelte-w05ah6"><input class="text-input svelte-w05ah6" placeholder="Beschreibung, z. B. Abendessen"${attr("value", newExpenseDescription)}/> <input class="text-input svelte-w05ah6" type="number" placeholder="Betrag"${attr("value", newExpenseAmount)}/> `);
        $$renderer2.select(
          { class: "select-input", value: newExpenseCurrency },
          ($$renderer3) => {
            $$renderer3.option({ value: "CHF" }, ($$renderer4) => {
              $$renderer4.push(`CHF`);
            });
            $$renderer3.option({ value: "EUR" }, ($$renderer4) => {
              $$renderer4.push(`EUR`);
            });
            $$renderer3.option({ value: "USD" }, ($$renderer4) => {
              $$renderer4.push(`USD`);
            });
          },
          "svelte-w05ah6"
        );
        $$renderer2.push(` `);
        $$renderer2.select(
          { class: "select-input", value: newExpensePaidBy },
          ($$renderer3) => {
            $$renderer3.option({ value: "", disabled: true }, ($$renderer4) => {
              $$renderer4.push(`Bezahlt von ...`);
            });
            $$renderer3.push(`<!--[-->`);
            const each_array_3 = ensure_array_like(selectedGroup.participants);
            for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
              let p = each_array_3[$$index_3];
              $$renderer3.option({ value: p.id }, ($$renderer4) => {
                $$renderer4.push(`${escape_html(p.name)}`);
              });
            }
            $$renderer3.push(`<!--]-->`);
          },
          "svelte-w05ah6"
        );
        $$renderer2.push(` <button class="pill pill-cta svelte-w05ah6" type="button"${attr("disabled", !canAddExpense, true)}>+ Hinzufügen</button></div></section></div> <div class="two-column-grid svelte-w05ah6"><section class="card-surface svelte-w05ah6"><span class="card-label svelte-w05ah6">Saldo pro Person</span> `);
        if (selectedGroup.expenses.length === 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="empty-hint svelte-w05ah6">Noch keine Salden, da bisher keine Ausgaben existieren.</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="item-list svelte-w05ah6"><!--[-->`);
          const each_array_4 = ensure_array_like(balances);
          for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
            let b = each_array_4[$$index_4];
            $$renderer2.push(`<div class="list-item balance-item svelte-w05ah6"><div class="item-main-info svelte-w05ah6"><span class="item-icon svelte-w05ah6">`);
            Icon($$renderer2, { name: "wallet", size: 18 });
            $$renderer2.push(`<!----></span> <span class="item-label svelte-w05ah6">${escape_html(getParticipantName(selectedGroup, b.participantId))}</span></div> <div class="balance-status svelte-w05ah6"><span${attr_class("balance-amount svelte-w05ah6", void 0, { "positive": b.net > 0.01, "negative": b.net < -0.01 })}>${escape_html(b.net.toFixed(2))} ${escape_html(newExpenseCurrency)}</span> `);
            if (b.net > 0.01) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<span class="status-badge status-positive svelte-w05ah6">bekommt</span>`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (b.net < -0.01) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<span class="status-badge status-negative svelte-w05ah6">schuldet</span>`);
              } else {
                $$renderer2.push("<!--[!-->");
                $$renderer2.push(`<span class="status-badge status-neutral svelte-w05ah6">ausgeglichen</span>`);
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]--></div></div>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--></section> <section class="card-surface svelte-w05ah6"><span class="card-label svelte-w05ah6">Ausgleichszahlungen</span> `);
        if (!selectedGroup.expenses.length) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="empty-hint svelte-w05ah6">Keine Vorschläge, da noch keine Ausgaben erfasst sind.</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (settlements.length === 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<p class="empty-hint svelte-w05ah6">Alles ist bereits ausgeglichen. ✓</p>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<div class="item-list svelte-w05ah6"><!--[-->`);
            const each_array_5 = ensure_array_like(settlements);
            for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
              let s = each_array_5[$$index_5];
              $$renderer2.push(`<div class="list-item settlement-item svelte-w05ah6"><div class="settlement-flow svelte-w05ah6"><span class="settlement-person from svelte-w05ah6">${escape_html(getParticipantName(selectedGroup, s.fromParticipantId))}</span> <span class="settlement-arrow svelte-w05ah6">→</span> <span class="settlement-person to svelte-w05ah6">${escape_html(getParticipantName(selectedGroup, s.toParticipantId))}</span></div> <span class="settlement-amount svelte-w05ah6">${escape_html(s.amount.toFixed(2))} ${escape_html(newExpenseCurrency)}</span></div>`);
            }
            $$renderer2.push(`<!--]--></div>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></section></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<section class="card-surface svelte-w05ah6"><div class="empty-state svelte-w05ah6"><span class="empty-icon svelte-w05ah6">`);
        Icon($$renderer2, { name: "users", size: 48, strokeWidth: 1.5 });
        $$renderer2.push(`<!----></span> <h3 class="empty-title svelte-w05ah6">Keine Gruppe ausgewählt</h3> <p class="empty-desc svelte-w05ah6">Wähle oben eine bestehende Gruppe aus oder erstelle eine neue.</p></div></section>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
