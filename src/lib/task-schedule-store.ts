// src/lib/task-schedule-store.ts
// HU-16: Cronograma Táctil de Tareas de Obra (Lista / Calendario / Diagrama de Gantt)
// Motor de persistencia, avance físico por capítulos y timeline temporal.

import { loadAllProjects, getProjectById } from './costing-store.ts';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface TaskEvidence {
	id: string;
	file_name: string;
	file_type: 'photo' | 'document';
	file_url: string; // Data URL o SVG técnico
	caption?: string;
	uploaded_by: string; // ej: "Ing. Mateo Gómez (Residente)"
	created_at: string;
}

export interface TaskComment {
	id: string;
	author_name: string;
	author_role: string;
	message: string;
	created_at: string;
}

export interface ScheduleTask {
	id: string;
	project_id: string;
	chapter_id: string;
	title: string;
	description?: string;
	start_date: string; // YYYY-MM-DD
	end_date: string;   // YYYY-MM-DD
	status: TaskStatus;
	assigned_to: string; // Cuadrilla u oficial
	assigned_role?: string;
	progress_pct: number; // 0 a 100
	completed_at?: string;
	created_at: string;
	evidences?: TaskEvidence[];
	comments?: TaskComment[];
}

export interface ChapterProgress {
	chapter_id: string;
	chapter_name: string;
	total_tasks: number;
	completed_tasks: number;
	in_progress_tasks: number;
	overdue_tasks: number;
	progress_pct: number;
}

export interface ProjectScheduleMetrics {
	total_tasks: number;
	completed_tasks: number;
	in_progress_tasks: number;
	pending_tasks: number;
	overdue_tasks: number;
	overall_progress_pct: number;
	chapter_progress: ChapterProgress[];
}

export const STORAGE_KEY_SCHEDULE_TASKS = 'obraflow_schedule_tasks_v3';

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD.
 */
export function getTodayDateString(): string {
	return new Date().toISOString().split('T')[0];
}

/**
 * Carga todas las tareas almacenadas localmente.
 */
export function loadAllTasks(): ScheduleTask[] {
	if (typeof window === 'undefined') {
		return getInitialDemoTasks();
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY_SCHEDULE_TASKS);
		if (!raw) {
			const initial = getInitialDemoTasks();
			localStorage.setItem(STORAGE_KEY_SCHEDULE_TASKS, JSON.stringify(initial));
			return initial;
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : getInitialDemoTasks();
	} catch (e) {
		console.error('Error cargando tareas de cronograma:', e);
		return getInitialDemoTasks();
	}
}

/**
 * Guarda el array de tareas en localStorage.
 */
export function saveAllTasks(tasks: ScheduleTask[]): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY_SCHEDULE_TASKS, JSON.stringify(tasks));
		window.dispatchEvent(new CustomEvent('obraflow:tasks-updated'));
	} catch (e) {
		console.error('Error guardando tareas de cronograma:', e);
	}
}

/**
 * Obtiene las tareas filtradas por proyecto.
 */
export function getTasksByProject(projectId: string): ScheduleTask[] {
	const all = loadAllTasks();
	return all.filter((t) => t.project_id === projectId);
}

/**
 * Crea una nueva tarea en el cronograma.
 */
export function createTask(data: {
	project_id: string;
	chapter_id: string;
	title: string;
	description?: string;
	start_date: string;
	end_date: string;
	status?: TaskStatus;
	assigned_to: string;
	assigned_role?: string;
}): ScheduleTask {
	const all = loadAllTasks();
	const now = new Date().toISOString();

	const newTask: ScheduleTask = {
		id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
		project_id: data.project_id,
		chapter_id: data.chapter_id,
		title: data.title.trim(),
		description: data.description?.trim() || '',
		start_date: data.start_date || getTodayDateString(),
		end_date: data.end_date || getTodayDateString(),
		status: data.status || 'pending',
		assigned_to: data.assigned_to.trim() || 'Cuadrilla General',
		assigned_role: data.assigned_role?.trim() || 'Oficial',
		progress_pct: data.status === 'completed' ? 100 : 0,
		completed_at: data.status === 'completed' ? now : undefined,
		created_at: now
	};

	all.push(newTask);
	saveAllTasks(all);

	if (typeof window !== 'undefined') {
		window.dispatchEvent(
			new CustomEvent('obraflow:task-created', {
				detail: { task: newTask }
			})
		);
	}

	return newTask;
}

