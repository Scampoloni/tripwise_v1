import { V as attr, Y as ensure_array_like } from "../../../chunks/index2.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const faqs = [
      {
        q: "Wie lege ich eine neue Reise an?",
        a: 'Gehe auf „Trips" und klicke „Neue Reise". Gib Name, Reiseziel, Datum und Budget ein. Die Reise erscheint sofort auf deinem Dashboard.'
      },
      {
        q: "Wie füge ich Ausgaben hinzu?",
        a: 'Öffne eine Reise und wähle „Ausgabe hinzufügen". Trage Betrag, Kategorie und Datum ein. Die Ausgabe wird automatisch zum Budget-Tracker hinzugefügt.'
      },
      {
        q: "Was zeigt das Dashboard?",
        a: "Das Dashboard gibt dir einen Überblick über alle aktiven Reisen, dein Gesamtbudget in CHF, anstehende Trips und den aktuellen Ausgabenstand."
      },
      {
        q: "Wie funktioniert der Währungsrechner?",
        a: "Der Converter nutzt Live-Wechselkurse. Gib einen Betrag ein, wähle Ausgangs- und Zielwährung – das Ergebnis wird sofort angezeigt."
      },
      {
        q: "Was ist TripSplit?",
        a: "Mit TripSplit kannst du Gruppenausgaben fair aufteilen. Erstelle eine Gruppe, füge Teilnehmer hinzu und erfasse gemeinsame Ausgaben. Die App berechnet automatisch, wer wem wie viel schuldet."
      },
      {
        q: "Wo werden meine Daten gespeichert?",
        a: "Alle Daten werden lokal in deinem Browser gespeichert (Local Storage). Es gibt keinen Server-Sync – deine Daten bleiben privat auf deinem Gerät."
      },
      {
        q: "Kann ich zwischen Hell- und Dunkelmodus wechseln?",
        a: 'Ja, über das Theme-Icon in der Navigation. „Auto" folgt deiner System-Einstellung, oder du wählst manuell hell/dunkel.'
      },
      {
        q: "Wie lösche ich eine Reise?",
        a: 'Öffne die Reise und scrolle nach unten. Dort findest du den „Reise löschen"-Button. Achtung: Gelöschte Reisen können nicht wiederhergestellt werden.'
      }
    ];
    let query = "";
    const filtered = faqs.filter((f) => (f.q + " " + f.a).toLowerCase().includes(query.toLowerCase()));
    const visibleFaqs = filtered.slice(0, 3);
    const hasMoreFaqs = filtered.length > 3;
    $$renderer2.push(`<section class="page-shell svelte-1vby5nc" data-animate="fadeUp"><header class="page-header card-surface header-centered svelte-1vby5nc"><div class="page-headings svelte-1vby5nc"><h1 class="svelte-1vby5nc">Hilfe &amp; Support</h1> <p class="page-subtitle svelte-1vby5nc">Finde Antworten auf häufige Fragen und lerne TripWise besser kennen.</p></div> <div class="search-wrap svelte-1vby5nc"><input class="search-input svelte-1vby5nc" type="text" placeholder="FAQ durchsuchen …"${attr("value", query)}/></div></header> <div class="page-body svelte-1vby5nc"><div class="help-grid svelte-1vby5nc"><section class="card-surface faq-card svelte-1vby5nc"><span class="card-label svelte-1vby5nc">Häufige Fragen</span> <div class="faq-list svelte-1vby5nc"><!--[-->`);
    const each_array = ensure_array_like(visibleFaqs);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      $$renderer2.push(`<details class="faq-item svelte-1vby5nc"><summary class="svelte-1vby5nc">${escape_html(item.q)}</summary> <p class="svelte-1vby5nc">${escape_html(item.a)}</p></details>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (filtered.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="no-results svelte-1vby5nc">Keine Treffer – probiere einen anderen Suchbegriff.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (hasMoreFaqs && true) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="show-more-btn svelte-1vby5nc">Weitere Fragen anzeigen (${escape_html(filtered.length - 3)})</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></section> <section class="card-surface tips-card svelte-1vby5nc"><span class="card-label svelte-1vby5nc">Quick Tips</span> <ul class="tips-list svelte-1vby5nc"><li class="svelte-1vby5nc"><span class="tip-icon svelte-1vby5nc">`);
    Icon($$renderer2, { name: "lightbulb", size: 18 });
    $$renderer2.push(`<!----></span> <span>Nutze den <a href="/converter" class="svelte-1vby5nc">Währungsrechner</a> vor Reiseantritt, um ein Gefühl für lokale Preise zu bekommen.</span></li> <li class="svelte-1vby5nc"><span class="tip-icon svelte-1vby5nc">`);
    Icon($$renderer2, { name: "bar-chart", size: 18 });
    $$renderer2.push(`<!----></span> <span>Lege klare Kategorien an (Unterkunft, Essen, Transport) für bessere Budget-Übersicht.</span></li> <li class="svelte-1vby5nc"><span class="tip-icon svelte-1vby5nc">`);
    Icon($$renderer2, { name: "users", size: 18 });
    $$renderer2.push(`<!----></span> <span>Bei Gruppenreisen: Nutze <a href="/tripsplit" class="svelte-1vby5nc">TripSplit</a> für faire Kostenaufteilung.</span></li> <li class="svelte-1vby5nc"><span class="tip-icon svelte-1vby5nc">`);
    Icon($$renderer2, { name: "target", size: 18 });
    $$renderer2.push(`<!----></span> <span>Setze dein Budget realistisch – plane einen Puffer von 10-15% für Unvorhergesehenes ein.</span></li> <li class="svelte-1vby5nc"><span class="tip-icon svelte-1vby5nc">`);
    Icon($$renderer2, { name: "smartphone", size: 18 });
    $$renderer2.push(`<!----></span> <span>TripWise funktioniert offline – erfasse Ausgaben auch ohne Internetverbindung.</span></li></ul></section> <section class="card-surface start-card svelte-1vby5nc"><span class="card-label svelte-1vby5nc">Erste Schritte</span> <div class="steps-list svelte-1vby5nc"><div class="step svelte-1vby5nc"><span class="step-num svelte-1vby5nc">1</span> <div class="step-content svelte-1vby5nc"><strong class="svelte-1vby5nc">Reise erstellen</strong> <p class="svelte-1vby5nc">Starte mit einer neuen Reise – Name, Ziel, Daten und Budget festlegen.</p></div></div> <div class="step svelte-1vby5nc"><span class="step-num svelte-1vby5nc">2</span> <div class="step-content svelte-1vby5nc"><strong class="svelte-1vby5nc">Ausgaben tracken</strong> <p class="svelte-1vby5nc">Erfasse jeden Kauf direkt vor Ort. Je genauer, desto besser die Übersicht.</p></div></div> <div class="step svelte-1vby5nc"><span class="step-num svelte-1vby5nc">3</span> <div class="step-content svelte-1vby5nc"><strong class="svelte-1vby5nc">Budget im Blick</strong> <p class="svelte-1vby5nc">Das Dashboard zeigt dir jederzeit den aktuellen Stand – Budget vs. Ausgaben.</p></div></div></div></section></div></div></section>`);
  });
}
export {
  _page as default
};
