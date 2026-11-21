// Tests para la gestión de plantillas de presupuesto (src/lib/budget-templates.ts)
import assert from 'node:assert/strict';

// Mock localStorage para entorno Node.js
const storage = new Map<string, string>();
(globalThis as any).localStorage = {
	getItem: (k: string) => storage.get(k) ?? null,
	setItem: (k: string, v: string) => storage.set(k, String(v)),
	removeItem: (k: string) => storage.delete(k),
	clear: () => storage.clear()
};

import {
	loadBudgetTemplates,
	createBudgetTemplate,
	createTemplateFromBudget,
	createBudgetFromTemplate,
	deleteBudgetTemplate,
	findBudgetTemplate,
	updateBudgetTemplate,
	duplicateBudgetTemplate,
	DEFAULT_BUDGET_TEMPLATES
} from './budget-templates.ts';
import type { Budget } from './budget-store.ts';

// 1. Carga inicial de plantillas maestras por defecto
const initialTemplates = loadBudgetTemplates();
assert.ok(initialTemplates.length >= 3, 'Debe incluir al menos las 3 plantillas predefinidas');
const banoTemplate = findBudgetTemplate('tpl_bano_estandar');
assert.ok(banoTemplate, 'Plantilla de baño debe existir');
assert.equal(banoTemplate?.category, 'Baños');
assert.ok(banoTemplate?.chapters.length >= 3);

// 2. Crear una nueva plantilla personalizada
const customTpl = createBudgetTemplate({
	name: 'Plantilla Fachada Casa 2 Pisos',
	description: 'Limpieza, hidrófugo y pintura elastomérica',
	category: 'Fachadas',
	default_margin_percentage: 32,
	chapters: [
		{
			id: 'ch_test_1',
			order_index: 1,
			name: 'Hidrolavado y Sellado',
			items: [
				{
					id: 'it_test_1',
					chapter_id: 'ch_test_1',
					description: 'Lavado con hidrolavadora 2500 psi',
					category: 'labor',
					unit: 'm²',
					quantity: 80,
					unit_cost_internal: 6000,
					margin_percentage: 32
				}
			]
		}
	]
});
assert.ok(customTpl.id.startsWith('tpl_'));
assert.equal(customTpl.name, 'Plantilla Fachada Casa 2 Pisos');

// 3. Crear plantilla a partir de un presupuesto existente
const dummyBudget: Budget = {
	id: 'bgt_dummy_01',
	title: 'Reforma Oficina Poblado',
	status: 'draft',
	version: 1,
	tax_scheme: 'iva',
	admin_percentage: 10,
	contingency_percentage: 5,
	utility_percentage: 5,
	vat_percentage: 19,
	global_margin_percentage: 28,
	seller_commission_percentage: 2.5,
	chapters: [
		{
			id: 'ch_oficina_1',
			order_index: 1,
			name: 'Divisiones Modulares',
			items: [
				{
					id: 'it_oficina_1',
					chapter_id: 'ch_oficina_1',
					description: 'Panel acústico tapizado',
					category: 'material',
					unit: 'm²',
					quantity: 15,
					unit_cost_internal: 85000,
					margin_percentage: 28
				}
			]
		}
	],
	created_at: new Date().toISOString()
};

const tplFromBudget = createTemplateFromBudget(dummyBudget, 'Plantilla Oficinas Modulares', 'Para oficinas abiertas', 'Comercial');
assert.equal(tplFromBudget.name, 'Plantilla Oficinas Modulares');
assert.equal(tplFromBudget.category, 'Comercial');
assert.equal(tplFromBudget.chapters.length, 1);
assert.notEqual(tplFromBudget.chapters[0].id, dummyBudget.chapters[0].id, 'Los IDs de capítulos deben ser únicos');
assert.equal(tplFromBudget.tax_scheme, 'iva');
assert.equal(tplFromBudget.seller_commission_percentage, 2.5);

// 4. Instanciar presupuesto a partir de la plantilla
const newBudget = createBudgetFromTemplate({
	templateId: tplFromBudget.id,
	title: 'Presupuesto Oficina 402 - Torre Médica',
	client_name: 'Dr. Roberto Gómez',
	global_margin_percentage: 30
});

assert.ok(newBudget.id.startsWith('bgt_'));
assert.equal(newBudget.title, 'Presupuesto Oficina 402 - Torre Médica');
assert.equal(newBudget.client_name, 'Dr. Roberto Gómez');
assert.equal(newBudget.global_margin_percentage, 30);
assert.equal(newBudget.tax_scheme, 'iva');
assert.equal(newBudget.seller_commission_percentage, 2.5, 'Debe heredar la comisión de la plantilla');
assert.equal(newBudget.chapters.length, 1);
assert.equal(newBudget.chapters[0].items[0].margin_percentage, 30);

// 5. Editar y actualizar plantilla
tplFromBudget.name = 'Plantilla Oficinas Modulares - Rev 2';
tplFromBudget.seller_commission_percentage = 4.0;
tplFromBudget.tax_scheme = 'aiu';
updateBudgetTemplate(tplFromBudget);
const updatedTpl = findBudgetTemplate(tplFromBudget.id);
assert.equal(updatedTpl?.name, 'Plantilla Oficinas Modulares - Rev 2');
assert.equal(updatedTpl?.seller_commission_percentage, 4.0);
assert.equal(updatedTpl?.tax_scheme, 'aiu');

// 6. Duplicar plantilla existente
const duplicatedTpl = duplicateBudgetTemplate({
	sourceId: 'tpl_bano_estandar',
	name: 'Remodelación Baño VIP'
});
assert.ok(duplicatedTpl.id.startsWith('tpl_'));
assert.notEqual(duplicatedTpl.id, 'tpl_bano_estandar');
assert.equal(duplicatedTpl.name, 'Remodelación Baño VIP');
assert.equal(duplicatedTpl.is_builtin, false);
assert.equal(duplicatedTpl.chapters.length, 3);
assert.notEqual(duplicatedTpl.chapters[0].id, 'bch_tpl_bano_01', 'Los IDs de capítulos deben ser aislados');

// 7. Eliminar plantilla
deleteBudgetTemplate(customTpl.id);
assert.equal(findBudgetTemplate(customTpl.id), null, 'La plantilla eliminada no debe existir');
deleteBudgetTemplate(duplicatedTpl.id);
assert.equal(findBudgetTemplate(duplicatedTpl.id), null);

console.log('budget-templates: OK');
