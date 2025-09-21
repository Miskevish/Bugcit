import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarWidget({ compact = false }) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
      initialView={compact ? "dayGridMonth" : "dayGridMonth"}
      headerToolbar={{
        left: "prev,next",
        center: "title",
        right: compact ? "" : "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
      }}
      firstDay={0}
      height="100%"
      dayMaxEventRows={2}
      showNonCurrentDates={false}
      fixedWeekCount={false} /* solo las semanas del mes */
      selectable={false}
      editable={false}
      events={[]}
    />
  );
}
