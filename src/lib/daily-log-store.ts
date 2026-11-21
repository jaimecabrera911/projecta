// src/lib/daily-log-store.ts
// HU-17: Bitácora Diaria de Obra con Fotos y Clima (Daily Logs)
// Motor de persistencia, compresión de fotos WebP en cliente y muro social estilo feed.

export type WeatherType = 'sunny' | 'rainy' | 'cloudy';

export interface TaskProgressUpdate {
	task_id: string;
	task_title: string;
	chapter_name?: string;
	previous_pct: number;
	new_pct: number;
	notes?: string;
}

export interface DailyLogPhoto {
	id: string;
	url: string; // WebP Data URL o SVG técnico
	name: string;
	caption?: string;
	created_at: string;
}

export interface DailyLogEntry {
	id: string;
	project_id: string;
	date: string; // YYYY-MM-DD
	weather: WeatherType;
	officials_count: number;
	helpers_count: number;
	total_workers: number;
	downtime_hours: number; // Horas de paro por lluvia o fuerza mayor (0 a 12)
	downtime_reason: string; // Motivo del paro: 'lluvia' | 'fuerza_mayor' | 'otro' | ''
	notes: string;
	visible_to_client: boolean; // HU-18: Selector de Privacidad (true: visible para cliente / false: uso interno confidencial)
	tasks_progress?: TaskProgressUpdate[]; // Sincronización bidireccional con actividades del cronograma
	photos: DailyLogPhoto[];
	author_name: string;
	author_role: string;
	created_at: string; // ISO string
}

export const STORAGE_KEY_DAILY_LOGS = 'obraflow_daily_logs_v2';

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD.
 */
export function getTodayDateString(): string {
	return new Date().toISOString().split('T')[0];
}

/**
 * Carga todas las entradas de bitácora almacenadas localmente.
 */
export function loadAllDailyLogs(): DailyLogEntry[] {
	if (typeof window === 'undefined') {
		return getInitialDemoDailyLogs();
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY_DAILY_LOGS);
		if (!raw) {
			const initial = getInitialDemoDailyLogs();
			localStorage.setItem(STORAGE_KEY_DAILY_LOGS, JSON.stringify(initial));
			return initial;
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : getInitialDemoDailyLogs();
	} catch (e) {
		console.error('Error cargando bitácora diaria:', e);
		return getInitialDemoDailyLogs();
	}
}

/**
 * Guarda las entradas de bitácora en localStorage.
 */
export function saveAllDailyLogs(logs: DailyLogEntry[]): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY_DAILY_LOGS, JSON.stringify(logs));
		window.dispatchEvent(new CustomEvent('obraflow:daily-logs-updated'));
	} catch (e) {
		console.error('Error guardando bitácora diaria:', e);
	}
}

/**
 * Retorna las entradas de bitácora ordenadas en orden cronológico inverso (la más reciente arriba).
 */
export function getDailyLogsByProject(projectId: string): DailyLogEntry[] {
	const all = loadAllDailyLogs();
	return all
		.filter((log) => log.project_id === projectId)
		.sort((a, b) => new Date(b.date + 'T' + (b.created_at.split('T')[1] || '00:00:00')).getTime() -
			new Date(a.date + 'T' + (a.created_at.split('T')[1] || '00:00:00')).getTime());
}

/**
 * Retorna las entradas de bitácora autorizadas para el cliente (visible_to_client === true).
 * Cumple con el criterio de seguridad de la HU-18: ninguna nota ni foto confidencial es expuesta.
 */
export function getClientVisibleDailyLogs(projectId: string): DailyLogEntry[] {
	return getDailyLogsByProject(projectId).filter((log) => log.visible_to_client === true);
}

/**
 * Crea y publica una nueva entrada de bitácora diaria.
 */
