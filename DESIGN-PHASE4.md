# RESULTADO FASE 4

Revisión vigente del propietario: **21 septiembre 2026**. Pre-deploy local realizado contra HEAD `d4835af`. Este documento describe exclusivamente el código actual. Sustituye íntegramente el informe anterior.

## 1. Resumen ejecutivo

Estado: **PASS en la validación local descrita aquí**. Carta negra, acentos amarillos, bordes redondeados, tipografía conservada, H1 escalonado, señales discretas y fotografía del Italiano completa. Este pre-deploy solo corrige documentación y genera evidencia local; no modifica diseño ni lógica. Sin commit, push o deploy.

## 2. Dirección artística aplicada

Street Food Premium sobre negro asfalto, amarillo de señalética y texto claro. Barlow Condensed para identidad/titulares y DM Sans para lectura/controles. Rótulos existentes de Ruta 66, carta, Italiano y ubicación se presentan como señales pequeñas con flecha CSS, sin nuevas promesas comerciales.

## 3. Archivos modificados

Archivos versionados modificados respecto de HEAD:

- `style.css`: sistema visual compartido, tokens, espaciados, controles y radios.
- `experience.css`: composición, carta oscura, amarillo, responsive, encuadre del Italiano, señales y animaciones CSS.
- `index.html`: único cambio, envoltorios `span.headline-line` en las dos primeras líneas del H1 y clase `headline-line` en su `em`. Texto y saltos conservados.

No hay otros archivos versionados modificados. `app.js`, `menu-data.js`, `menu-export.json`, assets, pruebas, Worker, configuración y allowlist coinciden con HEAD según Git. Ningún texto comercial fue cambiado.

## 4. Archivos creados

`DESIGN-PHASE4.md` es nuevo y aún no versionado; debe incluirse junto con los tres archivos fuente en un futuro commit autorizado. Evidencia auxiliar en `../output/fase4/`, fuera del repositorio de este proyecto. `dist/` es artefacto generado, ignorado por Git, y no debe incluirse en el commit.

## 5. Archivos eliminados

Ningún archivo del proyecto eliminado.

## 6. Sistema visual

| Elemento | Estado vigente |
|---|---|
| Fondo / carta | #111210 |
| Superficies | #1b1c19 y #252621 |
| Texto principal | #f3f0e7; se usa como texto claro, no como fondo de la carta |
| Amarillo | #ffc400 |
| Secundario | #b5b5aa |
| Bordes oscuros | #41423a, con bordes de controles más contrastados |
| Familias | Barlow Condensed y DM Sans, solicitudes originales intactas |
| Radio común | 12px en controles/miniaturas |
| Paneles / fotografías | 24px |
| Tarjetas / señales | 16px / 8px |
| Contador del carrito | Circular |
| Espaciado | Escala 8/16/24/32/48/64; gutter 20–80px; secciones 56–112px |
| Grid | Máximo 1600px; dos columnas desktop, una móvil |
| Motion | 160/240/400ms en transiciones; H1 650ms escalonado; ticker 38s |

Foco amarillo en carta oscura y controles. Ticker amarillo usa foco negro; skip link conserva su contorno especial. Variables antiguas secundarias permanecen en CSS sin definir el fondo vigente de la carta.

## 7. Hero

Foto real original, mensaje y CTA conservados. H1 en tres líneas con entrada de 650ms y retrasos 0/120/240ms. Las líneas están presentes como texto HTML y su estilo base no las oculta; si no se aplica animación, siguen visibles. Con animación habilitada la entrada empieza temporalmente en opacidad cero y termina en uno: no depende de JavaScript, observer ni callback para mostrar contenido.

## 8. Header

Sticky de 84px en desktop, dos filas compactas en móvil, fondo sólido, navegación subrayada al hover, botón redondeado y contador circular. Alineación por ancho disponible, incluido el caso 1920px con scrollbar.

## 9. Ruta 66

Panel asfalto de radio 24px; señal amarilla, precio amarillo, capas, etiquetas, botón y slider conservados. Simple $5.300 y Doble $6.990. Botón verificado a 100, Home a 0 y flecha derecha a 1.

## 10. Carta

Fondo negro #111210, texto claro, titular RUTA amarillo, divisor amarillo y filtro activo amarillo con texto negro. Búsqueda y selects oscuros. Conteo amarillo. Filtros conservan todas las categorías y la opción Todo.

## 11. Product Cards

Fichas planas con radio 16px; categorías, códigos, precios e inclusión de papas destacados en amarillo. Compra alineada por fila; ingredientes y variantes no se ocultan. Miniaturas redondeadas, ampliación moderada y sin brillo/giro. thumbnailMap estable por ID, 57 entradas, avisos de imagen ilustrativa conservados.

