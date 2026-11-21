// src/lib/client-portal-store.ts
// HU-19: Portal Web Consolidado del Cliente sin Contraseña (Magic Link).
// Consolida finanzas en vivo, pagos aplicados, saldo pendiente, documentos y fotos públicas de bitácora.

import {
	getProjectById,
	loadAllProjects,
	generateReceiptSvg,
	type ProjectCosting
} from './costing-store.ts';
import {
	getChangeOrdersByProject,
	type ChangeOrder
} from './change-order-store.ts';
import {
	getClientVisibleDailyLogs,
	type DailyLogEntry,
	type DailyLogPhoto
} from './daily-log-store.ts';

export interface ClientPaymentRecord {
	id: string;
	project_id: string;
	date: string; // YYYY-MM-DD
	concept: string;
	amount: number;
	method: string; // ej: "Transferencia Bancolombia", "Cheque de Gerencia"
	receipt_number: string; // ej: "REC-001"
	receipt_url?: string; // Data URL SVG del comprobante de caja
	created_at: string;
}

export interface ClientDocumentRecord {
	id: string;
	type: 'contract' | 'proposal' | 'annex';
	title: string;
	code: string;
	date: string;
	file_size: string;
	download_url?: string;
	is_signed: boolean;
	signed_at?: string;
}

export interface ClientPortalFinancials {
	base_contract_amount: number;
	approved_change_orders_amount: number;
	total_contract_value: number;
	total_paid_amount: number;
	remaining_balance: number;
	paid_percentage: number;
}

export interface ClientPortalData {
	project_id: string;
	magic_token: string;
	project_name: string;
	client_name: string;
	client_email?: string;
	client_phone?: string;
	property_address: string;
	contractor_company: string;
	contractor_nit: string;
	contractor_phone: string;
	contractor_logo_url?: string;
	status_label: string;
	financials: ClientPortalFinancials;
	payments: ClientPaymentRecord[];
	documents: {
		contract: ClientDocumentRecord;
		change_orders: ChangeOrder[];
	};
	pending_change_orders_count: number;
	daily_logs: DailyLogEntry[];
	public_photos: Array<DailyLogPhoto & { date: string }>;
	portal_url: string;
	whatsapp_share_url: string;
}

export const STORAGE_KEY_PORTAL_PAYMENTS = 'obraflow_portal_payments_v1';
export const STORAGE_KEY_PORTAL_TOKENS = 'obraflow_portal_tokens_v1';

// Mapeo inicial de tokens conocidos y estables para pruebas y enlaces directos
const DEFAULT_PROJECT_TOKENS: Record<string, string> = {
	'proj_andina_001': 'portal_restrepo_001',
	'proj_andina_002': 'portal_nova_002',
	'demo': 'portal_restrepo_001'
};

/**
 * Obtiene o asigna el Magic Token para un proyecto determinado.
 */
export function getPortalTokenForProject(projectId: string): string {
	if (DEFAULT_PROJECT_TOKENS[projectId]) {
		return DEFAULT_PROJECT_TOKENS[projectId];
	}
	if (typeof window === 'undefined') {
		return `portal_${projectId.replace(/[^a-zA-Z0-9]/g, '_')}`;
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY_PORTAL_TOKENS);
		const map: Record<string, string> = raw ? JSON.parse(raw) : {};
		if (!map[projectId]) {
			map[projectId] = `portal_${projectId}_${Math.random().toString(36).substring(2, 8)}`;
			localStorage.setItem(STORAGE_KEY_PORTAL_TOKENS, JSON.stringify(map));
		}
		return map[projectId];
	} catch (e) {
		return `portal_${projectId}`;
	}
}

/**
 * Resuelve el project_id a partir de un Magic Token.
 */
export function resolveProjectIdFromToken(token: string): string | null {
	const cleanToken = token.trim().toLowerCase();
	// Revisar tokens por defecto
	for (const [projId, tok] of Object.entries(DEFAULT_PROJECT_TOKENS)) {
		if (tok.toLowerCase() === cleanToken || projId.toLowerCase() === cleanToken) {
			return projId === 'demo' ? 'proj_andina_001' : projId;
		}
	}

	if (typeof window !== 'undefined') {
		try {
			const raw = localStorage.getItem(STORAGE_KEY_PORTAL_TOKENS);
			if (raw) {
				const map: Record<string, string> = JSON.parse(raw);
				for (const [projId, tok] of Object.entries(map)) {
					if (tok.toLowerCase() === cleanToken) {
						return projId;
					}
				}
			}
		} catch (e) {}
	}

	// Si el token inicia con "portal_proj_", extraer el ID
	if (cleanToken.startsWith('portal_proj_')) {
		const candidate = cleanToken.replace('portal_', '');
		return candidate;
	}

	// Fallback por defecto si no se encuentra
	return 'proj_andina_001';
}

