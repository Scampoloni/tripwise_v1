import { _ as head, U as attr_class, V as attr } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let mode = "login";
    let email = "";
    let password = "";
    let loading = false;
    head("1x05zx6", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html("Anmelden")} · TripWise</title>`);
      });
    });
    $$renderer2.push(`<section class="auth-layout svelte-1x05zx6"><div class="card svelte-1x05zx6"><div class="card-header svelte-1x05zx6"><div class="logo-icon svelte-1x05zx6">`);
    Icon($$renderer2, { name: "plane", size: 28 });
    $$renderer2.push(`<!----></div> <h1 class="svelte-1x05zx6">TripWise</h1> <p class="subtitle svelte-1x05zx6">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`Willkommen zurück! Melde dich an, um fortzufahren.`);
    }
    $$renderer2.push(`<!--]--></p></div> <div class="tabs svelte-1x05zx6"><button type="button"${attr_class("svelte-1x05zx6", void 0, { "active": mode === "login" })}>Anmelden</button> <button type="button"${attr_class("svelte-1x05zx6", void 0, { "active": mode === "register" })}>Registrieren</button></div> <form class="form svelte-1x05zx6"><div class="field-group svelte-1x05zx6"><label for="email" class="label svelte-1x05zx6">E-Mail</label> <div class="input-wrapper svelte-1x05zx6">`);
    Icon($$renderer2, { name: "mail", size: 18 });
    $$renderer2.push(`<!----> <input id="email" type="email"${attr("value", email)} autocomplete="email" placeholder="name@beispiel.com" class="svelte-1x05zx6"/></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="field-group svelte-1x05zx6"><label for="password" class="label svelte-1x05zx6">Passwort</label> <div class="input-wrapper svelte-1x05zx6">`);
    Icon($$renderer2, { name: "lock", size: 18 });
    $$renderer2.push(`<!----> <input id="password" type="password"${attr("value", password)}${attr("autocomplete", "current-password")} placeholder="••••••••" class="svelte-1x05zx6"/></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <button class="btn-primary svelte-1x05zx6" type="submit"${attr("disabled", loading, true)}>`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`${escape_html("Anmelden")}`);
    }
    $$renderer2.push(`<!--]--></button></form> <p class="footer-hint svelte-1x05zx6">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`Noch kein Konto? <button type="button" class="link-btn svelte-1x05zx6">Jetzt registrieren</button>`);
    }
    $$renderer2.push(`<!--]--></p></div></section>`);
  });
}
export {
  _page as default
};