## 12. Carrito

Dialog nativo, fondo oscuro, divisor amarillo, cantidades/cierre de 44px, subtotal condensado, notas y CTA WhatsApp. Permanece explícito que el negocio confirma disponibilidad, despacho y pedido. No es una pasarela de pago. Comprobado con dos Ruta 66 Doble y subtotal $13.980.

## 13. Promoción

Italiano $6.000, contenido e imagen existentes. Imagen con width:100%, height:auto, aspect-ratio:3/2 y object-fit:contain; figure sin altura mínima fija ni relación de aspecto que recorte. Caption en flujo debajo de la imagen. Radio exterior 24px. Se conserva completa al cambiar ancho, tanto en dos columnas como en móvil.

## 14. Ubicación y footer

Señal amarilla de sección, dirección y enlaces originales, titular claro/amarillo y divisores. Footer alineado con el contenido. No se añadieron horarios, cobertura, coordenadas o información no confirmada.

## 15. Microinteracciones y animaciones

- H1 escalonado mediante CSS, sin JavaScript nuevo.
- `animation-timeline:view()` está dentro de `@supports(animation-timeline:view())` y `prefers-reduced-motion:no-preference`: mejora progresiva para los énfasis de titulares de sección.
- Sin soporte de animation-timeline, esos énfasis permanecen estáticos y visibles; el H1 puede conservar su animación CSS convencional, independiente de dicha API.
- `prefers-reduced-motion:reduce` fija animation:none!important, transform:none!important y opacity:1!important para H1 y énfasis. Las transiciones globales también se desactivan. Las nuevas animaciones no son obligatorias para leer contenido.
- Ticker mantiene pausa; comprobado aria-pressed y animationPlayState. Miniaturas conservan interacción sin agregar productos.

Fallback y reduced motion confirmados por inspección de las reglas CSS actuales; no se emularon otros motores ni la preferencia del sistema en esta sesión. No se confunde esta inspección con una prueba física multinavegador.

## 16. Mobile

320/375/390/430px: carta en una columna, filtros en dos, campos de 16px, controles táctiles conservados y carrito de ancho completo. H1 cabe en su columna. Italiano mantiene relación 3:2 y caption debajo. Sin overflow detectado.

## 17. Tablet

768px: dos columnas, filtros envolventes y miniaturas contenidas. Códigos no invaden cuerpos de producto. H1 y bloques editoriales sin solapamientos en la medición de geometría.

## 18. Desktop y matriz responsive

1024/1440/1920px: ancho máximo controlado y dos columnas. Se validó el catálogo completo de 57 productos y el carrito lleno en los ocho anchos.

| Viewport | Documento client = scroll | Carrito client = scroll | Overflow interno / solapamientos medidos | Italiano |
|---:|---:|---:|---|---|
| 320 | 305 | 304 | 0 / 0 | Completo 3:2 |
| 375 | 360 | 359 | 0 / 0 | Completo 3:2 |
| 390 | 375 | 374 | 0 / 0 | Completo 3:2 |
| 430 | 415 | 414 | 0 / 0 | Completo 3:2 |
| 768 | 753 | 489 | 0 / 0 | Completo 3:2 |
| 1024 | 1009 | 489 | 0 / 0 | Completo 3:2 |
| 1440 | 1425 | 489 | 0 / 0 | Completo 3:2 |
| 1920 | 1905 | 489 | 0 / 0 | Completo 3:2 |

Scrollbar de aproximadamente 15px; borde adicional de 1px en dialog. Mediciones: documento, hero-copy, product-body, product-purchase, sharing-copy, location-details, filtros, códigos versus cuerpo, hermanos de grids hero/Ruta 66/promoción/catálogo y columnas de cart-row. No se afirma una prueba exhaustiva de toda combinación posible de contenido. Fondo de carta computado #111210 y señal de carta #ffc400 en todos los anchos. Las tres líneas de H1 terminan en opacidad 1 y caben; retrasos 0/.12/.24s. Ratio de imagen 1.5 con tolerancia de redondeo subpíxel; cargada en todos los casos.

## 19. Accesibilidad

Skip link, labels, aria-live, teclado, dialog y reduced motion conservados. Miniatura activable con Enter, slider con Home/flecha y Escape para cerrar carrito. Sin cambios en anuncios o lógica comercial. La comprobación de reglas y DOM no certifica WCAG ni reemplaza lector de pantalla real.

## 20. Performance

Medición actual. Para comparar contra los blobs HEAD sin confundir cambios con CRLF de Windows, las columnas comparativas normalizan saltos a LF. La columna disco indica el archivo servido real.

