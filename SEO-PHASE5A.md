# Fase 5A — SEO local, 21 septiembre 2026

Estado: PASS local. Sin commit, push ni deploy. La validación pública queda pendiente.

## Metadata

Canonical absoluto único: https://rutacentral.cl/.
Title anterior: «Ruta Central · El camino del sabor».
Title actual: «Ruta Central | Hamburguesas y churrascos en Maipú» para expresar actividad y ubicación.
Description existente conservada, sin agregar servicios.
Open Graph: website, Ruta Central, es_CL, canonical, title, description y burger_hand.jpg con alt.
Twitter/X: summary, mismo title, description, imagen y alt; sin usuario no confirmado.
Imagen social existente de 700×700; una composición horizontal dedicada queda como mejora futura.

Favicon PNG RGBA de 192×192: conversión determinista de logo.webp con Pillow/LANCZOS,
canvas completo y transparencia conservados, sin IA ni recortes. No se añadió apple-touch-icon.
robots.txt permite todo el sitio y declara sitemap.xml. Sitemap XML contiene únicamente la URL canónica,
sin anchors ni lastmod artificial.

## Structured data

Un bloque application/ld+json con exactamente: @context, @type (Restaurant), name, url,
telephone, address (@type PostalAddress, streetAddress, addressLocality, addressCountry),
logo, image, menu, sameAs y servesCuisine. Teléfono +56963978232 y dirección confirmada
Av. Central Gonzalo Pérez Llona 497 Local 3, Maipú, CL. Sin horarios, ratings, geo ni precios inventados.

## Seguridad y preview

Worker, Wrangler, CSP y Security Headers permanecen idénticos a HEAD. No se añadió JavaScript ejecutable.
El JSON-LD es un bloque de datos no ejecutable según el estándar HTML:
https://html.spec.whatwg.org/multipage/scripting.html#the-script-element
Prueba real en navegador integrado sobre http://127.0.0.1:4176/: JSON válido presente en DOM,
0 errores JS, 0 violaciones CSP y 0 errores 404 en consola; tampoco warnings registrados.
No fue necesario relajar ninguna directiva.

preview-security.cjs ahora simula la petición HTTPS al host canónico antes de pasarla al Worker
original; evita que el preview local se redirija a producción. Permite PORT y declara MIME txt/xml.
No emula el edge de Cloudflare ni sustituye la verificación pública.

## Pruebas

Prevalidación y validación final: node check.cjs y node check-deploy.cjs PASS.
check-seo.cjs compartido valida metadata exacta, JSON-LD, robots, gramática estricta del XML de una URL,
PNG (firma, CRC de chunks, dimensiones y datos descomprimidos) y allowlist exacta.
Allowlist: 15 → 18; incorpora solo robots.txt, sitemap.xml y assets/favicon.png.
Los helpers y este informe quedan fuera de dist. dist es un artefacto generado, no código fuente.
Validación independiente: ElementTree parseó XML; Pillow verificó PNG y conversión idéntica del logo.
Los 18 recursos locales respondieron 200, bytes idénticos a dist y headers originales;
robots text/plain, sitemap application/xml y favicon image/png.
check-live.cjs preparado para contenido, MIME, headers, redirects y ausencia de loops después del deploy;
comprobación de sintaxis PASS. No ejecutado contra producción en esta fase.

Comparación con HEAD: body HTML idéntico, CSS, app.js, menu-data.js, logo, imágenes comerciales y PDF intactos.
Contrato: 57 productos, 155 variantes, Ruta 66 Doble $6.990, teléfono, precios, carrito y WhatsApp conservados.

## Pendientes Fase 5B

Search Console, DNSSEC, www, HSTS gradual, pruebas públicas y eventual retirada de workers.dev.
La indexación, rich results y presentación social definitiva dependen de los buscadores/plataformas;
no se han validado en producción ni se garantizan por esta metadata.
