---
name: ObraFlow
description: Plataforma SaaS de Gestión de Obras y Presupuestos con Ergonomía de Campo
colors:
  primary: "#F97316"
  primary-hover: "#EA580C"
  primary-light: "#FFF7ED"
  secondary: "#0F172A"
  secondary-light: "#1E293B"
  success: "#10B981"
  success-light: "#ECFDF5"
  warning: "#F59E0B"
  warning-light: "#FEF3C7"
  danger: "#EF4444"
  danger-light: "#FEE2E2"
  neutral-bg: "#F8FAFC"
  neutral-surface: "#FFFFFF"
  neutral-border: "#E2E8F0"
  neutral-border-medium: "#CBD5E1"
  neutral-text: "#0F172A"
  neutral-muted: "#475569"
  neutral-subtle: "#64748B"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.75rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

# Design System: ObraFlow

## Overview

**Creative North Star: "El Casco Blanco Digital" (Precision, Durability & Clarity Under Sunlight)**

ObraFlow es una herramienta de trabajo rudo y precisión financiera concebida para contratistas y maestros de obra en Latinoamérica. La interfaz prioriza la legibilidad bajo luz solar directa, la rapidez de interacción táctil con una sola mano (*Thumb Zone*) y el rigor numérico. La estética huye de la decoración superficial y abraza la claridad estructural de la arquitectura técnica: contrastes firmes, tipografía legible y microinteracciones de confirmación inmediata.

### Key Characteristics:
- **Operate Mode Primero:** Botones y áreas táctiles de mínimo $48 \times 48\text{ px}$ en dispositivos móviles.
- **Doble Sistema Tipográfico:** *Plus Jakarta Sans* para jerarquía editorial y *JetBrains Mono* para datos monetarios, medidas, teléfonos y fechas.
- **Cero Diálogos Nativos:** Cero uso de `alert()`, `confirm()` o `prompt()`. Toda interacción se resuelve mediante modales accesibles y toasts con feedback háptico/visual.
- **Autonomía Local:** Cero dependencias externas en tiempo de ejecución (CDN).

## Colors

Paleta de alto contraste inspirada en la seguridad industrial y la solidez constructiva, garantizando cumplimiento WCAG AA/AAA.

### Primary
- **Naranja Seguridad** (`#F97316` / hover: `#EA580C`): Color de acción principal (CTA), botones flotantes FAB, estados activos y focus rings en Operate Mode.
- **Naranja Tenue** (`#FFF7ED` / borde `#FED7AA`): Fondo para estados de advertencia suave y chips destacados.

### Secondary & Semantic
- **Pizarra Obra / Slate 900** (`#0F172A` / `#1E293B`): Superficies de navegación principal, cabeceras fijas y texto de máximo contraste.
- **Verde Éxito / Esmeralda** (`#10B981` / hover: `#059669`): Presupuestos aprobados, obras activas, sincronización guardada y enlaces directos de WhatsApp.
- **Ámbar Advertencia / Job Costing** (`#F59E0B` / `#D97706` / fondo `#FEF3C7`): Alerta preventiva cuando el consumo presupuestal está entre 85% y 99.9%.
- **Rojo Peligro / Sobrecosto** (`#EF4444` / `#DC2626` / fondo `#FEE2E2`): Sobrecostos críticos ($\ge 100\%$) y saldo disponible en déficit negativo.

### Neutral
- **Fondo Lienzo** (`#F8FAFC`): Base limpia y fría para reducir el deslumbramiento exterior.
- **Superficie Tarjeta** (`#FFFFFF`): Contenedores modulares con bordes visibles `#E2E8F0` para separación óptica sin sombras pesadas.
- **Texto Primario** (`#0F172A`): Contraste 14:1 contra fondos claros.
- **Texto Secundario Muted** (`#475569`): Etiquetas de apoyo y notas secundarias con ratio superior a 5.5:1.

### The Contrast Floor Rule
> **The Contrast Floor Rule:** Ningún texto informativo o de captura puede tener un ratio de contraste inferior a 4.5:1. En exteriores con luz solar, los grises deslavados son invisibles; se prohíbe el uso de texto con opacidad menor a 0.8 en datos operativos.

## Typography

