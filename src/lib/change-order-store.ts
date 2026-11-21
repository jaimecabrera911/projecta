// src/lib/change-order-store.ts
// HU-15: Cotización y Firma de Órdenes de Cambio (Adicionales de Obra)
// Motor de persistencia, generación de tokens públicos de firma y recálculo presupuestal.

import {
	loadAllProjects,
	saveCostingProject,
	getProjectById,
	calculateProjectCosting,
	type ProjectCosting
} from './costing-store.ts';

export type ChangeOrderStatus = 'draft' | 'pending_signature' | 'approved' | 'rejected';

export interface ChangeOrder {
	id: string;
	code: string; // Ej: "OC-001"
	project_id: string;
	chapter_id: string; // Capítulo al que se suma el costo interno
	title: string;
	justification: string;
	cost_amount: number; // Costo directo interno para la constructora
	sale_price_amount: number; // Precio cobrado al cliente final
	margin_pct: number; // Margen de ganancia calculado
	additional_days: number; // Prórroga al cronograma (ej. 2 días)
	status: ChangeOrderStatus;
	created_at: string;
	created_by: string;
	magic_token: string; // UUID v4 para link público sin contraseña
	// Datos de Aprobación y Firma Digital
	signature_data_url?: string;
	signed_by_name?: string;
	signed_by_id_number?: string;
	signed_at?: string;
	rejection_reason?: string;
}

export const STORAGE_KEY_CHANGE_ORDERS = 'obraflow_change_orders_v1';

/**
 * Genera un UUID v4 simple para Magic Links públicos.
 */
export function generateMagicToken(): string {
	return 'co_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/**
 * Carga todas las órdenes de cambio almacenadas localmente.
 */
export function loadAllChangeOrders(): ChangeOrder[] {
	if (typeof window === 'undefined') {
		return getInitialDemoChangeOrders();
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY_CHANGE_ORDERS);
		if (!raw) {
			const initial = getInitialDemoChangeOrders();
			localStorage.setItem(STORAGE_KEY_CHANGE_ORDERS, JSON.stringify(initial));
			return initial;
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : getInitialDemoChangeOrders();
	} catch (e) {
		console.error('Error cargando órdenes de cambio:', e);
		return getInitialDemoChangeOrders();
	}
}

/**
 * Guarda el array de órdenes de cambio en localStorage.
 */
export function saveAllChangeOrders(orders: ChangeOrder[]): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY_CHANGE_ORDERS, JSON.stringify(orders));
		window.dispatchEvent(new CustomEvent('obraflow:change-orders-updated'));
	} catch (e) {
		console.error('Error guardando órdenes de cambio:', e);
	}
}

/**
 * Obtiene las órdenes de cambio filtradas por proyecto.
 */
export function getChangeOrdersByProject(projectId: string): ChangeOrder[] {
	const all = loadAllChangeOrders();
	return all.filter((co) => co.project_id === projectId);
}

/**
 * Busca una orden de cambio por su ID único.
 */
export function getChangeOrderById(id: string): ChangeOrder | null {
	const all = loadAllChangeOrders();
	return all.find((co) => co.id === id) || null;
}

/**
 * Busca una orden de cambio por su Magic Token público de firma.
 */
export function getChangeOrderByToken(token: string): ChangeOrder | null {
	const all = loadAllChangeOrders();
	return all.find((co) => co.magic_token === token || co.id === token) || null;
}

/**
 * Crea una nueva orden de cambio y la deja lista para envío / firma.
 */
