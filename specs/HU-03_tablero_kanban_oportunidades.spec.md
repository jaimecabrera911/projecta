# SPECIFICATION: HU-03
# Tablero Kanban Visual y Táctil de Oportunidades

@modulo: Módulo 0 - CRM Comercial y Pre-Venta
@id: HU-03
@rol: Administrador / Dueño / Contratista General
@prioridad: Must Have (P0)
@estimacion: 5 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-007, RF-008 | SRS: 1.1, 3.1 (leads.stage)

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Administrador o dueño de la empresa de remodelación
QUIERO: Visualizar el embudo de ventas en columnas por etapa con la suma monetaria acumulada y mover tarjetas táctilmente
PARA: Conocer al instante cuántas propuestas tengo pendientes de cierre y proyectar el flujo de caja del mes.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Distribución del Embudo (Columnas):
    1. `new_lead`: Nuevo Lead
    2. `visit_scheduled`: Visita Agendada
    3. `in_budgeting`: En Presupuesto
    4. `proposal_sent`: Propuesta Enviada
    5. `negotiation`: En Negociación
    6. `won`: Ganado (Contrato Aprobado)
    7. `lost`: Perdido

2.2 Cabeceras de Columna:
    - Nombre de la etapa.
    - Contador de tarjetas (`count`).
    - Suma total monetaria formateada según la divisa de la organización (ej. "$ 45,200 USD").

2.3 Anatomía de la Tarjeta (Lead Card):
    - Título: Nombre del cliente en fuente semibold (15px).
    - Subtítulo: Tipo de proyecto + Dirección recortada.
    - Presupuesto estimado / Cotizado en verde oscuro.
    - Badge de antigüedad: Si tiene más de 3 días sin actualizarse, badge ámbar o rojo.
    - Acción rápida: Botón con icono de WhatsApp con link directo `https://wa.me/{phone}` para abrir chat en 1 clic.
    - Menú contextual (3 puntos): "Editar", "Ver Visita", "Mover a...", "Descartar".

2.4 Interacción Drag & Drop y Touch:
    - Arrastre suave entre columnas mediante puntero o dedo.
    - Feedback visual: Columna destino resalta con borde punteado suave.
    - Al soltar en columna `lost`: Diálogo modal obligatorio:
      "Motivo de Pérdida": [Precio elevado] [Tiempo de entrega] [Eligió competidor] [Sin respuesta] [Otro].

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y ENDPOINT API
--------------------------------------------------------------------------------
Endpoint: PATCH /api/v1/leads/{lead_id}/stage
Auth: Bearer JWT ('owner')

Payload Request:
```json
{
  "stage": "lost",
  "lost_reason": "Precio elevado"
}
```

Respuesta Exitosa (200 OK):
```json
{
  "id": "7b6f685c-6e6c-48be-a6b1-3e4b7c62b0e1",
  "stage": "lost",
  "lost_reason": "Precio elevado",
  "updated_at": "2026-11-20T21:35:00Z"
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Tablero Kanban de Oportunidades

  Scenario: Movimiento de oportunidad y actualización reactiva de sumatorias
    Given que la columna "Propuesta Enviada" tiene 2 tarjetas por $5,000 c/u (Total: $10,000)
    And la columna "Ganado" tiene $0
    When el contratista arrastra una tarjeta de $5,000 a la columna "Ganado"
    Then la API actualiza la etapa a "won"
    And la columna "Propuesta Enviada" muestra 1 tarjeta con total de $5,000
    And la columna "Ganado" muestra 1 tarjeta con total de $5,000
    And se dispara una microanimación de celebración visual.

  Scenario: Mover tarjeta a "Perdido" requiere motivo
    Given una tarjeta en la etapa "En Negociación"
    When el usuario arrastra la tarjeta a la columna "Perdido"
    Then se abre un modal solicitando seleccionar el motivo de pérdida
    When selecciona "Precio elevado" y confirma
    Then la tarjeta se ubica en "Perdido" con el motivo registrado
    And si cancela el modal, la tarjeta regresa automáticamente a "En Negociación".
```