/**
 * Alterna el estado de completada de una tarea (Check táctil en 1 toque).
 * REGLA DE NEGOCIO OBLIGATORIA (HU-16):
 * - Si está completada, pasa a 'in_progress' o 'pending'.
 * - Si no está completada, pasa a 'completed' con 100% y registra completed_at.
 * - Recalcula el avance físico del capítulo y de la obra inmediatamente.
 */
export function toggleTaskComplete(taskId: string): ScheduleTask {
	const all = loadAllTasks();
	const index = all.findIndex((t) => t.id === taskId);
	if (index === -1) {
		throw new Error(`Tarea no encontrada con ID: ${taskId}`);
	}

	const task = all[index];
	const isCompleting = task.status !== 'completed';
	const now = new Date().toISOString();

	const updated: ScheduleTask = {
		...task,
		status: isCompleting ? 'completed' : 'in_progress',
		progress_pct: isCompleting ? 100 : 50,
		completed_at: isCompleting ? now : undefined
	};

	all[index] = updated;
	saveAllTasks(all);

	if (typeof window !== 'undefined') {
		window.dispatchEvent(
			new CustomEvent('obraflow:task-status-changed', {
				detail: { task: updated }
			})
		);
	}

	return updated;
}

/**
 * Actualiza los atributos de una tarea (Edición completa de la actividad).
 * Sincroniza automáticamente progreso y estado de la tarea.
 */
export function updateTask(
	taskId: string,
	patch: Partial<Omit<ScheduleTask, 'id' | 'project_id' | 'created_at'>>
): ScheduleTask {
	const all = loadAllTasks();
	const index = all.findIndex((t) => t.id === taskId);
	if (index === -1) {
		throw new Error(`Tarea no encontrada con ID: ${taskId}`);
	}

	const existing = all[index];
	let newProgressPct = patch.progress_pct !== undefined ? patch.progress_pct : existing.progress_pct;
	let newStatus = patch.status !== undefined ? patch.status : existing.status;
	let completedAt = existing.completed_at;

	// Sincronización automática de avance porcentual y estado
	if (patch.progress_pct !== undefined && patch.status === undefined) {
		if (newProgressPct >= 100) {
			newStatus = 'completed';
			newProgressPct = 100;
			completedAt = completedAt || new Date().toISOString();
		} else if (newProgressPct > 0) {
			newStatus = 'in_progress';
			completedAt = undefined;
		} else {
			newStatus = 'pending';
			completedAt = undefined;
		}
	} else if (patch.status !== undefined && patch.progress_pct === undefined) {
		if (newStatus === 'completed') {
			newProgressPct = 100;
			completedAt = completedAt || new Date().toISOString();
		} else if (newStatus === 'in_progress' && newProgressPct === 0) {
			newProgressPct = 50;
			completedAt = undefined;
		} else if (newStatus === 'pending') {
			newProgressPct = 0;
			completedAt = undefined;
		}
	}

	const updated: ScheduleTask = {
		...existing,
		...patch,
		status: newStatus,
		progress_pct: newProgressPct,
		completed_at: completedAt
	};

	all[index] = updated;
	saveAllTasks(all);

	if (typeof window !== 'undefined') {
		window.dispatchEvent(
			new CustomEvent('obraflow:task-updated', {
				detail: { task: updated }
			})
		);
	}

	return updated;
}

/**
 * Agrega una evidencia fotográfica o documental a una tarea específica.
 */
export function addTaskEvidence(
	taskId: string,
	evidence: Omit<TaskEvidence, 'id' | 'created_at'>
): TaskEvidence {
	const all = loadAllTasks();
	const index = all.findIndex((t) => t.id === taskId);
	if (index === -1) {
		throw new Error(`Tarea no encontrada con ID: ${taskId}`);
	}

	const newEvidence: TaskEvidence = {
		id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
		file_name: evidence.file_name,
		file_type: evidence.file_type || 'photo',
		file_url: evidence.file_url,
		caption: evidence.caption || '',
		uploaded_by: evidence.uploaded_by || 'Residente de Obra',
		created_at: new Date().toISOString()
	};

	const task = all[index];
	const evidences = task.evidences ? [...task.evidences, newEvidence] : [newEvidence];
	all[index] = { ...task, evidences };
	saveAllTasks(all);

	return newEvidence;
}

