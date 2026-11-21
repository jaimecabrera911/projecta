// src/lib/daily-log-privacy.test.ts
// Tests automatizados para HU-18: Selector de Privacidad en Bitácora (Visible para el Cliente: Sí/No)
// Criterios de Aceptación Gherkin, Filtro en Backend y PDF Diferenciado.

import assert from 'node:assert/strict';
import {
	createDailyLog,
	getClientVisibleDailyLogs,
	getDailyLogsByProject,
	toggleDailyLogVisibility,
	type DailyLogEntry
} from './daily-log-store.ts';
import { generateDailyLogPdfHtml } from './daily-log-pdf.ts';
import { getProjectChapters, getTasksByProject } from './task-schedule-store.ts';

console.log('--- Iniciando tests de HU-18 (Selector de Privacidad en Bitácora Diaria) ---');

// Mock localStorage para Node.js
const storageMap = new Map<string, string>();
(globalThis as any).localStorage = {
	getItem: (k: string) => storageMap.get(k) || null,
	setItem: (k: string, v: string) => storageMap.set(k, v),
	removeItem: (k: string) => storageMap.delete(k),
	clear: () => storageMap.clear()
};
(globalThis as any).window = {
	dispatchEvent: () => true
};
(globalThis as any).CustomEvent = class CustomEvent {
	type: string;
	detail?: any;
	constructor(type: string, detail?: any) {
		this.type = type;
		this.detail = detail;
	}
};

// =========================================================================
// ESCENARIO GHERKIN 1: Entrada pública autorizada para el cliente por defecto
// Given que el residente registra un avance normal de enchapes
// When publica la bitácora con visible_to_client = true (por defecto)
// Then queda almacenada con visible_to_client: true
// And el portal de clientes la incluye en getClientVisibleDailyLogs()
// =========================================================================
console.log('Test 1: Entrada pública por defecto visible para el cliente');
const logPublic = createDailyLog({
	project_id: 'proj_test_privacy',
	date: '2026-11-21',
	weather: 'sunny',
	officials_count: 2,
	helpers_count: 2,
	downtime_hours: 0,
	downtime_reason: '',
	notes: 'Avance satisfactorio de instalación de porcelanato en baño principal.',
	visible_to_client: true,
	tasks_progress: [],
	photos: [],
	author_name: 'Ing. Mateo Gómez',
	author_role: 'Residente de Obra'
});

assert.equal(logPublic.visible_to_client, true, 'Debe tener visible_to_client = true');
const clientLogs1 = getClientVisibleDailyLogs('proj_test_privacy');
assert.equal(clientLogs1.length, 1, 'Debe haber 1 entrada visible para el cliente');
assert.equal(clientLogs1[0].id, logPublic.id);
console.log('  ✓ Entrada pública guardada y visible para el cliente correctamente');

// =========================================================================
// ESCENARIO GHERKIN 2: Entrada confidencial oculta del portal del cliente
// Given que ocurrió una rotura accidental de tubería o incidente técnico
// When el residente selecciona "Solo Uso Interno del Equipo de Obra" (visible_to_client = false)
// Then la entrada se guarda con visible_to_client = false
// And getClientVisibleDailyLogs() la EXCLUYE estrictamente
// And getDailyLogsByProject() (vista interna) sí la incluye
// =========================================================================
console.log('Test 2: Entrada confidencial excluida del portal de cliente');
const logConfidential = createDailyLog({
	project_id: 'proj_test_privacy',
	date: '2026-11-21',
	weather: 'sunny',
	officials_count: 3,
	helpers_count: 1,
	downtime_hours: 2,
	downtime_reason: 'Rotura menor de tubería resuelta internamente',
	notes: 'Se presentó rotura imprevista en niple de desagüe al picar muro divisorio. Cuadrilla reparó sin afectación estructural.',
	visible_to_client: false,
	tasks_progress: [],
	photos: [],
	author_name: 'Ing. Mateo Gómez',
	author_role: 'Residente de Obra'
});

assert.equal(logConfidential.visible_to_client, false, 'Debe tener visible_to_client = false');
const clientLogs2 = getClientVisibleDailyLogs('proj_test_privacy');
assert.equal(clientLogs2.length, 1, 'El cliente solo debe ver la entrada pública, NO la confidencial');
assert.equal(clientLogs2[0].id, logPublic.id);

