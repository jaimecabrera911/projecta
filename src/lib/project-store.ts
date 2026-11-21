// src/lib/project-store.ts
// HU-12: proyectos activos creados al firmar propuesta. Persistencia local; shortcut: reemplazar por tabla projects + job_costing en backend.

import type { Budget } from './budget-store';
import { calcTax, calcTotals } from './budget-math';

export interface Project {
	id: string;
	lead_id?: string;
	budget_id: string;
	name: string;
	address?: string;
	status: 'active';
	total_contract_value: number;
	budget_direct_cost: number;
	created_at: string;
}

const STORAGE_KEY = 'obraflow_projects';

function uid(prefix: string): string {
	return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function loadProjects(): Project[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as Project[]) : [];
	} catch (_) {
		return [];
	}
}

export function saveProjects(projects: Project[]) {
	try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch (_) {}
}

export function findProjectByBudgetId(budgetId: string): Project | undefined {
	return loadProjects().find((p) => p.budget_id === budgetId);
}

export function createProjectFromBudget(budget: Budget, address?: string): Project {
	const existing = findProjectByBudgetId(budget.id);
	if (existing) return existing;
	const lines = budget.chapters.flatMap((c) => c.items);
	const lineTotals = calcTotals(lines);
	const tax = calcTax({
		taxScheme: budget.tax_scheme,
		directCost: lineTotals.directCost,
		saleSubtotal: lineTotals.saleTotal,
		adminPercentage: budget.admin_percentage,
		contingencyPercentage: budget.contingency_percentage,
		utilityPercentage: budget.utility_percentage,
		vatPercentage: budget.vat_percentage
	});
	const project: Project = {
		id: uid('prj'),
		lead_id: budget.lead_id,
		budget_id: budget.id,
		name: budget.title || 'Proyecto de obra',
		address,
		status: 'active',
		total_contract_value: tax.grandTotal,
		budget_direct_cost: lineTotals.directCost,
		created_at: new Date().toISOString()
	};
	const projects = loadProjects();
	projects.unshift(project);
	saveProjects(projects);
	return project;
}
