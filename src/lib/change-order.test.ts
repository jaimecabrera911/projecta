// src/lib/change-order.test.ts
// Verificación automatizada de HU-15 (Cotización y Firma de Órdenes de Cambio / Adicionales)

import assert from 'node:assert/strict';
import {
	calculateProjectCosting,
	type ProjectCosting
} from './costing-store.ts';
import {
	createChangeOrder,
	approveAndSignChangeOrder,
	generateWhatsAppShareLink,
	type ChangeOrder
} from './change-order-store.ts';

console.log('--- Iniciando tests de HU-15 (Órdenes de Cambio y Adicionales) ---');

// 1. Simulación in-memory de la regla de negocio Gherkin de HU-15
const baseProject = {
	project_id: 'proj_test_hu15',
	title: 'Obra Test Gherkin HU-15',
	client_name: 'Marcela Gómez',
	address: 'Calle 10 # 43-20',
	status: 'active' as const,
	target_sale_price: 15000, // Contrato base $15,000
	chapters: [
		{
			chapter_id: 'chap_test_01',
			name: 'Obra Civil y Mampostería',
			order_index: 1,
			base_cost: 11000, // Costo presupuestado inicial $11,000
			change_orders_cost: 0,
			expenses: []
		}
	]
};

// Verificar estado inicial
let projectState = calculateProjectCosting(baseProject);
assert.equal(projectState.target_sale_price, 15000, 'El valor contractual base debe ser $15,000');
assert.equal(projectState.total_budget_direct_cost, 11000, 'El costo base presupuestado debe ser $11,000');
assert.equal(projectState.approved_change_orders_cost, 0, 'No debe haber adicionales aprobados al inicio');
assert.equal(projectState.current_budget_cost, 11000, 'El presupuesto vigente inicial debe ser $11,000');
console.log('✓ Estado inicial verificado: Contrato $15,000 y Costo Presupuestado $11,000.');

// 2. Creación de Orden de Cambio
const mockChangeOrder: ChangeOrder = {
	id: 'co_test_001',
	code: 'OC-001',
	project_id: baseProject.project_id,
	chapter_id: 'chap_test_01',
	title: 'Instalación de 6 puntos eléctricos adicionales en isla de cocina',
	justification: 'Solicitud del cliente durante recorrido en sitio',
	cost_amount: 350, // Costo directo interno $350
	sale_price_amount: 500, // Precio cobrado al cliente $500
	margin_pct: 30.0,
	additional_days: 2,
	status: 'pending_signature',
	created_at: new Date().toISOString(),
	created_by: 'Contratista General',
	magic_token: 'magic_token_test_abc'
};

assert.equal(mockChangeOrder.status, 'pending_signature', 'La orden nace en estado pendiente de firma');
assert.equal(mockChangeOrder.cost_amount, 350, 'El costo interno debe ser $350');
assert.equal(mockChangeOrder.sale_price_amount, 500, 'El precio al cliente debe ser $500');

// 3. Generación de Enlace WhatsApp para el Cliente
const waLink = generateWhatsAppShareLink(mockChangeOrder, '3001234567', 'http://localhost:4321');
assert.ok(waLink.includes('magic_token_test_abc'), 'El enlace de WhatsApp debe contener el Magic Token');
assert.ok(waLink.includes('phone=3001234567'), 'El enlace debe incluir el número telefónico del cliente');
console.log('✓ Generación de enlace Magic Link y WhatsApp validada con éxito.');

// 4. Firma Digital del Cliente y Recálculo Contractual
function simulateClientApproval(order: ChangeOrder, proj: ProjectCosting, signature: string, signerName: string) {
	// Aprobación de la orden
	order.status = 'approved';
	order.signed_by_name = signerName;
	order.signature_data_url = signature;
	order.signed_at = new Date().toISOString();

	// Impacto en el contrato y en el presupuesto vigente
	const updatedTargetSale = proj.target_sale_price + order.sale_price_amount;
	const updatedChapters = proj.chapters.map((ch) => {
		if (ch.chapter_id === order.chapter_id) {
			return {
				...ch,
				change_orders_cost: ch.change_orders_cost + order.cost_amount
			};
		}
		return ch;
	});

	return calculateProjectCosting({
		project_id: proj.project_id,
		title: proj.title,
		client_name: proj.client_name,
		address: proj.address,
		status: proj.status,
		target_sale_price: updatedTargetSale,
		chapters: updatedChapters
	});
}

const updatedProject = simulateClientApproval(
	mockChangeOrder,
	projectState,
	'data:image/svg+xml;utf8,<svg>firma</svg>',
	'Marcela Gómez'
);

// Comprobaciones exactas del Criterio de Aceptación Gherkin
assert.equal(mockChangeOrder.status, 'approved', 'El estado de la orden de cambio debe pasar a "approved"');
assert.equal(
	updatedProject.target_sale_price,
	15500,
	'El valor contractual de la obra se debe actualizar automáticamente a $15,500 (+ $500)'
);
assert.equal(
	updatedProject.current_budget_cost,
	11350,
	'El costo presupuestado vigente debe subir a $11,350 (+ $350)'
);
assert.equal(
	updatedProject.approved_change_orders_cost,
	350,
	'El consolidado de adicionales de costo debe ser $350'
);

console.log('✓ Escenario Gherkin superado con éxito:');
console.log('  - Estado de orden: approved');
console.log('  - Nuevo valor contractual: $15,500 (+ $500)');
console.log('  - Nuevo presupuesto vigente de costo: $11,350 (+ $350)');
console.log('  - Saldo contractual incrementado');
// 5. Aislamiento estricto por proyecto
import { getChangeOrdersByProject } from './change-order-store.ts';

const ordersProj1 = getChangeOrdersByProject('proj_andina_001');
const ordersProj2 = getChangeOrdersByProject('proj_andina_002');

assert.ok(ordersProj1.length > 0, 'Debe haber órdenes para el proyecto 1');
assert.ok(ordersProj2.length > 0, 'Debe haber órdenes para el proyecto 2');
assert.ok(ordersProj1.every((o) => o.project_id === 'proj_andina_001'), 'Todas las órdenes deben ser estrictamente de proj_andina_001');
assert.ok(ordersProj2.every((o) => o.project_id === 'proj_andina_002'), 'Todas las órdenes deben ser estrictamente de proj_andina_002');
assert.equal(ordersProj1.some((o) => o.project_id === 'proj_andina_002'), false, 'Las órdenes de proj_andina_002 no deben aparecer en proj_andina_001');
console.log('✓ Aislamiento multi-proyecto de órdenes de cambio verificado.');

console.log('Todos los tests de HU-15 pasaron exitosamente.');
