# In Mare Copas · Propuesta de landing

Propuesta de web para In Mare Copas, pub de copas y cócteles en la Rúa
Echegaray, 5, de Marín (Pontevedra). Teléfono y WhatsApp: 660 53 61 81.

## La idea

«La noche con su neón». Los colores salen de sus fotos: el violeta oscuro de
las paredes, la luz violeta de las tiras LED, el azul de las baldas de la
barra y el blanco de sus molduras. El logo es su ancla.

- **El letrero de la portada** dice cómo está el local esta noche, con la
  hora del móvil de quien la mira: «Abierto hasta las 5:00», «Hoy abrimos a
  las 23:00» o «Hoy descansamos». Se enciende una vez al cargar, con dos
  parpadeos suaves. Es lo único que se mueve en la página.
- **La carta** va sobre «su pared»: blanca y con moldura doble, como la sala.
- **La tabla de horario** marca la fila de esta noche.
- **Contacto:** botones de WhatsApp (con el mensaje ya escrito) y de llamar.

Hecha con las guías de Modern Web Guidance y frontend-design: menú del móvil
con `<dialog>` (se cierra también arrastrándolo), cabecera sólida con una
animación ligada al scroll, `font-size-adjust` para que el texto no salte al
cargar las fuentes y, con «menos movimiento», el letrero aparece encendido
sin parpadear.

HTML, CSS y JavaScript sin librerías. Las fuentes (Tilt Neon para el letrero
y Archivo para el resto) van dentro de la web, en `fonts/`.

Para verla tal cual quedará publicada, ábrela con un servidor local (por
ejemplo, la extensión Live Server de VS Code). Con doble clic en `index.html`
funciona todo, pero el navegador no carga las fuentes desde el disco.

## Las fotos: ojo antes de publicar

Las fotos de `img/` salen de su ficha de Google Maps y no se sabe quién las
hizo (pueden ser de clientes). Sirven para enseñarles la propuesta, pero
**antes de publicar hay que pedirles sus propias fotos o permiso** y
sustituirlas con el mismo nombre.

| Archivo | Tamaño | Qué se ve |
|---|---|---|
| `sala.jpg` | 1200 × 1500 | La sala con la luz violeta (portada) |
| `cabina.jpg` | 900 × 1100 | Rincón con letreros de neón (música) |
| `celebrar.jpg` | 1600 × 1000 | Copas en una mesa junto a los sofás |
| `piano.jpg` | 1200 × 900 | El piano blanco con botellas |
| `barra.jpg` | 900 × 1200 | Una copa en la barra |
| `rose.jpg` | 900 × 1200 | Copa de ginebra rosa |
| `sofas.jpg` | 900 × 1200 | Sofá corrido bajo la luz violeta |
| `botella.jpg` | 900 × 1200 | Botella en forma de calavera |
| `entrada.jpg` | 1200 × 900 | La entrada con el cartel |

Fotos en JPG de calidad 75-80, unos 250 KB como mucho.

## Datos que hay que confirmar con el local

- **Carta:** las bebidas y los precios son de ejemplo y la página lo avisa
  («Precios de ejemplo»). Pedirles su carta y quitar el aviso (buscar
  `sample-note` en `index.html`).
- **Música:** las noches de la semana son de ejemplo. El nombre de Andrew,
  el DJ, sale de una reseña: confirmar que sigue con ellos.
- **Horario:** sale de su ficha de Google. Si cambia, hay que tocarlo en dos
  sitios: la tabla del HTML y `SCHEDULE` al principio de `js/script.js`.
- **Celebraciones:** el texto no promete nada concreto (ni regalos ni
  precios); solo que preparan una zona para el grupo.

## Estructura

```
index.html
css/style.css
js/script.js
fonts/   tipografías
img/     fotos (ahora, de su ficha de Google Maps)
```
