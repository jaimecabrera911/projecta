// src/lib/budget-templates.ts
// Gestión y persistencia de Plantillas de Presupuestos reutilizables para ObraFlow.
import {
	uid,
	type Budget,
	type BudgetChapter,
	type BudgetItem,
	DEFAULT_TAX_PARAMETERS
} from './budget-store.ts';
import { loadCatalog } from './catalog.ts';

export interface BudgetTemplate {
	id: string;
	name: string;
	description?: string;
	category: string;
	default_margin_percentage: number;
	tax_scheme?: 'iva' | 'aiu';
	vat_percentage?: number;
	admin_percentage?: number;
	contingency_percentage?: number;
	utility_percentage?: number;
	seller_commission_percentage?: number;
	chapters: BudgetChapter[];
	is_builtin?: boolean;
	created_at: string;
	updated_at: string;
}

export const TEMPLATE_STORAGE_KEY = 'obraflow_budget_templates';

export const DEFAULT_BUDGET_TEMPLATES: BudgetTemplate[] = [
	{
		id: 'tpl_bano_estandar',
		name: 'Remodelación Baño Estándar (3.5 m²)',
		description: 'Demolición, adecuación hidrosanitaria, impermeabilización, enchape completo y aparatos sanitarios.',
		category: 'Baños',
		default_margin_percentage: 30,
		tax_scheme: 'iva',
		vat_percentage: 19,
		seller_commission_percentage: 3,
		is_builtin: true,
		created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
		updated_at: new Date().toISOString(),
		chapters: [
			{
				id: 'bch_tpl_bano_01',
				order_index: 1,
				name: '1. Demoliciones y Retiros',
				items: [
					{
						id: 'bit_tpl_bano_01',
						chapter_id: 'bch_tpl_bano_01',
						catalog_item_id: 'cat_07',
						description: 'Demolición de enchape cerámico en muro y piso',
						category: 'labor',
						unit: 'm²',
						quantity: 18.5,
						unit_cost_internal: 8500,
						margin_percentage: 30
					},
					{
						id: 'bit_tpl_bano_02',
						chapter_id: 'bch_tpl_bano_01',
						catalog_item_id: 'cat_19',
						description: 'Retiro y disposición final de escombros en botadero',
						category: 'subcontract',
						unit: 'viaje',
						quantity: 1,
						unit_cost_internal: 240000,
						margin_percentage: 25
					}
				]
			},
			{
				id: 'bch_tpl_bano_02',
				order_index: 2,
				name: '2. Redes Hidrosanitarias',
				items: [
					{
						id: 'bit_tpl_bano_03',
						chapter_id: 'bch_tpl_bano_02',
						catalog_item_id: 'cat_09',
						description: 'Tubo PVC Sanitario 3 pulgadas Pavco (desagües)',
						category: 'material',
						unit: 'ml',
						quantity: 4,
						unit_cost_internal: 14200,
						margin_percentage: 30
					},
					{
						id: 'bit_tpl_bano_04',
						chapter_id: 'bch_tpl_bano_02',
						catalog_item_id: 'cat_16',
						description: 'Mano de obra punto hidráulico lavamanos y ducha',
						category: 'labor',
						unit: 'pto',
						quantity: 2,
						unit_cost_internal: 38000,
						margin_percentage: 30
					}
				]
			},
			{
				id: 'bch_tpl_bano_03',
				order_index: 3,
				name: '3. Enchapes e Instalaciones',
				items: [
					{
						id: 'bit_tpl_bano_05',
						chapter_id: 'bch_tpl_bano_03',
						catalog_item_id: 'cat_07',
						description: 'Cerámica Corona 30x60cm tráfico medio para baño',
						category: 'material',
						unit: 'm²',
						quantity: 22,
						unit_cost_internal: 46500,
						margin_percentage: 30
					},
					{
						id: 'bit_tpl_bano_06',
						chapter_id: 'bch_tpl_bano_03',
						catalog_item_id: 'cat_08',
						description: 'Pegacor Blanco Corona (bulto 25kg)',
						category: 'material',
						unit: 'un',
						quantity: 4,
						unit_cost_internal: 29800,
						margin_percentage: 30
					},
					{
						id: 'bit_tpl_bano_07',
						chapter_id: 'bch_tpl_bano_03',
						catalog_item_id: 'cat_15',
						description: 'Mano de obra instalación piso y muro cerámico',
						category: 'labor',
						unit: 'm²',
						quantity: 22,
						unit_cost_internal: 26000,
						margin_percentage: 30
					},
					{
						id: 'bit_tpl_bano_08',
						chapter_id: 'bch_tpl_bano_03',
						catalog_item_id: 'cat_18',
						description: 'División de baño en vidrio templado 8mm con acero inoxidable',
						category: 'subcontract',
						unit: 'un',
						quantity: 1,
						unit_cost_internal: 680000,
						margin_percentage: 25
					}
				]
			}
		]
	},
	{
		id: 'tpl_pintura_apartamento',
		name: 'Pintura y Estuco Integral (Apto 60 m²)',
		description: 'Preparación de muros, resanes, empapelado, estuco plástico y pintura vinilo Tipo 1 a 2 manos.',
		category: 'Pintura y Acabados',
		default_margin_percentage: 35,
		tax_scheme: 'iva',
		vat_percentage: 19,
		seller_commission_percentage: 2.5,
		is_builtin: true,
		created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
		updated_at: new Date().toISOString(),
		chapters: [
			{
				id: 'bch_tpl_pin_01',
				order_index: 1,
				name: '1. Preparación de Superficies',
				items: [
					{
						id: 'bit_tpl_pin_01',
						chapter_id: 'bch_tpl_pin_01',
						description: 'Lijado, limpieza de muros y protección de zócalos con cinta y plástico',
						category: 'labor',
						unit: 'm²',
						quantity: 140,
						unit_cost_internal: 3500,
						margin_percentage: 35
					}
				]
			},
			{
				id: 'bch_tpl_pin_02',
				order_index: 2,
				name: '2. Pintura y Acabados',
				items: [
					{
						id: 'bit_tpl_pin_02',
						chapter_id: 'bch_tpl_pin_02',
						catalog_item_id: 'cat_06',
						description: 'Pintura Vinilo Tipo 1 Blanco Superlavable (cuñete 5 gal)',
						category: 'material',
						unit: 'gl',
						quantity: 4,
						unit_cost_internal: 68000,
						margin_percentage: 30
					},
					{
						id: 'bit_tpl_pin_03',
						chapter_id: 'bch_tpl_pin_02',
						catalog_item_id: 'cat_14',
						description: 'Mano de obra pintura vinilo 2 manos en muros y cielos',
						category: 'labor',
						unit: 'm²',
						quantity: 140,
						unit_cost_internal: 7500,
						margin_percentage: 35
					}
				]
			}
		]
	},
	{
		id: 'tpl_cocina_integral',
		name: 'Adecuación Cocina Integral',
		description: 'Desmonte de cocina antigua, adecuación eléctrica e hidráulica y suministro de mueble con mesón granito.',
		category: 'Cocinas',
		default_margin_percentage: 28,
		tax_scheme: 'aiu',
		vat_percentage: 19,
		admin_percentage: 10,
		contingency_percentage: 3,
		utility_percentage: 7,
		seller_commission_percentage: 4,
		is_builtin: true,
		created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
		updated_at: new Date().toISOString(),
		chapters: [
			{
				id: 'bch_tpl_coc_01',
				order_index: 1,
				name: '1. Desmonte y Redes',
				items: [
					{
						id: 'bit_tpl_coc_01',
						chapter_id: 'bch_tpl_coc_01',
						description: 'Desmonte y retiro de mueble y mesón existente',
						category: 'labor',
						unit: 'un',
						quantity: 1,
						unit_cost_internal: 150000,
						margin_percentage: 30
					},
					{
						id: 'bit_tpl_coc_02',
						chapter_id: 'bch_tpl_coc_01',
						catalog_item_id: 'cat_16',
						description: 'Mano de obra adecuación punto eléctrico tomas/extractor',
						category: 'labor',
						unit: 'pto',
						quantity: 3,
						unit_cost_internal: 38000,
						margin_percentage: 30
					}
				]
			},
			{
				id: 'bch_tpl_coc_02',
				order_index: 2,
				name: '2. Mobiliario y Acabados',
				items: [
					{
						id: 'bit_tpl_coc_03',
						chapter_id: 'bch_tpl_coc_02',
						catalog_item_id: 'cat_17',
						description: 'Suministro e instalación cocina integral granito San Gabriel',
						category: 'subcontract',
						unit: 'ml',
						quantity: 2.8,
						unit_cost_internal: 1450000,
						margin_percentage: 25
					}
				]
			}
		]
	}
];

