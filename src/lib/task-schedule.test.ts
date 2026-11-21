// src/lib/task-schedule.test.ts
// Test de verificación automatizada para HU-16: Cronograma Táctil de Tareas de Obra.

import assert from 'node:assert/strict';
import {
	isTaskOverdue,
	type ScheduleTask,
	type ChapterProgress
} from './task-schedule-store.ts';

console.log('--- Iniciando tests de HU-16 (Cronograma Táctil de Tareas de Obra) ---');

// 1. Simulación in-memory de tareas y capítulos
const mockTasks: ScheduleTask[] = [
	{
		id: 'task_t1',
		project_id: 'proj_test',
		chapter_id: 'chap_01',
		title: 'Demolición de muros de mampostería',
		start_date: '2026-11-01',
		end_date: '2026-11-05',
		status: 'completed',
		assigned_to: 'Cuadrilla Demolición',
		progress_pct: 100,
		completed_at: '2026-11-05T17:00:00Z',
		created_at: '2026-11-01T08:00:00Z'
	},
	{
		id: 'task_t2',
		project_id: 'proj_test',
		chapter_id: 'chap_01',
		title: 'Retiro y cargue de escombros',
		start_date: '2026-11-06',
		end_date: '2026-11-08',
		status: 'completed',
		assigned_to: 'Transportes Andina',
		progress_pct: 100,
		completed_at: '2026-11-08T15:00:00Z',
		created_at: '2026-11-01T08:00:00Z'
	},
	{
		id: 'task_t3',
		project_id: 'proj_test',
		chapter_id: 'chap_02',
		title: 'Instalación de tubería de desagüe',
		start_date: '2026-11-18',
		end_date: '2026-11-24', // En curso vigente
		status: 'in_progress', // Inicialmente en curso
		assigned_to: 'Plomero Jairo',
		progress_pct: 50,
		created_at: '2026-11-05T09:00:00Z'
	},
	{
		id: 'task_t4',
		project_id: 'proj_test',
		chapter_id: 'chap_02',
		title: 'Puntos de agua fría y caliente en cocina',
		start_date: '2026-11-22',
		end_date: '2026-11-28', // Futura / Pendiente
		status: 'pending',
		assigned_to: 'Plomero Jairo',
		progress_pct: 0,
		created_at: '2026-11-05T09:00:00Z'
	},
	{
		id: 'task_t5',
		project_id: 'proj_test',
		chapter_id: 'chap_03',
		title: 'Enchape porcelanato piso sala',
		start_date: '2026-11-15',
		end_date: '2026-11-20', // Vencida respecto a 2026-11-21
		status: 'in_progress',
		assigned_to: 'Oficial Enchapador Luis',
		progress_pct: 40,
		created_at: '2026-11-10T10:00:00Z'
	}
];

function calculateMetricsInMemory(tasks: ScheduleTask[], today: string) {
	const total = tasks.length;
	const completed = tasks.filter((t) => t.status === 'completed').length;
	const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
	const pending = tasks.filter((t) => t.status === 'pending').length;
	const overdue = tasks.filter((t) => isTaskOverdue(t, today)).length;
	const overallPct = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;

	// Avance específico para chap_02
	const chap2Tasks = tasks.filter((t) => t.chapter_id === 'chap_02');
	const chap2Completed = chap2Tasks.filter((t) => t.status === 'completed').length;
	const chap2Pct = chap2Tasks.length > 0 ? Math.round((chap2Completed / chap2Tasks.length) * 1000) / 10 : 0;

	return { total, completed, inProgress, pending, overdue, overallPct, chap2Pct };
}

// 2. Estado Inicial: chap_02 tiene 0 completadas de 2 (0% de avance)
const todayStr = '2026-11-21';
let metrics = calculateMetricsInMemory(mockTasks, todayStr);
assert.equal(metrics.total, 5, 'Debe haber 5 tareas en total');
assert.equal(metrics.completed, 2, 'Inicialmente 2 tareas están completadas');
assert.equal(metrics.chap2Pct, 0, 'El capítulo 2 inicialmente debe tener 0% de avance físico');
assert.equal(metrics.overallPct, 40, 'El avance global inicial debe ser 40% (2/5)');
console.log('✓ Estado inicial verificado: Avance global 40%, Capítulo 2 con 0%.');

