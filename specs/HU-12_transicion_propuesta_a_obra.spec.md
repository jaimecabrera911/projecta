# SPECIFICATION: HU-12
# Transición Automática de Propuesta a Obra en Ejecución

@modulo: Módulo 2 - Propuestas Comerciales, Tracking y Firma Electrónica
@id: HU-12
@rol: Sistema / Administrador / Dueño
@prioridad: Must Have (P0)
@estimacion: 5 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-020, RN-004 | SRS: 2.2, 3.1 (projects, budgets.status='frozen')

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Administrador o dueño de la empresa constructora
QUIERO: Que al registrarse la firma del cliente, el sistema congele automáticamente el presupuesto y cree el proyecto activo de obra
PARA: Garantizar que nadie altere la línea base contratada y habilitar de inmediato el control de costos y compras en campo.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN TÉCNICA Y DE COMPORTAMIENTO
--------------------------------------------------------------------------------
2.1 Automatización Disparada por Evento de Firma:
    - En cuanto la API valida la firma de la HU-11, ejecuta una transacción de base de datos (`BEGIN ... COMMIT`):
      1. Actualiza `budgets.status = 'frozen'` (inmutable).
      2. Actualiza `leads.stage = 'won'`.
      3. Inserta registro en la tabla `projects`:
         - `organization_id`: Heredada.
         - `lead_id`: Asociado.
         - `budget_id`: Presupuesto aprobado.
         - `name`: Nombre del proyecto (ej. "Remodelación Apto 502").
         - `address`: Dirección del inmueble.
         - `status`: `'active'`.
         - `total_contract_value`: `budgets.grand_total`.
         - `budget_direct_cost`: `budgets.total_direct_cost`.
      4. Inicializa la línea base de control de costos (`job_costing`).

2.2 Notificaciones y Feedback en el CRM:
    - La tarjeta en el Kanban se traslada con animación a la columna "Ganado".
    - El dueño recibe notificación inmediata con sonido y badge:
      "¡Contrato firmado! El proyecto [Nombre] ha sido creado y está listo para ejecución".
    - Botón de acción directa: "Ir al Panel de Obra".

--------------------------------------------------------------------------------
## 3. INTEGRIDAD Y BLOQUEO DE EDICIÓN
--------------------------------------------------------------------------------
Regla de Inmutabilidad en DB:
- Un trigger en PostgreSQL o validación de middleware impide cualquier operación `UPDATE` o `DELETE` sobre las tablas `budget_chapters` y `budget_items` cuando `budgets.status = 'frozen'`.
- Respuesta si se intenta editar:
```json
// HTTP 422 Unprocessable Entity
{
  "error": "BUDGET_FROZEN",
  "message": "Este presupuesto ha sido firmado contractualmente y no puede editarse. Para modificaciones debes crear una Orden de Cambio."
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Transición Automática a Obra en Ejecución

  Scenario: Creación automática del proyecto al recibir la firma
    Given una propuesta comercial en estado "sent"
    When el cliente completa la firma digital con éxito
    Then el presupuesto cambia inmediatamente a estado "frozen"
    And se crea un nuevo proyecto con estado "active"
    And la oportunidad en el CRM cambia a "won"
    And cualquier intento posterior de modificar precios o cantidades en el presupuesto base es bloqueado con error 422.
```