export function loadBudgetTemplates(): BudgetTemplate[] {
	try {
		const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed) && parsed.length > 0) {
				return parsed.map((tpl: any) => ({
					...tpl,
					tax_scheme: tpl.tax_scheme || 'iva',
					vat_percentage: typeof tpl.vat_percentage === 'number' ? tpl.vat_percentage : 19,
					admin_percentage: typeof tpl.admin_percentage === 'number' ? tpl.admin_percentage : 10,
					contingency_percentage: typeof tpl.contingency_percentage === 'number' ? tpl.contingency_percentage : 3,
					utility_percentage: typeof tpl.utility_percentage === 'number' ? tpl.utility_percentage : 5,
					seller_commission_percentage: typeof tpl.seller_commission_percentage === 'number' ? tpl.seller_commission_percentage : 0
				}));
			}
		}
	} catch (_) {}

	saveBudgetTemplates(DEFAULT_BUDGET_TEMPLATES);
	return [...DEFAULT_BUDGET_TEMPLATES];
}

export function saveBudgetTemplates(templates: BudgetTemplate[]) {
	try {
		localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
	} catch (_) {}
}

export function findBudgetTemplate(id: string): BudgetTemplate | null {
	return loadBudgetTemplates().find((t) => t.id === id) ?? null;
}

