# Catálogo del Equipo de Agentes (.agents)
## Plataforma ObraFlow

Este directorio contiene las definiciones formales y responsabilidades del equipo de subagentes especializados que operan sobre el proyecto:

| Agente | Archivo de Especificación | Rol Principal |
| :--- | :--- | :--- |
| **Desarrollador** | [developer-agent.md](file:///C:/Users/Usuario/Documents/Proyectos/projecta/.agents/developer-agent.md) | Implementación de componentes Astro, TypeScript, Canvas API y estilos locales. |
| **Pruebas / QA** | [qa-tester-agent.md](file:///C:/Users/Usuario/Documents/Proyectos/projecta/.agents/qa-tester-agent.md) | Validación de criterios de aceptación Gherkin, edge cases, seguridad y honeypots. |
| **Auditor UX/UI** | [ux-ui-reviewer-agent.md](file:///C:/Users/Usuario/Documents/Proyectos/projecta/.agents/ux-ui-reviewer-agent.md) | Auditoría de diseño con la skill `impeccable`, Operate Mode y ergonomía de campo. |

---

## Flujo de Trabajo Colaborativo (Tríada de Desarrollo)
1. **Fase 1 - Implementación:** `developer-agent` construye la historia de usuario siguiendo la especificación `specs/HU-XX_*.spec.md`.
2. **Fase 2 - Aseguramiento de Calidad:** `qa-tester-agent` somete la implementación a pruebas funcionales, validaciones y escenarios límite.
3. **Fase 3 - Auditoría de Diseño Impeccable:** `ux-ui-reviewer-agent` revisa y pule la interfaz garantizando accesibilidad, ergonomía táctil y fidelidad visual.