export function createDailyLog(data: {
	project_id: string;
	date?: string;
	weather: WeatherType;
	officials_count: number;
	helpers_count: number;
	downtime_hours?: number;
	downtime_reason?: string;
	notes: string;
	visible_to_client?: boolean;
	tasks_progress?: TaskProgressUpdate[];
	photos?: DailyLogPhoto[];
	author_name: string;
	author_role: string;
}): DailyLogEntry {
	const all = loadAllDailyLogs();
	const now = new Date().toISOString();
	const officials = Math.max(0, data.officials_count || 0);
	const helpers = Math.max(0, data.helpers_count || 0);

	const newEntry: DailyLogEntry = {
		id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
		project_id: data.project_id,
		date: data.date || getTodayDateString(),
		weather: data.weather,
		officials_count: officials,
		helpers_count: helpers,
		total_workers: officials + helpers,
		downtime_hours: Math.max(0, Math.min(12, data.downtime_hours || 0)),
		downtime_reason: data.downtime_reason?.trim() || '',
		notes: data.notes.trim(),
		visible_to_client: data.visible_to_client !== undefined ? data.visible_to_client : true,
		tasks_progress: data.tasks_progress || [],
		photos: data.photos || [],
		author_name: data.author_name.trim() || 'Residente de Obra',
		author_role: data.author_role.trim() || 'Residente',
		created_at: now
	};

	// Insertar al inicio (cronológico inverso)
	all.unshift(newEntry);
	saveAllDailyLogs(all);

	return newEntry;
}

/**
 * Alterna el estado de privacidad de una bitácora en 1 toque.
 * Permite conmutar entre 'Compartido con el Cliente' y 'Nota Interna Confidencial'.
 */
export function toggleDailyLogVisibility(logId: string): DailyLogEntry {
	const all = loadAllDailyLogs();
	const index = all.findIndex((l) => l.id === logId);
	if (index === -1) {
		throw new Error(`Bitácora no encontrada con ID: ${logId}`);
	}

	const existing = all[index];
	const updated: DailyLogEntry = {
		...existing,
		visible_to_client: !existing.visible_to_client
	};

	all[index] = updated;
	saveAllDailyLogs(all);
	return updated;
}

/**
 * Elimina una entrada de bitácora por su ID.
 */
export function deleteDailyLog(logId: string): boolean {
	const all = loadAllDailyLogs();
	const filtered = all.filter((l) => l.id !== logId);
	if (filtered.length !== all.length) {
		saveAllDailyLogs(filtered);
		return true;
	}
	return false;
}

/**
 * Restablece las entradas de demostración iniciales.
 */
export function resetDemoDailyLogs(): DailyLogEntry[] {
	const initial = getInitialDemoDailyLogs();
	saveAllDailyLogs(initial);
	return initial;
}

/**
 * Comprime una imagen en el cliente convirtiéndola a WebP mediante Canvas (< 800 KB).
 */
export async function compressImageToWebP(file: File, maxSizeBytes: number = 800 * 1024): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = reject;
		reader.onload = (e) => {
			const img = new Image();
			img.onerror = reject;
			img.onload = () => {
				const canvas = document.createElement('canvas');
				let width = img.width;
				let height = img.height;

				// Redimensionar si la resolución es mayor a 1920x1080 para ahorrar memoria
				const maxDimension = 1920;
				if (width > maxDimension || height > maxDimension) {
					if (width > height) {
						height = Math.round((height * maxDimension) / width);
						width = maxDimension;
					} else {
						width = Math.round((width * maxDimension) / height);
						height = maxDimension;
					}
				}

				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					resolve(e.target?.result as string);
					return;
				}

				ctx.drawImage(img, 0, 0, width, height);

				// Intentar comprimir a WebP con calidad 0.82
				try {
					let quality = 0.82;
					let dataUrl = canvas.toDataURL('image/webp', quality);

					// Si supera el límite, reducir calidad iterativamente
					if (dataUrl.length > maxSizeBytes && quality > 0.4) {
						quality = 0.65;
						dataUrl = canvas.toDataURL('image/webp', quality);
					}

					resolve(dataUrl);
				} catch (err) {
					// Fallback a JPEG si WebP no fuera soportado
					resolve(canvas.toDataURL('image/jpeg', 0.8));
				}
			};
			img.src = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	});
}

/**
 * Genera una foto técnica SVG con sello de agua para demostración de bitácora diaria.
 */