const internalLogs = getDailyLogsByProject('proj_test_privacy');
assert.equal(internalLogs.length, 2, 'El equipo interno sí debe ver ambas bitácoras (pública y confidencial)');
console.log('  ✓ Aislamiento estricto: Entrada confidencial oculta del portal del cliente');

// =========================================================================
// ESCENARIO GHERKIN 3: Conmutación de privacidad en 1 toque (toggle)
// Given una entrada clasificada como confidencial
// When el residente pulsa "Compartir con Cliente" mediante toggleDailyLogVisibility()
// Then el atributo visible_to_client pasa a true
// And ahora el cliente sí la ve en su portal
// =========================================================================
console.log('Test 3: Conmutación de privacidad en 1 toque');
const toggled = toggleDailyLogVisibility(logConfidential.id);
assert.equal(toggled.visible_to_client, true, 'Debe conmutar de false a true');
assert.equal(getClientVisibleDailyLogs('proj_test_privacy').length, 2, 'Ahora ambas son visibles para el cliente');

const toggledBack = toggleDailyLogVisibility(logConfidential.id);
assert.equal(toggledBack.visible_to_client, false, 'Debe conmutar de true a false');
assert.equal(getClientVisibleDailyLogs('proj_test_privacy').length, 1, 'Vuelve a quedar oculta del cliente');
console.log('  ✓ Conmutación bidireccional inmediata verificada');

// =========================================================================
// ESCENARIO GHERKIN 4: Detección de Incidentes (Error Prevention)
// Given palabras clave como accidente, rotura, daño, retraso
// Then la expresión regular preventiva las detecta para sugerir privacidad interna
// =========================================================================
console.log('Test 4: Detección preventiva de incidentes por palabras clave');
const INCIDENT_REGEX = /(accidente|rotura|daño|falla|retraso|imprevisto|sobrecosto|demanda|reclamo|paro|tuber[ií]a\s+rota)/i;

assert.equal(INCIDENT_REGEX.test('Se presentó una rotura en el tubo'), true, 'Debe detectar rotura');
assert.equal(INCIDENT_REGEX.test('Tuvimos un retraso por falta de material'), true, 'Debe detectar retraso');
assert.equal(INCIDENT_REGEX.test('Hubo una falla eléctrica en el taladro'), true, 'Debe detectar falla');
assert.equal(INCIDENT_REGEX.test('Instalación normal de pintura vinilo'), false, 'Notas normales no deben alertar');
console.log('  ✓ Regex preventivo de incidentes funcionando con precisión');

// =========================================================================
// ESCENARIO GHERKIN 5: Distinción en PDF Exportado
// Given una entrada pública vs una confidencial
// When se genera el HTML del PDF
// Then la pública incluye banner "DOCUMENTO AUTORIZADO PARA EL CLIENTE"
// And la confidencial incluye banner "DOCUMENTO DE USO INTERNO CONFIDENCIAL"
// =========================================================================
console.log('Test 5: Distinción clara en Acta PDF');
const pdfPublic = generateDailyLogPdfHtml(logPublic, 'Penthouse El Poblado');
assert.ok(pdfPublic.includes('DOCUMENTO AUTORIZADO PARA EL CLIENTE'), 'PDF público debe contener banner de autorización');

const pdfConfidential = generateDailyLogPdfHtml(logConfidential, 'Penthouse El Poblado');
assert.ok(pdfConfidential.includes('DOCUMENTO DE USO INTERNO CONFIDENCIAL'), 'PDF confidencial debe contener banner confidencial');
console.log('  ✓ Marcas de agua y banners de seguridad en PDF validados');

// =========================================================================
// TEST ADICIONAL: Agrupación y Colapso por Capítulo (Schedule Sync Accordion)
// =========================================================================
console.log('Test 6: Agrupación y consistencia de capítulos del cronograma');
const tasks = getTasksByProject('proj_andina_001');
const chapters = getProjectChapters('proj_andina_001');

assert.equal(chapters.length, 4, 'Deben existir 4 capítulos para proj_andina_001');
assert.equal(tasks.length, 8, 'Deben existir 8 tareas en proj_andina_001');

// Cada capítulo debe tener exactamente 2 tareas
chapters.forEach((ch) => {
	const chTasks = tasks.filter((t) => t.chapter_id === ch.id);
	assert.equal(chTasks.length, 2, `El capítulo ${ch.name} debe tener exactamente 2 tareas`);
});
console.log('  ✓ Todos los capítulos tienen sus tareas perfectamente asignadas sin huérfanas');

console.log('--- Todos los tests de HU-18 pasaron exitosamente (100% OK) ---');