export function updateBudgetTemplate(template: BudgetTemplate): void {
	const templates = loadBudgetTemplates();
	const index = templates.findIndex((t) => t.id === template.id);
	template.updated_at = new Date().toISOString();
	if (index >= 0) {
		templates[index] = template;
	} else {
		templates.unshift(template);
	}
	saveBudgetTemplates(templates);
}

export interface DuplicateTemplateInput {
	sourceId: string;
	name?: string;
	description?: string;
	category?: string;
	default_margin_percentage?: number;
	syncCatalogPrices?: boolean;
}

/**
 * Duplica una plantilla existente creando una copia independiente y editable.
 */
export function duplicateBudgetTemplate(input: DuplicateTemplateInput): BudgetTemplate {
	const source = findBudgetTemplate(input.sourceId);
	if (!source) {
		throw new Error(`Plantilla no encontrada: ${input.sourceId}`);
	}

	const catalogById = input.syncCatalogPrices
		? new Map(loadCatalog().map((item) => [item.id, item]))
		: null;

	const now = new Date().toISOString();
	const newTemplateId = uid('tpl');

	const chapters: BudgetChapter[] = source.chapters.map((ch, idx) => {
		const newChId = uid('bch_tpl');
		return {
			id: newChId,
			order_index: idx + 1,
			name: ch.name,
			items: ch.items.map((it) => {
				const catalogItem = catalogById && it.catalog_item_id ? catalogById.get(it.catalog_item_id) : undefined;
				return {
					id: uid('bit_tpl'),
					chapter_id: newChId,
					catalog_item_id: it.catalog_item_id,
					description: it.description,
					category: it.category,
					unit: it.unit,
					quantity: it.quantity,
					unit_cost_internal: catalogItem ? catalogItem.unit_cost : it.unit_cost_internal,
					margin_percentage: it.margin_percentage,
					unit_sale_price: it.unit_sale_price
				};
			})
		};
	});

	const duplicate: BudgetTemplate = {
		id: newTemplateId,
		name: (input.name || `Copia de ${source.name}`).trim(),
		description: (input.description ?? source.description)?.trim(),
		category: input.category || source.category || 'General',
		default_margin_percentage: input.default_margin_percentage ?? source.default_margin_percentage,
		tax_scheme: source.tax_scheme || 'iva',
		vat_percentage: source.vat_percentage ?? 19,
		admin_percentage: source.admin_percentage ?? 10,
		contingency_percentage: source.contingency_percentage ?? 3,
		utility_percentage: source.utility_percentage ?? 5,
		seller_commission_percentage: source.seller_commission_percentage ?? 0,
		chapters,
		is_builtin: false,
		created_at: now,
		updated_at: now
	};

	const templates = loadBudgetTemplates();
	templates.unshift(duplicate);
	saveBudgetTemplates(templates);
	return duplicate;
}

