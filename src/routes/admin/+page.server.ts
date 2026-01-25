import type { PageServerLoad } from './$types.js';
import { getAllEngines } from '$lib/server/services/engine.service.js';
import type { Engine } from '$lib/types/index.js';

export const load: PageServerLoad = async () => {
	try {
		// Get engines using cached service (optimized!)
		const engines = await getAllEngines();

		// Transform to simple Engine format (without metrics)
		const simpleEngines: Engine[] = engines.map((e) => ({
			id: e.id,
			model: e.model,
			status: e.status,
			planned_power_kw: e.planned_power_kw || 1200,
			total_hours: e.total_hours || 0
		}));

		return {
			engines: simpleEngines
		};
	} catch (error) {
		console.error('[Admin SSR] Error loading engines:', error);

		// Return empty array on error to prevent crash
		return {
			engines: []
		};
	}
};
