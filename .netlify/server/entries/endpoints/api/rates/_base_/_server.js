const TTL_SECONDS = 60 * 60;
async function GET({ params, url, setHeaders, fetch }) {
  const base = (params.base || "CHF").toUpperCase();
  const symbols = (url.searchParams.get("symbols") || "").toUpperCase();
  try {
    const r = await fetch(
      `https://api.frankfurter.app/latest?from=${base}&to=${symbols}`
    );
    if (!r.ok) {
      throw new Error("remote failed");
    }
    const data = await r.json();
    setHeaders({
      "Cache-Control": `public, max-age=${TTL_SECONDS}`,
      "CDN-Cache-Control": `public, max-age=${TTL_SECONDS}`
    });
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    const fallback = {
      amount: 1,
      base,
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      rates: {}
    };
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
export {
  GET
};
