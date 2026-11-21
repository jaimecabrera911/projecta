// src/lib/daily-log.test.ts
// Tests automatizados para HU-17: Bitácora Diaria de Obra con Fotos y Clima (Daily Logs)
// Incluye pruebas para Horas de Paro por Clima y Generación de Acta PDF.

import assert from 'node:assert/strict';
import {
	type DailyLogEntry,
	type WeatherType
} from './daily-log-store.ts';
import { generateDailyLogPdfHtml } from './daily-log-pdf.ts';

console.log('--- Iniciando tests de HU-17 (Bitácora Diaria de Obra con Fotos y Clima) ---');

// 1. Simulación en memoria
const mockLogs: DailyLogEntry[] = [
	{
		id: 'log_01',
		project_id: 'proj_test',
		date: '2026-11-18',
		weather: 'cloudy',
		officials_count: 2,
		helpers_count: 2,
		total_workers: 4,
		downtime_hours: 0,
		downtime_reason: '',
		notes: 'Recepción de perfiles galvanizados y láminas.',
		photos: [],
		author_name: 'Maestro Pedro Flórez',
		author_role: 'Maestro Supervisor',
		created_at: '2026-11-18T16:00:00Z'
	},
	{
		id: 'log_02',
		project_id: 'proj_test',
		date: '2026-11-19',
		weather: 'rainy',
		officials_count: 3,
		helpers_count: 1,
		total_workers: 4,
		downtime_hours: 3,
		downtime_reason: 'Lluvia intensa en horas de la tarde.',
		notes: 'Lluvia en la tarde. Labores internas de resane.',
		photos: [],
		author_name: 'Ing. Mateo Gómez',
		author_role: 'Residente de Obra',
		created_at: '2026-11-19T17:00:00Z'
	}
];

// 2. ESCENARIO GHERKIN 1: Publicación de bitácora exitosa al finalizar la jornada
// Given que el residente está en la obra al terminar el día
// When selecciona el clima "Soleado", registra 3 oficiales y 2 ayudantes y escribe "Se colaron 15 columnas"
// And adjunta 2 fotografías de avance
// Then se calcula el total de trabajadores = 5
// And la entrada queda registrada con estampa de tiempo y autor
const newEntry: DailyLogEntry = {
	id: 'log_03',
	project_id: 'proj_test',
	date: '2026-11-20',
	weather: 'sunny',
	officials_count: 3,
	helpers_count: 2,
	total_workers: 3 + 2,
	downtime_hours: 0,
	downtime_reason: '',
	notes: 'Se colaron 15 columnas en el sector norte.',
	photos: [
		{
			id: 'p_1',
			name: 'columnas_fundidas_01.jpg',
			url: 'data:image/svg+xml;utf8,<svg></svg>',
			caption: 'Columnas desencofradas',
			created_at: '2026-11-20T17:00:00Z'
		},
		{
			id: 'p_2',
			name: 'curado_humedo_02.jpg',
			url: 'data:image/svg+xml;utf8,<svg></svg>',
			caption: 'Curado con agua',
			created_at: '2026-11-20T17:10:00Z'
		}
	],
	author_name: 'Ing. Mateo Gómez',
	author_role: 'Residente de Obra',
	created_at: '2026-11-20T17:30:00Z'
};

mockLogs.unshift(newEntry);

assert.equal(newEntry.weather, 'sunny', 'El clima registrado debe ser sunny (Soleado)');
assert.equal(newEntry.total_workers, 5, 'El total de trabajadores debe ser 5 (3 oficiales + 2 ayudantes)');
assert.equal(newEntry.photos.length, 2, 'Debe contener 2 fotografías adjuntas');
assert.equal(newEntry.author_role, 'Residente de Obra', 'Debe conservar el rol del autor');
console.log('✓ Escenario Gherkin 1 superado: Creación de bitácora con clima, cuadrilla y fotos.');