export function deleteBudgetTemplate(id: string) {
	const templates = loadBudgetTemplates().filter((t) => t.id !== id);
	saveBudgetTemplates(templates);
}

export interface CreateTemplateInput {
	name: string;
	description?: string;
	category?: string;
	default_margin_percentage?: number;
	tax_scheme?: 'iva' | 'aiu';
	vat_percentage?: number;
	admin_percentage?: number;
	contingency_percentage?: number;
	utility_percentage?: number;
	seller_commission_percentage?: number;
	chapters?: BudgetChapter[];
}

/**
 * Crea una nueva plantilla reutilizable a partir de capítulos y partidas.
 */
export function createBudgetTemplate(input: CreateTemplateInput): BudgetTemplate {
	const now = new Date().toISOString();
	const templateId = uid('tpl');

	// Clona capítulos y partidas asignando nuevos IDs de plantilla para aislamiento
	const chapters: BudgetChapter[] = (input.chapters || []).map((ch, idx) => {
		const chId = uid('bch_tpl');
		return {
			id: chId,
			order_index: idx + 1,
			name: ch.name,
			items: ch.items.map((it) => ({
				id: uid('bit_tpl'),
				chapter_id: chId,
				catalog_item_id: it.catalog_item_id,
				description: it.description,
				category: it.category,
				unit: it.unit,
				quantity: it.quantity,
				unit_cost_internal: it.unit_cost_internal,
				margin_percentage: it.margin_percentage,
				unit_sale_price: it.unit_sale_price
			}))
		};
	});

	// Si no se proveyeron capítulos, inicia con un capítulo base para que el usuario pueda empezar a añadir partidas
	if (chapters.length === 0) {
		chapters.push({
			id: uid('bch_tpl'),
			order_index: 1,
			name: '1. Preliminares y Obra',
			items: []
		});
	}

	const newTemplate: BudgetTemplate = {
		id: templateId,
		name: input.name.trim(),
		description: input.description?.trim(),
		category: input.category?.trim() || 'General',
		default_margin_percentage: input.default_margin_percentage ?? 30,
		tax_scheme: input.tax_scheme ?? 'iva',
		vat_percentage: input.vat_percentage ?? 19,
		admin_percentage: input.admin_percentage ?? 10,
		contingency_percentage: input.contingency_percentage ?? 3,
		utility_percentage: input.utility_percentage ?? 5,
		seller_commission_percentage: input.seller_commission_percentage ?? 0,
		chapters,
		is_builtin: false,
		created_at: now,
		updated_at: now
	};

	const templates = loadBudgetTemplates();
	templates.unshift(newTemplate);
	saveBudgetTemplates(templates);
	return newTemplate;
}

/**
 * Guarda un presupuesto existente como una nueva plantilla de catálogo de presupuestos.
 */
