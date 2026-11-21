// src/lib/daily-log-pdf.ts
// Motor de exportación y generación de Acta de Reporte Diario de Obra en PDF (HU-17)
// Cumple con la directiva de cero dependencias externas de CDN y genera documentos listos para imprimir o guardar como PDF.

import type { DailyLogEntry } from './daily-log-store.ts';

const MONTH_NAMES = [
	'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
	'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = [
	'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

function formatDateFormal(dateStr: string): string {
	if (!dateStr) return '';
	const parts = dateStr.split('-');
	if (parts.length < 3) return dateStr;
	const year = parts[0];
	const monthNum = parseInt(parts[1], 10) - 1;
	const day = parseInt(parts[2], 10);
	const dObj = new Date(parseInt(year, 10), monthNum, day);
	const dayName = DAY_NAMES[dObj.getDay()] || '';
	const monthName = MONTH_NAMES[monthNum] || '';
	return `${dayName}, ${day} de ${monthName} de ${year}`;
}

function escapeHtml(str: string): string {
	return (str || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Genera el documento HTML imprimible del Reporte Diario con estándares técnicos de interventoría colombiana.
 */
export function generateDailyLogPdfHtml(entry: DailyLogEntry, projectTitle: string): string {
	const weatherLabel = entry.weather === 'sunny' ? 'Soleado' : entry.weather === 'rainy' ? 'Lluvia' : 'Nublado';
	const formattedDate = formatDateFormal(entry.date);
	const nowStr = new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
	const photos = entry.photos || [];

	return `<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<title>Reporte_Diario_${entry.date}_${escapeHtml(projectTitle.replace(/[^a-zA-Z0-9]/g, '_'))}</title>
	<style>
		@page {
			size: letter portrait;
			margin: 12mm 15mm 15mm 15mm;
		}
		* {
			box-sizing: border-box;
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
			color: #0F172A;
			background: #FFFFFF;
			margin: 0;
			padding: 0;
			font-size: 11pt;
			line-height: 1.4;
		}
		.report-container {
			width: 100%;
			max-width: 800px;
			margin: 0 auto;
		}
		/* Encabezado Corporativo */
		.report-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: 2.5px solid #0F172A;
			padding-bottom: 10px;
			margin-bottom: 14px;
		}
		.header-logo-brand {
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.brand-badge {
			background-color: #0F172A;
			color: #F97316;
			font-weight: 900;
			font-size: 14pt;
			padding: 4px 10px;
			border-radius: 4px;
			letter-spacing: -0.5px;
		}
		.brand-sub {
			font-size: 8pt;
			color: #64748B;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}
		.report-title-box {
			text-align: right;
		}
		.report-main-title {
			font-size: 13pt;
			font-weight: 900;
			color: #0F172A;
			margin: 0;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}
		.report-code-sub {
			font-size: 8.5pt;
			color: #64748B;
			margin-top: 2px;
			font-family: monospace;
		}

		/* Ficha Técnica del Proyecto */
		.project-meta-grid {
			display: grid;
			grid-template-columns: 2fr 1fr 1fr 1.5fr;
			gap: 8px;
			background-color: #F8FAFC;
			border: 1px solid #E2E8F0;
			border-radius: 6px;
			padding: 10px 14px;
			margin-bottom: 14px;
		}
		.privacy-banner {
			padding: 6px 12px;
			border-radius: 4px;
			font-size: 8pt;
			margin-bottom: 12px;
			font-weight: 700;
			letter-spacing: 0.3px;
		}
		.privacy-banner.confidential {
			background-color: #FEF3C7;
			border: 1px solid #F59E0B;
			color: #92400E;
		}
		.privacy-banner.client-shared {
			background-color: #ECFDF5;
			border: 1px solid #10B981;
			color: #065F46;
		}
		.meta-item {
			display: flex;
			flex-direction: column;
		}
		.meta-label {
			font-size: 7.5pt;
			font-weight: 800;
			color: #64748B;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			margin-bottom: 2px;
		}
		.meta-value {
			font-size: 9.5pt;
			font-weight: 700;
			color: #0F172A;
		}

		/* Métricas de Campo (Cuadrilla y Horas) */
		.metrics-strip {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
			margin-bottom: 14px;
		}
		.metric-box {
			border: 1px solid #CBD5E1;
			border-radius: 6px;
			padding: 8px 12px;
			background-color: #FFFFFF;
		}
		.metric-box.downtime-alert {
			border-color: #F59E0B;
			background-color: #FEF3C7;
		}
		.metric-box-title {
			font-size: 7.5pt;
			font-weight: 800;
			text-transform: uppercase;
			color: #475569;
			margin-bottom: 2px;
		}
		.metric-box.downtime-alert .metric-box-title {
			color: #92400E;
		}
		.metric-box-value {
			font-size: 11pt;
			font-weight: 900;
			color: #0F172A;
			font-family: monospace;
		}
		.metric-box.downtime-alert .metric-box-value {
			color: #B45309;
		}
		.metric-box-sub {
			font-size: 7.5pt;
			color: #64748B;
			margin-top: 1px;
		}

		/* Bloque de Novedades y Actividades */
		.section-block {
			margin-bottom: 14px;
		}
		.section-heading {
			font-size: 9pt;
			font-weight: 800;
			text-transform: uppercase;
			color: #0F172A;
			border-bottom: 1px solid #CBD5E1;
			padding-bottom: 3px;
			margin-bottom: 6px;
			letter-spacing: 0.5px;
		}
		.notes-content {
			font-size: 9.5pt;
			color: #1E293B;
			line-height: 1.5;
			background-color: #FFFFFF;
			border: 1px solid #E2E8F0;
			border-radius: 6px;
			padding: 10px 14px;
			white-space: pre-line;
		}

		/* Cláusula de Horas de Paro */
		.downtime-banner {
			background-color: #FFFBEB;
			border-left: 4px solid #F59E0B;
			padding: 8px 12px;
			margin-bottom: 14px;
			border-radius: 0 4px 4px 0;
			font-size: 8.5pt;
		}
		.downtime-banner-title {
			font-weight: 800;
			color: #B45309;
			margin-bottom: 2px;
		}
		.downtime-banner-desc {
			color: #78350F;
		}

		/* Tabla de Actividades del Cronograma */
		.tasks-table {
			width: 100%;
			border-collapse: collapse;
			font-size: 8.5pt;
			margin-top: 4px;
			margin-bottom: 14px;
		}
		.tasks-table th {
			background-color: #F1F5F9;
			border: 1px solid #CBD5E1;
			padding: 6px 8px;
			font-weight: 800;
			text-transform: uppercase;
			font-size: 7pt;
			color: #334155;
		}
		.tasks-table td {
			border: 1px solid #E2E8F0;
			padding: 6px 8px;
			vertical-align: middle;
		}
		.task-status-pill {
			display: inline-block;
			padding: 2px 6px;
			border-radius: 4px;
			font-size: 7pt;
			font-weight: 800;
			text-transform: uppercase;
		}
		.task-status-pill.done {
			background-color: #ECFDF5;
			color: #047857;
			border: 1px solid #A7F3D0;
		}
		.task-status-pill.prog {
			background-color: #FFF7ED;
			color: #C2410C;
			border: 1px solid #FED7AA;
		}

		/* Cuadrícula de Fotografías */
		.photos-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 10px;
			margin-bottom: 16px;
		}
		.photo-card {
			border: 1px solid #CBD5E1;
			border-radius: 4px;
			overflow: hidden;
			background: #F8FAFC;
			page-break-inside: avoid;
		}
		.photo-img {
			width: 100%;
			height: 150px;
			object-fit: cover;
			display: block;
			background-color: #0F172A;
		}
		.photo-caption {
			padding: 4px 8px;
			font-size: 7.5pt;
			font-weight: 700;
			color: #334155;
			border-top: 1px solid #E2E8F0;
			background-color: #FFFFFF;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		/* Área de Firmas Formales */
		.signatures-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 25px;
			margin-top: 25px;
			page-break-inside: avoid;
		}
		.signature-box {
			border-top: 1.5px solid #0F172A;
			padding-top: 6px;
			text-align: center;
		}
		.sig-name {
			font-size: 9pt;
			font-weight: 800;
			color: #0F172A;
		}
		.sig-role {
			font-size: 8pt;
			color: #64748B;
		}
		.sig-disclaimer {
			font-size: 7pt;
			color: #94A3B8;
			margin-top: 2px;
		}

		/* Footer */
		.report-footer {
			margin-top: 20px;
			border-top: 1px dashed #CBD5E1;
			padding-top: 6px;
			display: flex;
			justify-content: space-between;
			font-size: 7.5pt;
			color: #94A3B8;
		}
	</style>
</head>
<body>
	<div class="report-container">
		<!-- Encabezado -->
		<header class="report-header">
			<div class="header-logo-brand">
				<div class="brand-badge">ObraFlow</div>
				<div>
					<div class="brand-sub">Control Técnico de Obra</div>
					<div style="font-size: 8pt; font-weight: 700; color: #0F172A;">Construcciones &amp; Reformas Andina SAS</div>
				</div>
			</div>
			<div class="report-title-box">
				<h1 class="report-main-title">Acta de Reporte Diario</h1>
				<div class="report-code-sub">REG-OBRA-${entry.id.toUpperCase()}</div>
			</div>
		</header>

		<!-- Distintivo de Privacidad HU-18 -->
		${entry.visible_to_client === false ? `
			<div class="privacy-banner confidential">
				&#9888; DOCUMENTO DE USO INTERNO CONFIDENCIAL &mdash; PROHIBIDA SU DISTRIBUCIÓN AL CLIENTE O TERCEROS (Incidencia o nota técnica interna).
			</div>
		` : `
			<div class="privacy-banner client-shared">
				&#10003; DOCUMENTO AUTORIZADO PARA EL CLIENTE &mdash; Copia oficial autorizada para consulta en el portal web del cliente.
			</div>
		`}

		<!-- Datos del Proyecto -->
		<div class="project-meta-grid">
			<div class="meta-item">
				<span class="meta-label">Proyecto / Obra</span>
				<span class="meta-value">${escapeHtml(projectTitle)}</span>
			</div>
			<div class="meta-item">
				<span class="meta-label">Fecha de la Jornada</span>
				<span class="meta-value">${escapeHtml(formattedDate)}</span>
			</div>
			<div class="meta-item">
				<span class="meta-label">Condición Climática</span>
				<span class="meta-value">${escapeHtml(weatherLabel)}</span>
			</div>
			<div class="meta-item">
				<span class="meta-label">Privacidad / Destino</span>
				<span class="meta-value" style="color: ${entry.visible_to_client === false ? '#B45309' : '#047857'}; font-weight: 800;">
					${entry.visible_to_client === false ? 'Solo Equipo Interno' : 'Visible para Cliente'}
				</span>
			</div>
		</div>

		<!-- Métricas de Operación -->
		<div class="metrics-strip">
			<div class="metric-box">
				<div class="metric-box-title">Personal en Obra</div>
				<div class="metric-box-value">${entry.total_workers} Operarios</div>
				<div class="metric-box-sub">${entry.officials_count} Oficiales + ${entry.helpers_count} Ayudantes</div>
			</div>
			<div class="metric-box ${entry.downtime_hours > 0 ? 'downtime-alert' : ''}">
				<div class="metric-box-title">Suspensión / Paro</div>
				<div class="metric-box-value">${entry.downtime_hours || 0} Horas</div>
				<div class="metric-box-sub">${entry.downtime_hours > 0 ? 'Afectación por clima' : 'Jornada normal sin paro'}</div>
			</div>
			<div class="metric-box">
				<div class="metric-box-title">Responsable de Reporte</div>
				<div class="metric-box-value" style="font-size: 9pt; font-family: inherit;">${escapeHtml(entry.author_name)}</div>
				<div class="metric-box-sub">${escapeHtml(entry.author_role)}</div>
			</div>
		</div>

		${entry.downtime_hours > 0 ? `
			<div class="downtime-banner">
				<div class="downtime-banner-title">CONSTANCIA TÉCNICA DE SUSPENSIÓN TEMPORAL DE ACTIVIDADES:</div>
				<div class="downtime-banner-desc">
					Se registran <strong>${entry.downtime_hours} horas de suspensión</strong> laboral por condiciones climáticas adversas o fuerza mayor.
					${entry.downtime_reason ? `<br><em>Motivo:</em> ${escapeHtml(entry.downtime_reason)}` : ''}
					<br><small>Esta anotación sirve como constancia oficial ante la Interventoría para justificar prórrogas en el cronograma contractual de obra.</small>
				</div>
			</div>
		` : ''}

		<!-- Novedades y Notas de Campo -->
		<div class="section-block">
			<div class="section-heading">Memoria Técnica y Actividades Realizadas</div>
			<div class="notes-content">${escapeHtml(entry.notes)}</div>
		</div>

		<!-- Avance en Actividades del Cronograma (Sincronización en Vivo) -->
		${entry.tasks_progress && entry.tasks_progress.length > 0 ? `
			<div class="section-block">
				<div class="section-heading">Actividades del Cronograma Intervenidas en la Jornada (${entry.tasks_progress.length})</div>
				<table class="tasks-table">
					<thead>
						<tr>
							<th style="text-align: left;">Actividad / Hito</th>
							<th style="width: 140px; text-align: left;">Capítulo</th>
							<th style="width: 90px; text-align: center;">Avance Previo</th>
							<th style="width: 90px; text-align: center;">Nuevo Avance</th>
							<th style="width: 100px; text-align: center;">Estado</th>
						</tr>
					</thead>
					<tbody>
						${entry.tasks_progress.map((tp) => `
							<tr>
								<td>
									<strong>${escapeHtml(tp.task_title)}</strong>
									${tp.notes ? `<div style="font-size: 7.5pt; color: #64748B; margin-top: 2px;"><em>Nota:</em> ${escapeHtml(tp.notes)}</div>` : ''}
								</td>
								<td style="font-size: 8pt; color: #475569;">${escapeHtml(tp.chapter_name || 'Capítulo')}</td>
								<td style="text-align: center; font-family: monospace;">${tp.previous_pct}%</td>
								<td style="text-align: center; font-family: monospace; font-weight: 800; color: #0F172A;">${tp.new_pct}%</td>
								<td style="text-align: center;">
									<span class="task-status-pill ${tp.new_pct === 100 ? 'done' : 'prog'}">
										${tp.new_pct === 100 ? 'Completada' : 'En Ejecución'}
									</span>
								</td>
							</tr>
						`).join('')}
					</tbody>
				</table>
			</div>
		` : ''}

		<!-- Fotografías de Avance -->
		${photos.length > 0 ? `
			<div class="section-block">
				<div class="section-heading">Registro Fotográfico de Avance (${photos.length} ${photos.length === 1 ? 'Foto' : 'Fotos'})</div>
				<div class="photos-grid">
					${photos.slice(0, 4).map((p) => `
						<div class="photo-card">
							<img src="${p.url}" alt="${escapeHtml(p.caption || p.name)}" class="photo-img" />
							<div class="photo-caption">${escapeHtml(p.caption || p.name)}</div>
						</div>
					`).join('')}
				</div>
			</div>
		` : ''}

		<!-- Cuadro de Firmas -->
		<div class="signatures-row">
			<div class="signature-box">
				<div class="sig-name">${escapeHtml(entry.author_name)}</div>
				<div class="sig-role">${escapeHtml(entry.author_role)}</div>
				<div class="sig-disclaimer">Firma y Certificación de Residente</div>
			</div>
			<div class="signature-box">
				<div class="sig-name">Supervisión / Interventoría</div>
				<div class="sig-role">Interventor de Obra o Delegado</div>
				<div class="sig-disclaimer">Visto Bueno y Recepción Técnica</div>
			</div>
		</div>

		<!-- Pie de Página -->
		<footer class="report-footer">
			<span>Generado por ObraFlow SaaS • Plataforma de Gestión de Obras</span>
			<span>Fecha y hora de emisión: ${nowStr}</span>
		</footer>
	</div>

	<script>
		// Auto-invocar impresión al cargar si se abre en ventana independiente
		window.addEventListener('load', () => {
			setTimeout(() => {
				window.print();
			}, 300);
		});
	</script>
</body>
</html>`;
}

/**
 * Abre e imprime el reporte diario en una ventana emergente o iframe limpio.
 */
export function printDailyLogPdf(entry: DailyLogEntry, projectTitle: string): void {
	const html = generateDailyLogPdfHtml(entry, projectTitle);
	const printWindow = window.open('', '_blank', 'width=880,height=960,toolbar=0,scrollbars=1,status=0');
	if (printWindow) {
		printWindow.document.open();
		printWindow.document.write(html);
		printWindow.document.close();
	} else {
		// Fallback mediante iframe oculto si los popups están bloqueados
		let iframe = document.getElementById('obraflow-pdf-iframe') as HTMLIFrameElement | null;
		if (!iframe) {
			iframe = document.createElement('iframe');
			iframe.id = 'obraflow-pdf-iframe';
			iframe.style.position = 'fixed';
			iframe.style.top = '-9999px';
			iframe.style.left = '-9999px';
			iframe.style.width = '1000px';
			iframe.style.height = '1000px';
			document.body.appendChild(iframe);
		}
		const doc = iframe.contentWindow?.document || iframe.contentDocument;
		if (doc) {
			doc.open();
			doc.write(html);
			doc.close();
			setTimeout(() => {
				iframe?.contentWindow?.focus();
				iframe?.contentWindow?.print();
			}, 400);
		}
	}
}
