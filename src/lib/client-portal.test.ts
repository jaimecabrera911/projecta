// src/lib/client-portal.test.ts
// Tests automatizados para HU-19: Portal Web Consolidado del Cliente sin Contraseña (Magic Link).
// Criterios de Aceptación Gherkin, Cálculos Financieros, Segregación de Documentos y Aislamiento de Privacidad.

import assert from 'node:assert/strict';
import {
	getClientPortalData,
	getPortalTokenForProject,
	resolveProjectIdFromToken,
	recordClientPayment,
	getPaymentsByProject,
	loadAllPortalPayments,
	saveAllPortalPayments,
	type ClientPortalData
} from './client-portal-store.ts';
import {
	createDailyLog,
	getClientVisibleDailyLogs
} from './daily-log-store.ts';
import {
	createChangeOrder,
	approveAndSignChangeOrder
} from './change-order-store.ts';

console.log('--- Iniciando tests de HU-19 (Portal Web del Cliente sin Contraseña) ---');

// Mock localStorage y entorno de navegador para Node.js
const storageMap = new Map<string, string>();
(globalThis as any).localStorage = {
	getItem: (k: string) => storageMap.get(k) || null,
	setItem: (k: string, v: string) => storageMap.set(k, v),
	removeItem: (k: string) => storageMap.delete(k),
	clear: () => storageMap.clear()
};
(globalThis as any).window = {
	dispatchEvent: () => true,
	location: {
		origin: 'http://localhost:4321'
	}
};
(globalThis as any).CustomEvent = class CustomEvent {
	type: string;
	detail?: any;
	constructor(type: string, detail?: any) {
		this.type = type;
		this.detail = detail;
	}
};

// =========================================================================
// ESCENARIO GHERKIN 1: Resolución y Acceso por Magic Link sin Contraseña
// Given que el cliente recibe su enlace en WhatsApp con token 'portal_restrepo_001'
// When el sistema procesa el token
// Then resuelve correctamente el ID del proyecto 'proj_andina_001'
// And genera un enlace canónico con protocolo y origen
// =========================================================================
console.log('Test 1: Resolución de Magic Token y acceso sin autenticación');
const resolvedProjId = resolveProjectIdFromToken('portal_restrepo_001');
assert.equal(resolvedProjId, 'proj_andina_001', 'Debe resolver el proyecto de Remodelación Restrepo');

const resolvedProjId2 = resolveProjectIdFromToken('portal_nova_002');
assert.equal(resolvedProjId2, 'proj_andina_002', 'Debe resolver el segundo proyecto');

const resolvedDemo = resolveProjectIdFromToken('demo');
assert.equal(resolvedDemo, 'proj_andina_001', 'Debe resolver el alias demo al proyecto principal');

const generatedToken = getPortalTokenForProject('proj_andina_001');
assert.equal(generatedToken, 'portal_restrepo_001', 'Token debe ser consistente');

// =========================================================================
// ESCENARIO GHERKIN 2: Consolidación Financiera (Base + Adicionales - Abonos = Saldo)
// Given un proyecto con contrato base y órdenes de cambio aprobadas
// When se obtiene la data del portal del cliente
// Then el valor total contratado es igual a base + órdenes aprobadas
// And el saldo restante es igual a total - abonos realizados
// And el porcentaje pagado se calcula correctamente
// =========================================================================
console.log('Test 2: Consolidación y consistencia financiera del portal');
const portalData = getClientPortalData('portal_restrepo_001');
assert.ok(portalData, 'Debe devolver la estructura de portal para el token');
assert.equal(portalData.magic_token, 'portal_restrepo_001');
assert.equal(portalData.project_name, 'Remodelación Penthouse El Poblado');
assert.equal(portalData.client_name, 'Dr. Andrés Restrepo');

