/**
 * IN MARE COPAS — LANDING
 * JavaScript sin dependencias. Script clásico con "defer" (no módulo): así
 * funciona también al abrir index.html con doble clic. Todo va dentro de
 * una función para no ensuciar el ámbito global, y cada parte "init..." va
 * aislada con safeRun(): si una falla, el resto sigue funcionando.
 *
 * Patrones de Modern Web Guidance (Chrome):
 *  - Cabecera sólida al bajar: animación CSS ligada al scroll (aquí, plan B).
 *  - Menú móvil: <dialog> modal con carril de scroll-snap.
 */
(() => {
"use strict";

/** Debe coincidir con el punto de corte del CSS (@media (width < 960px)) */
const WIDE_SCREEN = window.matchMedia("(width >= 960px)");

/*
 * Horario del local. Cada noche: [abre, cierra] en minutos desde las 00:00
 * de ese día. Si cierra de madrugada, pasa de 24 h (4:00 = 28 * 60).
 * null = cerrado. Si cambia, cambia también la tabla de horario del HTML.
 */
const h = (hours, minutes = 0) => hours * 60 + minutes;
const SCHEDULE = {
  0: [h(23), h(28)], // domingo: 23:00 – 4:00
  1: null, // lunes: cerrado
  2: [h(23), h(28)], // martes
  3: [h(23), h(28)], // miércoles
  4: [h(23), h(28)], // jueves
  5: [h(22), h(29)], // viernes: 22:00 – 5:00
  6: [h(22), h(29)], // sábado
};
const DAY = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function safeRun(fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[In Mare] Error en ${fn.name}:`, error);
  }
}

/* =====================================================================
 * Año del pie
 * =================================================================== */
function setFooterYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = year;
  });
}

/* =====================================================================
 * Cabecera: plan B para navegadores sin animaciones ligadas al scroll
 * =================================================================== */
function initHeaderFallback() {
  if (CSS.supports("(animation-timeline: scroll()) and (animation-range: 0% 100%)")) return;

  const header = document.getElementById("header");
  if (!header) return;

  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* =====================================================================
 * Letrero de neón: cómo está el local esta noche
 * Ejemplos: "Abierto hasta las 5:00", "Hoy abrimos a las 23:00",
 * "Hoy descansamos". Usa la hora del móvil de quien la mira.
 * =================================================================== */

/** 1740 → "5:00" (los minutos que pasan de 24 h son de la madrugada) */
function clock(minutes) {
  const total = minutes % h(24);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Estado de esta noche a partir de una fecha */
function tonight(now) {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const yesterday = (day + 6) % 7;

  // De madrugada todavía cuenta la noche de ayer (el sábado sigue hasta las 5:00 del domingo)
  const late = SCHEDULE[yesterday];
  if (late && minutes + h(24) < late[1]) {
    return { state: "open", night: yesterday, closes: late[1] };
  }

  const today = SCHEDULE[day];
  if (today && minutes >= today[0]) return { state: "open", night: day, closes: today[1] };
  if (today) return { state: "later", night: day, opens: today[0] };

  // Hoy cerrado: busca la próxima noche que abren
  for (let i = 1; i <= 7; i++) {
    const next = (day + i) % 7;
    if (SCHEDULE[next]) return { state: "closed", night: day, nextDay: next, opens: SCHEDULE[next][0], tomorrow: i === 1 };
  }
  return { state: "closed", night: day };
}

function initTonight() {
  const sign = document.querySelector("[data-tonight-sign]");
  const text = document.querySelector("[data-tonight-text]");
  if (!sign) return;

  const status = tonight(new Date());
  const place = "Estamos en la calle Echegaray, 5, en Marín. Cócteles, copas y DJ con música de todos los estilos.";

  if (status.state === "open") {
    sign.textContent = `Abierto hasta las ${clock(status.closes)}`;
    if (text) text.textContent = place;
  } else if (status.state === "later") {
    sign.textContent = `Hoy abrimos a las ${clock(status.opens)}`;
    if (text) text.textContent = place;
  } else {
    sign.textContent = "Hoy descansamos";
    if (text && status.nextDay !== undefined) {
      const when = status.tomorrow ? "mañana" : `el ${DAY[status.nextDay]}`;
      text.textContent = `Volvemos ${when} a las ${clock(status.opens)}. ${place}`;
    }
  }
  sign.dataset.state = status.state;

  // En la tabla de horario se marca la fila de esta noche
  const row = document.querySelector(`.hours tr[data-days~="${status.night}"]`);
  if (row && status.state !== "closed") {
    row.classList.add("is-today");
    const label = document.createElement("span");
    label.className = "hours__today";
    label.textContent = "(esta noche)";
    row.querySelector("th").append(" ", label);
  }
}

/* =====================================================================
 * Menú móvil: <dialog> con carril de scroll-snap
 * Abrir y cerrar es desplazar el carril. Un IntersectionObserver sobre el
 * panel decide cuándo ha salido del todo, así que todas las formas de
 * cerrar (botón, Escape, tocar fuera, arrastrar) acaban en el mismo sitio.
 * =================================================================== */
function initDrawer() {
  const drawer = document.getElementById("drawer");
  const openBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("drawerClose");
  if (!drawer || !openBtn || !closeBtn || typeof drawer.showModal !== "function") return;

  const scroller = drawer.querySelector(".drawer__scroller");
  const sheet = drawer.querySelector(".drawer__sheet");

  // seen: el panel ya ha llegado a verse. Mientras entra, el observer avisa
  // de que "no se ve"; eso es la apertura, no un cierre, y se ignora.
  let seen = false;

  function openDrawer() {
    if (drawer.open) return;
    seen = false;
    drawer.showModal();
    openBtn.setAttribute("aria-expanded", "true");
    // Un fotograma de espera para que el carril ya esté colocado al moverlo
    requestAnimationFrame(() => {
      scroller.scrollTo({ left: scroller.scrollWidth, behavior: "auto" });
    });
    // Red de seguridad: si por lo que sea no ha entrado, se coloca sin animación
    setTimeout(() => {
      if (drawer.open && !seen) scroller.scrollLeft = scroller.scrollWidth;
    }, 800);
  }

  function closeDrawer() {
    if (!drawer.open) return;
    if (!seen) {
      onDrawerClosed();
      return;
    }
    // Sale deslizándose; el observer cierra el diálogo cuando ya no se ve
    scroller.scrollTo({ left: 0, behavior: "auto" });
  }

  function onDrawerClosed() {
    seen = false;
    scroller.scrollLeft = 0;
    if (drawer.open) drawer.close(); // devuelve el foco al botón "Menú"
    openBtn.setAttribute("aria-expanded", "false");
  }

  const visibleThreshold = 1 / window.innerWidth;
  const observer = new IntersectionObserver(
    (entries) => {
      if (!drawer.open) return;
      const entry = entries[entries.length - 1];
      if (entry.intersectionRatio >= visibleThreshold) seen = true;
      else if (seen) onDrawerClosed();
    },
    { root: drawer, threshold: [visibleThreshold] }
  );
  observer.observe(sheet);

  openBtn.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);

  // Tocar la zona oscura (fuera del panel) lo cierra
  drawer.addEventListener("click", (event) => {
    if (!sheet.contains(event.target)) closeDrawer();
  });

  // Escape: el panel sale deslizándose en vez de desaparecer de golpe
  drawer.addEventListener("cancel", (event) => {
    if (event.cancelable) {
      event.preventDefault();
      closeDrawer();
    }
  });

  // Un enlace del menú: se cierra al momento y la página va a su sección
  sheet.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", onDrawerClosed);
  });

  WIDE_SCREEN.addEventListener("change", (event) => {
    if (event.matches && drawer.open) onDrawerClosed();
  });

  // Plan B del fundido del fondo sin animaciones ligadas al scroll
  if (!CSS.supports("animation-timeline: scroll()")) {
    scroller.addEventListener("scroll", () => {
      const ratio = scroller.scrollLeft / sheet.offsetWidth;
      drawer.style.setProperty("--drawer-backdrop", Math.min(1, Math.max(0, ratio)));
    }, { passive: true });
  }
}

safeRun(setFooterYear);
safeRun(initHeaderFallback);
safeRun(initTonight);
safeRun(initDrawer);
})();
