import { V as attr, a0 as bind_props } from "./index2.js";
import { f as fallback } from "./utils2.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
/* empty css                                         */
import { e as escape_html } from "./context.js";
function BackButton($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let label = fallback($$props["label"], "Zurück");
    let defaultHref = fallback($$props["defaultHref"], "/");
    $$renderer2.push(`<button type="button" class="back-button svelte-iugoeh"${attr("aria-label", label)}><span class="icon svelte-iugoeh" aria-hidden="true"><svg viewBox="0 0 20 20" role="presentation" class="svelte-iugoeh"><path d="M12.5 4.5 6 10l6.5 5.5"></path><path d="M6.4 10H15.5"></path></svg></span> <span class="label svelte-iugoeh">${escape_html(label)}</span></button>`);
    bind_props($$props, { label, defaultHref });
  });
}
export {
  BackButton as B
};
