# SPECIFICATION: HU-19
# Portal Web Consolidado del Cliente sin Contraseña (Magic Link)

@modulo: Módulo 5 - Portal del Cliente y Control de Cobros
@id: HU-19
@rol: Cliente Final de la Obra
@prioridad: Must Have (P0)
@estimacion: 5 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-030, RF-031 | SRS: 1.1 (ClientPortal), 2.2, 3.1

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Cliente final de la obra de remodelación
QUIERO: Acceder desde un enlace que me envían por WhatsApp a un portal privado donde pueda consultar mi saldo, ver fotos de avance y revisar documentos
PARA: Sentirme tranquilo, informado y en control de mi inversión sin tener que llamar o escribir al contratista repetidamente.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Acceso Directo por Enlace Seguro (Magic Link UUIDv4):
    - URL única y privada: `https://app.obraflow.co/portal/{client_access_token}`.
    - Cero registro de usuarios, cero contraseñas olvidadas.

2.2 Navegación Móvil Limpia (3 Pestañas en Bottom Bar):
    1. 💳 **Finanzas:**
       - Tarjeta resumen destacada:
         - Valor Contratado Total: $ 20,850.00
         - Anticipos y Pagos Realizados: $ 12,000.00
         - **Saldo Pendiente por Pagar: $ 8,850.00**
       - Historial de abonos con fecha y soporte.
    2. 📝 **Documentos:**
       - Contrato firmado descargable en PDF.
       - Órdenes de cambio aprobadas o pendientes de firma.
    3. 📸 **Avance:**
       - Muro cronológico de fotos públicas de la bitácora con fechas de avance.

2.3 Banner de Alerta para Firmas Pendientes:
    - Si existe una orden de cambio o adicional pendiente de firma, se despliega una barra azul al tope:
      "Tienes 1 trabajo adicional pendiente de aprobación. Toca aquí para revisar".

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y ENDPOINT API
--------------------------------------------------------------------------------
Endpoint: GET /api/v1/public/portal/{token}
Auth: Ninguna (Token de portal validado con hash en DB)

Respuesta Exitosa (200 OK):
```json
{
  "project_name": "Remodelación Casa 24",
  "contractor_company": "Construcciones y Diseños SAS",
  "contractor_logo_url": "https://storage.obraflow.co/logos/org_1.png",
  "financials": {
    "base_contract_amount": 20000.00,
    "approved_change_orders_amount": 850.00,
    "total_contract_value": 20850.00,
    "total_paid_amount": 12000.00,
    "remaining_balance": 8850.00
  },
  "pending_change_orders_count": 0,
  "recent_approved_photos": [
    {
      "photo_url": "https://storage.obraflow.co/org_1/logs/avance_piso.webp",
      "date": "2026-11-20"
    }
  ]
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Portal Web del Cliente sin Contraseña

  Scenario: Acceso rápido desde enlace de WhatsApp y consulta de saldo
    Given que el cliente hace clic en el enlace de su portal desde WhatsApp
    When la página carga en el navegador de su teléfono móvil
    Then no se solicita ningún inicio de sesión ni contraseña
    And visualiza claramente el total contratado, los pagos aplicados y su saldo pendiente
    And puede explorar las fotos de avance publicadas por el residente de obra.
```
