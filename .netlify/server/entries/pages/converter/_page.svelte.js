import { V as attr, Y as ensure_array_like } from "../../../chunks/index2.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let amountStr = "";
    let base = "CHF";
    let target = "EUR";
    let result = 0;
    let rateDate = null;
    let history = [];
    const SYMBOL = { CHF: "CHF", EUR: "€", USD: "$", JPY: "¥", GBP: "£" };
    function parseAmount(s) {
      const v = parseFloat(s.replace(/\s+/g, "").replace(",", "."));
      return Number.isFinite(v) && v >= 0 ? v : 0;
    }
    function round(n, d = 4) {
      const f = 10 ** d;
      return Math.round(n * f) / f;
    }
    function fmtMoney(n, code) {
      try {
        return new Intl.NumberFormat("de-CH", { style: "currency", currency: code }).format(n);
      } catch {
        return `${round(n, 2)} ${code}`;
      }
    }
    const effectiveRate = round(0 / (parseAmount(amountStr) || 1), 6);
    $$renderer2.push(`<section class="page-shell svelte-r7s8dr" data-animate="fadeUp"><header class="page-header card-surface header-centered svelte-r7s8dr"><div class="page-headings svelte-r7s8dr"><h1 class="svelte-r7s8dr">Währungsrechner</h1> <p class="page-subtitle svelte-r7s8dr">Konvertiere Beträge schnell und präzise – mit Live-Kursen und ruhigem Design.</p></div></header> <div class="page-body svelte-r7s8dr"><section class="converter-card card-surface svelte-r7s8dr"><div class="field svelte-r7s8dr"><label for="amount" class="svelte-r7s8dr">Betrag</label> <div class="amount-wrap svelte-r7s8dr"><span class="prefix svelte-r7s8dr">${escape_html(SYMBOL[base])}</span> <input id="amount" inputmode="decimal" placeholder="Betrag eingeben"${attr("value", amountStr)} aria-label="Betrag in Ausgangswährung" class="svelte-r7s8dr"/></div></div> <div class="field grid svelte-r7s8dr"><div class="svelte-r7s8dr"><label for="base" class="svelte-r7s8dr">Von</label> `);
    $$renderer2.select(
      { id: "base", value: base, class: "" },
      ($$renderer3) => {
        $$renderer3.option(
          { class: "" },
          ($$renderer4) => {
            $$renderer4.push(`CHF`);
          },
          "svelte-r7s8dr"
        );
        $$renderer3.option(
          { class: "" },
          ($$renderer4) => {
            $$renderer4.push(`EUR`);
          },
          "svelte-r7s8dr"
        );
        $$renderer3.option(
          { class: "" },
          ($$renderer4) => {
            $$renderer4.push(`USD`);
          },
          "svelte-r7s8dr"
        );
        $$renderer3.option(
          { class: "" },
          ($$renderer4) => {
            $$renderer4.push(`JPY`);
          },
          "svelte-r7s8dr"
        );
        $$renderer3.option(
          { class: "" },
          ($$renderer4) => {
            $$renderer4.push(`GBP`);
          },
          "svelte-r7s8dr"
        );
      },
      "svelte-r7s8dr"
    );
    $$renderer2.push(`</div> <div class="swap-col svelte-r7s8dr"><button type="button" class="swap svelte-r7s8dr" aria-label="Währungen tauschen">`);
    Icon($$renderer2, { name: "arrow-right", size: 20 });
    $$renderer2.push(`<!----></button></div> <div class="svelte-r7s8dr"><label for="target" class="svelte-r7s8dr">Nach</label> `);
    $$renderer2.select(
      { id: "target", value: target, class: "" },
      ($$renderer3) => {
        $$renderer3.option(
          { class: "" },
          ($$renderer4) => {
            $$renderer4.push(`CHF`);
          },
          "svelte-r7s8dr"
        );
        $$renderer3.option(
          { class: "" },
          ($$renderer4) => {
            $$renderer4.push(`EUR`);
          },
          "svelte-r7s8dr"
        );
        $$renderer3.option(
          { class: "" },
          ($$renderer4) => {
            $$renderer4.push(`USD`);
          },
          "svelte-r7s8dr"
        );
        $$renderer3.option(
          { class: "" },
          ($$renderer4) => {
            $$renderer4.push(`JPY`);
          },
          "svelte-r7s8dr"
        );
        $$renderer3.option(
          { class: "" },
          ($$renderer4) => {
            $$renderer4.push(`GBP`);
          },
          "svelte-r7s8dr"
        );
      },
      "svelte-r7s8dr"
    );
    $$renderer2.push(`</div></div> <div class="result-panel svelte-r7s8dr"><div class="result-main svelte-r7s8dr"><div class="result-line svelte-r7s8dr"><span class="from svelte-r7s8dr">${escape_html(fmtMoney(parseAmount(amountStr), base))}</span> <span class="eq svelte-r7s8dr">=</span> <span class="to svelte-r7s8dr">${escape_html(fmtMoney(result, target))}</span> <button class="copy-btn svelte-r7s8dr" type="button" title="Ergebnis kopieren">`);
    Icon($$renderer2, { name: "copy", size: 16 });
    $$renderer2.push(`<!----></button></div> <div class="rate-line svelte-r7s8dr">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`1 ${escape_html(base)} = ${escape_html(effectiveRate)} ${escape_html(target)} <span class="sep svelte-r7s8dr">•</span> <span class="date svelte-r7s8dr">Stand: ${escape_html(rateDate)}</span>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="result-actions svelte-r7s8dr"><button class="pill pill-cta svelte-r7s8dr" type="button">`);
    Icon($$renderer2, { name: "plus", size: 16 });
    $$renderer2.push(`<!----> Zur Historie</button></div></div> <div class="accuracy svelte-r7s8dr"><button type="button" class="accuracy-toggle svelte-r7s8dr"><span class="svelte-r7s8dr">Hinweis zur Genauigkeit</span> <span class="chevron svelte-r7s8dr">${escape_html("▼")}</span></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></section> `);
    if (history.length) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<section class="history card-surface svelte-r7s8dr"><span class="card-label svelte-r7s8dr">Letzte Umrechnungen</span> <ul class="history-list svelte-r7s8dr"><!--[-->`);
      const each_array = ensure_array_like(history);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let h = each_array[$$index];
        $$renderer2.push(`<li class="history-item svelte-r7s8dr"><span class="history-icon svelte-r7s8dr">`);
        Icon($$renderer2, { name: "credit-card", size: 16 });
        $$renderer2.push(`<!----></span> <span class="history-time svelte-r7s8dr">${escape_html(new Date(h.ts).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }))}</span> <span class="history-entry svelte-r7s8dr">${escape_html(fmtMoney(h.amount, h.base))} → <strong class="svelte-r7s8dr">${escape_html(fmtMoney(h.result, h.target))}</strong></span></li>`);
      }
      $$renderer2.push(`<!--]--></ul></section>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}
export {
  _page as default
};
