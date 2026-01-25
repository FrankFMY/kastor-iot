import type { PageServerLoad } from './$types.js';
import { seedSpareParts } from '$lib/server/services/maintenance.service.js';
import { getAllEngines } from '$lib/server/services/engine.service.js';
import { getAllMaintenanceForecasts } from '$lib/server/services/maintenance.service.js';
import { getSparePartsInventory } from '$lib/server/services/maintenance.service.js';
import type { MaintenanceForecast } from '$lib/types/index.js';

export const load: PageServerLoad = async () => {
	try {
		// Ensure spare parts are seeded
		await seedSpareParts();

		// Get all data using cached services (optimized!)
		const [engines, maintenanceRecords, sparePartsRaw] = await Promise.all([
			getAllEngines(),
			getAllMaintenanceForecasts(),
			getSparePartsInventory()
		]);

		// Transform spare parts to match client-side type
		const spareParts = sparePartsRaw.map((part) => ({
			name: part.name,
			quantity: part.quantity || 0,
			min: part.min_quantity || 0
		}));

		// Calculate budget from upcoming maintenance
		const budgetNext7Days = maintenanceRecords
			.filter((m: MaintenanceForecast) => m.days_remaining <= 7)
			.reduce((sum: number, m: MaintenanceForecast) => sum + m.estimated_cost, 0);

		const budgetNext30Days = maintenanceRecords
			.filter((m: MaintenanceForecast) => m.days_remaining <= 30)
			.reduce((sum: number, m: MaintenanceForecast) => sum + m.estimated_cost, 0);

		const budgetNextQuarter = maintenanceRecords
			.filter((m: MaintenanceForecast) => m.days_remaining <= 90)
			.reduce((sum: number, m: MaintenanceForecast) => sum + m.estimated_cost, 0);

		return {
			maintenanceRecords,
			spareParts,
			engines,
			budget: {
				next7Days: budgetNext7Days,
				next30Days: budgetNext30Days,
				nextQuarter: budgetNextQuarter
			}
		};
	} catch (error) {
		console.error('[Maintenance SSR] Error loading data:', error);

		// Return empty data on error to prevent crash
		return {
			maintenanceRecords: [],
			spareParts: [],
			engines: [],
			budget: {
				next7Days: 0,
				next30Days: 0,
				nextQuarter: 0
			}
		};
	}
};