export function createTemplateFromBudget(
	budget: Budget,
	optionsOrName?: string | {
		name?: string;
		description?: string;
		category?: string;
		defaultMarginPercentage?: number;
	},
	description?: string,
	category?: string
): BudgetTemplate {
	let name = `Plantilla: ${budget.title}`;
	let desc = description || `Generada a partir del presupuesto “${budget.title}”. Contiene ${budget.chapters.length} capítulos.`;
	let cat = category || 'Personalizada';
	let margin = budget.global_margin_percentage;

	if (typeof optionsOrName === 'string') {
		name = optionsOrName;
	} else if (optionsOrName && typeof optionsOrName === 'object') {
		if (optionsOrName.name) name = optionsOrName.name;
		if (optionsOrName.description) desc = optionsOrName.description;
		if (optionsOrName.category) cat = optionsOrName.category;
		if (typeof optionsOrName.defaultMarginPercentage === 'number') margin = optionsOrName.defaultMarginPercentage;
	}

	return createBudgetTemplate({
		name,
		description: desc,
		category: cat,
		default_margin_percentage: margin,
		tax_scheme: budget.tax_scheme,
		vat_percentage: budget.vat_percentage,
		admin_percentage: budget.admin_percentage,
		contingency_percentage: budget.contingency_percentage,
		utility_percentage: budget.utility_percentage,
		seller_commission_percentage: budget.seller_commission_percentage ?? 0,
		chapters: budget.chapters
	});
}

export interface CreateBudgetFromTemplateInput {
	templateId: string;
	title: string;
	lead_id?: string;
	client_name?: string;
	global_margin_percentage?: number;
	syncCatalogPrices?: boolean;
}

/**
 * Instancia un nuevo presupuesto borrador a partir de una plantilla.
 * Hereda estructura de capítulos, partidas, esquema fiscal y comisión comercial.
 * Opcionalmente actualiza los costos con el catálogo maestro vigente.
 */
export function createBudgetFromTemplate(input: CreateBudgetFromTemplateInput): Budget {
	const template = findBudgetTemplate(input.templateId);
	if (!template) {
		throw new Error(`Plantilla no encontrada: ${input.templateId}`);
	}

	const now = new Date().toISOString();
	const budgetId = uid('bgt');
	const margin = input.global_margin_percentage ?? template.default_margin_percentage;

	const catalogById = input.syncCatalogPrices
		? new Map(loadCatalog().map((item) => [item.id, item]))
		: null;

	const chapters: BudgetChapter[] = template.chapters.map((ch, chIdx) => {
		const newChapterId = uid('bch');
		return {
			id: newChapterId,
			order_index: chIdx + 1,
			name: ch.name,
			items: ch.items.map((it) => {
				const catalogItem = catalogById && it.catalog_item_id ? catalogById.get(it.catalog_item_id) : undefined;
				return {
					id: uid('bit'),
					chapter_id: newChapterId,
					catalog_item_id: it.catalog_item_id,
					description: it.description,
					category: it.category,
					unit: it.unit,
					quantity: it.quantity,
					unit_cost_internal: catalogItem ? catalogItem.unit_cost : it.unit_cost_internal,
					margin_percentage: margin
				};
			})
		};
	});

	return {
		id: budgetId,
		lead_id: input.lead_id,
		client_name: input.client_name,
		version: 1,
		title: input.title.trim(),
		status: 'draft',
		tax_scheme: template.tax_scheme ?? 'iva',
		vat_percentage: template.vat_percentage ?? 19,
		admin_percentage: template.admin_percentage ?? DEFAULT_TAX_PARAMETERS.admin_percentage,
		contingency_percentage: template.contingency_percentage ?? DEFAULT_TAX_PARAMETERS.contingency_percentage,
		utility_percentage: template.utility_percentage ?? DEFAULT_TAX_PARAMETERS.utility_percentage,
		global_margin_percentage: margin,
		seller_commission_percentage: template.seller_commission_percentage ?? 0,
		seller_name: undefined,
		chapters,
		created_at: now,
		updated_at: now
	};
}
