import * as server from '../entries/pages/trips/_id_/_page.server.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/trips/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/trips/[id]/+page.server.js";
export const imports = ["_app/immutable/nodes/11.sCKd-1mS.js","_app/immutable/chunks/DKcKZNbM.js","_app/immutable/chunks/DRGJ6kLP.js","_app/immutable/chunks/C92ekl7V.js","_app/immutable/chunks/BEeA_574.js","_app/immutable/chunks/BQ-wiG2K.js","_app/immutable/chunks/B_4rgOcn.js","_app/immutable/chunks/DjHb6xwI.js","_app/immutable/chunks/TutFs-Lq.js","_app/immutable/chunks/CyaBjvEp.js","_app/immutable/chunks/CjMs6E5P.js","_app/immutable/chunks/DCl5zek9.js","_app/immutable/chunks/DbbM3Xvw.js","_app/immutable/chunks/BuOSR_F5.js","_app/immutable/chunks/BOnd17ZU.js","_app/immutable/chunks/CxgrFlsE.js","_app/immutable/chunks/D0dmKdsx.js","_app/immutable/chunks/CvBvdhmX.js","_app/immutable/chunks/CtFfj1Ex.js"];
export const stylesheets = ["_app/immutable/assets/Icon.DFpEnOby.css","_app/immutable/assets/BackButton.BvrRhCQi.css","_app/immutable/assets/11.B0I2jlOj.css"];
export const fonts = [];
