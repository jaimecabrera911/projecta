// src/lib/active-project.test.ts
// Tests unitarios para active-project-store (Obra Fijada Global)

import assert from 'node:assert/strict';
import {
	getActiveProjectId,
	setActiveProjectId,
	clearActiveProjectId,
	getActiveProject,
	getAvailableProjects,
	DEFAULT_PROJECT_ID,
	STORAGE_KEY_ACTIVE_PROJECT
} from './active-project-store.ts';

console.log('--- Iniciando tests de Obra Fijada Global (active-project-store) ---');

// 1. Simulación de entorno de navegador (mock localStorage y CustomEvent)
const mockStorage: Record<string, string> = {};
const dispatchedEvents: Array<{ type: string; detail: any }> = [];

(globalThis as any).localStorage = {
	getItem: (key: string) => mockStorage[key] || null,
	setItem: (key: string, val: string) => {
		mockStorage[key] = val;
	},
	removeItem: (key: string) => {
		delete mockStorage[key];
	},
	clear: () => {
		for (const k of Object.keys(mockStorage)) delete mockStorage[k];
	}
};

(globalThis as any).window = {
	dispatchEvent: (event: any) => {
		dispatchedEvents.push({ type: event.type, detail: event.detail });
		return true;
	}
};

(globalThis as any).CustomEvent = class CustomEvent {
	type: string;
	detail: any;
	constructor(type: string, params: { detail?: any } = {}) {
		this.type = type;
		this.detail = params.detail;
	}
};

// Test 1: Retorno de ID por defecto si no hay nada guardado
const initialId = getActiveProjectId();
assert.equal(initialId, DEFAULT_PROJECT_ID, 'Debe retornar el ID predeterminado (proj_andina_001)');
console.log('✓ Test 1 superado: ID predeterminado cuando no hay valor previo.');

// Test 2: Obtener lista de proyectos disponibles
const available = getAvailableProjects();
assert.ok(available.length >= 2, 'Deben existir al menos 2 proyectos demo en el sistema');
assert.ok(available.some((p) => p.project_id === 'proj_andina_001'), 'Debe incluir proj_andina_001');
assert.ok(available.some((p) => p.project_id === 'proj_andina_002'), 'Debe incluir proj_andina_002');
console.log('✓ Test 2 superado: Listado de proyectos disponibles cargado.');

// Test 3: Fijar un nuevo proyecto activo (proj_andina_002)
const chosenId = 'proj_andina_002';
const savedId = setActiveProjectId(chosenId);
assert.equal(savedId, chosenId, 'setActiveProjectId debe retornar el ID asignado');
assert.equal(mockStorage[STORAGE_KEY_ACTIVE_PROJECT], chosenId, 'Debe persistir en localStorage');
assert.equal(getActiveProjectId(), chosenId, 'getActiveProjectId debe retornar el nuevo ID fijado');
assert.ok(
	dispatchedEvents.some((e) => e.type === 'obraflow:project-changed' && e.detail?.projectId === chosenId),
	'Debe disparar el evento global obraflow:project-changed'
);
console.log('✓ Test 3 superado: Fijar nueva obra y emisión de evento reactivo.');

// Test 4: Recuperar el objeto completo del proyecto fijado
const activeProj = getActiveProject();
assert.equal(activeProj.project_id, chosenId, 'getActiveProject debe coincidir con la obra fijada');
assert.ok(activeProj.title.length > 0, 'Debe tener título válido');
assert.ok(activeProj.chapters.length > 0, 'Debe incluir los capítulos presupuestales');
console.log('✓ Test 4 superado: Recuperación completa del objeto de obra con capítulos.');

// Test 5: Fallback de seguridad ante ID inexistente
const invalidId = 'proj_fantasma_999';
const fallbackResult = setActiveProjectId(invalidId);
assert.equal(fallbackResult, DEFAULT_PROJECT_ID, 'Debe hacer fallback a la obra por defecto');
assert.equal(getActiveProjectId(), DEFAULT_PROJECT_ID, 'Debe mantenerse en la obra por defecto');
console.log('✓ Test 5 superado: Fallback seguro ante proyecto no reconocido.');

// Test 6: Limpiar obra fijada
clearActiveProjectId();
assert.equal(mockStorage[STORAGE_KEY_ACTIVE_PROJECT], undefined, 'Debe eliminar la clave de obra fijada');
assert.equal(getActiveProjectId(), DEFAULT_PROJECT_ID, 'Sin obra fijada, debe retornar fallback por defecto');
console.log('✓ Test 6 superado: Limpiar obra fijada.');

console.log('Todos los tests de Obra Fijada pasaron exitosamente.');