export function createChangeOrder(data: {
	project_id: string;
	chapter_id: string;
	title: string;
	justification: string;
	cost_amount: number;
	sale_price_amount: number;
	additional_days?: number;
	created_by?: string;
	status?: ChangeOrderStatus;
}): ChangeOrder {
	const all = loadAllChangeOrders();
	const projectOrders = all.filter((co) => co.project_id === data.project_id);
	const nextNum = projectOrders.length + 1;
	const code = `OC-${String(nextNum).padStart(3, '0')}`;

	const cost = Math.max(0, Number(data.cost_amount) || 0);
	const sale = Math.max(0, Number(data.sale_price_amount) || 0);
	const margin_pct = sale > 0 ? Math.round(((sale - cost) / sale) * 1000) / 10 : 0;

	const newOrder: ChangeOrder = {
		id: `co_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
		code,
		project_id: data.project_id,
		chapter_id: data.chapter_id,
		title: data.title.trim(),
		justification: data.justification.trim(),
		cost_amount: cost,
		sale_price_amount: sale,
		margin_pct,
		additional_days: Math.max(0, Number(data.additional_days) || 0),
		status: data.status || 'pending_signature',
		created_at: new Date().toISOString(),
		created_by: data.created_by || 'Contratista General',
		magic_token: generateMagicToken()
	};

	all.unshift(newOrder);
	saveAllChangeOrders(all);

	// Si se creó directamente como aprobada, aplicar recálculo presupuestal
	if (newOrder.status === 'approved') {
		applyChangeOrderToProject(newOrder);
	}

	return newOrder;
}

/**
 * Procesa la firma digital del cliente final sobre una orden de cambio.
 * REGLA DE NEGOCIO OBLIGATORIA (HU-15):
 * 1. Pasa el estado a "approved" con la firma y sello de tiempo.
 * 2. Actualiza el valor contractual del proyecto (+ sale_price_amount).
 * 3. Suma el costo directo interno (+ cost_amount) al capítulo imputado en Job Costing.
 */
export function approveAndSignChangeOrder(
	tokenOrId: string,
	signatureData: {
		signature_png_base64: string;
		signed_by_name: string;
		signed_by_id_number?: string;
	}
): { order: ChangeOrder; projectUpdated: boolean } {
	const all = loadAllChangeOrders();
	const index = all.findIndex((co) => co.magic_token === tokenOrId || co.id === tokenOrId);

	if (index === -1) {
		throw new Error(`Orden de cambio no encontrada para el token: ${tokenOrId}`);
	}

	const existing = all[index];
	if (existing.status === 'approved') {
		return { order: existing, projectUpdated: false };
	}

	const updated: ChangeOrder = {
		...existing,
		status: 'approved',
		signature_data_url: signatureData.signature_png_base64,
		signed_by_name: signatureData.signed_by_name.trim(),
		signed_by_id_number: signatureData.signed_by_id_number?.trim() || undefined,
		signed_at: new Date().toISOString()
	};

	all[index] = updated;
	saveAllChangeOrders(all);

	// Aplicar impacto automático en el presupuesto de Job Costing
	const projectUpdated = applyChangeOrderToProject(updated);

	if (typeof window !== 'undefined') {
		window.dispatchEvent(
			new CustomEvent('obraflow:change-order-approved', {
				detail: { order: updated, projectUpdated }
			})
		);
	}

	return { order: updated, projectUpdated };
}

/**
 * Rechaza una orden de cambio con motivo explicativo.
 */
export function rejectChangeOrder(tokenOrId: string, reason: string): ChangeOrder {
	const all = loadAllChangeOrders();
	const index = all.findIndex((co) => co.magic_token === tokenOrId || co.id === tokenOrId);
	if (index === -1) {
		throw new Error(`Orden de cambio no encontrada para el token: ${tokenOrId}`);
	}

	const updated: ChangeOrder = {
		...all[index],
		status: 'rejected',
		rejection_reason: reason.trim() || 'Rechazada por el cliente'
	};

	all[index] = updated;
	saveAllChangeOrders(all);
	return updated;
}

/**
 * Aplica el costo de la orden de cambio al proyecto y su capítulo en costing-store.
 */
export function applyChangeOrderToProject(order: ChangeOrder): boolean {
	const project = getProjectById(order.project_id);
	if (!project) return false;

	// 1. Incrementar el precio de venta del contrato
	const updatedTargetSale = (project.target_sale_price || 0) + order.sale_price_amount;

	// 2. Incrementar el costo del capítulo imputado
	let chapterFound = false;
	const updatedChapters = project.chapters.map((ch) => {
		if (ch.chapter_id === order.chapter_id) {
			chapterFound = true;
			return {
				...ch,
				change_orders_cost: (ch.change_orders_cost || 0) + order.cost_amount
			};
		}
		return ch;
	});

	// Si no se encontró el capítulo exacto, imputar al primer capítulo como fallback
	if (!chapterFound && updatedChapters.length > 0) {
		updatedChapters[0].change_orders_cost = (updatedChapters[0].change_orders_cost || 0) + order.cost_amount;
	}

	// 3. Recalcular métricas de Job Costing
	const recalculated = calculateProjectCosting({
		project_id: project.project_id,
		title: project.title,
		client_name: project.client_name,
		address: project.address,
		status: project.status,
		target_sale_price: updatedTargetSale,
		chapters: updatedChapters
	});

	saveCostingProject(recalculated);
	return true;
}

/**
 * Genera el enlace de WhatsApp pre-diligenciado con el Magic Link.
 */
export function generateWhatsAppShareLink(
	order: ChangeOrder,
	clientPhone: string = '',
	baseUrl: string = ''
): string {
	const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321');
	const link = `${origin}/change-orders/view?token=${encodeURIComponent(order.magic_token)}`;

	const formattedPrice = new Intl.NumberFormat('es-CO', {
		style: 'currency',
		currency: 'COP',
		maximumFractionDigits: 0
	}).format(order.sale_price_amount);

	const daysText = order.additional_days > 0 ? `\nPrórroga de entrega: +${order.additional_days} días hábiles` : '';

	const message = `Hola! Te compartimos la Orden de Cambio *${order.code}* para tu aprobación:\n\n*${order.title}*\nValor adicional: *${formattedPrice}*${daysText}\n\nPuedes revisar los detalles y firmar digitalmente desde tu celular aquí:\n${link}\n\nQuedamos atentos para iniciar los trabajos!`;

	const cleanPhone = clientPhone.replace(/\D/g, '');
	const phoneParam = cleanPhone ? `phone=${cleanPhone}&` : '';
	return `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(message)}`;
}

/**
 * Datos semilla iniciales de órdenes de cambio para testing de alta fidelidad.
 */
export function getInitialDemoChangeOrders(): ChangeOrder[] {
	return [
		{
			id: 'co_demo_001',
			code: 'OC-001',
			project_id: 'proj_andina_001',
			chapter_id: 'chap_03', // Instalaciones Hidrosanitarias y Gas
			title: 'Instalación de 6 puntos eléctricos adicionales en isla de cocina solicitados por el cliente',
			justification: 'El cliente solicitó agregar tomas empotradas pop-up en la isla central de mármol y circuito dedicado de 20A para torre de hornos.',
			cost_amount: 180000,
			sale_price_amount: 260000,
			margin_pct: 30.8,
			additional_days: 2,
			status: 'approved',
			created_at: '2026-11-18T10:30:00.000Z',
			created_by: 'Arq. Andrés Morales (Residente)',
			magic_token: 'co_token_demo_001_approved',
			signed_by_name: 'Marcela Gómez Restrepo',
			signed_by_id_number: 'CC 43.120.985',
			signed_at: '2026-11-18T16:45:00.000Z',
			signature_data_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10 90 40 T 170 30" stroke="%230F172A" stroke-width="2.5" fill="none"/></svg>'
		},
		{
			id: 'co_demo_002',
			code: 'OC-002',
			project_id: 'proj_andina_001',
			chapter_id: 'chap_04', // Acabados y Enchapes
			title: 'Cambio de grifería empotrada a acabado oro cepillado y nicho con luz LED en ducha',
			justification: 'Modificación del diseño original de baño principal solicitada por la propietaria durante la visita técnica del miércoles.',
			cost_amount: 450000,
			sale_price_amount: 680000,
			margin_pct: 33.8,
			additional_days: 3,
			status: 'pending_signature',
			created_at: '2026-11-20T14:15:00.000Z',
			created_by: 'Arq. Andrés Morales (Residente)',
			magic_token: 'co_token_demo_002_pending'
		},
		{
			id: 'co_demo_003',
			code: 'OC-001',
			project_id: 'proj_andina_002',
			chapter_id: 'chap_02_02',
			title: 'Refuerzo de insonorización acústica con doble panel de yeso en sala de juntas',
			justification: 'Requerimiento de confidencialidad para sala de conferencias de la gerencia médica.',
			cost_amount: 850000,
			sale_price_amount: 1250000,
			margin_pct: 32.0,
			additional_days: 2,
			status: 'pending_signature',
			created_at: '2026-11-19T09:00:00.000Z',
			created_by: 'Ing. Carlos Mendoza',
			magic_token: 'co_token_demo_003_pending'
		}
	];
}