/**
 * Elimina una evidencia fotográfica de una tarea.
 */
export function deleteTaskEvidence(taskId: string, evidenceId: string): boolean {
	const all = loadAllTasks();
	const index = all.findIndex((t) => t.id === taskId);
	if (index === -1) return false;

	const task = all[index];
	if (!task.evidences) return false;

	const filtered = task.evidences.filter((e) => e.id !== evidenceId);
	if (filtered.length !== task.evidences.length) {
		all[index] = { ...task, evidences: filtered };
		saveAllTasks(all);
		return true;
	}
	return false;
}

/**
 * Agrega un comentario técnico a la bitácora de una tarea.
 */
export function addTaskComment(
	taskId: string,
	comment: Omit<TaskComment, 'id' | 'created_at'>
): TaskComment {
	const all = loadAllTasks();
	const index = all.findIndex((t) => t.id === taskId);
	if (index === -1) {
		throw new Error(`Tarea no encontrada con ID: ${taskId}`);
	}

	const newComment: TaskComment = {
		id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
		author_name: comment.author_name || 'Usuario',
		author_role: comment.author_role || 'Residente de Obra',
		message: comment.message.trim(),
		created_at: new Date().toISOString()
	};

	const task = all[index];
	const comments = task.comments ? [...task.comments, newComment] : [newComment];
	all[index] = { ...task, comments };
	saveAllTasks(all);

	return newComment;
}

/**
 * Genera una imagen SVG técnica como evidencia fotográfica con sello de agua de obra.
 */
