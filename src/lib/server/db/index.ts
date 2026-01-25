import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

if (!building && !env.DATABASE_URL) throw Error('DATABASE_URL is not set');

/**
 * Database connection pool configuration
 * 
 * DEMO/PRESENTATION MODE: Increased limits for stability during presentations
 * - max: 100 connections (was 10, then 30) - supports many concurrent users
 * - connect_timeout: 15s (was 10s) - more tolerant to temporary load spikes
 * - idle_timeout: 30s (was 20s) - keep connections longer for reuse
 * 
 * For production, consider:
 * - Monitoring actual connection usage
 * - Using connection pooler (PgBouncer) for better scalability
 * - Adjusting based on actual load patterns
 */
const client = building
	? ({} as postgres.Sql)
	: postgres(env.DATABASE_URL!, {
			max: 100, // Maximum 100 connections in pool (increased for demo/presentation with many concurrent users)
			idle_timeout: 30, // Close idle connections after 30 seconds
			connect_timeout: 15, // Connection timeout 15 seconds (increased for stability)
			max_lifetime: 60 * 60 // Max connection lifetime 1 hour
		});

export const db = drizzle(client, { schema });
