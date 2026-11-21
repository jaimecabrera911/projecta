// src/lib/active-project-store.ts
// HU-ObraFijada: Gestión y persistencia global de la Obra Activa en ObraFlow SaaS.
// Permite fijar un proyecto en el Header para mantener la coherencia a través de todos los módulos.

import {
	loadAllProjects,
	getProjectById,
	INITIAL_DEMO_PROJECT,
	SECOND_DEMO_PROJECT,
	type ProjectCosting
} from './costing-store.ts';

export const STORAGE_KEY_ACTIVE_PROJECT = 'obraflow_active_project_id';
export const DEFAULT_PROJECT_ID = 'proj_andina_001';

/**
 * ID fijado por el usuario, o null si no hay obra fijada.
 */
export function getPinnedProjectId(): string | null {
	if (typeof window === 'undefined') return DEFAULT_PROJECT_ID;
	try {
		const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_PROJECT);
		if (stored && getAvailableProjects().some((p) => p.project_id === stored)) return stored;
	} catch (e) {
		console.error('Error leyendo obra fijada de localStorage:', e);
	}
	return null;
}

/**
 * Obtiene el ID del proyecto activo. Si no hay obra fijada, retorna el predeterminado (fallback legacy).
 */
export function getActiveProjectId(): string {
	return getPinnedProjectId() ?? DEFAULT_PROJECT_ID;
}

function persistActiveProjectId(targetId: string | null) {
	if (typeof window === 'undefined') return;
	try {
		if (targetId) localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT, targetId);
		else localStorage.removeItem(STORAGE_KEY_ACTIVE_PROJECT);
		window.dispatchEvent(new CustomEvent('obraflow:project-changed', { detail: { projectId: targetId } }));
	} catch (e) {
		console.error('Error guardando obra fijada en localStorage:', e);
	}
}

/**
 * Fija un proyecto activo y despacha el evento global para sincronizar todas las vistas.
 */
export function setActiveProjectId(projectId: string): string {
	const projects = getAvailableProjects();
	const validProject = projects.find((p) => p.project_id === projectId);
	const targetId = validProject ? validProject.project_id : DEFAULT_PROJECT_ID;
	persistActiveProjectId(targetId);
	return targetId;
}

/** Quita la obra fijada. Los módulos usarán su fallback local hasta que se fije otra. */
export function clearActiveProjectId(): void {
	persistActiveProjectId(null);
}

/**
 * Obtiene el objeto completo del proyecto fijado actualmente (fallback legacy).
 */
export function getActiveProject(): ProjectCosting {
	const currentId = getActiveProjectId();
	const project = getProjectById(currentId);
	return project || INITIAL_DEMO_PROJECT;
}

export function getPinnedProject(): ProjectCosting | null {
	const id = getPinnedProjectId();
	return id ? getProjectById(id) : null;
}

/**
 * Retorna todos los proyectos disponibles en el sistema.
 */
export function getAvailableProjects(): ProjectCosting[] {
	try {
		const projects = loadAllProjects();
		if (Array.isArray(projects) && projects.length > 0) {
			return projects;
		}
	} catch (e) {
		console.error('Error cargando proyectos disponibles:', e);
	}
	return [INITIAL_DEMO_PROJECT, SECOND_DEMO_PROJECT];
}
