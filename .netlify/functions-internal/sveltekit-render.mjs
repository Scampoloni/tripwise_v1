import { init } from '../serverless.js';

export const handler = init((() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.Bl08jltv.js",app:"_app/immutable/entry/app.BrTv-0kE.js",imports:["_app/immutable/entry/start.Bl08jltv.js","_app/immutable/chunks/iZtgjtWq.js","_app/immutable/chunks/DRGJ6kLP.js","_app/immutable/chunks/D0dmKdsx.js","_app/immutable/entry/app.BrTv-0kE.js","_app/immutable/chunks/l3EYua_C.js","_app/immutable/chunks/DRGJ6kLP.js","_app/immutable/chunks/C92ekl7V.js","_app/immutable/chunks/BEeA_574.js","_app/immutable/chunks/DKcKZNbM.js","_app/immutable/chunks/D0dmKdsx.js","_app/immutable/chunks/BQ-wiG2K.js","_app/immutable/chunks/CyaBjvEp.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../server/nodes/0.js')),
			__memo(() => import('../server/nodes/1.js')),
			__memo(() => import('../server/nodes/2.js')),
			__memo(() => import('../server/nodes/3.js')),
			__memo(() => import('../server/nodes/4.js')),
			__memo(() => import('../server/nodes/5.js')),
			__memo(() => import('../server/nodes/6.js')),
			__memo(() => import('../server/nodes/7.js')),
			__memo(() => import('../server/nodes/8.js')),
			__memo(() => import('../server/nodes/9.js')),
			__memo(() => import('../server/nodes/10.js')),
			__memo(() => import('../server/nodes/11.js')),
			__memo(() => import('../server/nodes/12.js')),
			__memo(() => import('../server/nodes/13.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/analytics",
				pattern: /^\/analytics\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/auth/login/_server.js'))
			},
			{
				id: "/api/auth/logout",
				pattern: /^\/api\/auth\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/auth/logout/_server.js'))
			},
			{
				id: "/api/auth/register",
				pattern: /^\/api\/auth\/register\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/auth/register/_server.js'))
			},
			{
				id: "/api/db-test",
				pattern: /^\/api\/db-test\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/db-test/_server.js'))
			},
			{
				id: "/api/expenses",
				pattern: /^\/api\/expenses\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/expenses/_server.js'))
			},
			{
				id: "/api/expenses/[eid]",
				pattern: /^\/api\/expenses\/([^/]+?)\/?$/,
				params: [{"name":"eid","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/expenses/_eid_/_server.js'))
			},
			{
				id: "/api/rates",
				pattern: /^\/api\/rates\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/rates/_server.js'))
			},
			{
				id: "/api/rates/[base]",
				pattern: /^\/api\/rates\/([^/]+?)\/?$/,
				params: [{"name":"base","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/rates/_base_/_server.js'))
			},
			{
				id: "/api/tripsplit",
				pattern: /^\/api\/tripsplit\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/tripsplit/_server.js'))
			},
			{
				id: "/api/tripsplit/[id]",
				pattern: /^\/api\/tripsplit\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/tripsplit/_id_/_server.js'))
			},
			{
				id: "/api/trips",
				pattern: /^\/api\/trips\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/trips/_server.js'))
			},
			{
				id: "/api/trips/[id]",
				pattern: /^\/api\/trips\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/trips/_id_/_server.js'))
			},
			{
				id: "/api/trips/[id]/expenses",
				pattern: /^\/api\/trips\/([^/]+?)\/expenses\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/trips/_id_/expenses/_server.js'))
			},
			{
				id: "/api/trips/[id]/expenses/[expenseId]",
				pattern: /^\/api\/trips\/([^/]+?)\/expenses\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"expenseId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/trips/_id_/expenses/_expenseId_/_server.js'))
			},
			{
				id: "/converter",
				pattern: /^\/converter\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/globe",
				pattern: /^\/globe\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/help",
				pattern: /^\/help\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/tripsplit",
				pattern: /^\/tripsplit\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/trips",
				pattern: /^\/trips\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/trips/analytics",
				pattern: /^\/trips\/analytics\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/trips/new",
				pattern: /^\/trips\/new\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/trips/[id]",
				pattern: /^\/trips\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/trips/[id]/analytics",
				pattern: /^\/trips\/([^/]+?)\/analytics\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})());
