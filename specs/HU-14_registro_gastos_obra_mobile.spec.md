# SPECIFICATION: HU-14
# Registro Rápido de Gastos de Obra en 3 Toques (Mobile-First / PWA Offline)

@modulo: Módulo 3 - Control de Costos (Job Costing) y Órdenes de Cambio
@id: HU-14
@rol: Residente de Obra / Maestro de Obra
@prioridad: Must Have (P0)
@estimacion: 5 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-021, RF-022, RN-003, RNF-002 | SRS: 1.1, 1.2, 2.2, 3.1

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Residente de obra o maestro supervisor en campo
QUIERO: Registrar una compra de materiales o pago de jornal tomando foto a la factura y digitando el monto en mi celular en 3 toques
PARA: Mantener los costos de la obra actualizados sin acumular papeles arrugados ni depender de facturación manual al final de semana.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI (OPERATE MODE EN CAMPO)
--------------------------------------------------------------------------------
2.1 Ergonomía Táctil en 3 Toques:
    - Toque 1: Pulsar botón flotante de cámara grande (56x56 px) fijo en la PWA: "Registrar Gasto".
    - Toque 2: Tomar la foto del recibo o factura con la cámara nativa del teléfono (compresión automática a < 800 KB en < 1 segundo).
    - Toque 3: Digitar el `Monto`, seleccionar el `Capítulo` en botones grandes táctiles (chips) y presionar `Guardar Gasto`.

2.2 Enmascaramiento Estricto de Cifras (Seguridad):
    - El residente de obra NO ve en la pantalla el presupuesto total, ni márgenes, ni precios cobrados al cliente.
    - Únicamente visualiza los nombres técnicos de los capítulos (ej. *01. Plomería*, *02. Pintura*) para imputar el comprobante.

2.3 Tolerancia Offline Total (IndexedDB + Service Workers):
    - Si el residente está en un sótano o zona sin señal celular:
      1. El gasto y la foto se guardan en el almacenamiento local del teléfono (`idb-keyval`).
      2. La tarjeta de gasto se muestra con un badge ámbar: "Pendiente de sincronizar (sin conexión)".
      3. Un Service Worker escucha el evento `sync` o el evento de red `navigator.onLine`.
      4. Al detectar internet, envía los datos en segundo plano y muestra notificación verde de éxito.

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y ENDPOINT API
--------------------------------------------------------------------------------
Endpoint: POST /api/v1/projects/{project_id}/expenses
Auth: Bearer JWT ('owner', 'resident')

Payload (multipart/form-data):
- amount: 145000.00
- currency: "COP"
- chapter_id: "chap_04_acabados"
- concept: "Compra de 3 galones de estuco acrílico y lija"
- receipt_photo: [Binary File] (Compreso < 800 KB)
- client_temp_id: "offline_exp_9981273" (Para deduplicación en re-intentos)

Respuesta Exitosa (201 Created):
```json
{
  "id": "exp_445566",
  "project_id": "proj_12345",
  "chapter_id": "chap_04_acabados",
  "amount": 145000.00,
  "concept": "Compra de 3 galones de estuco acrílico y lija",
  "receipt_url": "https://storage.obraflow.co/org_1/receipts/exp_445566.webp",
  "synced_at": "2026-11-20T21:40:00Z"
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Registro Rápido de Gastos de Obra en PWA

  Scenario: Registro de gasto con captura fotográfica en condiciones normales
    Given que el residente de obra está autenticado en la PWA móvil
    When pulsa el botón flotante "Registrar Gasto"
    And captura la foto del recibo de ferretería
    And digita $45.00 e imputa al capítulo "Pintura"
    Then el archivo de imagen se comprime en el navegador a menos de 800 KB
    And la petición se envía al servidor respondiendo con código 201 en menos de 1 segundo
    And el gasto aparece en la lista con icono de confirmación verde.

  Scenario: Registro de gasto sin conexión a internet (Modo Offline)
    Given que el residente se encuentra en el sótano de una obra sin señal de datos móvil
    When registra un gasto de $80.00 con foto de recibo
    Then la PWA almacena el registro en el almacenamiento local IndexedDB del teléfono
    And muestra el mensaje: "Gasto guardado en tu teléfono. Se subirá al recuperar señal"
    When el dispositivo vuelve a conectarse a internet
    Then la aplicación sincroniza automáticamente el gasto con el servidor sin intervención del usuario.
```