| Archivo | HEAD (LF) | Vigente (LF) | Delta (LF) | Disco vigente |
|---|---:|---:|---:|---:|
| style.css | 11.566 | 13.229 | +1.663 | 13.233 |
| experience.css | 17.374 | 33.551 | +16.177 | 33.676 |
| CSS total | 28.940 | 46.780 | +17.840 | 46.909 |
| index.html | 9.217 | 9.309 | +92 | 9.336 |
| app.js | 20.132 | 20.132 | 0 | 20.352 |
| menu-data.js | 5.174 | 5.174 | 0 | 5.174 |

Bytes sin compresión. Gzip local orientativo, con LF: CSS 7.935 → 11.534 (+3.599); HTML 3.447 → 3.459 (+12). Artefacto vigente en disco: **6.089.449 bytes**, 15 archivos permitidos. No se reutilizan métricas de propuestas intermedias.

Cero assets, fuentes, librerías o referencias de red nuevas. Dos CSS y dos JS conservados. No se midieron Web Vitals ni un waterfall de producción; gzip local no equivale a transferencia HTTP Cloudflare. Aumento CSS asociado al sistema visual, responsive, señales y animaciones; persiste cascada acumulada de fases anteriores. Este pre-deploy no la reorganiza.

## 21. Security

Sin diferencias respecto de HEAD en worker.mjs, wrangler.json y build-public.cjs. CSP y Security Headers conservados: X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options y Cross-Origin-Opener-Policy. Redirect HTTP → HTTPS 308 y allowlist sin cambios. check-deploy verifica redirects, headers y exclusiones con mock ASSETS. Los 15 recursos públicos responden HTTP 200 con CSP en preview local. dist está ignorado y no tiene archivos versionados.

## 22. Datos comerciales

57 productos, 155 variantes, nombres, ingredientes, categorías, precios y teléfono/WhatsApp +56 9 6397 8232 intactos. Ruta 66 Doble $6.990. app.js, menu-data.js, menu-export.json y assets coinciden con HEAD. El cambio estructural del H1 en index.html no altera texto ni datos comerciales.

## 23. Pruebas pre-deploy

- node check.cjs: PASS, incluyendo catálogo, variantes, cantidades, subtotal, notas, índices inválidos, escaping, miniaturas por ID y regresiones Fase 3.
- node check-deploy.cjs: PASS, 15 archivos permitidos, exclusiones, referencias, redirect y headers. Es build/verificación local, no deploy.
- git diff --check: sin errores de whitespace. Avisos Git de futura conversión LF/CRLF no son warnings de navegador.
- Búsqueda «jalapeno»: Ruta Azteca. Limpieza con teclado restablece catálogo.
- Filtros: 14 hamburguesas, 14 sándwiches, 14 completos/as, 11 compartir, 4 bebidas, Todo 57.
- Ruta 66 Doble: $6.990; dos unidades $13.980. URL WhatsApp conserva destinatario, cantidades, variante, subtotal y nota «Prueba local sin envío». No se abrió/envió un pedido.
- Slider: botón 100; Home y flecha derecha 1. Ticker: paused. Miniatura por Enter: aria-pressed true, sin agregar producto.
- Carrito lleno y catálogo completo medidos en los ocho anchos; Escape cierra dialog.
- Consola local capturada al finalizar: cero errores JS, cero errores CSP y cero warnings relevantes registrados. Los 15 archivos públicos responden 200; cero assets 404 observados. Esto se limita a la sesión local, no al sitio publicado.

## 24. Problemas detectados pero no modificados

Sin bloqueantes detectados en el alcance local. Material real e ilustrativo heterogéneo, hero 700×700, imágenes grandes heredadas, dependencia existente de Google Fonts y cascada CSS acumulada. No se modificaron diseño, lógica ni recursos durante el pre-deploy.

## 25. Material fotográfico futuro

Una eventual sesión profesional de productos reales con iluminación consistente y originales mayores puede mejorar homogeneidad y HiDPI. No forma parte de esta revisión y no se generaron imágenes.

## 26. Riesgos residuales

Validación en navegador integrado y pruebas Node; no constituye prueba física iOS/Android, Safari/Firefox, lector de pantalla ni medición de producción. Fallback de animation-timeline y reduced motion comprobados en código, no mediante emulación multinavegador. No hubo publicación, por lo que no se declara verificado un nuevo despliegue Cloudflare.

## 27. Cambios NO realizados y futuro commit

Durante este pre-deploy solo se reescribió este informe; código fuente visual y comercial permaneció intacto. Sin arquitectura nueva, framework, SEO Fase 5, HSTS, DNS, nuevos productos/precios, backend o persistencia. Sin commit, push o deploy.

Archivos exactos para un futuro commit autorizado: **style.css, experience.css, index.html, DESIGN-PHASE4.md**. Excluir dist y evidencia auxiliar de output.
