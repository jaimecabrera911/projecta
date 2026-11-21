# SPECIFICATION: HU-08
# Duplicar Presupuesto como Plantilla

@modulo: Módulo 1 - Catálogo de Costos y Constructor de Presupuestos
@id: HU-08
@rol: Contratista General / Estimador
@prioridad: Should Have (P1)
@estimacion: 3 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-015 | SRS: 2.2, 3.1 (budgets)

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Contratista general o estimador de presupuestos
QUIERO: Duplicar cualquier presupuesto previo con un solo clic y asignarlo a un nuevo cliente
PARA: Ahorrar hasta un 80% del tiempo de cotización en proyectos repetitivos (ej. remodelación estándar de baño o pintura de piso).

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Disparador:
    - Opción "Duplicar como plantilla" en el menú contextual (tres puntos) de cualquier presupuesto existente en la lista o vista detalle.

2.2 Modal de Duplicación Rápida:
    - Campo 1: "Nombre del Nuevo Presupuesto" (Pre-poblado como: "Copia de [Título del Presupuesto Original]").
    - Campo 2: "Asociar a Oportunidad / Cliente" (Dropdown con autocompletado fuzzy para elegir un Lead del CRM o dejar sin asignar).
    - Casilla de verificación: [x] "Copiar costos unitarios vigentes del catálogo maestro" (si los insumos cambiaron de precio, permite actualizar o mantener los originales).

2.3 Redirección y Feedback:
    - Al pulsar "Duplicar Presupuesto", la API clona el presupuesto, sus capítulos y partidas en una transacción atómica.
    - Redirige de inmediato a la pantalla de edición del nuevo presupuesto con estado `draft`.
    - Toast verde superior: "Presupuesto duplicado exitosamente. Ahora puedes ajustar cantidades".

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y ENDPOINT API
--------------------------------------------------------------------------------
Endpoint: POST /api/v1/budgets/{budget_id}/duplicate
Auth: Bearer JWT ('owner')

Payload Request:
```json
{
  "new_title": "Remodelación Apto 402 - Baño y Cocina",
  "target_lead_id": "lead_998877",
  "sync_catalog_prices": false
}
```

Respuesta Exitosa (201 Created):
```json
{
  "new_budget_id": "bud_11223344",
  "title": "Remodelación Apto 402 - Baño y Cocina",
  "status": "draft",
  "version": 1,
  "chapters_copied": 3,
  "items_copied": 18,
  "grand_total": 8750.00
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Duplicar Presupuesto como Plantilla

  Scenario: Duplicación completa de estructura de capítulos y partidas
    Given un presupuesto original con 3 capítulos y 14 partidas por un total de $8,750.00
    When el contratista selecciona "Duplicar como plantilla" y confirma
    Then se crea un nuevo presupuesto con estado "draft" y versión 1
    And se replican exactamente los 3 capítulos y las 14 partidas con sus cantidades y márgenes
    And el usuario es redirigido automáticamente a la vista de edición del nuevo borrador.
```
