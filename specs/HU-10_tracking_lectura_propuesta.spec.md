# SPECIFICATION: HU-10
# Tracking de Lectura de la Propuesta en Tiempo Real

@modulo: Módulo 2 - Propuestas Comerciales, Tracking y Firma Electrónica
@id: HU-10
@rol: Administrador / Dueño / Equipo Comercial
@prioridad: Should Have (P1)
@estimacion: 3 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-017 | SRS: 1.1, 2.2

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Dueño de la empresa o vendedor
QUIERO: Recibir una alerta visual y registro de auditoría en el CRM en cuanto el cliente abra el enlace de su propuesta comercial
PARA: Llamar al cliente en el momento preciso en que está revisando la cotización y maximizar la tasa de conversión comercial.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Indicador Visual en el Tablero Kanban:
    - En la tarjeta del lead en la columna "Propuesta Enviada", se añade un badge interactivo:
      - Icono de ojo verde con texto: "Visto hace 12 min (2 aperturas)"
      - Si nunca se ha abierto: badge gris con texto "No abierta aún".

2.2 Timeline de Actividad en la Ficha del Lead:
    - Registro cronológico inmutable:
      - `[20 Nov, 10:15 AM]` Enlace de propuesta generado y copiado para WhatsApp.
      - `[20 Nov, 10:48 AM]` Cliente abrió la propuesta por 1ra vez (Dispositivo: iPhone / iOS Safari).
      - `[20 Nov, 03:22 PM]` Cliente abrió la propuesta por 2da vez (Dispositivo: Mac Desktop / Chrome).

--------------------------------------------------------------------------------
## 3. CONTRATO DE EVENTO Y REGISTRO EN BACKEND
--------------------------------------------------------------------------------
Endpoint: POST /api/v1/public/proposals/{proposal_uuid}/track
Auth: Ninguna (Se ejecuta silenciosamente cuando el cliente carga la página web de la propuesta)

Payload Enviado por el Cliente:
```json
{
  "screen_resolution": "390x844",
  "referrer": "https://api.whatsapp.com/"
}
```

Operación en Backend:
- Registra apertura en tabla de auditoría: `proposal_views` (proposal_id, viewed_at, user_agent, ip_address).
- Actualiza estado del lead a `opened` si estaba en `sent`.
- Incrementa contador de aperturas (`view_count = view_count + 1`).

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Tracking de Lectura de Propuesta Comercial

  Scenario: Registro automático de apertura sin fricción para el cliente
    Given que el contratista compartió el enlace con Magic Link de la propuesta
    When el cliente abre el enlace en su teléfono móvil
    Then la página carga inmediatamente sin solicitar inicio de sesión
    And se emite una llamada en segundo plano a la ruta de tracking
    And en el CRM del contratista la tarjeta muestra el badge verde "Visto hace un momento".
```
