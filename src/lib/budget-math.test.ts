// Self-check de los cálculos de presupuesto. Ejecutar: npm run check:budget
import assert from 'node:assert/strict';
import { calcLine, calcTax, calcTotals, formatMoney } from './budget-math.ts';

// Gherkin HU-06: 40 m2 x $12.00, margen 25% -> costo $480, venta unitaria $15, subtotal $600.
const mamposteria = calcLine({ quantity: 40, unit_cost_internal: 12, margin_percentage: 25 });
assert.equal(mamposteria.directSubtotal, 480);
assert.equal(mamposteria.unitSalePrice, 15);
assert.equal(mamposteria.saleSubtotal, 600);

// Gherkin UX: 20 m2 x $10.00, margen 30% -> costo $200, venta unitaria $13, subtotal $260.
const demolicion = calcLine({ quantity: 20, unit_cost_internal: 10, margin_percentage: 30 });
assert.equal(demolicion.directSubtotal, 200);
assert.equal(demolicion.unitSalePrice, 13);
assert.equal(demolicion.saleSubtotal, 260);

const totals = calcTotals([
	{ quantity: 40, unit_cost_internal: 12, margin_percentage: 25 },
	{ quantity: 20, unit_cost_internal: 10, margin_percentage: 30 }
]);
assert.equal(totals.directCost, 680);
assert.equal(totals.saleTotal, 860);
assert.equal(totals.profit, 180);
assert.equal(totals.marginPercentage, 20.93);

// Bordes: cantidades vacías no rompen la suma.
assert.deepEqual(calcLine({ quantity: 0, unit_cost_internal: 0, margin_percentage: 0 }), {
	directSubtotal: 0,
	unitSalePrice: 0,
	saleSubtotal: 0
});
assert.equal(calcTotals([]).marginPercentage, 0);
assert.match(formatMoney(600), /600/);

// Gherkin HU-07 (AIU): CD $10.000 con A 10% / I 5% / U 5% / IVA 19% (solo sobre utilidad).
const aiu = calcTax({
	taxScheme: 'aiu',
	directCost: 10000,
	saleSubtotal: 10000,
	adminPercentage: 10,
	contingencyPercentage: 5,
	utilityPercentage: 5,
	vatPercentage: 19
});
assert.equal(aiu.adminAmount, 1000);
assert.equal(aiu.contingencyAmount, 500);
assert.equal(aiu.utilityAmount, 500);
assert.equal(aiu.subtotal, 12000);
assert.equal(aiu.taxAmount, 95);
assert.equal(aiu.grandTotal, 12095);

// Gherkin HU-07 (IVA general): el IVA se liquida sobre el subtotal completo de venta.
const iva = calcTax({
	taxScheme: 'iva',
	directCost: 800,
	saleSubtotal: 1000,
	adminPercentage: 10,
	contingencyPercentage: 5,
	utilityPercentage: 5,
	vatPercentage: 19
});
assert.equal(iva.adminAmount, 0);
assert.equal(iva.utilityAmount, 200);
assert.equal(iva.subtotal, 1000);
assert.equal(iva.taxAmount, 190);
assert.equal(iva.grandTotal, 1190);
assert.equal(iva.commissionAmount, 0);
assert.equal(iva.netProfit, 200);

// HU Comisión de Vendedor: Venta $10.000 con CD $7.000 (Utilidad bruta $3.000) y comisión 3% ($300).
const ivaConComision = calcTax({
	taxScheme: 'iva',
	directCost: 7000,
	saleSubtotal: 10000,
	adminPercentage: 10,
	contingencyPercentage: 5,
	utilityPercentage: 5,
	vatPercentage: 19,
	commissionPercentage: 3
});
assert.equal(ivaConComision.subtotal, 10000);
assert.equal(ivaConComision.profit, 3000);
assert.equal(ivaConComision.commissionAmount, 300);
assert.equal(ivaConComision.netProfit, 2700);
assert.equal(ivaConComision.netMarginPercentage, 27);

// HU Comisión en Esquema AIU: Subtotal AIU $12.000 con comisión 2.5% ($300).
const aiuConComision = calcTax({
	taxScheme: 'aiu',
	directCost: 10000,
	saleSubtotal: 10000,
	adminPercentage: 10,
	contingencyPercentage: 5,
	utilityPercentage: 5,
	vatPercentage: 19,
	commissionPercentage: 2.5
});
assert.equal(aiuConComision.subtotal, 12000);
assert.equal(aiuConComision.commissionAmount, 300);
assert.equal(aiuConComision.netProfit, 1700);

console.log('budget-math: OK');
