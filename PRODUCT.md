# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Dueño / Contratista General (`owner`):**
   - **Situación:** En oficina o desplazándose entre proyectos, supervisando finanzas, cotizaciones y personal.
   - **Trabajo (Job):** Elaborar presupuestos rentables rápidamente, controlar el margen de utilidad en tiempo real, cobrar hitos a tiempo y blindar legalmente cualquier trabajo adicional mediante firma digital.
2. **Residente de Obra / Maestro de Obra (`resident`):**
   - **Situación:** En el sitio de la obra con luz solar directa, manos sucias o guantes, y conectividad intermitente (sótanos).
   - **Trabajo (Job):** Registrar compras menores y jornales con foto del recibo en menos de 1 minuto, documentar la bitácora fotográfica diaria y reportar solicitudes de cambios sin acceso a cifras financieras confidenciales.
3. **Cliente Final (`client`):**
   - **Situación:** Propietario de la vivienda o local comercial, usando su smartphone sin descargar aplicaciones ni recordar contraseñas.
   - **Trabajo (Job):** Revisar y firmar digitalmente la propuesta comercial y órdenes de cambio, conocer su saldo pendiente con transparencia y consultar el avance fotográfico aprobado.

## Product Purpose

**ObraFlow** es una plataforma SaaS multi-tenant diseñada para profesionalizar la operación y proteger el margen de ganancia de contratistas generales y empresas especializadas en remodelaciones integrales, acabados y obra civil liviana en Colombia y Latinoamérica. 

El producto existe para erradicar la fuga silenciosa de dinero causada por órdenes de cambio verbales no cobradas, el extravío de recibos de compra en obra y la desconfianza del cliente final. El éxito significa que una obra se entregue con discrepancia cero entre lo presupuestado y lo ejecutado, con todos los adicionales firmados y cobrados.

## Positioning

La única plataforma de gestión de obra en LATAM diseñada con ergonomía de campo (Operate Mode en PWA offline) que integra captura de leads en <15 segundos, motor de presupuestación dual adaptado a la legislación tributaria regional (IVA general o esquema AIU con IVA exclusivo sobre utilidad), propuestas con firma digital en pantalla y control estricto de costos (Job Costing) con enmascaramiento de márgenes comerciales para el personal operativo.

## Operating Context

- **Entorno Físico:** Obras en ejecución con ruido, polvo, iluminación variable y mala cobertura celular. Se requiere operación con una sola mano (Thumb Zone) y botones de mínimo 48x48 px.
- **Régimen Contractual y Tributario:** Contratos civiles de obra y remodelación bajo legislación colombiana y de la región andina, diferenciando régimen ordinario de IVA del esquema AIU (Administración 10%, Imprevistos 5%, Utilidad 5%, con IVA del 19% liquidado únicamente sobre la Utilidad).
- **Herramientas de Comunicación:** Uso masivo de WhatsApp como canal de interacción con clientes y proveedores.
- **Dispositivos:** Teléfonos inteligentes Android y iOS para campo (PWA con almacenamiento local IndexedDB) y pantallas de escritorio/laptop para estimación y finanzas en oficina.

## Capabilities and Constraints

- **Captura Rápida de Lead:** Formulario minimalista de 4 datos básicos accesible en < 15 segundos vía FAB.
- **Formulario Público Web:** Captación embebible en redes sociales con compresión automática de fotografías en el navegador del cliente (< 800 KB).
- **Catálogo Maestro de Insumos:** Banco reutilizable de partidas categorizadas en Material, Mano de Obra, Equipos y Subcontratos.
- **Presupuestos Paramétricos:** Estructura jerárquica por Capítulos y Partidas con recálculo dinámico de márgenes y selección de esquema IVA vs AIU.
- **Propuestas Digitales y PDF:** Visualización limpia al cliente con firma táctil digital en Canvas y exportación determinista a PDF sin revelar costos directos internos.
- **Línea Base Congelada:** Una vez firmada la propuesta, el presupuesto se congela (`frozen`) y se convierte en obra activa. Modificaciones posteriores exigen Orden de Cambio formal.
- **Job Costing y Gastos de Obra:** Registro de egresos con foto obligatoria de recibo e imputación a capítulo del presupuesto. Comparativo Presupuesto vs Real.
- **Bitácora Diaria (Daily Log):** Registro de cuadrilla, clima y fotos con bandera de privacidad (`visible_to_client: true/false`).
- **Portal del Cliente sin Contraseña:** Enlace único (Magic Link UUIDv4) para revisar estado de cuenta, firmar adicionales y ver fotos autorizadas.
- **Aislamiento Multi-Tenant:** Separación lógica estricta por organización a nivel de base de datos con PostgreSQL Row Level Security (RLS).

## Brand Commitments

- **Nombre:** **ObraFlow** (SaaS de Gestión de Obras y Presupuestos).
- **Identidad Visual:**
  - *Azul Petróleo / Estructura:* `#0F172A` / `#1E293B` (Solidez y formalidad técnica).
  - *Naranja Seguridad / Acción de Obra:* `#F97316` / `#EA580C` (Visibilidad inmediata de botones clave y estados).
  - *Neutro Limpio:* `#F8FAFC` y `#FFFFFF` (Máxima legibilidad bajo luz solar directa).
  - *Tipografía:* *Plus Jakarta Sans* para interfaz y *JetBrains Mono* para datos numéricos y monetarios.
- **Tono de Voz:** Directo, pragmático, respetuoso del lenguaje de construcción de campo, sin tecnicismos innecesarios de software.

## Evidence on Hand

- Documentos de definición de producto y técnica en el repositorio:
  - `PRD.md` — Requerimientos funcionales y arquitectura del producto v2.0.
  - `SPEC_TECNICO_SaaS_OBRA.md` — Especificación de arquitectura técnica, seguridad RLS y DDL de base de datos.
  - `HISTORIAS_DE_USUARIO_UX_UI.md` — Detalle ergonómico de 20 HUs con escenarios Gherkin.
  - Directorio `specs/` — 20 especificaciones funcionales en formato `.spec.md`.

## Product Principles

1. **Operate Mode Primero:** La ergonomía táctil en obra supera a la decoración. Botones grandes, alto contraste y cero formularios de más de 4 campos en campo.
2. **Aislamiento de Márgenes No Negociable:** Ni el residente de obra ni el cliente final tienen acceso a los costos unitarios base del contratista ni a sus márgenes de ganancia.
3. **Cero Fricción para el Cliente:** Los clientes finales no crean usuarios ni recuerdan contraseñas; interactúan mediante enlaces únicos seguros (Magic Link) desde WhatsApp.
4. **Blindaje Total de Adicionales:** Ningún trabajo fuera de presupuesto se ejecuta sin una Orden de Cambio cotizada, enviada y firmada digitalmente.
5. **Cero Pérdida de Recibos:** Cada egreso de caja menor se registra en 3 toques con soporte fotográfico obligatorio para erradicar las discrepancias contables.

## Accessibility & Inclusion

- Cumplimiento de pautas WCAG 2.1 nivel AA: Relación de contraste de texto mínimo 4.5:1 en cuerpo y 3:1 en encabezados.
- Áreas táctiles mínimas de 48x48 px en todos los elementos interactivos móviles.
- Navegación accesible por teclado (`Tab`, `Esc`, `Enter`) y soporte para lectores de pantalla con atributos ARIA en modales y estados.