/**
 * Carga todos los pagos registrados localmente.
 */
export function loadAllPortalPayments(): ClientPaymentRecord[] {
	if (typeof window === 'undefined') {
		return getInitialDemoPayments();
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY_PORTAL_PAYMENTS);
		if (!raw) {
			const initial = getInitialDemoPayments();
			localStorage.setItem(STORAGE_KEY_PORTAL_PAYMENTS, JSON.stringify(initial));
			return initial;
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : getInitialDemoPayments();
	} catch (e) {
		console.error('Error cargando pagos de cliente:', e);
		return getInitialDemoPayments();
	}
}

/**
 * Guarda el array de pagos en localStorage.
 */
export function saveAllPortalPayments(payments: ClientPaymentRecord[]): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY_PORTAL_PAYMENTS, JSON.stringify(payments));
		window.dispatchEvent(new CustomEvent('obraflow:portal-payments-updated'));
	} catch (e) {
		console.error('Error guardando pagos de cliente:', e);
	}
}

/**
 * Obtiene los pagos de un proyecto.
 */
export function getPaymentsByProject(projectId: string): ClientPaymentRecord[] {
	const all = loadAllPortalPayments();
	return all.filter((p) => p.project_id === projectId);
}

/**
 * Registra un nuevo pago/abono de cliente.
 */
export function recordClientPayment(data: {
	project_id: string;
	date: string;
	concept: string;
	amount: number;
	method: string;
}): ClientPaymentRecord {
	const all = loadAllPortalPayments();
	const nextNum = all.filter((p) => p.project_id === data.project_id).length + 1;
	const receiptNumber = `RC-${String(nextNum).padStart(3, '0')}`;
	const receiptSvg = generateReceiptSvg('Construcciones Andina S.A.S.', data.amount, data.concept, data.date);

	const newPayment: ClientPaymentRecord = {
		id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
		project_id: data.project_id,
		date: data.date,
		concept: data.concept.trim(),
		amount: Math.max(0, data.amount),
		method: data.method.trim() || 'Transferencia Bancaria',
		receipt_number: receiptNumber,
		receipt_url: receiptSvg,
		created_at: new Date().toISOString()
	};

	all.push(newPayment);
	saveAllPortalPayments(all);
	return newPayment;
}

/**
 * Obtiene la estructura consolidada para renderizar el Portal Web del Cliente (HU-19).
 */
