# RESULTADO FASE 3

## 1. Resumen
Implementación exclusivamente local de accesibilidad, optimización sin pérdida, ajustes responsive y miniaturas estables. No commit, push ni deploy. Validación 18–19 septiembre 2026. Fases 1/2 preservadas; quedan pendientes pruebas con lectores de pantalla, dispositivos físicos y visores Chrome/Firefox.

## 2. Archivos modificados
`app.js`, `index.html`, `style.css`, `experience.css`, `build-public.cjs`, `check.cjs`.

## 3. Archivos creados
`assets/logo.webp`, `assets/burger-layers.webp`, `assets/italiano-studio.webp`, este informe `QUALITY-PHASE3.md` (interno, excluido de dist).

## 4. Archivos eliminados
Ningún archivo fuente. Se retiraron únicamente las tres copias PNG obsoletas dentro de dist/assets antes de regenerarlo; los originales PNG continúan intactos en assets/. Build sigue fallando ante archivos inesperados. Para un checkout antiguo con dist existente, retirar esas tres copias generadas antes de reconstruir; un clon limpio no necesita este paso.

## 5. Accesibilidad
- Skip link z-index 100 frente a header 20; primer Tab lo muestra en top 10px. Probado por teclado; el destino carta queda debajo del sticky.
- Anuncios de agregado, cantidad, eliminación y subtotal en una región polite/atomic activa por acción. Dos ubicaciones necesarias: fuera y dentro del diálogo modal, porque el contenido exterior queda inerte al abrirlo. Se limpia la inactiva. Toast visual aria-hidden evita duplicar anuncio.
- Focus existente conservado; scroll-margin agregado para reducir ocultamiento. Miniatura activable con Enter, slider con Home/flechas, cierre con Escape.
- Filtros/Agregar mínimo 44px de alto; cantidad 36px escritorio, 44px móvil o puntero grueso; cierre y slider 44px en táctil. Diálogo verificado sin overflow en los ocho anchos.
- No se certifica WCAG ni se simula una prueba real de lector de pantalla: anuncios comprobados mediante DOM y regresiones.

## 6. Performance
Pesos exactos en bytes, sin compresión HTTP. MB decimal. No equivalen al tráfico de una visita: el PDF es bajo demanda, las categorías cargan sprites según uso y hay caché/fuentes externas.

| Archivo | Antes | Después | Reducción |
|---|---:|---:|---:|
| `logo.png → .webp` | 225,196 | 150,590 | 74,606 (33.13%) |
| `burger-layers.png → .webp` | 2,047,766 | 1,482,784 | 564,982 (27.59%) |
| `italiano-studio.png → .webp` | 2,454,004 | 1,674,346 | 779,658 (31.77%) |

Ahorro de imágenes: **1,419,246 bytes** (25.38%).

Inventario completo del artefacto resultante:

| Archivo | Tipo | Dimensiones px | Peso bytes | Lugar de uso | Prioridad |
|---|---|---|---:|---|---|
| `index.html` | html | — | 9,244 | Documento principal | Alta |
| `style.css` | css | — | 11,571 | Estilos base, bloqueante de render | Alta |
| `experience.css` | css | — | 17,516 | Interacción y responsive, bloqueante de render | Alta |
| `menu-data.js` | js | — | 5,174 | Catálogo; script defer | Alta |
| `app.js` | js | — | 20,352 | Interacciones; script defer | Alta |
| `assets/logo.webp` | webp | 420 × 420 | 150,590 | Header y footer | Normal; header visible |
| `assets/burger_hand.jpg` | jpg | 700 × 700 | 81,685 | Foto real hero / candidato LCP | Alta explícita; sin lazy |
| `assets/burger-layers.webp` | webp | 1254 × 1254 | 1,482,784 | Capas Ruta 66 y miniatura; fondo CSS compartido | Normal; carga CSS sin lazy nativo |
| `assets/italiano-studio.webp` | webp | 1536 × 1024 | 1,674,346 | Promoción Italiano | Baja / loading=lazy |
| `assets/carta-ruta-central.pdf` | pdf | — | 1,835,649 | Carta enlazada de 8 páginas | Bajo demanda |
| `assets/mini-hamburguesas.webp` | webp | 972 × 1619 | 189,688 | Sprite de categoría; recortes CSS | Normal; al renderizar categoría |
| `assets/mini-sandwiches.webp` | webp | 971 × 1619 | 217,916 | Sprite de categoría; recortes CSS | Normal; al renderizar categoría |
| `assets/mini-completos.webp` | webp | 971 × 1619 | 156,028 | Sprite de categoría; recortes CSS | Normal; al renderizar categoría |
| `assets/mini-compartir.webp` | webp | 971 × 1619 | 165,312 | Sprite de categoría; recortes CSS | Normal; al renderizar categoría |
| `assets/mini-bebidas.webp` | webp | 1254 × 1254 | 53,680 | Sprite de categoría; recortes CSS | Normal; al renderizar categoría |

