# RESULTADO FASE 2

Fecha: 2026-09-18. Implementación local, no desplegada en esta tarea.
Fase 1 pública confirmada por el usuario. No se hicieron commit ni push.

## Archivos modificados

- `app.js`: validación del catálogo, variantes, claves, cantidades y slider;
  escape de campos de catálogo en HTML; observaciones y Unicode seguro.
- `worker.mjs`: fuente única de cabeceras y CSP.
- `check.cjs`: conserva y amplía las pruebas funcionales con casos adversos.
- `check-deploy.cjs`: verifica cabeceras y preservación de respuestas.
- `check-live.cjs`: comprueba las cabeceras tras el despliegue, además de Fase 1.
- `DEPLOYMENT.md`: nota de estado actual y referencia a esta fase.

## Archivos creados

- `preview-security.cjs`: vista local de dist con las cabeceras del Worker.
- `SECURITY-PHASE2.md`: este informe.

`dist` fue regenerado. Los nuevos archivos internos no forman parte de la
allowlist de 15 archivos. No se eliminaron archivos.

## Security headers implementados

Configuración única en `worker.mjs`, mediante `withSecurityHeaders()`.
Se usa `Headers.set` para reemplazar valores previos, no concatenar políticas.
No existe un segundo `_headers` ni meta CSP. El cuerpo, status y cabeceras
de contenido/caché de ASSETS se conservan.

| Cabecera | Valor | Motivo |
|---|---|---|
| Content-Security-Policy | Política exacta de la siguiente sección | Restringir recursos y ejecución. |
| X-Content-Type-Options | nosniff | Evitar reinterpretación del MIME. |
| Referrer-Policy | strict-origin-when-cross-origin | Limitar referencias enviadas a otros orígenes. |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), payment=(), usb=() | Desactivar capacidades no usadas. |
| X-Frame-Options | DENY | Respaldo frente a framing en clientes antiguos. |
| Cross-Origin-Opener-Policy | same-origin | Aislar relaciones de ventanas cross-origin; no hay OAuth/popups integrados. |

Todas se aplican a respuestas manejadas por el Worker: recursos, redirecciones
y errores retornados por ASSETS. Las pruebas incluyen 200, 206, 304, 404 y 308.
No cubren errores de infraestructura generados fuera de este código.

CORP se evaluó y no se activó: no es necesario para el flujo actual y puede
introducir restricciones a recursos compartidos y problemas de compatibilidad
con visores PDF. No se configura COEP: no hay requisito de aislamiento
cross-origin. HSTS queda expresamente fuera de esta fase.

## CSP final

Valor exacto, en una sola línea HTTP:

```text
default-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self' https://fonts.googleapis.com; style-src-elem 'self' https://fonts.googleapis.com; style-src-attr 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'none'; frame-src 'none'; object-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests;
```

Inspección de compatibilidad:
- Los únicos scripts del documento son menu-data.js y app.js del mismo origen.
- No hay scripts inline, event handlers inline ni necesidad de unsafe-eval.
- Las hojas CSS proceden del mismo origen y de fonts.googleapis.com.
- Las fuentes se descargan de fonts.gstatic.com.
- Imágenes, sprites y logo son locales.
- No hay fetch/XHR/WebSocket ni workers de aplicación.
- El PDF se abre por navegación; no se incrusta con object/iframe.
- WhatsApp, Maps e Instagram son enlaces de navegación, no conexiones fetch.
- No se usan base ni envío nativo de formulario.

Se eliminó unsafe-inline del fallback style-src; se conserva exclusivamente
en style-src-attr. Es necesario para los atributos de estilos de los sprites,
el orden de entrada de tarjetas y las capas existentes. Eliminarlo por completo
requeriría cambiar esa presentación; se deja para otra fase. Las asignaciones
directas mediante element.style conservan su funcionamiento.

La separación style-src-attr/style-src-elem requiere navegadores con CSP3.
Navegadores antiguos que no la reconozcan pueden bloquear estilos inline por
el fallback estricto; no se afirma compatibilidad con navegadores obsoletos.

## Cambios de robustez

- `validateCatalog`: comprueba array, ID con formato seguro, unicidad, nombre
  no vacío, categoría conocida, descripción/included de tipo texto, variantes
  no vacías (también rechaza arrays dispersos), labels y precios enteros
  positivos dentro del rango seguro. Descarta entradas inválidas y copia/
  congela los datos aceptados sin modificar menu-data.js. Duplicados posteriores
  no se incorporan.
- `variantIndex` / `getVariant`: rechazan valores no canónicos, negativos,
  fracciones, NaN, Infinity, índices fuera de rango y productos inexistentes.
- `selectedIndex`: descarta una selección corrupta y recupera la opción inicial
  al renderizar el producto.
- `parseCartKey`: solo acepta ID válido seguido de un índice decimal canónico.
- `orderRows`: elimina entradas corruptas sin lanzar errores y comprueba
  cantidades, importes por línea y sumas seguras. No realiza multiplicaciones
  sobre valores no numéricos.
- `setQuantity` / `changeQuantity`: solo aceptan enteros seguros, respetan
  incrementos/decrementos de una unidad, eliminan al llegar a cero y rechazan
  desbordamientos. No añaden límites comerciales nuevos.
- `addProduct`: valida antes de insertar y no altera el carrito al recibir
  un producto/variante inválido.
- Cambio de variante: verifica índice y producto antes de actualizar selección
  y precio; tolera ausencia del nodo de precio.
- Filtros: solo acepta claves propias del mapa de categorías.
- `setSpread`: rechaza valores no finitos o tipos inválidos y conserva el
  rango 0–100 para entradas numéricas válidas.