export function generateDailyPhotoSvg(projectTitle: string, title: string, weather: WeatherType): string {
	const weatherText = weather === 'sunny' ? 'SOLEADO' : weather === 'rainy' ? 'LLUVIA' : 'NUBLADO';
	const nowStr = new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

	const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
	<defs>
		<linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="#1E293B" />
			<stop offset="100%" stop-color="#0F172A" />
		</linearGradient>
		<pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
			<path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" stroke-width="0.8" opacity="0.35" />
		</pattern>
	</defs>
	<rect width="600" height="450" fill="url(#bgGrad)" />
	<rect width="600" height="450" fill="url(#grid)" />

	<!-- Marco de Obra -->
	<rect x="40" y="50" width="520" height="300" rx="10" fill="#0F172A" stroke="#475569" stroke-width="2" />
	
	<!-- Elemento central ilustrativo -->
	<circle cx="300" cy="180" r="48" fill="#1E293B" stroke="#F97316" stroke-width="3" />
	<path d="M 285 180 L 297 192 L 320 168" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
	
	<text x="300" y="255" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#F8FAFC" text-anchor="middle">
		REGISTRO DIARIO DE AVANCE
	</text>
	<text x="300" y="280" font-family="system-ui, sans-serif" font-size="13" fill="#CBD5E1" text-anchor="middle">
		${title.length > 50 ? title.substring(0, 47) + '...' : title}
	</text>

	<!-- Sello de agua inferior -->
	<rect x="25" y="365" width="550" height="65" rx="8" fill="#000000" fill-opacity="0.8" stroke="#F97316" stroke-width="1.5" />
	<text x="40" y="390" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="bold" fill="#F97316">
		ObraFlow • BITÁCORA TÉCNICA VERIFICADA
	</text>
	<text x="40" y="412" font-family="system-ui, sans-serif" font-size="11" fill="#E2E8F0">
		Fecha: ${nowStr} | Clima: ${weatherText}
	</text>
	<text x="560" y="402" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#10B981" text-anchor="end">
		${projectTitle.length > 30 ? projectTitle.substring(0, 27) + '...' : projectTitle}
	</text>
</svg>
`.trim();

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Entradas de demostración iniciales (Noviembre 2026).
 */
export function getInitialDemoDailyLogs(): DailyLogEntry[] {
	return [
		{
			id: 'log_001',
			project_id: 'proj_andina_001',
			date: '2026-11-20',
			weather: 'sunny',
			officials_count: 3,
			helpers_count: 2,
			total_workers: 5,
			downtime_hours: 0,
			downtime_reason: '',
			notes: 'Jornada completa con clima favorable. Se finalizó el armado de perfiles metálicos en muro divisorio de la sala y se instalaron las cajas de paso eléctricas. Prueba de continuidad exitosa. Sin incidentes de seguridad.',
			visible_to_client: true,
			tasks_progress: [
				{
					task_id: 'task_003',
					task_title: 'Instalación de tubería de desagüe y punto de lavavajillas',
					chapter_name: '02. Redes Hidráulicas y Sanitarias',
					previous_pct: 80,
					new_pct: 100,
					notes: 'Desagües listos con prueba hidráulica a presión.'
				},
				{
					task_id: 'task_005',
					task_title: 'Enchape porcelanato 60x120 en baño principal y nicho de ducha',
					chapter_name: '03. Enchapes y Revestimientos Porcelánicos',
					previous_pct: 50,
					new_pct: 60,
					notes: 'Avance en enchape vertical de zona de ducha.'
				}
			],
			photos: [
				{
					id: 'p_001',
					name: 'estructura_drywall_sala.jpg',
					url: generateDailyPhotoSvg('Penthouse El Poblado', 'Estructura Drywall Sala y perfiles', 'sunny'),
					caption: 'Estructura metálica nivelada y anclada a losa.',
					created_at: '2026-11-20T16:30:00Z'
				},
				{
					id: 'p_002',
					name: 'puntos_electricos_cajas.jpg',
					url: generateDailyPhotoSvg('Penthouse El Poblado', 'Cajas de paso y tubería EMT', 'sunny'),
					caption: 'Instalación de tubería EMT de 1/2 pulgada.',
					created_at: '2026-11-20T17:15:00Z'
				}
			],
			author_name: 'Ing. Mateo Gómez',
			author_role: 'Residente de Obra',
			created_at: '2026-11-20T17:45:00Z'
		},
		{
			id: 'log_002',
			project_id: 'proj_andina_001',
			date: '2026-11-19',
			weather: 'rainy',
			officials_count: 3,
			helpers_count: 1,
			total_workers: 4,
			downtime_hours: 3,
			downtime_reason: 'Lluvia intensa en horas de la tarde — suspensión de labores exteriores',
			notes: 'Lluvia intensa en horas de la tarde. Se suspendió el cargue de escombros en la terraza pero se continuó con labores internas de resane y trazado de puntos hidrosanitarios en baño principal. Personal laboró con EPP completo.',
			visible_to_client: true,
			tasks_progress: [
				{
					task_id: 'task_006',
					task_title: 'Emboquillado epóxico y sellado impermeable en zonas húmedas',
					chapter_name: '03. Enchapes y Revestimientos Porcelánicos',
					previous_pct: 0,
					new_pct: 25,
					notes: 'Mortero hidrófugo aplicado en zonas húmedas.'
				}
			],
			photos: [
				{
					id: 'p_003',
					name: 'resanes_internos_bano.jpg',
					url: generateDailyPhotoSvg('Penthouse El Poblado', 'Resane hidrófugo en baño principal', 'rainy'),
					caption: 'Mortero hidrófugo aplicado en zonas húmedas.',
					created_at: '2026-11-19T15:20:00Z'
				}
			],
			author_name: 'Ing. Mateo Gómez',
			author_role: 'Residente de Obra',
			created_at: '2026-11-19T17:30:00Z'
		},
		{
			id: 'log_003',
			project_id: 'proj_andina_001',
			date: '2026-11-18',
			weather: 'cloudy',
			officials_count: 2,
			helpers_count: 2,
			total_workers: 4,
			downtime_hours: 1,
			downtime_reason: 'Incidente técnico interno en red secundaria',
			notes: 'INCIDENTE TÉCNICO INTERNO: Se presentó rotura accidental de tubería de agua secundaria de 1/2 pulgada al perforar el muro divisorio de la cocina. Se cerró la válvula general en 2 minutos sin daños a acabados. Se reemplazó el tramo afectado con niple y unión rápida CPVC. Se acordó debate técnico con el subcontratista sobre trazado as-built. NOTA CONFIDENCIAL.',
			visible_to_client: false, // HU-18: Nota Interna Confidencial
			photos: [
				{
					id: 'p_004',
					name: 'reparacion_acometida_cocina.jpg',
					url: generateDailyPhotoSvg('Penthouse El Poblado', 'Reparación interna CPVC cocina', 'cloudy'),
					caption: 'Unión rápida y prueba de estanqueidad interna.',
					created_at: '2026-11-18T11:40:00Z'
				}
			],
			author_name: 'Ing. Mateo Gómez',
			author_role: 'Residente de Obra',
			created_at: '2026-11-18T12:30:00Z'
		},
		{
			id: 'log_004',
			project_id: 'proj_andina_001',
			date: '2026-11-17',
			weather: 'sunny',
			officials_count: 2,
			helpers_count: 2,
			total_workers: 4,
			downtime_hours: 0,
			downtime_reason: '',
			notes: 'Se recibió material en obra: 25 bultos de yeso, 40 perfiles cal. 26 y 15 láminas Drywall RH. Se verificó inventario contra remisión de Sodimac Corona. Todo conforme y acopiado bajo techo.',
			visible_to_client: true,
			photos: [
				{
					id: 'p_005',
					name: 'recepcion_material_acopio.jpg',
					url: generateDailyPhotoSvg('Penthouse El Poblado', 'Acopio de láminas RH y perfiles', 'sunny'),
					caption: 'Material estibado bajo cubierta.',
					created_at: '2026-11-17T14:10:00Z'
				}
			],
			author_name: 'Maestro Pedro Flórez',
			author_role: 'Maestro Supervisor',
			created_at: '2026-11-17T16:50:00Z'
		}
	];
}