La búsqueda conserva el render por evento: máximo 57 productos, listeners delegados y sin ciclo de escritura/lectura geométrica en renderProducts. No se añadió debounce sin evidencia de mejora. Movimiento de hamburguesa usa requestAnimationFrame en scroll y listeners existentes; no se agregaron animaciones.

Caché pública consultada para /, PDF, hero JPG y menu-data.js: 200, `Cache-Control: public, max-age=0, must-revalidate`, ETag presente (débil en HTML/JS, fuerte en PDF/JPG). No se añadió immutable ni se alteró la invalidación. Preview local usa no-store; no equivale a Cloudflare.

## 7. Imágenes
WebP lossless, mismos píxeles decodificados y dimensiones. Logo 420×420 RGBA; capas 1254×1254 RGBA; Italiano 1536×1024 RGB. Transparencia exacta verificada con Pillow. Originales conservados; solo WebP se publica para esos tres recursos.

Evaluación en memoria (bytes): PNG optimizado logo 224707, capas 2005295, Italiano 2227611; AVIF calidad 95 logo 77508, capas 544441, Italiano 492717. AVIF ofrece menor peso pero es con pérdida: se eligió garantía de igualdad de píxeles, sin sustituir fotos ni ilustraciones. No se instalaron dependencias.

Hero real sin modificación: JPG 700×700, 81685 bytes, fetchpriority high, object-fit cover, dimensiones declaradas. Render observado en viewport 1440: 692×650. No se agregó preload ni srcset: la fuente ya es pequeña y no hay original mayor para mejorar HiDPI; una variante menor aportaría poco frente a los grandes recursos optimizados. Persisten recortes intencionales cover, sin deformación de proporciones.

Promoción lazy, width/height conservados, cargada correctamente al navegar a Destacado. Los sprites/capas son fondos CSS y no aceptan loading=lazy: no se introdujo un cargador JS adicional. No se declara CLS cero: no se midió.

## 8. Fuentes
Barlow Condensed solicitado antes 600/700/800/900; después 700/800/900. Inspección computada: 700 y 800 en texto y 900 en strong/b heredados (CON TODO y símbolos del ticker). Solo se retiró 600. DM Sans 400/500/600/700 conservado. Familias, preconnect y display=swap iguales; document.fonts.status=loaded y sin errores CSP. Algunos pesos CSS 800 de DM Sans continúan resolviendo a la familia disponible como antes; no se cambió tipografía.

## 9. Miniaturas
thumbnailMap declarativo congelado: ID → categoría, fila y columna. Ya no se calcula por orden de menuProducts. Ruta 66 mantiene su enlace y capas. Test compara HTML de las 57 miniaturas con catálogo invertido: idéntico. Sin coordenadas para un ID nuevo se omite la miniatura en lugar de producir NaN; nuevos productos deberán incorporar coordenadas explícitas.

## 10. Responsive
Viewport simulado en navegador integrado, altura 900px (algunas capturas móviles 844px). Catálogo completo de 57 productos y diálogo comprobados:

| Ancho solicitado | clientWidth = scrollWidth documento | Carrito sin overflow | Todo visible | Solapamiento código/cuerpo |
|---:|---:|---|---|---|
| 320 | 305 | PASS | Sí | 0 |
| 375 | 360 | PASS | Sí | 0 |
| 390 | 375 | PASS | Sí | 0 |
| 430 | 415 | PASS | Sí | 0 |
| 768 | 753 | PASS | Sí | 0 |
| 1024 | 1009 | PASS | Sí | 0 |
| 1440 | 1425 | PASS | Sí | 0 |
| 1920 | 1905 | PASS | Sí | 0 |

Diferencia de 15px corresponde a scrollbar del entorno. Ningún overflow interno detectado en cuerpos/CTA/selects/hero/header/footer/ubicación. Inspección visual representativa: carta 320, promoción 390, menú 768, hero 1440. No se probaron iPhone/Android físicos.

## 11. Cambios visuales menores
Columna de código 38px y tipografía 22px entre 651–900; filtros wrap en ese tramo. Product-body flex y bloque de compra con margin-top:auto: precio/CTA y variantes se alinean por fila sin recortar texto ni fijar alturas. Medición de primeras parejas: bottoms coincidentes. Se mantienen avisos de imagen ilustrativa; no se redujo transparencia comercial. Sin refactorización masiva CSS.