- Checkout: revalida el estado antes de continuar. Mantiene el límite de
  500 unidades UTF-16 de maxlength también al construir el mensaje. Unicode
  mal formado se reemplaza antes de encodeURIComponent; emojis válidos se
  conservan. No cambia el texto normal del pedido ni el teléfono.

## Cambios de XSS/DOM

Se conserva el renderizado por plantillas. Se aplica escapeHTML a nombre,
descripción, incluido, labels y texto decorativo derivado del nombre, también
en atributos entre comillas. Los IDs están restringidos antes de usarse en
atributos/selectores. Los estilos de sprites siguen usando valores numéricos
y nombres de archivos de un mapa fijo.

La búsqueda sigue filtrando sin convertirse en HTML. Las notas siguen siendo
texto codificado en un enlace de destino fijo. El botón de ingredientes solo
inserta dos fragmentos HTML constantes. No se agregó eval ni JavaScript inline.

## Pruebas ejecutadas

- `node check.cjs`: PASS. 57 productos / 155 variantes y pruebas previas de
  carrito, búsqueda, miniaturas, precios y WhatsApp, más catálogo malformado,
  duplicados, índices inválidos, claves corruptas, NaN/Infinity, cantidades
  inválidas, rango seguro de importes, slider, notas y escape de markup hostil.
- `node check-deploy.cjs`: PASS. Generación de dist con solo 15 archivos,
  integridad, referencias HTML/CSS y exclusiones. Worker simulado conserva
  308 HTTP→HTTPS, ruta/query y ausencia de bucle. Cabeceras verificadas también
  en 206/304/404, conservando cuerpo, ETag y MIME.
- HTTP local sobre `preview-security.cjs`: los 15 recursos responden 200 con
  cabeceras correctas y bytes idénticos a dist, incluido el PDF.
- Navegador con CSP en enforcement: 57 opciones; búsqueda jalapeno; Ruta 66
  Doble $6.990, dos unidades $13.980; eliminación hasta cero y checkout
  deshabilitado. Notas con &, markup y emoji conservadas como texto codificado.
- Sándwich Italiano con variante Champiñón: $6.000 y línea de carrito correcta.
- Google Fonts: hoja externa presente, estado de fuentes loaded, tipografía
  renderizada; no errores CSP en consola durante el recorrido.
- Imágenes HTML cargadas; sprites con background-image aplicado, ampliación
  de miniatura activa, ticker pausa/reanuda, botón de ingredientes y slider
  por teclado funcionan. No se modificaron reglas prefers-reduced-motion.
- Carrito a 390 px: sin overflow horizontal; Escape cierra y retorna foco.
- Enlaces WhatsApp, Maps e Instagram mantienen URL y noopener. No se enviaron
  pedidos ni se certificó la disponibilidad de aplicaciones externas.
- El visor PDF del navegador integrado quedó en blanco tanto en el servidor
  con cabeceras como en el anterior sin cabeceras. La respuesta PDF y su
  integridad están verificadas; visualización final en Chrome/Safari pendiente.

La vista local delega al Worker una URL HTTPS sintética para poder inspeccionar
las cabeceras finales sobre loopback HTTP. No sustituye el runtime Cloudflare;
las redirecciones se prueban separadamente.

## Resultado del contrato funcional

Preservado en las pruebas realizadas. No cambian datos comerciales, precios,
teléfono, PDF, imágenes, HTML, estilos, selectores, accesibilidad ni estructura.
Los archivos de catálogo y presentación originales permanecen sin cambios.
La allowlist y configuración de Fase 1 permanecen intactas.

## Riesgos residuales

- Falta desplegar Fase 2 y ejecutar `node check-live.cjs` sobre la versión nueva.
  No se atribuyen estas cabeceras a la versión pública actual.
- Validar visualización PDF en navegador con visor disponible y repetir en
  Safari/iPhone; no se añadieron excepciones CSP sin causa demostrada.
- La CSP permite estilos en atributos. No sustituye escape contextual.
- El catálogo es JavaScript local ejecutable; validarlo no protege frente a
  compromiso del repositorio o de scripts del mismo origen.
- Miniaturas siguen ligadas al orden del catálogo. Un cambio futuro del
  catálogo requiere revisar esa correspondencia.
- El subtotal y mensaje WhatsApp son modificables por el cliente. El local
  debe confirmar disponibilidad, despacho y total; no hay pago autenticado.
- La defensa del DOM no pretende tolerar cualquier cambio estructural del HTML.

## Cambios NO realizados

- No se implementó HSTS, includeSubDomains ni preload de HSTS.
- No hubo rediseño, optimización visual ni optimización de imágenes.
- No se modificaron precios ni catálogo.
- No se añadió framework, dependencia ni persistencia del carrito.
- No se implementaron SEO avanzado, COEP ni CORP.
- No se realizaron commit, push ni deploy.

## Recomendaciones para Fase 3

1. Después de publicar esta fase, verificar cabeceras públicas y cerrar la
   comprobación del PDF en Chrome/Safari y del flujo en dispositivos reales.
2. Consolidar fuente única de catálogo/PDF/promociones y asociación de sprites
   por ID, con aprobación comercial de cualquier dato nuevo.
3. Abordar accesibilidad y rendimiento de la auditoría sin perder identidad.
4. Con dominio definitivo operativo, revisar DNS/certificados y evaluar HSTS
   de forma independiente.

## Referencias técnicas

- Cloudflare: https://developers.cloudflare.com/workers/static-assets/headers/
- CSP de atributos CSS: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src-attr
- COOP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy
- CORP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Resource-Policy
