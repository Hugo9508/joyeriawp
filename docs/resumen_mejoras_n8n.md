# Resumen de Mejoras y Estabilidad: Flujo n8n (v5 y v6)

Este documento detalla la evolución del flujo de n8n para resolver problemas de inestabilidad, errores de integración y falta de control humano.

## 1. Problema Crítico: Flujo "Roto" por Falta de Cuota (v5)
- **Síntoma**: El chat devolvía el mismo mensaje que enviaba el usuario (eco) o un error `500`.
- **Causa Raíz**: 
    1. La API gratuita de Google Gemini (usada por Dify) tiene un límite de 15 RPM / 1500 RPD en `gemini-2.0-flash`, pero el modelo anterior (`gemini-2.5-flash`) tenía solo **20 peticiones por día**.
    2. El nodo de Community de Dify en n8n no maneja correctamente las salidas de error, haciendo que el flujo continuara por la rama de éxito con datos vacíos.
- **Solución (v5 Resiliente)**:
    - **Modo Blocking**: Se eliminó el streaming para evitar errores de parseo.
    - **Validación Explícita**: Se añadió un nodo de código (`🔍 Verificar Respuesta`) después de Dify para comprobar manualmente si la respuesta `answer` está vacía o contiene errores.
    - **Fallback de Emergencia**: Si Dify falla, el flujo deriva automáticamente a un mensaje: *"Tengo mucha demanda, escribinos por WhatsApp"*.

## 2. Problema de Negocio: Vendedor Interrumpiendo a la IA (v6)
- **Síntoma**: Si el vendedor respondía manualmente por WhatsApp, la IA seguía contestando al cliente, creando confusión (dos "personas" hablando a la vez).
- **Solución (v6 Handoff Inteligente)**:
    - **Base de Datos de Estado**: Se creó una tabla `chat_handoff` en Supabase para rastrear qué clientes están siendo atendidos por humanos.
    - **Auto-Pausa**: Cuando el flujo detecta un mensaje saliente del vendedor (`fromMe: true` en WhatsApp), inserta un registro en Supabase pausando la IA por **30 minutos**.
    - **Router de Comandos**: El vendedor puede escribir `#pausa` o `#activar` para controlar manualmente el estado.

## 3. Problema Técnico: Incompatibilidad de Nodos Supabase (v6)
- **Síntoma**: La versión actual de n8n no soportaba operaciones `Upsert` nativas en el nodo Supabase, impidiendo guardar/actualizar el estado correctamente.
- **Solución (v6 HTTP)**:
    - Reemplazo de nodos nativos por **HTTP Request** directos a la API REST de Supabase (`PostgREST`).
    - Uso del header `Prefer: resolution=merge-duplicates` para lograr el comportamiento de "Upsert" (crear o actualizar) de manera robusta.

---

## Resumen de Archivos Entregados

| Archivo | Descripción |
|---|---|
| `docs/n8n_flujo_v5_resiliente.json` | Versión estable con fallback de errores (sin base de datos). |
| `docs/n8n_flujo_v6_handoff.json` | **Versión recomendada**. Incluye Human Handoff, Supabase y comandos. |
| `docs/sql_handoff_table.sql` | Script SQL para crear la tabla necesaria en Supabase. |

**Fecha de Actualización**: 19 de Febrero, 2026
