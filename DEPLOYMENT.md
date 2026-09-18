# Ruta Central — despliegue seguro, Fase 1

> Actualización 18-09-2026: el usuario confirmó las verificaciones públicas
> satisfactorias de Fase 1. Se preparó localmente la Fase 2, documentada en
> `SECURITY-PHASE2.md`, pendiente de su despliegue. Los resultados del día 17
> que siguen son el registro histórico anterior al despliegue de Fase 1.
> `check-live.cjs` ahora comprueba también las cabeceras de Fase 2.

## Estado

Implementación local preparada y probada. Todavía no desplegada desde esta tarea.
No se realizaron commits, push ni cambios en la cuenta Cloudflare.
En la comprobación pública del 17 de septiembre de 2026, `.git/HEAD`,
`.git/config`, `check.cjs`, `preview.cjs` y `assets/GENERACION.md` siguen
respondiendo 200. HTTP sigue respondiendo 200. No dar por cerrada la Fase 1
hasta desplegar y aprobar la verificación pública.

Resultados registrados:
- `node check.cjs`: PASS (57 productos, 155 variantes, carrito, precios,
  codificación WhatsApp, búsqueda y controles de ingredientes).
- `node check-deploy.cjs`: PASS (15 archivos permitidos, integridad de copias,
  referencias, exclusiones y redirección mediante ASSETS simulado).
- Servidor temporal del artefacto: los 15 recursos responden 200 con contenido
  idéntico, incluido PDF válido; las cinco rutas internas principales, 404.
- Navegador sobre dist: 57 opciones, búsqueda `jalapeno` encuentra Ruta Azteca,
  Ruta 66 Doble = $6.990, dos unidades = $13.980; decremento hasta vacío,
  subtotal $0 y checkout deshabilitado. Notas codificadas y maxlength 500.
  Imágenes HTML cargadas, tres hojas de estilo y sin errores de consola.
- Comparación con HEAD: el único archivo original modificado es index.html,
  con una sola línea eliminada. No se alteró lógica, estilos ni assets.
- `node check-live.cjs`: FAIL esperado antes de desplegar, 11 comprobaciones
  pendientes: ocho rutas internas siguen 200, HTML antiguo y dos pruebas HTTP
  sin redirección. Los otros 14 recursos públicos coinciden con dist.

## Mecanismo encontrado y nuevo contrato de publicación

El sitio existe en `ruta-central.roberto-bravo-07.workers.dev`.
El repositorio inicial no tenía configuración Wrangler, package.json ni build
versionado. La exposición comprobada demuestra que se publicaron archivos
ajenos a la web, incluida metadata Git; no se pudo inspeccionar el comando
exacto configurado en el panel.

`wrangler.json` define ahora Workers con Static Assets exclusivamente desde
`./dist`. `build-public.cjs` copia exactamente los 15 archivos de su allowlist,
sin copiar directorios recursivamente. Valida fuentes, rechaza symlinks y
rechaza archivos/directorios inesperados en una salida existente. No elimina
archivos: si dist está contaminado, detiene el build para revisión.

`dist` y `.wrangler` no se versionan. `.gitignore` no es la barrera de publicación:
la barrera es la allowlist y `assets.directory = ./dist`.

Se conservan en el repositorio las herramientas internas, originales PNG de
miniaturas, promociones antiguas, JSON de exportación y documentación. No se
incluyen en dist porque el navegador no los necesita.

## Construir y validar localmente

Desde la raíz del repositorio que contiene `index.html` y `wrangler.json`,
con Node.js 22 o posterior:

```text
node check.cjs
node check-deploy.cjs
```

La segunda orden genera dist y valida bytes, referencias HTML/CSS, archivos
excluidos y redirección. El test del Worker usa un binding ASSETS simulado;
no sustituye una prueba real en Cloudflare. No se instaló Wrangler localmente
ni se ejecutó un dry-run en su runtime.

## Activar en Cloudflare, paso por paso

1. Incorporar los cambios revisados a la rama conectada al Worker mediante
   el flujo Git habitual. Esta tarea no hizo commit ni push. Comprobar antes
   la configuración de build para evitar que una publicación automática use
   aún el comando anterior.
