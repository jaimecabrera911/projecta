# SPECIFICATION: HU-20
# Registro de Anticipos y Emisión de Estado de Cuenta PDF

@modulo: Módulo 5 - Portal del Cliente y Control de Cobros
@id: HU-20
@rol: Administrador / Dueño de Empresa
@prioridad: Must Have (P0)
@estimacion: 3 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-031, RN-005 | SRS: 1.1, 2.2, 3.1

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Administrador o dueño de la constructora
QUIERO: Registrar los abonos bancarios o en efectivo recibidos del cliente y generar un estado de cuenta en PDF para compartirlo al instante
PARA: Mantener una conciliación transparente de cobros, evitar confusiones sobre saldos pendientes y cobrar oportunamente los hitos de obra.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Modal de Registro de Pago / Anticipo:
    - `Monto Recibido`: Formato monetario automático con separadores de miles.
    - `Fecha del Recaudo`: Selector de fecha (por defecto fecha actual).
    - `Método de Pago`: Chips de selección táctil:
      [Transferencia Bancaria]  [Efectivo]  [Cheque]  [Tarjeta]
    - `Referencia / Comprobante Bancario`: Campo de texto opcional para número de transacción.
    - `Comprobante`: Subida opcional de captura de pantalla o foto de la consignación.

2.2 Emisión y Descarga del Estado de Cuenta en PDF:
    - Botón "Descargar Estado de Cuenta PDF" y botón "Compartir por WhatsApp".
    - El documento PDF presenta:
      - Encabezado con datos fiscales de la constructora y del cliente.
      - Tabla de Aportes Históricos: Fecha, Comprobante, Método de Pago, Monto Recibido.
      - Liquidación Final: Total Contrato (incluyendo adicionales aprobados) - Total Recibido = **Saldo Pendiente**.
      - Datos bancarios de la empresa para el próximo desembolso.

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y ENDPOINT API
--------------------------------------------------------------------------------
Endpoint: POST /api/v1/projects/{project_id}/payments
Auth: Bearer JWT ('owner')

Payload Request:
```json
{
  "amount": 5000000.00,
  "currency": "COP",
  "payment_date": "2026-11-20",
  "payment_method": "transfer",
  "reference_number": "TR-98213744",
  "notes": "Anticipo de inicio de obra 50%"
}
```

Respuesta Exitosa (201 Created):
```json
{
  "id": "pay_887766",
  "project_id": "proj_12345",
  "amount": 5000000.00,
  "new_remaining_balance": 5000000.00,
  "receipt_number": "RC-0012",
  "created_at": "2026-11-20T21:48:00Z"
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Registro de Anticipos y Estado de Cuenta

  Scenario: Registro de abono y actualización reactiva de saldo
    Given un proyecto con un saldo pendiente de $8,850.00
    When el administrador registra un abono de $4,000.00 recibido por transferencia
    Then la API registra el pago con código 201
    And el saldo pendiente se reduce inmediatamente a $4,850.00 en el panel del contratista y en el portal del cliente
    And se habilita el botón para descargar el comprobante de estado de cuenta actualizado en PDF.
```
