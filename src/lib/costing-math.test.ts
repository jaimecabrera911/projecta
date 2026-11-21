// src/lib/costing-math.test.ts
// Test de validación automatizada de los cálculos de Job Costing (HU-13)
// y verificación del escenario Gherkin de sobrecosto.

import assert from 'node:assert/strict';
import { calculateProjectCosting, getUtilizationStatus, type ExpenseRecord } from './costing-store.ts';

console.log('--- Iniciando tests de Job Costing (HU-13) ---');

// 1. Test de Semáforo Financiero
assert.equal(getUtilizationStatus(70.5), 'normal', 'Consumo < 85% debe ser normal');
assert.equal(getUtilizationStatus(84.9), 'normal', 'Consumo 84.9% debe ser normal');
assert.equal(getUtilizationStatus(85.0), 'warning', 'Consumo 85.0% debe ser warning');
assert.equal(getUtilizationStatus(99.9), 'warning', 'Consumo 99.9% debe ser warning');
assert.equal(getUtilizationStatus(100.0), 'danger', 'Consumo 100.0% debe ser danger');
assert.equal(getUtilizationStatus(105.4), 'danger', 'Consumo > 100% debe ser danger');
console.log('✓ Test 1: Semáforo financiero (normal, warning, danger) superado.');

// 2. Test del Escenario Gherkin (HU-13 Spec Líneas 81-91):
// Given un capítulo con Presupuesto Vigente de $2,000 y gastos acumulados de $1,800
// When se aprueba un nuevo gasto de campo de $350 imputado a ese capítulo
// Then el gasto real ejecutado sube a $2,150
// And el saldo disponible muestra -$150.00
// And el indicador del capítulo cambia a estado "danger" (rojo)
// And el margen real del proyecto se recalcula instantáneamente.

const initialExpenses: ExpenseRecord[] = [
	{
		id: 'exp_init_1',
		chapter_id: 'chap_demo',
		date: '2026-11-20',
		concept: 'Materiales base',
		category: 'material',
		registered_by: 'Residente',
		amount: 1800,
		receipt_url: '',
		vendor: 'Ferretería Demo',
		created_at: '2026-11-20T10:00:00Z'
	}
];

const testProject = {
	project_id: 'test_gherkin',
	title: 'Proyecto Gherkin HU-13',
	client_name: 'Cliente Test',
	address: 'Calle Falsa 123',
	status: 'active' as const,
	target_sale_price: 3000, // Margen proyectado base: (3000 - 2000)/3000 = 33.3%
	chapters: [
		{
			chapter_id: 'chap_demo',
			name: 'Capítulo Demo',
			order_index: 1,
			base_cost: 2000,
			change_orders_cost: 0,
			expenses: [...initialExpenses]
		}
	]
};

const stateBefore = calculateProjectCosting(testProject);
assert.equal(stateBefore.chapters[0].current_budget, 2000);
assert.equal(stateBefore.chapters[0].actual_spent, 1800);
assert.equal(stateBefore.chapters[0].variance, 200);
assert.equal(stateBefore.chapters[0].utilization_pct, 90.0);
assert.equal(stateBefore.chapters[0].status, 'warning');
assert.equal(stateBefore.projected_margin_pct, 33.3);
assert.equal(stateBefore.actual_current_margin_pct, 40.0); // (3000 - 1800)/3000 = 40%

// WHEN: se aprueba un nuevo gasto de campo de $350
testProject.chapters[0].expenses.push({
	id: 'exp_new_350',
	chapter_id: 'chap_demo',
	date: '2026-11-21',
	concept: 'Gasto imprevisto',
	category: 'material',
	registered_by: 'Residente',
	amount: 350,
	receipt_url: '',
	vendor: 'Ferretería Urgencias',
	created_at: '2026-11-21T11:00:00Z'
});

const stateAfter = calculateProjectCosting(testProject);

// THEN:
assert.equal(stateAfter.chapters[0].actual_spent, 2150, 'Gasto real debe subir a $2,150');
assert.equal(stateAfter.chapters[0].variance, -150, 'Saldo disponible debe ser -$150');
assert.equal(stateAfter.chapters[0].status, 'danger', 'Estado debe ser danger (rojo)');
assert.equal(stateAfter.chapters[0].utilization_pct, 107.5, '% de ejecución debe ser 107.5%');
assert.equal(stateAfter.actual_spent_cost, 2150, 'Total gastado del proyecto debe ser 2,150');
assert.equal(stateAfter.remaining_balance, -150, 'Saldo restante del proyecto debe ser -$150');
assert.equal(stateAfter.actual_current_margin_pct, 28.3, 'Margen real actual debe recalcularse a 28.3%');

console.log('✓ Test 2: Escenario Gherkin (sobrecosto -$150 y estado danger) superado con éxito.');
console.log('Todos los tests de HU-13 pasaron satisfactoriamente.');
