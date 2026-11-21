# SPECIFICATION: HU-15
# Cotización y Firma de Órdenes de Cambio (Adicionales de Obra)

@modulo: Módulo 3 - Control de Costos (Job Costing) y Órdenes de Cambio
@id: HU-15
@rol: Contratista / Cliente Final
@prioridad: Must Have (P0)
@estimacion: 5 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-024, RN-002 | SRS: 1.1, 2.2, 3.1

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Contratista general
QUIERO: Cotizar un trabajo adicional solicitado por el cliente en obra y enviarle un enlace para que lo apruebe y firme digitalmente
PARA: Garantizar el cobro del 100% de los adicionales y erradicar disputas financieras al liquidar la obra.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Creación Rápida de Orden de Cambio (`change_order`):
    - Modal simplificado de 3 campos:
      1. Título y Justificación: ej. "Instalación de 6 puntos eléctricos adicionales en isla de cocina solicitados por el cliente".
      2. Costo Directo Interno: $ 180.00
      3. Precio de Venta al Cliente: $ 260.00 (calculado automáticamente por margen o digitado).
    - Asignación de días de prórroga al cronograma (opcional): "+ 2 días hábiles".

2.2 Envío Ágil al Teléfono del Cliente:
    - Botón de 1 toque: "Enviar Aprobación por WhatsApp". Genera un enlace directo tipo Magic Link.

2.3 Experiencia de Aprobación del Cliente:
    - El cliente abre el enlace en su móvil y visualiza una tarjeta clara:
      - Obra: Remodelación Casa Campestre
      - Trabajo adicional solicitado: "Instalación de 6 puntos eléctricos..."
      - Valor adicional a pagar: **$ 260.00**
      - Prórroga estimada de entrega: 2 días
    - Lienzo de firma táctil y botón: "Aprobar y Firmar Trabajo Adicional".

2.4 Impacto Automático tras la Firma:
    - Se recalcula de inmediato el valor total del contrato en el portal del cliente (+ $260.00).
    - Se incrementa el presupuesto vigente de costos de la obra (+ $180.00).
    - El residente de obra recibe notificación en su PWA: "Orden de Cambio #1 aprobada. Autorizado para iniciar trabajos".

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y TRANSICIÓN
--------------------------------------------------------------------------------
Endpoint: POST /api/v1/projects/{project_id}/change-orders
Payload:
```json
{
  "title": "Adición de 6 tomas dobles de cocina",
  "cost_amount": 180.00,
  "sale_price_amount": 260.00,
  "additional_days": 2
}
```

Endpoint Firma Cliente: POST /api/v1/public/change-orders/{uuid}/sign
Payload:
```json
{
  "signature_png_base64": "data:image/png;base64,...",
  "signed_by_name": "Marcela Gómez"
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Gestión y Firma de Órdenes de Cambio

  Scenario: Creación y aprobación con impacto en el presupuesto y saldo del cliente
    Given un proyecto con contrato base de $15,000 y costo presupuestado de $11,000
    When el contratista crea una Orden de Cambio por $500 (costo interno $350)
    And el cliente la abre desde WhatsApp y la firma digitalmente
    Then el estado de la orden de cambio pasa a "approved"
    And el valor contractual de la obra se actualiza automáticamente a $15,500
    And el costo presupuestado vigente sube a $11,350
    And el saldo pendiente de cobro en el portal del cliente se incrementa en $500.
```
