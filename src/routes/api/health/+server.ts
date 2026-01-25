import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { sql } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

// Кэш для health check результатов (TTL: 5 секунд)
let healthCache: {
	result: { status: 'ok' | 'degraded' | 'error'; checks: Record<string, unknown>; timestamp: string; demoMode: boolean };
	expires: number;
} | null = null;

const CACHE_TTL = 5000; // 5 секунд

export const GET: RequestHandler = async () => {
	// Проверяем кэш
	if (healthCache && Date.now() < healthCache.expires) {
		return json(
			{
				...healthCache.result,
				timestamp: new Date().toISOString()
			},
			{ status: healthCache.result.status === 'error' ? 503 : 200 }
		);
	}

	const checks: Record<string, { status: 'ok' | 'error'; message?: string; latency?: number }> = {};
	let overallStatus: 'ok' | 'degraded' | 'error' = 'ok';

	// Check demo mode status
	const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';

	// Database check with timeout
	const dbCheck = async (): Promise<number> => {
		const start = Date.now();
		await db.execute(sql`SELECT 1`);
		return Date.now() - start;
	};

	const timeout = (ms: number): Promise<never> =>
		new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), ms));

	// Увеличенный таймаут для демо (10 секунд вместо 5)
	const DB_TIMEOUT = 10000;

	try {
		const latency = await Promise.race([dbCheck(), timeout(DB_TIMEOUT)]);
		checks.database = { status: 'ok', latency };
	} catch (error) {
		checks.database = {
			status: 'error',
			message: error instanceof Error ? error.message : 'Unknown error'
		};
		overallStatus = 'error';
	}

	// Сохраняем в кэш
	const result = {
		status: overallStatus,
		timestamp: new Date().toISOString(),
		version: '0.0.1',
		demoMode: isDemoMode,
		checks
	};

	healthCache = {
		result,
		expires: Date.now() + CACHE_TTL
	};

	// Return health status
	const httpStatus = overallStatus === 'error' ? 503 : 200;
	return json(result, { status: httpStatus });
};
