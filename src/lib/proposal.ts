// src/lib/proposal.ts
// HU-09: proyección COMERCIAL de un presupuesto para la propuesta al cliente.
// Regla dura de privacidad: este módulo NUNCA devuelve unit_cost_internal ni margin_percentage.
import { calcTax, calcTotals, type TaxScheme } from './budget-math';
import type { Budget } from './budget-store';

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export interface CommercialItem {
	ref: string;
	description: string;
	unit: string;
	quantity: number;
	unitSalePrice: number;
	saleSubtotal: number;
}

export interface CommercialChapter {
	ref: string;
	name: string;
	items: CommercialItem[];
	subtotal: number;
}

export interface CommercialTotals {
	subtotal: number;
	taxLabel: string;
	taxAmount: number;
	grandTotal: number;
}

export interface CommercialProposal {
	title: string;
	clientName?: string;
	address?: string;
	scheme: TaxScheme;
	chapters: CommercialChapter[];
	totals: CommercialTotals;
}

export interface CommercialMeta {
	address?: string;
}

export interface PaymentMilestone {
	label: string;
	percentage: number;
}

// Información de la empresa contratista (sección 2.1 del spec).
export const PROPOSAL_COMPANY = {
	name: 'Construcciones Andina',
	nit: '901.442.188-4',
	city: 'Medellín, Colombia',
	phone: '+57 604 444 5566',
	email: 'propuestas@construccionesandina.co'
};

export const PROPOSAL_VALIDITY_DAYS = 15;

// Términos comerciales (sección 2.4 del spec).
export const PAYMENT_MILESTONES: PaymentMilestone[] = [
	{ label: 'Anticipo al firmar la propuesta', percentage: 50 },
	{ label: 'Avance a mitad del cronograma', percentage: 40 },
	{ label: 'Saldo a entrega final de la obra', percentage: 10 }
];

export const WORK_EXCLUSIONS: string[] = [
	'Permisos, licencias y trámites ante entidades o curadurías.',
	'Cambios de diseño o alcance solicitados después de la aprobación.',
	'Obras eléctricas o hidrosanitarias fuera del alcance aquí descrito.',
	'Retiro de escombros en volúmenes superiores a los estimados.',
	'IVA, retenciones o impuestos distintos a los indicados en esta propuesta.'
];

function aiuMarkup(budget: Budget): number {
	const admin = budget.admin_percentage || 0;
	const contingency = budget.contingency_percentage || 0;
	const utility = budget.utility_percentage || 0;
	return admin + contingency + utility;
}

/**
 * Convierte un presupuesto interno en la estructura comercial que ve el cliente:
 * solo descripción, unidad, cantidad, precio unitario de venta y subtotal de venta.
 * IVA: el precio de venta aplica el margen de cada partida.
 * AIU: el precio de venta aplica el componente A+I+U sobre el costo (uniforme).
 */
export function buildCommercialProposal(budget: Budget, meta: CommercialMeta = {}): CommercialProposal {
	const uniformAiuMarkup = budget.tax_scheme === 'aiu' ? aiuMarkup(budget) : 0;

	const chapters: CommercialChapter[] = [...budget.chapters]
		.sort((a, b) => a.order_index - b.order_index)
		.map((chapter, chapterIndex) => {
			let chapterSubtotal = 0;
			const items: CommercialItem[] = chapter.items.map((item, itemIndex) => {
				const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
				const unitCost = Number.isFinite(item.unit_cost_internal) ? item.unit_cost_internal : 0;
				const markup = budget.tax_scheme === 'aiu'
					? uniformAiuMarkup
					: (Number.isFinite(item.margin_percentage) ? item.margin_percentage : 0);
				const unitSalePrice = round2(unitCost * (1 + markup / 100));
				const saleSubtotal = round2(unitSalePrice * quantity);
				chapterSubtotal += saleSubtotal;
				return {
					ref: `${chapterIndex + 1}.${itemIndex + 1}`,
					description: item.description,
					unit: item.unit,
					quantity,
					unitSalePrice,
					saleSubtotal
				};
			});
			return {
				ref: String(chapterIndex + 1),
				name: chapter.name,
				items,
				subtotal: round2(chapterSubtotal)
			};
		});

	const lineTotals = calcTotals(budget.chapters.flatMap((chapter) => chapter.items));
	const tax = calcTax({
		taxScheme: budget.tax_scheme,
		directCost: lineTotals.directCost,
		saleSubtotal: lineTotals.saleTotal,
		adminPercentage: budget.admin_percentage,
		contingencyPercentage: budget.contingency_percentage,
		utilityPercentage: budget.utility_percentage,
		vatPercentage: budget.vat_percentage
	});

	return {
		title: budget.title,
		clientName: budget.client_name,
		address: meta.address,
		scheme: budget.tax_scheme,
		chapters,
		totals: {
			subtotal: tax.subtotal,
			taxLabel: `IVA (${budget.vat_percentage}%)`,
			taxAmount: tax.taxAmount,
			grandTotal: tax.grandTotal
		}
	};
}