## 12. Datos comerciales
menu-data.js idéntico byte por byte a HEAD: 57 productos, 155 variantes, nombres, ingredientes y precios intactos. Tests vinculan Simple/Doble de Ruta 66 y promo Italiano con catálogo. PDF idéntico a HEAD: 8 páginas, 113 precios impresos coinciden en orden con los precios distintos por producto; corresponden a 155 variantes porque bases con igual precio comparten importe. No se encontraron discrepancias de precio.

## 13. Pruebas
- node check.cjs: PASS, validaciones previas y nuevas (mapa reordenado, anuncios, promociones, recursos/dimensiones).
- node check-deploy.cjs: PASS, 15 archivos explícitos, bytes/referencias, exclusión de internos, HTTP 308 y headers sobre 200/206/304/404 con ASSETS simulado.
- HTTP local: los 15 recursos responden 200 con bytes iguales al archivo fuente y MIME apropiado; PDF application/pdf.
- Navegador: búsqueda jalapeno encuentra Ruta Azteca; filtros; Simple/Doble y select Champiñón; agregar Ruta66 Doble; cantidad 2 = $13.980; notas con &; URL WhatsApp codificada correctamente; eliminación hasta cero; Escape; miniatura por Enter; slider Home/flecha/toggle; pausa ticker; navegación anclas; fuentes y foto promocional cargadas. No se envió pedido real.
- Google Maps e Instagram: href, target blank y noopener correctos; no se validó disponibilidad de servicios externos iniciando sesiones.
- Consola inspeccionada: sin errores JS/CSP ni warnings; recursos sin 404.
- Reduced-motion revisado en CSS/JS: ticker, reflejos, miniaturas, capas/reveal y animación carrito conservan sus protecciones. No se cambió preferencia del sistema ni se afirma prueba perceptual con ella activada.
- PDF: integridad y precios extraídos con pypdf; respuesta 200/MIME correcto. Chrome no disponible al intentar abrirlo; Firefox no expuesto por inventario de navegadores. Apertura visual en esos visores queda pendiente. PDF sigue sin StructTreeRoot (no etiquetado).

## 14. CSP y Security Headers
worker.mjs y wrangler.json idénticos byte por byte a HEAD. CSP y seis headers de Fase 2 intactos, sin comodines ni relajación. run_worker_first true, binding ASSETS y directory ./dist conservados. Redirección HTTP 308 verificada en prueba. No HSTS.

## 15. Contrato funcional
Catálogo, normalización, filtros, variantes, precios, separación producto/variante, cantidades, subtotal, eliminación, notas máximo500, teléfono, texto WhatsApp y confirmación manual preservados. Acceso destacado, PDF, Ruta66, slider, ticker, pausa, miniaturas, anclas, Maps, Instagram y seguridad preservados dentro de las pruebas indicadas. No persistencia añadida.

## 16. Métricas BEFORE / AFTER

| Métrica | Antes | Después |
|---|---:|---:|
| Bytes de archivos públicos | 7,485,207 | 6,071,535 |
| Bytes de imágenes | 5,591,275 | 4,172,029 |
| Archivos allowlist | 15 | 15 |

Reducción neta artefacto: 1,413,672 bytes (18.89%). El mapa explícito y los ajustes aumentan ligeramente JS/CSS/HTML; el ahorro neto está incluido.

Requests de una visita completa, bytes HTTP comprimidos, LCP, CLS e INP: **no medidos**. No Lighthouse score ni métricas inventadas.

## 17. Riesgos residuales
Validar lectores de pantalla reales (NVDA/VoiceOver), Chrome/Firefox PDF, Safari/Android y dispositivos táctiles físicos. PDF no etiquetado. Imágenes aún suman más de 4 MB si se visitan todas las categorías: se priorizó lossless. Hero 700px limita nitidez en pantallas grandes HiDPI. Web vitals requieren medición reproducible/real. Sin deploy no se puede certificar que la Fase3 esté publicada; la comprobación de caché corresponde a la versión pública anterior.

## 18. Cambios NO realizados
Sin rediseño completo, cambio de branding/paleta, precios/catálogo, framework, persistencia, HSTS, SEO avanzado, contenido editorial del PDF, commit, push ni deploy. No limpieza amplia de CSS ni debounce.

## 19. Recomendaciones para Fase 4
- Dirección artística: coherencia street food premium con carácter carretera.
- Jerarquía: revisar énfasis entre hero, ingredientes, carta y destacado.
- Fotografía: sesión real consistente y originales de mayor resolución.
- Sistema de diseño: documentar escalas y estados accesibles.
- Cards: explorar jerarquía sin perder variantes/ingredientes.
- Hero: dirigir encuadre y legibilidad manteniendo foto real.
- Microinteracciones: unificar tiempos/intensidad con reduced-motion.
- Experiencia premium: consistencia editorial, fotografía y checkout claro, conservando personalidad.

Estas recomendaciones no fueron implementadas.