const fin = portalData.financials;
assert.ok(fin.base_contract_amount > 0, 'Monto contractual base debe ser positivo');
assert.equal(
	fin.total_contract_value,
	fin.base_contract_amount + fin.approved_change_orders_amount,
	'Total contratado = Base + Órdenes de cambio aprobadas'
);
assert.equal(
	fin.remaining_balance,
	fin.total_contract_value - fin.total_paid_amount,
	'Saldo restante = Total contratado - Total pagado'
);
assert.ok(fin.paid_percentage >= 0 && fin.paid_percentage <= 100, 'Porcentaje debe estar entre 0 y 100');
assert.equal(
	fin.paid_percentage,
	Math.round((fin.total_paid_amount / fin.total_contract_value) * 1000) / 10,
	'Porcentaje pagado debe coincidir con cálculo de precisión decimal'
);

// =========================================================================
// ESCENARIO GHERKIN 3: Historial de Abonos y Soporte de Recibo de Caja
// Given la lista de abonos realizados por el cliente
// When se consulta el historial de pagos
// Then cada pago contiene id, fecha, concepto, valor, método y soporte de recibo
// And registrar un nuevo abono incrementa el monto pagado y reduce el saldo
// =========================================================================
console.log('Test 3: Historial de abonos y actualización dinámica tras nuevo pago');
const initialPaid = fin.total_paid_amount;
const initialBalance = fin.remaining_balance;

const nuevoPago = recordClientPayment({
	project_id: 'proj_andina_001',
	date: '2026-11-21',
	concept: 'Tercer Abono Parcial por Avance de Redes Hidráulicas',
	amount: 5000000,
	method: 'Transferencia Bancaria Bancolombia'
});

assert.ok(nuevoPago.id, 'Debe generar ID de pago');
assert.equal(nuevoPago.amount, 5000000);
assert.ok(nuevoPago.receipt_number.startsWith('RC-'), 'Debe generar consecutivo de recibo de caja');
assert.ok(nuevoPago.receipt_url && nuevoPago.receipt_url.length > 50, 'Debe generar SVG/URL de soporte de recibo');

// Reconsultar portal data
const updatedPortalData = getClientPortalData('portal_restrepo_001')!;
assert.equal(
	updatedPortalData.financials.total_paid_amount,
	initialPaid + 5000000,
	'Total pagado debe incrementarse en 5,000,000'
);
assert.equal(
	updatedPortalData.financials.remaining_balance,
	initialBalance - 5000000,
	'Saldo pendiente debe reducirse en 5,000,000'
);

// =========================================================================
// ESCENARIO GHERKIN 4: Detección de Órdenes de Cambio Pendientes y Banner de Alerta
// Given que el contratista envía una orden de cambio adicional para aprobación
// When la orden está en estado 'pending_signature'
// Then pending_change_orders_count debe ser mayor a 0
// And el portal refleja la necesidad de firma del cliente
// =========================================================================
console.log('Test 4: Detección de órdenes de cambio pendientes de firma');
const co = createChangeOrder({
	project_id: 'proj_andina_001',
	chapter_id: 'chap_01',
	title: 'Ampliación de Nicho e Iluminación LED en Ducha',
	justification: 'Se solicita nicho decorativo con tira LED impermeable',
	cost_amount: 450000,
	sale_price_amount: 720000
});

const portalConPendiente = getClientPortalData('portal_restrepo_001')!;
assert.ok(
	portalConPendiente.pending_change_orders_count >= 1,
	'Debe registrar al menos 1 orden pendiente de firma'
);
const coPendiente = portalConPendiente.documents.change_orders.find((c) => c.id === co.id);
assert.ok(coPendiente, 'La orden creada debe listarse en los documentos del cliente');
assert.equal(coPendiente?.status, 'pending_signature');