- **Display & Interface:** *Plus Jakarta Sans* (fallbacks: `system-ui, -apple-system, sans-serif`).
- **Mono / Financial Data:** *JetBrains Mono* (fallbacks: `monospace`).

### Hierarchy
- **Display** (800, `clamp(2rem, 4vw, 2.75rem)`, 1.15): Títulos principales de sección y resúmenes de impacto.
- **Headline** (700, `1.5rem`, 1.25): Cabeceras de modal y títulos de columna Kanban.
- **Title** (700, `1.125rem`, 1.35): Nombres de prospecto y capítulos de presupuesto.
- **Body** (400 / 500, `0.875rem`, 1.5): Descripciones técnicas, notas de acceso y direcciones.
- **Label / Mono** (600 / 800, `0.75rem` / `0.875rem`, 1.2): Valores monetarios (ej. `$ 22.500.000 COP`), porcentajes de AIU y fechas compactas.

### The Currency Integrity Rule
> **The Currency Integrity Rule:** Toda cifra monetaria se renderiza con `white-space: nowrap` y tipografía monospace. El símbolo de moneda jamás debe quedar separado de sus dígitos en una línea anterior.

## Layout

- **Spatial Model:** Cuadrículas fluidas basadas en flexbox y CSS Grid con espaciado de múltiplos de 4px / 8px (`0.25rem`, `0.5rem`, `0.75rem`, `1rem`).
- **Kanban Pipeline:** Columnas horizontales de ancho mínimo `21.5rem` (344 px) con scroll horizontal suave y contención estricta `overflow: hidden` en tarjetas.
- **Ficha de Trabajo en Sitio:** Diseño en 2 columnas asimétricas (`1.15fr 0.85fr`) en pantallas de escritorio ($\ge 1024\text{ px}$) y flujo vertical ordenado en teléfonos.

## Elevation & Depth

La interfaz de campo privilegia la solidez planar sobre las sombras difusas. La profundidad se comunica primariamente mediante bordes sutiles de 1px (`#E2E8F0` o `#CBD5E1`) y fondos tonales.

### Shadow Vocabulary
- **Card Rest:** `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04)` (separación limpia).
- **Card Hover / Lift:** `box-shadow: 0 6px 14px rgba(15, 23, 42, 0.1)` (respuesta al cursor).
- **Modal Backdrop:** `backdrop-filter: blur(4px); background-color: rgba(15, 23, 42, 0.65)` (enfoque inmersivo).

## Shapes

- **Tarjetas y Paneles:** Esquinas redondeadas `0.75rem` (12px) y `0.875rem` (14px).
- **Botones y Controles:** Radio de `0.5rem` (8px).
- **Pills y Badges:** Radio de `9999px` (completamente redondeados).

## Components

- **Botón Primario (`.btn-primary`):** Fondo Naranja `#F97316`, texto blanco, altura mínima 48 px en móvil, hover `#EA580C`.
- **Píldora WhatsApp (`.btn-card-wa-pill`):** Fondo verde menta `#ECFDF5`, borde `#A7F3D0`, texto `#047857`, icono SVG de 13x13 px.
- **Tarjetas Kanban (`.lead-card`):** Contenedor rígido `box-sizing: border-box`, `overflow: hidden`, franjas contextuales para visita agendada y motivo de descarte.
- **Modales Personalizados:** Encabezado con icono temático, título y subtítulo descriptivo, botón de cierre de 48x48 px y barra inferior de acciones con botón de cancelar neutro y botón de confirmación de alto contraste.

## Do's and Don'ts

### Do's
- Mantener siempre touch targets de al menos $48 \times 48\text{ px}$ en cualquier control táctil.
- Usar iconos SVG limpios (Feather/Lucide style) para todas las acciones visuales.
- Proporcionar confirmación visual inmediata (toasts o cambios de estado) en cada guardado.
- Incluir anillos de foco accesibles `:focus-visible` de 2px en color Naranja Seguridad.

### Don'ts
- **PROHIBIDO:** Usar emojis como iconos de interfaz (usar siempre SVG vectorial).
- **PROHIBIDO:** Usar `alert()`, `confirm()` o `prompt()` nativos del navegador.
- **PROHIBIDO:** Importar fuentes o librerías desde CDNs externas en tiempo de ejecución.
- **PROHIBIDO:** Dejar que cifras numéricas o botones de acción desborden el ancho del contenedor.
