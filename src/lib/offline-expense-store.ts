// src/lib/offline-expense-store.ts
// HU-14: Registro Rápido de Gastos de Obra en 3 Toques (Mobile-First / PWA Offline)
// Motor de cola offline, compresión de imágenes en el cliente y sincronización automática.

import { addExpenseToChapter, type ExpenseCategory } from './costing-store.ts';

export interface OfflineExpenseItem {
	id: string;
	project_id: string;
	chapter_id: string;
	amount: number;
	concept: string;
	vendor: string;
	category: ExpenseCategory;
	receipt_photo: string; // Base64 dataURL o SVG
	photo_size_kb: number;
	registered_by: string;
	created_at: string;
	synced: boolean;
	synced_at?: string;
	offline_reason?: string;
}

export const STORAGE_KEY_OFFLINE_EXPENSES = 'obraflow_offline_expenses_queue_v1';
export const STORAGE_KEY_SIMULATED_OFFLINE = 'obraflow_simulated_offline_mode';

/**
 * Verifica si el dispositivo está offline (real o simulado para pruebas).
 */
export function isOffline(): boolean {
	if (typeof window === 'undefined') return false;
	const simulated = localStorage.getItem(STORAGE_KEY_SIMULATED_OFFLINE) === 'true';
	return simulated || !navigator.onLine;
}

/**
 * Activa o desactiva la simulación de modo sin señal (Sótano de Obra).
 */
export function setSimulatedOffline(enabled: boolean): boolean {
	if (typeof window === 'undefined') return false;
	try {
		localStorage.setItem(STORAGE_KEY_SIMULATED_OFFLINE, enabled ? 'true' : 'false');
		window.dispatchEvent(
			new CustomEvent('obraflow:network-status-changed', {
				detail: { isOffline: enabled || !navigator.onLine, simulated: enabled }
			})
		);
		if (!enabled && navigator.onLine) {
			// Si salimos del modo offline, disparar sincronización inmediata
			syncPendingExpenses();
		}
	} catch (e) {}
	return enabled;
}

/**
 * Carga todos los gastos registrados en la cola local.
 */
export function loadAllOfflineExpenses(): OfflineExpenseItem[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_EXPENSES);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch (e) {
		console.error('Error cargando cola de gastos offline:', e);
		return [];
	}
}

/**
 * Guarda un gasto en la cola local y, si hay conexión, lo sincroniza inmediatamente.
 */
export function recordQuickExpense(expenseData: {
	project_id: string;
	chapter_id: string;
	amount: number;
	concept: string;
	vendor: string;
	category?: ExpenseCategory;
	receipt_photo: string;
	photo_size_kb?: number;
	registered_by?: string;
	date?: string;
}): { item: OfflineExpenseItem; syncedImmediately: boolean } {
	const offlineNow = isOffline();
	const id = `offline_exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
	const now = new Date().toISOString();

	const item: OfflineExpenseItem = {
		id,
		project_id: expenseData.project_id,
		chapter_id: expenseData.chapter_id,
		amount: Math.max(0, Number(expenseData.amount) || 0),
		concept: expenseData.concept.trim() || 'Compra de materiales en campo',
		vendor: expenseData.vendor.trim() || 'Proveedor Local',
		category: expenseData.category || 'material',
		receipt_photo: expenseData.receipt_photo,
		photo_size_kb: expenseData.photo_size_kb || 45,
		registered_by: expenseData.registered_by || 'Residente de Obra',
		created_at: now,
		synced: !offlineNow,
		synced_at: offlineNow ? undefined : now,
		offline_reason: offlineNow ? 'Guardado sin conexión en sótano' : undefined
	};

	const queue = loadAllOfflineExpenses();
	queue.unshift(item);

	try {
		localStorage.setItem(STORAGE_KEY_OFFLINE_EXPENSES, JSON.stringify(queue));
	} catch (e) {
		console.error('Error guardando en cola offline:', e);
	}

	// Si hay conexión, imputar directamente en el almacén de Job Costing (HU-13)
	if (!offlineNow) {
		addExpenseToChapter(item.project_id, item.chapter_id, {
			concept: item.concept,
			category: item.category,
			registered_by: item.registered_by,
			amount: item.amount,
			vendor: item.vendor,
			receipt_url: item.receipt_photo,
			notes: 'Registrado desde PWA Móvil (HU-14)'
		});
	}

	window.dispatchEvent(
		new CustomEvent('obraflow:expense-recorded', {
			detail: { item, syncedImmediately: !offlineNow }
		})
	);

	return { item, syncedImmediately: !offlineNow };
}

/**
 * Sincroniza todos los gastos pendientes de la cola con el almacén central.
 */
export function syncPendingExpenses(): { syncedCount: number; remainingCount: number } {
	if (isOffline()) return { syncedCount: 0, remainingCount: countPendingExpenses() };

	const queue = loadAllOfflineExpenses();
	let syncedCount = 0;
	const now = new Date().toISOString();

	queue.forEach((item) => {
		if (!item.synced) {
			item.synced = true;
			item.synced_at = now;
			item.offline_reason = undefined;

			addExpenseToChapter(item.project_id, item.chapter_id, {
				concept: item.concept,
				category: item.category,
				registered_by: item.registered_by,
				amount: item.amount,
				vendor: item.vendor,
				receipt_url: item.receipt_photo,
				notes: `Sincronizado desde cola offline (creado: ${item.created_at})`
			});

			syncedCount++;
		}
	});

	if (syncedCount > 0) {
		try {
			localStorage.setItem(STORAGE_KEY_OFFLINE_EXPENSES, JSON.stringify(queue));
		} catch (e) {}

		window.dispatchEvent(
			new CustomEvent('obraflow:expenses-synced', {
				detail: { syncedCount, timestamp: now }
			})
		);
	}

	return { syncedCount, remainingCount: 0 };
}

/**
 * Cuenta cuántos gastos están pendientes de sincronizar.
 */
export function countPendingExpenses(): number {
	const queue = loadAllOfflineExpenses();
	return queue.filter((i) => !i.synced).length;
}

/**
 * Compresión de imágenes en cliente (HTML5 Canvas) a menos de 800 KB en < 1 segundo.
 */
export function compressImageClient(
	file: File,
	maxDimension = 1280,
	quality = 0.8
): Promise<{ dataUrl: string; sizeKb: number }> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = (event) => {
			const img = new Image();
			img.src = event.target?.result as string;
			img.onload = () => {
				let width = img.width;
				let height = img.height;

				if (width > maxDimension || height > maxDimension) {
					if (width > height) {
						height = Math.round((height * maxDimension) / width);
						width = maxDimension;
					} else {
						width = Math.round((width * maxDimension) / height);
						height = maxDimension;
					}
				}

				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					resolve({ dataUrl: img.src, sizeKb: Math.round(file.size / 1024) });
					return;
				}

				ctx.drawImage(img, 0, 0, width, height);

				// Exportar a WebP o JPEG con compresión ajustada
				const dataUrl = canvas.toDataURL('image/webp', quality);
				const approxSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

				resolve({ dataUrl, sizeKb: approxSizeKb });
			};
			img.onerror = () => reject(new Error('No se pudo decodificar la imagen'));
		};
		reader.onerror = (e) => reject(e);
	});
}
