import { Pool } from 'mysql2/promise';

export const pool: Pool;
export function checkHealth(): Promise<{ healthy: boolean; message?: string }>;
export function closePool(): Promise<void>;
export function createPool(): Promise<Pool>;