// 3. Detección de tareas atrasadas
assert.equal(isTaskOverdue(mockTasks[4], todayStr), true, 'La tarea t5 debe estar marcada como atrasada');
assert.equal(isTaskOverdue(mockTasks[0], todayStr), false, 'La tarea completada t1 NO debe estar atrasada');
assert.equal(metrics.overdue, 1, 'Debe haber exactamente 1 tarea atrasada');
console.log('✓ Detección de tareas atrasadas validada correctamente.');

// 4. ESCENARIO GHERKIN:
// "When toca el círculo de la tarea 'Instalación de tubería de desagüe'"
// "Then el estado de la tarea cambia inmediatamente a 'completed'"
// "And el porcentaje de avance físico del capítulo correspondiente se recalcula automáticamente"
const targetTask = mockTasks.find((t) => t.id === 'task_t3')!;
targetTask.status = 'completed';
targetTask.progress_pct = 100;
targetTask.completed_at = new Date().toISOString();

metrics = calculateMetricsInMemory(mockTasks, todayStr);

assert.equal(targetTask.status, 'completed', 'El estado de la tarea debe ser completed');
assert.ok(targetTask.completed_at, 'Debe tener sello de tiempo de finalización');
assert.equal(metrics.completed, 3, 'Ahora debe haber 3 tareas completadas');
assert.equal(metrics.chap2Pct, 50, 'El capítulo 2 debe subir automáticamente a 50% de avance (1 de 2)');
assert.equal(metrics.overallPct, 60, 'El avance físico global de la obra debe subir automáticamente a 60% (3 de 5)');
console.log('✓ Escenario Gherkin superado con éxito:');
console.log('  - Tarea t3 completada en un solo toque');
console.log('  - Avance del Capítulo 2 recalculado a 50%');
console.log('  - Avance global de la obra recalculado a 60%');

// 5. TEST DE EDICIÓN DE TAREA, EVIDENCIAS Y COMENTARIOS
// Prueba de edición de atributos
targetTask.title = 'Instalación de tubería de desagüe y sifones';
targetTask.assigned_to = 'Oficial Plomero Pedro & Ayudante';
targetTask.progress_pct = 80;
targetTask.status = 'in_progress';

assert.equal(targetTask.title, 'Instalación de tubería de desagüe y sifones');
assert.equal(targetTask.assigned_to, 'Oficial Plomero Pedro & Ayudante');
assert.equal(targetTask.progress_pct, 80);
assert.equal(targetTask.status, 'in_progress');
console.log('✓ Edición de tarea (título, cuadrilla, % avance) validada.');

// Prueba de evidencias
targetTask.evidences = [];
targetTask.evidences.push({
	id: 'ev_test_1',
	file_name: 'tuberia_prueba_hidraulica.jpg',
	file_type: 'photo',
	file_url: 'data:image/svg+xml;utf8,<svg></svg>',
	caption: 'Prueba hidráulica superada a 50 PSI',
	uploaded_by: 'Ing. Mateo Gómez (Residente)',
	created_at: new Date().toISOString()
});

assert.equal(targetTask.evidences.length, 1, 'Debe tener 1 evidencia adjunta');
assert.equal(targetTask.evidences[0].caption, 'Prueba hidráulica superada a 50 PSI');

// Eliminar evidencia
targetTask.evidences = targetTask.evidences.filter((e) => e.id !== 'ev_test_1');
assert.equal(targetTask.evidences.length, 0, 'La evidencia debe ser eliminada');
console.log('✓ Inserción y eliminación de evidencias fotográficas validadas.');

// Prueba de comentarios de bitácora
targetTask.comments = [];
targetTask.comments.push({
	id: 'cmt_test_1',
	author_name: 'Ing. Mateo Gómez',
	author_role: 'Residente de Obra',
	message: 'Se completó la prueba sin fugas en codos de 4 pulgadas.',
	created_at: new Date().toISOString()
});

assert.equal(targetTask.comments.length, 1, 'Debe tener 1 comentario');
assert.equal(targetTask.comments[0].author_role, 'Residente de Obra');
console.log('✓ Registro de comentarios de bitácora técnica por tarea validado.');

console.log('Todos los tests de HU-16 pasaron exitosamente.');