// =========================================================================
// ESCENARIO GHERKIN 5: Aislamiento Estricto de Privacidad en Bitácora y Fotos
// Given bitácoras con visible_to_client = false (confidenciales) y true (públicas)
// When el portal del cliente solicita las bitácoras y fotos de avance
// Then el portal NO contiene ninguna bitácora privada
// And todas las fotos mostradas corresponden a publicaciones públicas autorizadas
// =========================================================================
console.log('Test 5: Aislamiento riguroso de privacidad en feed y fotos del cliente');
const logPrivado = createDailyLog({
	project_id: 'proj_andina_001',
	date: '2026-11-21',
	weather: 'cloudy',
	officials_count: 2,
	helpers_count: 1,
	downtime_hours: 3,
	downtime_reason: 'Discusión interna de garantías con subcontratista',
	notes: 'NOTA INTERNA ULTRA CONFIDENCIAL: Falla estructural menor corregida sin alertar al cliente.',
	visible_to_client: false,
	tasks_progress: [],
	photos: [
		{
			id: 'photo_privada_01',
			url: 'data:image/svg+xml;utf8,<svg><text>Fisura</text></svg>',
			caption: 'Fisura interna corregida',
			timestamp: '2026-11-21T10:00:00Z',
			watermark_applied: true
		}
	],
	author_name: 'Ing. Mateo Gómez',
	author_role: 'Residente de Obra'
});

const logPublico = createDailyLog({
	project_id: 'proj_andina_001',
	date: '2026-11-21',
	weather: 'sunny',
	officials_count: 4,
	helpers_count: 2,
	downtime_hours: 0,
	downtime_reason: '',
	notes: 'Avance exitoso: enchape de porcelanato 60x120 finalizado en baño principal.',
	visible_to_client: true,
	tasks_progress: [],
	photos: [
		{
			id: 'photo_publica_01',
			url: 'data:image/svg+xml;utf8,<svg><text>Enchape</text></svg>',
			caption: 'Enchape porcelanato baño',
			timestamp: '2026-11-21T16:00:00Z',
			watermark_applied: true
		}
	],
	author_name: 'Ing. Mateo Gómez',
	author_role: 'Residente de Obra'
});

const portalDataFinal = getClientPortalData('portal_restrepo_001')!;

// 1. Verificar que el log privado NO está en daily_logs del portal
const containsPrivateLog = portalDataFinal.daily_logs.some((l) => l.id === logPrivado.id);
assert.equal(containsPrivateLog, false, 'El portal del cliente NUNCA debe incluir bitácoras privadas');

// 2. Verificar que el texto de la nota interna no se fuga
const notesLeaked = portalDataFinal.daily_logs.some((l) => l.notes.includes('ULTRA CONFIDENCIAL'));
assert.equal(notesLeaked, false, 'Las notas confidenciales jamás deben filtrarse');

// 3. Verificar que la foto privada no aparece en las fotos públicas
const containsPrivatePhoto = portalDataFinal.public_photos.some((p) => p.id === 'photo_privada_01');
assert.equal(containsPrivatePhoto, false, 'Las fotos de bitácoras privadas no deben exponerse al cliente');

// 4. Verificar que el log público y su foto SÍ están incluidos
const containsPublicLog = portalDataFinal.daily_logs.some((l) => l.id === logPublico.id);
assert.equal(containsPublicLog, true, 'El portal del cliente debe incluir la bitácora pública');
const containsPublicPhoto = portalDataFinal.public_photos.some((p) => p.id === 'photo_publica_01');
assert.equal(containsPublicPhoto, true, 'La foto de la bitácora pública debe estar en la galería');

// =========================================================================
// ESCENARIO GHERKIN 6: Enlace de Compartir por WhatsApp
// Given el portal del cliente generado
// When se inspecciona whatsapp_share_url
// Then contiene la API de WhatsApp con mensaje personalizado y URL directa
// =========================================================================
console.log('Test 6: Enlace de compartir por WhatsApp con 1 solo toque');
assert.ok(portalDataFinal.whatsapp_share_url.startsWith('https://api.whatsapp.com/send?text='), 'Debe apuntar a la API de WhatsApp');
assert.ok(portalDataFinal.whatsapp_share_url.includes('Restrepo'), 'Debe incluir el nombre del cliente');
assert.ok(portalDataFinal.whatsapp_share_url.includes('portal_restrepo_001'), 'Debe incluir el token del portal');

console.log('--- TODOS LOS TESTS DE HU-19 HAN PASADO EXITOSAMENTE ---');
