// src/lib/budget-store.ts
// Persistencia local de HU-06. Los capítulos anidan sus partidas para simplificar el editor;
// al persistir se mantiene el contrato de campos de budgets / budget_chapters / budget_items.
import { calcLine, calcTotals, type BudgetTotals } from './budget-math';
import { loadCatalog } from './catalog';

export type BudgetCategory = 'material' | 'labor' | 'subcontract' | 'equipment';
export type BudgetStatus = 'draft' | 'sent' | 'approved' | 'frozen';

export interface BudgetSignature {
	signer_name: string;
	signer_id_number: string;
	signature_png_base64: string;
	signed_at: string;
	signer_user_agent?: string;
	screen_resolution?: string;
	referrer?: string;
	contract_hash_sha256?: string;
	terms_accepted: boolean;
	proposal_token?: string;
}

// HU-07: parámetros del motor tributario dual (IVA general / AIU).
export interface TaxParameters {
	admin_percentage: number;
	contingency_percentage: number;
	utility_percentage: number;
	vat_percentage: number;
}

export const DEFAULT_TAX_PARAMETERS: TaxParameters = {
	admin_percentage: 10,
	contingency_percentage: 5,
	utility_percentage: 5,
	vat_percentage: 19
};

export interface BudgetItem {
	id: string;
	chapter_id: string;
	catalog_item_id?: string;
	description: string;
	category: BudgetCategory;
	unit: string;
	quantity: number;
	unit_cost_internal: number;
	margin_percentage: number;
	unit_sale_price?: number;
}

export interface BudgetChapter {
	id: string;
	order_index: number;
	name: string;
	collapsed?: boolean;
	items: BudgetItem[];
}

export interface Budget {
	id: string;
	lead_id?: string;
	client_name?: string;
	version: number;
	title: string;
	status: BudgetStatus;
	tax_scheme: 'iva' | 'aiu';
	admin_percentage: number;
	contingency_percentage: number;
	utility_percentage: number;
	vat_percentage: number;
	global_margin_percentage: number;
	chapters: BudgetChapter[];
	created_at: string;
	updated_at?: string;
	signature?: BudgetSignature;
}

export interface NewBudgetInput {
	title: string;
	lead_id?: string;
	client_name?: string;
	global_margin_percentage: number;
}

const STORAGE_KEY = 'obraflow_budgets';

export function uid(prefix: string): string {
	return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function allItems(budget: Budget): BudgetItem[] {
	return budget.chapters.flatMap((chapter) => chapter.items);
}

export function budgetTotals(budget: Budget): BudgetTotals {
	return calcTotals(allItems(budget));
}

function buildSeedBudget(): Budget {
	const now = new Date();
	const chapterOne: BudgetChapter = {
		id: 'bch_seed_01',
		order_index: 1,
		name: 'Demoliciones y Retiros',
		items: [
			{
				id: 'bit_seed_01',
				chapter_id: 'bch_seed_01',
				catalog_item_id: 'cat_07',
				description: 'Demolición de enchape cerámico en muro',
				category: 'labor',
				unit: 'm²',
				quantity: 18.5,
				unit_cost_internal: 8500,
				margin_percentage: 30
			},
			{
				id: 'bit_seed_02',
				chapter_id: 'bch_seed_01',
				catalog_item_id: 'cat_19',
				description: 'Retiro y disposición final de escombros',
				category: 'subcontract',
				unit: 'viaje',
				quantity: 2,
				unit_cost_internal: 240000,
				margin_percentage: 25
			}
		]
	};

	const chapterTwo: BudgetChapter = {
		id: 'bch_seed_02',
		order_index: 2,
		name: 'Mampostería y Pañetes',
		items: [
			{
				id: 'bit_seed_03',
				chapter_id: 'bch_seed_02',
				catalog_item_id: 'cat_12',
				description: 'Muro bloque 10cm con pañete liso',
				category: 'labor',
				unit: 'm²',
				quantity: 40,
				unit_cost_internal: 48000,
				margin_percentage: 25
			},
			{
				id: 'bit_seed_04',
				chapter_id: 'bch_seed_02',
				catalog_item_id: 'cat_16',
				description: 'Punto hidráulico para lavamanos',
				category: 'labor',
				unit: 'pto',
				quantity: 3,
				unit_cost_internal: 145000,
				margin_percentage: 30
			}
		]
	};

	return {
		id: 'bgt_seed_01',
		lead_id: 'lead_03',
		client_name: 'Felipe Restrepo',
		version: 1,
		title: 'Remodelación Baño Principal — Castropol',
		status: 'draft',
		tax_scheme: 'iva',
		...DEFAULT_TAX_PARAMETERS,
		global_margin_percentage: 30,
		chapters: [chapterOne, chapterTwo],
		created_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
		updated_at: now.toISOString()
	};
}

// Migración: garantiza los parámetros fiscales (HU-07) en presupuestos guardados con versiones previas.
function migrateBudget(budget: Budget): Budget {
	const safe = (value: unknown, fallback: number) =>
		typeof value === 'number' && Number.isFinite(value) ? value : fallback;
	const status: BudgetStatus =
		budget.status === 'sent' || budget.status === 'approved' || budget.status === 'frozen' ? budget.status : 'draft';
	const sig = budget.signature as BudgetSignature | undefined;
	const signature =
		sig && typeof sig.signer_name === 'string' && typeof sig.signature_png_base64 === 'string'
			? { ...sig }
			: undefined;
	return {
		...budget,
		status,
		tax_scheme: budget.tax_scheme === 'aiu' ? 'aiu' : 'iva',
		admin_percentage: safe(budget.admin_percentage, DEFAULT_TAX_PARAMETERS.admin_percentage),
		contingency_percentage: safe(budget.contingency_percentage, DEFAULT_TAX_PARAMETERS.contingency_percentage),
		utility_percentage: safe(budget.utility_percentage, DEFAULT_TAX_PARAMETERS.utility_percentage),
		vat_percentage: safe(budget.vat_percentage, DEFAULT_TAX_PARAMETERS.vat_percentage),
		signature
	};
}

export function loadBudgets(): Budget[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw !== null) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) return parsed.map(migrateBudget);
		}
	} catch (_) {}

	const seed = [buildSeedBudget()];
	saveBudgets(seed);
	return seed;
}