export function generateEvidenceSvg(taskTitle: string, caption: string, author: string): string {
	const nowStr = new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
	const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
	<defs>
		<linearGradient id="wallGrad" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="#334155" />
			<stop offset="100%" stop-color="#0F172A" />
		</linearGradient>
		<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
			<path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" stroke-width="0.8" opacity="0.3" />
		</pattern>
	</defs>
	<rect width="600" height="450" fill="url(#wallGrad)" />
	<rect width="600" height="450" fill="url(#grid)" />
	
	<!-- Simulación de elementos constructivos -->
	<rect x="50" y="80" width="500" height="260" rx="8" fill="#1E293B" stroke="#64748B" stroke-width="2" />
	<line x1="50" y1="210" x2="550" y2="210" stroke="#F97316" stroke-width="3" stroke-dasharray="6,4" />
	
	<circle cx="300" cy="180" r="44" fill="#0F172A" stroke="#10B981" stroke-width="4" />
	<path d="M 286 180 L 296 190 L 316 170" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
	
	<!-- Texto central -->
	<text x="300" y="250" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="#F8FAFC" text-anchor="middle">
		REGISTRO TÉCNICO DE CAMPO
	</text>
	<text x="300" y="275" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1" text-anchor="middle">
		${taskTitle.length > 45 ? taskTitle.substring(0, 42) + '...' : taskTitle}
	</text>
	
	<!-- Sello de agua inferior (Watermark de Obra) -->
	<rect x="20" y="370" width="560" height="60" rx="6" fill="#000000" fill-opacity="0.75" stroke="#F97316" stroke-width="1.5" />
	<text x="35" y="393" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="bold" fill="#F97316">
		ObraFlow • EVIDENCIA VERIFICADA
	</text>
	<text x="35" y="415" font-family="system-ui, sans-serif" font-size="11" fill="#E2E8F0">
		Fecha: ${nowStr} | Inspector: ${author}
	</text>
	<text x="565" y="405" font-family="system-ui, sans-serif" font-size="10" fill="#94A3B8" text-anchor="end">
		${caption ? (caption.length > 35 ? caption.substring(0, 32) + '...' : caption) : 'Inspección de obra'}
	</text>
</svg>
`.trim();

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Actualiza el estado específico de una tarea ('pending' | 'in_progress' | 'completed' | 'blocked').
 */
export function updateTaskStatus(taskId: string, status: TaskStatus): ScheduleTask {
	const all = loadAllTasks();
	const index = all.findIndex((t) => t.id === taskId);
	if (index === -1) {
		throw new Error(`Tarea no encontrada con ID: ${taskId}`);
	}

	const now = new Date().toISOString();
	const isCompleted = status === 'completed';

	const updated: ScheduleTask = {
		...all[index],
		status,
		progress_pct: isCompleted ? 100 : status === 'in_progress' ? 50 : 0,
		completed_at: isCompleted ? now : undefined
	};

	all[index] = updated;
	saveAllTasks(all);

	if (typeof window !== 'undefined') {
		window.dispatchEvent(
			new CustomEvent('obraflow:task-status-changed', {
				detail: { task: updated }
			})
		);
	}

	return updated;
}

/**
 * Elimina una tarea por su ID.
 */
export function deleteTask(taskId: string): boolean {
	const all = loadAllTasks();
	const filtered = all.filter((t) => t.id !== taskId);
	if (filtered.length !== all.length) {
		saveAllTasks(filtered);
		return true;
	}
	return false;
}

/**
 * Restablece las tareas de demostración iniciales en el store.
 */
export function resetDemoTasks(): ScheduleTask[] {
	const initial = getInitialDemoTasks();
	saveAllTasks(initial);
	return initial;
}

/**
 * Obtiene la lista de capítulos para un proyecto dado.
 */
export function getProjectChapters(projectId: string): { id: string; name: string }[] {
	const project = getProjectById(projectId);
	if (!project || !project.chapters || project.chapters.length === 0) {
		return [
			{ id: 'chap_01', name: '01. Demoliciones y Retiro de Escombros' },
			{ id: 'chap_02', name: '02. Mampostería, Muros y Drywall' },
			{ id: 'chap_03', name: '03. Instalaciones Hidrosanitarias y Red Eléctrica' },
			{ id: 'chap_04', name: '04. Acabados, Pisos y Enchapes' },
			{ id: 'chap_05', name: '05. Carpintería Arquitectónica y Vidrios' }
		];
	}
	return project.chapters.map((ch) => ({
		id: ch.chapter_id,
		name: ch.name
	}));
}

/**
 * Determina si una tarea está atrasada respecto a la fecha actual.
 */
export function isTaskOverdue(task: ScheduleTask, todayStr: string = getTodayDateString()): boolean {
	if (task.status === 'completed') return false;
	return task.end_date < todayStr;
}

/**
 * Calcula los porcentajes de avance físico global y por capítulos para una obra.
 */
export function calculateProjectScheduleMetrics(projectId: string): ProjectScheduleMetrics {
	const project = getProjectById(projectId);
	const tasks = getTasksByProject(projectId);
	const today = getTodayDateString();

	const totalTasks = tasks.length;
	const completedTasks = tasks.filter((t) => t.status === 'completed').length;
	const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
	const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
	const overdueTasks = tasks.filter((t) => isTaskOverdue(t, today)).length;

	const overallProgressPct =
		totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

	// Avance físico por cada capítulo
	const chapterProgress: ChapterProgress[] = (project?.chapters || []).map((ch) => {
		const chapterTasks = tasks.filter((t) => t.chapter_id === ch.chapter_id);
		const chTotal = chapterTasks.length;
		const chCompleted = chapterTasks.filter((t) => t.status === 'completed').length;
		const chInProgress = chapterTasks.filter((t) => t.status === 'in_progress').length;
		const chOverdue = chapterTasks.filter((t) => isTaskOverdue(t, today)).length;
		const chPct = chTotal > 0 ? Math.round((chCompleted / chTotal) * 1000) / 10 : 0;

		return {
			chapter_id: ch.chapter_id,
			chapter_name: ch.name,
			total_tasks: chTotal,
			completed_tasks: chCompleted,
			in_progress_tasks: chInProgress,
			overdue_tasks: chOverdue,
			progress_pct: chPct
		};
	});

	return {
		total_tasks: totalTasks,
		completed_tasks: completedTasks,
		in_progress_tasks: inProgressTasks,
		pending_tasks: pendingTasks,
		overdue_tasks: overdueTasks,
		overall_progress_pct: overallProgressPct,
		chapter_progress: chapterProgress
	};
}

/**
 * Datos semilla realistas para testing de cronograma (Noviembre - Diciembre 2026).
 */
export function getInitialDemoTasks(): ScheduleTask[] {
	return [
		// --- Proyecto 1: Remodelación Penthouse El Poblado (proj_andina_001) ---
		{
			id: 'task_001',
			project_id: 'proj_andina_001',
			chapter_id: 'chap_01', // Demoliciones y Retiro
			title: 'Demolición de muros divisorios y cielo falso en zona social',
			description: 'Retiro controlado de mampostería no estructural y disposición en costales.',
			start_date: '2026-11-03',
			end_date: '2026-11-07',
			status: 'completed',
			assigned_to: 'Cuadrilla Demolición Hermanos Gómez',
			assigned_role: 'Oficial de Demolición',
			progress_pct: 100,
			completed_at: '2026-11-07T17:00:00Z',
			created_at: '2026-11-01T08:00:00Z',
			evidences: [
				{
					id: 'ev_001',
					file_name: 'demolicion_muro_sala_01.jpg',
					file_type: 'photo',
					file_url: generateEvidenceSvg('Demolición de muros divisorios', 'Muro demolido sin afectar viga', 'Ing. Mateo Gómez'),
					caption: 'Muro divisorio retirado. Zona despejada para instalación de perfiles.',
					uploaded_by: 'Ing. Mateo Gómez (Residente)',
					created_at: '2026-11-06T15:30:00Z'
				}
			],
			comments: [
				{
					id: 'cmt_001',
					author_name: 'Ing. Mateo Gómez',
					author_role: 'Residente de Obra',
					message: 'Se verificó con detector que no pasara tubería hidrosanitaria antes del corte.',
					created_at: '2026-11-04T10:15:00Z'
				},
				{
					id: 'cmt_002',
					author_name: 'Maestro Pedro Flórez',
					author_role: 'Maestro Supervisor',
					message: 'Escombros embolsados y listos para evacuación por el montacargas.',
					created_at: '2026-11-06T16:45:00Z'
				}
			]
		},
		{
			id: 'task_002',
			project_id: 'proj_andina_001',
			chapter_id: 'chap_01',
			title: 'Cargue y evacuación de 3 volquetas de escombros',
			description: 'Transporte a escombrera autorizada San Antonio con manifiesto ambiental.',
			start_date: '2026-11-06',
			end_date: '2026-11-08',
			status: 'completed',
			assigned_to: 'Transportes & Volquetas Andina',
			assigned_role: 'Subcontrato',
			progress_pct: 100,
			completed_at: '2026-11-08T14:30:00Z',
			created_at: '2026-11-01T08:00:00Z'
		},
		{
			id: 'task_003',
			project_id: 'proj_andina_001',
			chapter_id: 'chap_02', // 02. Redes Hidráulicas y Sanitarias
			title: 'Instalación de tubería de desagüe y punto de lavavajillas',
			description: 'Tubería PVC sanitaria 2" y prueba hidráulica a presión.',
			start_date: '2026-11-10',
			end_date: '2026-11-14',
			status: 'completed',
			assigned_to: 'Plomero Especialista Jairo Pérez',
			assigned_role: 'Fontanero',
			progress_pct: 100,
			completed_at: '2026-11-14T18:00:00Z',
			created_at: '2026-11-05T09:00:00Z'
		},
		{
			id: 'task_004',
			project_id: 'proj_andina_001',
			chapter_id: 'chap_02', // 02. Redes Hidráulicas y Sanitarias
			title: 'Montaje de red de suministro CPVC y pruebas de presión a 100 PSI',
			description: 'Distribución de agua fría y caliente en baños y cocina con accesorios RDE 9.',
			start_date: '2026-11-14',
			end_date: '2026-11-18',
			status: 'completed',
			assigned_to: 'Plomero Especialista Jairo Pérez',
			assigned_role: 'Fontanero',
			progress_pct: 100,
			completed_at: '2026-11-18T17:00:00Z',
			created_at: '2026-11-08T10:00:00Z'
		},
		{
			id: 'task_005',
			project_id: 'proj_andina_001',
			chapter_id: 'chap_03', // 03. Enchapes y Revestimientos Porcelánicos
			title: 'Enchape porcelanato 60x120 en baño principal y nicho de ducha',
			description: 'Pegacor flexible blanco y niveladores autonivelantes de cuña.',
			start_date: '2026-11-16',
			end_date: '2026-11-20', // Tarea vencida ayer (Atrasada)
			status: 'in_progress',
			assigned_to: 'Maestro Enchapador Luis Castaño',
			assigned_role: 'Oficial Enchapador',
			progress_pct: 60,
			created_at: '2026-11-12T08:30:00Z'
		},
		{
			id: 'task_006',
			project_id: 'proj_andina_001',
			chapter_id: 'chap_03', // 03. Enchapes y Revestimientos Porcelánicos
			title: 'Emboquillado epóxico y sellado impermeable en zonas húmedas',
			description: 'Sellado antimanchas en juntas de 1.5mm en porcelanato Calacatta.',
			start_date: '2026-11-20',
			end_date: '2026-11-23',
			status: 'in_progress',
			assigned_to: 'Maestro Enchapador Luis Castaño',
			assigned_role: 'Oficial Enchapador',
			progress_pct: 25,
			created_at: '2026-11-14T09:00:00Z'
		},
		{
			id: 'task_007',
			project_id: 'proj_andina_001',
			chapter_id: 'chap_04', // 04. Carpintería Arquitectónica y Acabados
			title: 'Instalación de marcos y puertas entableradas en roble',
			description: 'Fijación con espuma de poliuretano y tornillería oculta.',
			start_date: '2026-11-22',
			end_date: '2026-11-26',
			status: 'pending',
			assigned_to: 'Carpintero Ebanista Darío Morales',
			assigned_role: 'Oficial Carpintero',
			progress_pct: 0,
			created_at: '2026-11-15T14:00:00Z'
		},
		{
			id: 'task_008',
			project_id: 'proj_andina_001',
			chapter_id: 'chap_04', // 04. Carpintería Arquitectónica y Acabados
			title: 'Aplicación de pintura vinilo tipo 1 y acabados finales en cielo raso',
			description: 'Dos manos de acabado mate lavable en zona social y pasillos.',
			start_date: '2026-11-26',
			end_date: '2026-11-30',
			status: 'pending',
			assigned_to: 'Cuadrilla Pintura & Estuco Medellín',
			assigned_role: 'Pintor Oficial',
			progress_pct: 0,
			created_at: '2026-11-18T09:00:00Z'
		},

		// --- Proyecto 2: Adecuación Oficinas Torre Médica (proj_andina_002) ---
		{
			id: 'task_009',
			project_id: 'proj_andina_002',
			chapter_id: 'chap_02_2', // 02. Redes Eléctricas e Iluminación LED
			title: 'Canalización subterránea de voz y datos Cat 6A para consultorios',
			description: 'Instalación de tubería EMT de 1 pulgada y cajas de paso.',
			start_date: '2026-11-15',
			end_date: '2026-11-23',
			status: 'in_progress',
			assigned_to: 'Redes & Conectividad SAS',
			assigned_role: 'Ingeniero de Redes',
			progress_pct: 45,
			created_at: '2026-11-10T10:00:00Z'
		},
		{
			id: 'task_010',
			project_id: 'proj_andina_002',
			chapter_id: 'chap_02_1', // 01. Drywall y Divisiones en Vidrio Templado
			title: 'Instalación de paneles de yeso acústico SoundStop en sala de juntas',
			description: 'Aislamiento de lana mineral de 2.5 pulgadas y sello perimetral acústico.',
			start_date: '2026-11-24',
			end_date: '2026-11-28',
			status: 'pending',
			assigned_to: 'Cuadrilla Drywall Acústico',
			assigned_role: 'Técnico Especialista',
			progress_pct: 0,
			created_at: '2026-11-12T11:00:00Z'
		}
	];
}
