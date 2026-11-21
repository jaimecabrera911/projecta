# SPECIFICATION: HU-16
# Cronograma Táctil de Tareas de Obra (Lista / Calendario)

@modulo: Módulo 4 - Cronograma Ligero y Bitácora Diaria (Daily Logs)
@id: HU-16
@rol: Residente de Obra / Contratista
@prioridad: Should Have (P1)
@estimacion: 3 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-026 | SRS: 2.2, 3.1

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Residente de obra en campo o contratista
QUIERO: Una lista táctil y calendario simple de tareas vinculadas a los capítulos del presupuesto con fechas de inicio y fin
PARA: Coordinar las actividades de las cuadrillas sin la fricción de diagramas de Gantt complejos e inmanejables en el celular.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Selector de Vista en Cabecera:
    - Selector segmentado: [Lista de Tareas]  |  [Calendario Semanal / Mensual]

2.2 Interacción Táctil por Toques:
    - Marcar como Completada: Tocar el checkbox circular a la izquierda de la tarea aplica animación de tachado suave, emite una pequeña vibración háptica y actualiza el progreso porcentual del capítulo.
    - Fechas de Inicio y Fin: Selector nativo de fecha móvil (`type="date"`).
    - Asignación de Responsable: Selector tipo chip con avatar y nombre del oficial o cuadrilla asignada.

2.3 Filtro Rápido por Estado:
    - Chips de filtro horizontal: [Todas] [Pendientes] [En Progreso] [Completadas] [Atrasadas (Rojo)].

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y ENDPOINT API
--------------------------------------------------------------------------------
Endpoint: GET /api/v1/projects/{project_id}/tasks
Auth: Bearer JWT ('owner', 'resident')

Endpoint Actualización Rápida: PATCH /api/v1/tasks/{task_id}/status
Payload:
```json
{
  "status": "completed" // 'pending' | 'in_progress' | 'completed' | 'blocked'
}
```

Respuesta Exitosa (200 OK):
```json
{
  "id": "task_8877",
  "project_id": "proj_12345",
  "chapter_id": "chap_03",
  "title": "Fundición de mesón de concreto",
  "status": "completed",
  "completed_at": "2026-11-20T21:42:00Z"
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Cronograma Táctil de Tareas de Obra

  Scenario: Finalización de una tarea en obra desde el móvil
    Given que el residente de obra está visualizando la lista de tareas del proyecto
    When toca el círculo de la tarea "Instalación de tubería de desagüe"
    Then el estado de la tarea cambia inmediatamente a "completed"
    And se refleja una línea de tachado sobre el texto de la tarea
    And el porcentaje de avance físico del capítulo correspondiente se recalcula automáticamente.
```