export function getClientPortalData(tokenOrProjectId: string): ClientPortalData | null {
	const resolvedProjectId = resolveProjectIdFromToken(tokenOrProjectId) || tokenOrProjectId;
	const project = getProjectById(resolvedProjectId);

	if (!project) {
		return null;
	}

	const token = getPortalTokenForProject(project.project_id);
	const changeOrders = getChangeOrdersByProject(project.project_id);
	const payments = getPaymentsByProject(project.project_id);
	const publicDailyLogs = getClientVisibleDailyLogs(project.project_id);

	// 1. Cálculos Financieros
	const baseContractAmount = project.target_sale_price || 64500000;
	// Sumar precio cobrado al cliente de órdenes de cambio aprobadas
	const approvedChangeOrdersAmount = changeOrders
		.filter((co) => co.status === 'approved')
		.reduce((sum, co) => sum + (Number(co.sale_price_amount) || 0), 0);

	const totalContractValue = baseContractAmount + approvedChangeOrdersAmount;
	const totalPaidAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
	const remainingBalance = Math.max(0, totalContractValue - totalPaidAmount);
	const paidPercentage = totalContractValue > 0
		? Math.min(100, Math.round((totalPaidAmount / totalContractValue) * 1000) / 10)
		: 0;

	// 2. Órdenes de cambio pendientes de firma
	const pendingChangeOrders = changeOrders.filter((co) => co.status === 'pending_signature');

	// 3. Extracción de fotos públicas de la memoria técnica de obra
	const publicPhotos: Array<DailyLogPhoto & { date: string }> = [];
	publicDailyLogs.forEach((log) => {
		(log.photos || []).forEach((photo) => {
			publicPhotos.push({
				...photo,
				date: log.date
			});
		});
	});

	// Ordenar fotos cronológicamente inverso (más reciente primero)
	publicPhotos.sort((a, b) => b.date.localeCompare(a.date));

	const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321';
	const portalUrl = `${origin}/portal/${token}`;

	const contractorCompany = 'Construcciones Andina S.A.S.';
	const contractorPhone = '+57 300 215 4890';
	const whatsappMsg = encodeURIComponent(
		`Hola ${project.client_name}, te comparto el acceso privado a tu portal de obra en ObraFlow. Aquí puedes revisar tu saldo al día, pagos y fotos de avance: ${portalUrl}`
	);
	const whatsappShareUrl = `https://api.whatsapp.com/send?text=${whatsappMsg}`;

	return {
		project_id: project.project_id,
		magic_token: token,
		project_name: project.title,
		client_name: project.client_name,
		client_phone: '+57 310 445 8920',
		property_address: project.address,
		contractor_company: contractorCompany,
		contractor_nit: 'NIT: 900.518.231-1',
		contractor_phone: contractorPhone,
		status_label: 'En Ejecución • Semana 3',
		financials: {
			base_contract_amount: baseContractAmount,
			approved_change_orders_amount: approvedChangeOrdersAmount,
			total_contract_value: totalContractValue,
			total_paid_amount: totalPaidAmount,
			remaining_balance: remainingBalance,
			paid_percentage: paidPercentage
		},
		payments,
		documents: {
			contract: {
				id: 'doc_contract_01',
				type: 'contract',
				title: 'Contrato Principal de Obra Civil y Remodelación',
				code: `CTR-${project.project_id.toUpperCase()}-2026`,
				date: '2026-11-02',
				file_size: '1.4 MB (PDF)',
				download_url: '#',
				is_signed: true,
				signed_at: '2026-11-02T10:00:00Z'
			},
			change_orders: changeOrders
		},
		pending_change_orders_count: pendingChangeOrders.length,
		daily_logs: publicDailyLogs,
		public_photos: publicPhotos,
		portal_url: portalUrl,
		whatsapp_share_url: whatsappShareUrl
	};
}

/**
 * Restablece los pagos demo iniciales.
 */
export function resetDemoPortalPayments(): ClientPaymentRecord[] {
	const initial = getInitialDemoPayments();
	saveAllPortalPayments(initial);
	return initial;
}

/**
 * Datos semilla realistas para el Dr. Andrés Restrepo (Penthouse El Poblado).
 */
export function getInitialDemoPayments(): ClientPaymentRecord[] {
	return [
		{
			id: 'pay_001',
			project_id: 'proj_andina_001',
			date: '2026-11-04',
			concept: 'Anticipo inicial 50% según cláusula 4ta del contrato de obra',
			amount: 32250000, // 50% de $64,500,000 COP
			method: 'Transferencia Bancolombia Cta. Corriente',
			receipt_number: 'RC-001',
			receipt_url: generateReceiptSvg(
				'Construcciones Andina S.A.S.',
				32250000,
				'Anticipo 50% obra Penthouse El Poblado',
				'2026-11-04'
			),
			created_at: '2026-11-04T10:30:00Z'
		},
		{
			id: 'pay_002',
			project_id: 'proj_andina_001',
			date: '2026-11-18',
			concept: 'Segundo abono por terminación de demoliciones y replanteo hidrosanitario',
			amount: 12000000,
			method: 'Transferencia Bancolombia Cta. Corriente',
			receipt_number: 'RC-002',
			receipt_url: generateReceiptSvg(
				'Construcciones Andina S.A.S.',
				12000000,
				'Segundo abono de obra civil',
				'2026-11-18'
			),
			created_at: '2026-11-18T15:20:00Z'
		},
		{
			id: 'pay_003',
			project_id: 'proj_andina_002',
			date: '2026-11-10',
			concept: 'Anticipo 40% adecuación oficinas coworking',
			amount: 35000000,
			method: 'Transferencia Davivienda',
			receipt_number: 'RC-101',
			receipt_url: generateReceiptSvg(
				'Construcciones Andina S.A.S.',
				35000000,
				'Anticipo adecuación oficinas coworking',
				'2026-11-10'
			),
			created_at: '2026-11-10T11:00:00Z'
		}
	];
}
