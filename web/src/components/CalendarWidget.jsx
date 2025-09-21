import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

/** Escanea TODAS las keys del localStorage y toma arrays con {title, date|start} */
function loadAnyEventsFromLocalStorage() {
  const results = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }
      if (!Array.isArray(parsed)) continue;

      parsed.forEach((e, idx) => {
        if (!e) return;
        const start = e.start || e.date;
        const title = e.title || e.name || e.titulo;
        if (start && title) {
          results.push({
            id: e.id ?? `${key}-${idx}`,
            title,
            start,
            allDay: e.allDay ?? true,
          });
        }
      });
    }
  } catch {
    /* no-op */
  }
  // Quitamos duplicados por (title+start)
  const seen = new Set();
  return results.filter((ev) => {
    const k = `${ev.title}@@${ev.start}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function ymd(dateLike) {
  const d = new Date(dateLike);
  // corrige TZ
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

const CalendarWidget = ({ events: eventsProp, onDateClick, onEventClick }) => {
  const calendarRef = useRef(null);
  const boxRef = useRef(null);

  // Si el padre no pasa eventos, los cargo desde localStorage (misma fuente que /calendar)
  const [eventsLS, setEventsLS] = useState(() =>
    loadAnyEventsFromLocalStorage()
  );
  const events = useMemo(
    () => (Array.isArray(eventsProp) ? eventsProp : eventsLS),
    [eventsProp, eventsLS]
  );

  const getApi = useCallback(
    () => (calendarRef.current ? calendarRef.current.getApi() : null),
    []
  );

  const handleToday = useCallback(() => {
    const api = getApi();
    if (api) api.today();
  }, [getApi]);

  const handlePrev = useCallback(() => {
    const api = getApi();
    if (api) api.prev();
  }, [getApi]);

  const handleNext = useCallback(() => {
    const api = getApi();
    if (api) api.next();
  }, [getApi]);

  // Mantener tamaño correcto y garantizar clics
  useEffect(() => {
    const api = getApi();
    if (!api) return;

    const el = boxRef.current || api.el;
    if (el) {
      // blindajes contra overlays
      el.style.position = el.style.position || "relative";
      el.style.zIndex = "3";
      el.style.pointerEvents = "auto";
    }

    const kick = () => api.updateSize();
    kick();

    const ro = new ResizeObserver(() => requestAnimationFrame(kick));
    if (el) ro.observe(el);
    window.addEventListener("resize", kick);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", kick);
    };
  }, [getApi]);

  // Escuchar cambios en localStorage (si guardas un evento en /calendar, se refleja aquí)
  useEffect(() => {
    const reload = () => setEventsLS(loadAnyEventsFromLocalStorage());
    // cambio entre pestañas
    const onStorage = () => reload();
    window.addEventListener("storage", onStorage);
    // y también cada vez que regresamos a esta vista
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Navegación a la página Calendario (mantiene una sola UI de creación/edición)
  const gotoCalendarWithDate = (dateStr) => {
    window.location.href = `/calendar?date=${encodeURIComponent(dateStr)}`;
  };

  const handleDateClickInternal = (arg) => {
    if (onDateClick) {
      onDateClick(arg);
    } else {
      // abrir página Calendario en el día clickeado
      gotoCalendarWithDate(ymd(arg.date));
    }
  };

  const handleEventClickInternal = (arg) => {
    if (onEventClick) {
      onEventClick(arg);
    } else {
      // ir a Calendario centrado en la fecha del evento
      gotoCalendarWithDate(ymd(arg.event.start));
    }
  };

  return (
    <div
      ref={boxRef}
      className="calendar-box card-bugcit fill"
      style={{
        position: "relative",
        zIndex: 3,
        pointerEvents: "auto",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Topbar del widget */}
      <div
        className="card-head"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <div style={{ fontWeight: 800 }}>Septiembre De 2025</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-ghost strong-btn"
            onClick={handlePrev}
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="btn btn-ghost strong-btn"
            onClick={handleToday}
          >
            hoy
          </button>
          <button
            type="button"
            className="btn btn-ghost strong-btn"
            onClick={handleNext}
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
      </div>

      <div className="card-body" style={{ minHeight: 0 }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          locale={esLocale}
          height="100%"
          expandRows
          dayMaxEventRows={2}
          events={events}
          dateClick={handleDateClickInternal}
          eventClick={handleEventClickInternal}
          handleWindowResize
        />
      </div>
    </div>
  );
};

export default CalendarWidget;
