import "clsx";
import { U as attr_class, V as attr, W as store_get, X as unsubscribe_stores } from "../../chunks/index2.js";
import { w as writable } from "../../chunks/index.js";
import { p as page } from "../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { I as Icon } from "../../chunks/Icon.js";
function computePreferred() {
  return "light";
}
const theme = writable(computePreferred());
function Header($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<header class="header svelte-1elxaub"><div class="container svelte-1elxaub"><a href="/" class="logo svelte-1elxaub"><span class="logo-icon svelte-1elxaub">`);
    Icon($$renderer2, { name: "plane", size: 20 });
    $$renderer2.push(`<!----></span> <span class="logo-text svelte-1elxaub">TripWise</span></a> <nav class="nav svelte-1elxaub" aria-label="Main"><a href="/"${attr_class("nav-link svelte-1elxaub", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/"
    })}${attr("aria-current", store_get($$store_subs ??= {}, "$page", page).url.pathname === "/" ? "page" : void 0)}>`);
    Icon($$renderer2, { name: "home", size: 16 });
    $$renderer2.push(`<!----> <span class="nav-label svelte-1elxaub">Dashboard</span></a> <a href="/tripsplit"${attr_class("nav-link svelte-1elxaub", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/tripsplit"
    })}${attr("aria-current", store_get($$store_subs ??= {}, "$page", page).url.pathname === "/tripsplit" ? "page" : void 0)}>`);
    Icon($$renderer2, { name: "users", size: 16 });
    $$renderer2.push(`<!----> <span class="nav-label svelte-1elxaub">TripSplit</span></a> <a href="/converter"${attr_class("nav-link svelte-1elxaub", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/converter"
    })}${attr("aria-current", store_get($$store_subs ??= {}, "$page", page).url.pathname === "/converter" ? "page" : void 0)}>`);
    Icon($$renderer2, { name: "credit-card", size: 16 });
    $$renderer2.push(`<!----> <span class="nav-label svelte-1elxaub">Converter</span></a> <a href="/help"${attr_class("nav-link svelte-1elxaub", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/help"
    })}${attr("aria-current", store_get($$store_subs ??= {}, "$page", page).url.pathname === "/help" ? "page" : void 0)}>`);
    Icon($$renderer2, { name: "help-circle", size: 16 });
    $$renderer2.push(`<!----> <span class="nav-label svelte-1elxaub">Help</span></a> <div class="theme-controls svelte-1elxaub"><button class="theme-toggle svelte-1elxaub" aria-label="Toggle theme" title="Toggle theme">`);
    if (store_get($$store_subs ??= {}, "$theme", theme) === "light") {
      $$renderer2.push("<!--[-->");
      Icon($$renderer2, { name: "moon", size: 16 });
    } else {
      $$renderer2.push("<!--[!-->");
      Icon($$renderer2, { name: "sun", size: 16 });
    }
    $$renderer2.push(`<!--]--></button> <button type="button" class="pill svelte-1elxaub">`);
    Icon($$renderer2, { name: "arrow-right", size: 14 });
    $$renderer2.push(`<!----> Logout</button></div></nav></div></header>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { $$slots, $$events, ...props } = $$props;
    props.data?.userId ?? null;
    $$renderer2.push(`<div class="app svelte-12qhfyh">`);
    Header($$renderer2);
    $$renderer2.push(`<!----> <main class="main svelte-12qhfyh">`);
    props.children($$renderer2);
    $$renderer2.push(`<!----></main></div>`);
  });
}
export {
  _layout as default
};
