# SPECIFICATION: HU-11
# Firma Electrónica Táctil sin Contraseña para el Cliente

@modulo: Módulo 2 - Propuestas Comerciales, Tracking y Firma Electrónica
@id: HU-11
@rol: Cliente Final del Proyecto
@prioridad: Must Have (P0)
@estimacion: 5 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-018, RNF-004 | SRS: 1.1 (SignatureService), 1.2, 2.2

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Cliente final de la remodelación u obra
QUIERO: Abrir el enlace de la propuesta en mi celular, revisar el alcance y firmar con mi dedo en la pantalla táctil
PARA: Aprobar legalmente el inicio de la obra sin imprimir papeles, sin escanear documentos y sin tener que registrarme con contraseñas.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Cero Barreras de Acceso:
    - Acceso directo mediante Magic Link seguro UUIDv4 (`/p/{proposal_token}`).
    - La vista adapta su layout a pantalla de smartphone de una sola columna.

2.2 Lienzo de Firma Digital (Signature Canvas):
    - Componente HTML5 Canvas con suavizado de curvas Bezier cuadráticas para emular tinta líquida real.
    - Área amplia táctil (altura mínima 180px) con línea de base punteada y texto tenue: "Firme aquí con su dedo".
    - Botón de utilidad con icono de borrador: "Borrar trazo y volver a firmar".
    - Pestaña opcional: "Escribir mi nombre con teclado".

2.3 Declaración Legal y Aceptación:
    - Casilla de verificación requerida:
      [x] "He leído, comprendido y acepto los términos de alcance, hitos de pago y especificaciones descritas en este documento".
    - Campo de texto requerido: "Nombre legal y cédula / DNI del firmante".

2.4 Botón de Aprobación:
    - Botón grande de ancho completo: "Aprobar y Firmar Contrato".
    - Estado de carga al pulsar: desactiva clics repetidos, spinner activo y texto: "Sellando y asegurando contrato...".

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y EVIDENCIA CRIPTOGRÁFICA
--------------------------------------------------------------------------------
Endpoint: POST /api/v1/public/proposals/{proposal_uuid}/sign
Auth: Ninguna (Token de propuesta validado)

Payload Request:
```json
{
  "signer_name": "Carlos Alberto Rodríguez",
  "signer_id_number": "CC 79.845.120",
  "signature_png_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "terms_accepted": true
}
```

Generación de Evidencia Criptográfica en Backend:
- Cálculo del hash SHA-256 del contenido contractual en el momento de la firma (`contract_hash`).
- Registro inmutable en base de datos:
  - `signature_url`: Enlace en almacenamiento privado a la imagen vectorial de la firma.
  - `signed_at`: Timestamp UTC certificado.
  - `signer_ip`: Dirección IP pública del cliente.
  - `signer_user_agent`: Cadena de identificación de navegador y dispositivo.
  - `hash_sha256`: Hash del acuerdo para no repudio.

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Firma Electrónica Táctil del Cliente

  Scenario: Firma y aprobación exitosa del contrato desde teléfono móvil
    Given que el cliente visualiza su propuesta comercial en su teléfono
    When dibuja su firma en el recuadro táctil
    And ingresa su nombre legal y número de documento
    And marca la casilla de aceptación de términos
    And presiona el botón "Aprobar y Firmar Contrato"
    Then el sistema almacena la firma con su estampa de tiempo e IP
    And la propuesta cambia de estado a "approved"
    And se despliega una pantalla de confirmación con opción de descargar la copia del contrato en PDF.

  Scenario: Intento de envío sin firma dibujada
    Given que el cliente está en el formulario de firma
    When presiona "Aprobar y Firmar Contrato" sin haber dibujado ningún trazo
    Then el sistema bloquea el envío y resalta el recuadro de firma con borde rojo
    And muestra el mensaje: "Por favor dibuja tu firma antes de continuar".
```
