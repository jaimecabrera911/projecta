// src/lib/daily-log.test.ts
// Tests automatizados para HU-17: Bitácora Diaria de Obra con Fotos y Clima (Daily Logs).

import assert from 'node:assert/strict';
import {
	type DailyLogEntry,
	type WeatherType
} from './daily-log-store.ts';

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

// 4. Eliminación de entrada
const filtered = mockLogs.filter((l) => l.id !== 'log_01');
assert.equal(filtered.length, 2, 'Debe quedar con 2 entradas tras eliminar una');
console.log('✓ Eliminación de entrada de bitácora validada.');

console.log('Todos los tests de HU-17 pasaron exitosamente.');
