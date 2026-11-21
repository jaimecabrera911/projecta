// src/lib/proposal-signature.ts
// HU-11/HU-12: firma local + transición a obra. shortcut: IP real/hash notariado/transacción server-side requieren backend.

import type { Budget, BudgetSignature } from './budget-store';
import { loadBudgets, saveBudgets } from './budget-store';
import { createProjectFromBudget, type Project } from './project-store';

export function isCanvasBlank(canvas: HTMLCanvasElement): boolean {
	const ctx = canvas.getContext('2d');
	if (!ctx) return true;
	const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
	for (let i = 3; i < data.length; i += 4) {
		if (data[i] !== 0) return false;
	}
	return true;
}

export async function sha256Hex(text: string): Promise<string> {
	const bytes = new TextEncoder().encode(text);
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function buildContractPayload(input: {
	budgetId: string;
	title: string;
	clientName: string;
	total: number;
	taxLabel: string;
	signerName: string;
	signerId: string;
	signedAt: string;
}): string {
	return JSON.stringify(input);
}

function markLeadWonFromProposal(leadId?: string) {
	if (!leadId) return;
	try {
		const raw = localStorage.getItem('obraflow_leads');
		if (!raw) return;
		const leads = JSON.parse(raw);
		if (!Array.isArray(leads)) return;
		const lead = leads.find((l) => l && l.id === leadId);
		if (!lead) return;
		if (['proposal_sent', 'opened', 'negotiation'].includes(lead.stage)) {
			lead.stage = 'won';
			lead.updated_at = new Date().toISOString();
			localStorage.setItem('obraflow_leads', JSON.stringify(leads));
		}
	} catch (_) {}
}

export interface FinalizeSignedProposalResult {
	budget: Budget;
	project: Project;
	alreadyFinalized: boolean;
}

export function finalizeSignedProposal(budgetId: string, signature: BudgetSignature, address?: string): FinalizeSignedProposalResult | null {
	const budgets = loadBudgets();
	const idx = budgets.findIndex((b) => b.id === budgetId);
	if (idx < 0) return null;
	const current = budgets[idx];
	const alreadyFinalized = current.status === 'frozen' && !!current.signature;
	const next: Budget = {
		...current,
		status: 'frozen',
		signature: current.signature ?? signature,
		updated_at: new Date().toISOString()
	};
	budgets[idx] = next;
	saveBudgets(budgets);
	const project = createProjectFromBudget(next, address);
	markLeadWonFromProposal(next.lead_id);
	return { budget: next, project, alreadyFinalized };
}

// Compatibilidad HU-11
export function approveBudgetWithSignature(budgetId: string, signature: BudgetSignature): Budget | null {
	return finalizeSignedProposal(budgetId, signature)?.budget ?? null;
}
