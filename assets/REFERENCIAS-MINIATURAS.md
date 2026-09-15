# Referencias de las miniaturas

Las miniaturas son ilustraciones generadas con ImageGen. Los ingredientes y nombres provienen de la carta PDF del negocio; no se usaron fotografías de otros locales como si fueran productos de Ruta Central.

## Fuentes consultadas

- Carta original del negocio: `carta-ruta-central.pdf` (cuatro páginas).
- Forma y presentación del Barros Luco chileno: https://www.adnradio.cl/2025/06/09/hoy-es-el-dia-del-barros-luco-en-chile-por-que-se-celebra-cada-9-de-junio-y-como-prepararlo-en-casa/
- Referencia de completo italiano: https://www.foodmap.in/chile
- Referencia de chorrillana tradicional (papas, carne, cebolla y huevo): https://commons.wikimedia.org/wiki/File:Wiki_Tour_-_Chorrillana_01.jpg

## Alcance y límites

- Hamburguesas: representación de la variante simple; la miniatura original de Ruta 66 se conserva.
- Sándwiches: referencia con churrasco. Los precios y elecciones de lomito, pollo y champiñón permanecen independientes de la imagen.
- Completos y as: referencia con vienesa; la carta permite seleccionar otras preparaciones.
- Acompañamientos: porciones ilustrativas sin representar un gramaje o cantidad exacta. El PDF no detalla todos los ingredientes de las chorrillanas ni de las papas supremas. Esos detalles deben confirmarse con el dueño; la imagen de papas supremas muestra solo la base de papas.
- Bebidas: envases genéricos, sin prometer una marca o sabor no confirmado. Jumex conserva su nombre en la carta, con una imagen genérica de jugo.
- Para una representación exacta del producto vendido, reemplazar las miniaturas por fotografías aprobadas por el negocio.

## Organización

Las hojas de hamburguesas, sándwiches, completos y acompañamientos tienen 3 columnas y 5 filas. Las bebidas usan 2 columnas y 2 filas. Las celdas se asignan de izquierda a derecha y de arriba abajo siguiendo el orden de `menu-data.js`. Los recortes se muestran con CSS, sin alterar ingredientes ni modificar los archivos originales.

Archivos: `mini-hamburguesas`, `mini-sandwiches`, `mini-completos`, `mini-compartir` y `mini-bebidas`, con originales `.png` y copias `.webp` para la página. Las copias WebP se codificaron a calidad 86, sin cambiar dimensiones ni composición. En conjunto pesan 782.624 bytes.

Los prompts exactos de las cinco generaciones y la corrección de Ruta 79 están en `prompts-miniaturas.json`. Se utilizó la herramienta integrada ImageGen; no se empleó el modo CLI/API.