export function saveBudgets(budgets: Budget[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
	} catch (_) {}
}

export function findBudget(id: string | null): Budget | null {
	if (!id) return null;
	return loadBudgets().find((budget) => budget.id === id) ?? null;
}

export function createBudget(input: NewBudgetInput): Budget {
	const now = new Date().toISOString();
	return {
		id: uid('bgt'),
		lead_id: input.lead_id,
		client_name: input.client_name,
		version: 1,
		title: input.title,
		status: 'draft',
		tax_scheme: 'iva',
		...DEFAULT_TAX_PARAMETERS,
		global_margin_percentage: input.global_margin_percentage,
		chapters: [],
		created_at: now,
		updated_at: now
	};
}

export function isBudgetFrozen(budget: Pick<Budget, 'status'> | null | undefined): boolean {
	return budget?.status === 'frozen';
}

export function persistBudget(budget: Budget) {
	budget.updated_at = new Date().toISOString();
	for (const item of allItems(budget)) {
		item.unit_sale_price = calcLine(item).unitSalePrice;
	}
	const budgets = loadBudgets();
	const index = budgets.findIndex((entry) => entry.id === budget.id);
	if (index >= 0) budgets[index] = budget;
	else budgets.unshift(budget);
	saveBudgets(budgets);
}

export function deleteBudget(id: string) {
	const budgets = loadBudgets().filter((entry) => entry.id !== id);
	saveBudgets(budgets);
}

export function applyGlobalMargin(budget: Budget, margin: number) {
	budget.global_margin_percentage = margin;
	for (const item of allItems(budget)) item.margin_percentage = margin;
}

export interface DuplicateBudgetInput {
	source: Budget;
	title: string;
	lead_id?: string;
	client_name?: string;
	syncCatalogPrices?: boolean;
}

/**
 * HU-08: clona un presupuesto completo (capítulos y partidas) en un nuevo borrador.
 * Con syncCatalogPrices se refresca el costo unitario de las partidas enlazadas al
 * catálogo maestro con el precio vigente; si no, se mantienen los costos originales.
 */
export function duplicateBudget(input: DuplicateBudgetInput): Budget {
	const now = new Date().toISOString();
	const catalogById = input.syncCatalogPrices
		? new Map(loadCatalog().map((item) => [item.id, item]))
		: null;

	const chapters: BudgetChapter[] = input.source.chapters.map((chapter) => {
		const chapterId = uid('bch');
		return {
			id: chapterId,
			order_index: chapter.order_index,
			name: chapter.name,
			items: chapter.items.map((item) => {
				const catalogItem = catalogById && item.catalog_item_id ? catalogById.get(item.catalog_item_id) : undefined;
				return {
					id: uid('bit'),
					chapter_id: chapterId,
					catalog_item_id: item.catalog_item_id,
					description: item.description,
					category: item.category,
					unit: item.unit,
					quantity: item.quantity,
					unit_cost_internal: catalogItem ? catalogItem.unit_cost : item.unit_cost_internal,
					margin_percentage: item.margin_percentage
				};
			})
		};
	});

	return {
		id: uid('bgt'),
		lead_id: input.lead_id,
		client_name: input.client_name,
		version: 1,
		title: input.title,
		status: 'draft',
		tax_scheme: input.source.tax_scheme,
		admin_percentage: input.source.admin_percentage,
		contingency_percentage: input.source.contingency_percentage,
		utility_percentage: input.source.utility_percentage,
		vat_percentage: input.source.vat_percentage,
		global_margin_percentage: input.source.global_margin_percentage,
		chapters,
		created_at: now,
		updated_at: now
	};
}
