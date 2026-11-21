// src/lib/budget-math.ts
// Cálculos puros de HU-06: costo directo, precio de venta y utilidad.

export interface BudgetLine {
	quantity: number;
	unit_cost_internal: number;
	margin_percentage: number;
}

export interface LineTotals {
	directSubtotal: number;
	unitSalePrice: number;
	saleSubtotal: number;
}

export interface BudgetTotals {
	directCost: number;
	saleTotal: number;
	profit: number;
	marginPercentage: number;
	itemCount: number;
}

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

function safeNumber(value: number): number {
	return Number.isFinite(value) ? value : 0;
}

export function calcLine(line: BudgetLine): LineTotals {
	const quantity = safeNumber(line.quantity);
	const cost = safeNumber(line.unit_cost_internal);
	const margin = safeNumber(line.margin_percentage);

	const directSubtotal = round2(quantity * cost);
	// Los ejemplos y criterios Gherkin aplican markup sobre el costo (12 -> 15 con 25%).
	// La fórmula de división de la sección 3 contradice esos números, así que manda el criterio de aceptación.
	const unitSalePrice = round2(cost * (1 + margin / 100));
	const saleSubtotal = round2(quantity * unitSalePrice);

	return { directSubtotal, unitSalePrice, saleSubtotal };
}

export function calcTotals(lines: BudgetLine[]): BudgetTotals {
	let directCost = 0;
	let saleTotal = 0;

	for (const line of lines) {
		const totals = calcLine(line);
		directCost += totals.directSubtotal;
		saleTotal += totals.saleSubtotal;
	}

	directCost = round2(directCost);
	saleTotal = round2(saleTotal);
	const profit = round2(saleTotal - directCost);
	const marginPercentage = saleTotal > 0 ? round2((profit / saleTotal) * 100) : 0;

	return { directCost, saleTotal, profit, marginPercentage, itemCount: lines.length };
}

export function formatMoney(amount: number): string {
	const safe = safeNumber(amount);
	const hasCents = Math.abs(safe % 1) > 0.004;
	return `$ ${safe.toLocaleString('es-CO', {
		minimumFractionDigits: hasCents ? 2 : 0,
		maximumFractionDigits: 2
	})}`;
}

// ============================================================================
// HU-07: Motor tributario dual (Régimen General IVA vs Esquema AIU)
// ============================================================================

export type TaxScheme = 'iva' | 'aiu';

export interface TaxInput {
	taxScheme: TaxScheme;
	/** Costo directo total (base de materiales, mano de obra y equipos). */
	directCost: number;
	/** Subtotal de venta con margen de partidas. Base gravable en régimen IVA. */
	saleSubtotal: number;
	adminPercentage: number;
	contingencyPercentage: number;
	utilityPercentage: number;
	vatPercentage: number;
}

export interface TaxTotals {
	taxScheme: TaxScheme;
	directCost: number;
	/** AIU: Administración. Contratos IVA: 0. */
	adminAmount: number;
	/** AIU: Imprevistos. Contratos IVA: 0. */
	contingencyAmount: number;
	/** AIU: Utilidad (U% sobre CD). IVA: utilidad/margen sobre la venta. */
	utilityAmount: number;
	/** Base antes de impuesto (AIU: CD+A+I+U · IVA: subtotal de venta). */
	subtotal: number;
	/** IVA liquidado (sobre la utilidad en AIU, sobre el subtotal en IVA general). */
	taxAmount: number;
	grandTotal: number;
	profit: number;
	marginPercentage: number;
}

/**
 * Liquida el presupuesto según el esquema fiscal.
 * AIU: el IVA se aplica únicamente sobre la Utilidad (no sobre el costo directo).
 * IVA general: el IVA se aplica sobre el subtotal completo de venta.
 */
export function calcTax(input: TaxInput): TaxTotals {
	const directCost = round2(safeNumber(input.directCost));
	const vatPercentage = safeNumber(input.vatPercentage);

	if (input.taxScheme === 'aiu') {
		const adminAmount = round2((directCost * safeNumber(input.adminPercentage)) / 100);
		const contingencyAmount = round2((directCost * safeNumber(input.contingencyPercentage)) / 100);
		const utilityAmount = round2((directCost * safeNumber(input.utilityPercentage)) / 100);
		const subtotal = round2(directCost + adminAmount + contingencyAmount + utilityAmount);
		const taxAmount = round2((utilityAmount * vatPercentage) / 100);
		const grandTotal = round2(subtotal + taxAmount);
		const profit = round2(subtotal - directCost);
		const marginPercentage = grandTotal > 0 ? round2((profit / grandTotal) * 100) : 0;

		return {
			taxScheme: 'aiu',
			directCost,
			adminAmount,
			contingencyAmount,
			utilityAmount,
			subtotal,
			taxAmount,
			grandTotal,
			profit,
			marginPercentage
		};
	}

	const subtotal = round2(safeNumber(input.saleSubtotal));
	const taxAmount = round2((subtotal * vatPercentage) / 100);
	const grandTotal = round2(subtotal + taxAmount);
	const profit = round2(subtotal - directCost);
	const marginPercentage = subtotal > 0 ? round2((profit / subtotal) * 100) : 0;

	return {
		taxScheme: 'iva',
		directCost,
		adminAmount: 0,
		contingencyAmount: 0,
		utilityAmount: profit,
		subtotal,
		taxAmount,
		grandTotal,
		profit,
		marginPercentage
	};
}