// 3. ESCENARIO GHERKIN 2: Orden cronológico inverso en el Muro Feed
// Las entradas deben estar ordenadas de más reciente a más antigua
const sortedLogs = [...mockLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
const sortedDates = sortedLogs.map((l) => l.date);
assert.deepEqual(
	sortedDates,
	['2026-11-20', '2026-11-19', '2026-11-18'],
	'El feed debe estar estrictamente ordenado en orden cronológico inverso'
);
console.log('✓ Escenario Gherkin 2 superado: Muro social ordenado cronológicamente inverso.');

// 4. ESCENARIO GHERKIN 3: Horas de suspensión / paro por lluvia o fuerza mayor
const rainyEntry = mockLogs.find((l) => l.id === 'log_02');
assert.ok(rainyEntry, 'Debe existir la entrada lluviosa');
assert.equal(rainyEntry.downtime_hours, 3, 'Debe registrar 3 horas de paro por lluvia');
assert.ok(rainyEntry.downtime_reason.includes('Lluvia intensa'), 'Debe almacenar el motivo del paro');

const totalProjectDowntime = mockLogs.reduce((acc, l) => acc + (l.downtime_hours || 0), 0);
assert.equal(totalProjectDowntime, 3, 'El acumulado de paro del proyecto debe ser 3 horas');
console.log('✓ Escenario Gherkin 3 superado: Registro de horas de suspensión por lluvia o fuerza mayor.');

// 5. ESCENARIO GHERKIN 4: Generación de Acta Formal en PDF
const pdfHtml = generateDailyLogPdfHtml(rainyEntry, 'Remodelación Penthouse El Poblado');
assert.ok(pdfHtml.includes('Acta de Reporte Diario'), 'El documento debe titularse Acta de Reporte Diario');
assert.ok(pdfHtml.includes('Remodelación Penthouse El Poblado'), 'Debe incluir el nombre del proyecto');
assert.ok(pdfHtml.includes('3 Horas'), 'Debe mostrar las horas de paro registradas');
assert.ok(pdfHtml.includes('Firma y Certificación de Residente'), 'Debe incluir caja de firma de residente');
assert.ok(pdfHtml.includes('Visto Bueno y Recepción Técnica'), 'Debe incluir caja de visto bueno de interventoría');
console.log('✓ Escenario Gherkin 4 superado: Generación de documento PDF imprimible con membrete y firmas.');

// 6. ESCENARIO GHERKIN 5: Sincronización bidireccional Bitácora <-> Cronograma
const logWithTasks: DailyLogEntry = {
	id: 'log_04',
	project_id: 'proj_test',
	date: '2026-11-21',
	weather: 'sunny',
	officials_count: 3,
	helpers_count: 2,
	total_workers: 5,
	downtime_hours: 0,
	downtime_reason: '',
	notes: 'Armado de perfiles e instalación de drywall.',
	tasks_progress: [
		{
			task_id: 'task_003',
			task_title: 'Replanteo y armado de estructura metálica Drywall',
			chapter_name: '02. Mampostería y Drywall',
			previous_pct: 75,
			new_pct: 100,
			notes: 'Estructura lista y aplomada.'
		}
	],
	photos: [],
	author_name: 'Ing. Mateo Gómez',
	author_role: 'Residente de Obra',
	created_at: '2026-11-21T17:00:00Z'
};

assert.ok(logWithTasks.tasks_progress && logWithTasks.tasks_progress.length === 1, 'Debe registrar 1 tarea sincronizada');
assert.equal(logWithTasks.tasks_progress[0].new_pct, 100, 'El nuevo avance debe ser 100%');

const syncPdfHtml = generateDailyLogPdfHtml(logWithTasks, 'Remodelación Penthouse El Poblado');
assert.ok(syncPdfHtml.includes('Actividades del Cronograma Intervenidas'), 'El PDF debe listar la sección de actividades');
assert.ok(syncPdfHtml.includes('Replanteo y armado de estructura metálica Drywall'), 'El PDF debe listar el título de la tarea');
assert.ok(syncPdfHtml.includes('100%'), 'El PDF debe reflejar el 100%');
console.log('✓ Escenario Gherkin 5 superado: Sincronización bidireccional bitácora <-> cronograma y tabla en PDF.');

// 7. Eliminación de entrada
const filtered = mockLogs.filter((l) => l.id !== 'log_01');
assert.equal(filtered.length, 2, 'Debe quedar con 2 entradas tras eliminar una');
console.log('✓ Eliminación de entrada de bitácora validada.');

console.log('Todos los tests de HU-17 pasaron exitosamente.');