2. En Cloudflare, abrir **Workers & Pages → ruta-central → Settings → Build**
   (la sección puede mostrarse como **Builds**).
3. Comprobar que el directorio raíz es el que contiene `wrangler.json`.
   Si el repositorio conectado es directamente el repositorio de esta carpeta,
   usar su raíz. Si contiene el proyecto como subcarpeta, seleccionar esa
   subcarpeta. No asumir que la ruta local de Windows es una ruta del build.
4. Establecer **Build command**: `node check.cjs && node check-deploy.cjs`.
5. Establecer **Deploy command**: `npx wrangler deploy --config wrangler.json`.
   Usar el Wrangler del entorno de Cloudflare; no es una dependencia nueva
   del sitio. Quitar cualquier opción anterior `--assets .`, `--assets ./`
   o equivalente que publique la raíz. No usar un despliegue solo de assets:
   también debe desplegarse `worker.mjs`.
6. Confirmar que el Worker existente se llama `ruta-central`, como indica
   la URL actual y el campo `name` del archivo. Si el panel indica otro nombre,
   reconciliarlo antes de desplegar; no crear otro Worker por accidente.
7. Ejecutar el despliegue de la revisión nueva y comprobar los logs: los
   tests deben pasar y el directorio de assets debe ser `dist`. Wrangler
   también ejecuta el build declarado en su configuración; repetirlo es
   seguro y evita saltarse validaciones en despliegues fuera del panel.
8. Comprobar que la versión nueva recibe el 100 % del tráfico. No conservar
   tráfico repartido con la versión anterior que expone archivos internos.
9. Desde este repositorio, con acceso a red, ejecutar:
   `node check-live.cjs https://ruta-central.roberto-bravo-07.workers.dev/`.
   El script exige 403/404 para rutas internas, 200 y contenido coincidente
   para recursos públicos, y 301/308 a HTTPS conservando ruta y query.
   No imprime el contenido de archivos internos.
10. Si siguen respondiendo 200 las rutas internas, no cerrar la fase:
    revisar revisión activa, tráfico, comando y directorio. Revisar también
    URLs antiguas de preview y restringir versiones expuestas desde el panel.
    Un despliegue nuevo no revoca automáticamente todos los accesos a previews
    de versiones anteriores. No eliminar historial Git local.

## HTTP → HTTPS

`worker.mjs` comprueba el protocolo de la URL de la solicitud. Para HTTP
devuelve 308 hacia la misma URL con protocolo HTTPS. No altera hostname,
path ni query. HTTPS se delega directamente a `env.ASSETS.fetch(request)`.
No depende de `X-Forwarded-Proto` ni agrega un origen externo.

`assets.run_worker_first = true` es necesario para que el redirect se ejecute
también cuando la ruta corresponde a un asset existente. Implica invocar el
Worker para cada solicitud; revisar cuotas del plan. Se mantiene
`not_found_handling = none` para no convertir rutas inexistentes en un HTML 200.

No es necesario inventar un ajuste de zona para workers.dev: la redirección
queda implementada en código, pendiente de desplegar. El dominio oficial y
sus reglas de zona se revisarán cuando exista.

## Criterios de aceptación y límites

- S-01: ningún archivo Git en dist; rutas Git públicas 403/404 tras desplegar.
- S-02: HTTP 308 (o 301 aplicado previamente por Cloudflare) hacia HTTPS,
  conservando ruta/query; HTTPS no entra en loop.
- S-03: herramientas y documentación interna fuera de dist y no accesibles
  desde la nueva versión pública.
- El HTML solo pierde la línea de desarrollo. CSS, JavaScript, datos,
  imágenes y PDF se copian sin transformar.
- Catálogo: 57 productos, 155 variantes. Se mantienen precios, teléfono,
  notas y lógica del pedido. Las pruebas existentes siguen pasando.
- Sin CSP, HSTS, rediseño, refactor general, optimización de imágenes,
  SEO avanzado, persistencia o dependencias nuevas.

Fuentes oficiales consultadas:
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
- https://developers.cloudflare.com/workers/wrangler/configuration/
