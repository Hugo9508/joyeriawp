# Resolución Técnica: Error 503 Service Unavailable en API de Productos

Este documento detalla la arquitectura de resiliencia implementada para estabilizar el endpoint `/api/products` en entornos de hosting compartido (Hostinger), eliminando los bloqueos por latencia de WooCommerce.

## Resumen Ejecutivo
* **Runtime:** Node 20.x LTS (Obligatorio para estabilidad del proceso).
* **Timeout:** Límite estricto de 15 segundos mediante `AbortSignal.timeout`.
* **Cache L1:** Almacenamiento en memoria (Map) con TTL de 2 minutos.
* **Stale-if-error:** Fallback de hasta 10 minutos si el backend falla o excede el timeout.
* **Carga Reducida:** Reducción de `per_page` por defecto de 50 a 20 elementos.
* **Diagnóstico:** Header `X-Cache` (HIT | MISS | STALE) en todas las respuestas.

---

## Diferenciación de Niveles de Cache
Es fundamental entender que esta implementación maneja dos tipos de cache distintos:
1. **Cache-Control (Browser/CDN):** Instruye al cliente para no solicitar el dato de nuevo durante un tiempo. No protege al servidor si muchos clientes diferentes piden el mismo dato.
2. **Cache L1 (In-Memory Server):** Almacena el resultado en la RAM del servidor Next.js. Si 100 usuarios solicitan el mismo producto, el servidor solo realiza **una** llamada a WooCommerce, protegiendo los recursos de CPU y red del hosting.

---

## Explicación Técnica

### 1. Origen del Error 503 en Hosting Compartido
El error 503 ocurría por saturación del "Event Loop" de Node.js. Al no tener timeout ni cache, cada petición al BFF quedaba abierta esperando a WooCommerce. En un entorno con concurrencia limitada, las peticiones lentas acumuladas dejaban al proceso Node en estado "busy", provocando que el servidor web rechazara nuevas conexiones.

### 2. Protección mediante Timeout
Se implementó `AbortSignal.timeout(15000)`. Esto garantiza que ninguna petición al backend quede colgada indefinidamente. Si WooCommerce no responde en 15 segundos, la conexión se cierra, liberando el hilo de ejecución para otras tareas.

### 3. Mecanismo de Cache L1 y Fallback Stale
Se utiliza un objeto `Map` global en el servidor. La clave de cache (`cacheKey`) se genera de forma estable ordenando los parámetros de búsqueda. 
* **TTL (2 min):** Los datos se consideran frescos y se sirven instantáneamente.
* **Stale-if-error (10 min):** Si una petición falla (error 500 o Timeout), el sistema busca en el historial de cache. Si existe una versión previa, la sirve con el estado `STALE`, garantizando que la tienda siga operativa aunque el backend esté caído.

### 4. Optimización de Carga (Payload)
Reducir el `per_page` a 20 disminuye drásticamente el uso de memoria al mapear objetos grandes de WooCommerce y reduce el tiempo de transferencia de red, factor crítico en servidores con ancho de banda compartido.

---

## Guía de Mantenimiento

### Dónde se encuentran los cambios
1. **`src/lib/woocommerce.ts`**: Contiene la lógica central de `fetchWooCommerce` con el sistema de cache y timeout.
2. **`src/app/api/products/route.ts`**: Define los parámetros por defecto y gestiona la respuesta final con los headers de diagnóstico.

### Cómo validar en Producción
Realice peticiones a las siguientes rutas y verifique los headers en el inspector de red:
* `/api/products`
* `/api/products?category=anillos`
* `/api/products?search=oro`

**Lectura del Header `X-Cache`:**
* **MISS:** El dato no estaba en cache, se fue a WooCommerce y se guardó.
* **HIT:** El dato se sirvió instantáneamente desde la memoria del servidor.
* **STALE:** WooCommerce falló o tardó demasiado; se muestra una versión guardada anteriormente.

---

## Notas y Limitaciones
* **Volatilidad:** El cache en memoria es volátil. Si el proceso de Node.js se reinicia o entra en reposo (común en hosting compartido), el cache se vacía.
* **Seguridad:** El sistema está diseñado para no registrar ni loguear las claves `consumer_key` o `consumer_secret`.
* **Escalabilidad:** Esta solución es "best-effort" para entornos sin Redis. En caso de tráfico masivo, el cache se regenerará por cada instancia del servidor.

---
*Documentación generada para el equipo de desarrollo de Joyeria Alianza.*