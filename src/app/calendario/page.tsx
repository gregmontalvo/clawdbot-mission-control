"use client";

import { useEffect, useState } from "react";
import cronstrue from "cronstrue/i18n";

interface CronJob {
  id: string;
  name: string;
  schedule: {
    kind: string;
    expr: string;
    tz: string;
  };
  enabled: boolean;
}

interface CalendarEvent {
  name: string;
  hour: number;
  dayOfWeek: number; // 0 = lunes, 6 = domingo
  color: string;
  id: string;
  description: string;
}

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7-23

function parseCronExpression(expr: string): {
  hours: number[];
  daysOfWeek: number[];
} {
  const parts = expr.split(" ");
  if (parts.length !== 5) return { hours: [], daysOfWeek: [] };

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Parse hours
  const hours: number[] = [];
  if (hour === "*") {
    hours.push(...HOURS);
  } else if (hour.includes("/")) {
    const [_, step] = hour.split("/");
    for (let h = 0; h < 24; h += parseInt(step)) {
      if (h >= 7 && h <= 23) hours.push(h);
    }
  } else if (hour.includes(",")) {
    hour.split(",").forEach((h) => {
      const parsed = parseInt(h);
      if (parsed >= 7 && parsed <= 23) hours.push(parsed);
    });
  } else {
    const h = parseInt(hour);
    if (h >= 7 && h <= 23) hours.push(h);
  }

  // Parse days of week (0 = Sunday in cron, we need 0 = Monday)
  const daysOfWeek: number[] = [];
  if (dayOfWeek === "*") {
    daysOfWeek.push(0, 1, 2, 3, 4, 5, 6);
  } else if (dayOfWeek.includes("-")) {
    const [start, end] = dayOfWeek.split("-").map((d) => parseInt(d));
    for (let d = start; d <= end; d++) {
      // Convert Sunday=0 to Sunday=6
      daysOfWeek.push(d === 0 ? 6 : d - 1);
    }
  } else if (dayOfWeek.includes(",")) {
    dayOfWeek.split(",").forEach((d) => {
      const day = parseInt(d);
      daysOfWeek.push(day === 0 ? 6 : day - 1);
    });
  } else {
    const day = parseInt(dayOfWeek);
    daysOfWeek.push(day === 0 ? 6 : day - 1);
  }

  return { hours, daysOfWeek };
}

function getJobColor(name: string): string {
  // Color coding by job type
  if (name.includes("tweet") || name.includes("Twitter")) return "#1DA1F2";
  if (name.includes("email") || name.includes("Email")) return "#EA4335";
  if (name.includes("calendario")) return "#FBBC04";
  if (name.includes("reporte") || name.includes("Reporte"))
    return "#34A853";
  if (name.includes("Instagram")) return "#E4405F";
  if (name.includes("Meta")) return "#0668E1";
  if (name.includes("LinkedIn")) return "#0A66C2";
  if (name.includes("Analytics")) return "#FF6F00";
  if (name.includes("CRM")) return "#7B68EE";
  if (name.includes("SEO")) return "#9333EA";
  if (name.includes("spider") || name.includes("araña")) return "#F97316";
  if (name.includes("Recordatorio")) return "#EC4899";
  return "#6B7280";
}

export default function CalendarioPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cron")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);

        // Convert jobs to calendar events
        const calendarEvents: CalendarEvent[] = [];
        (data.jobs || []).forEach((job: CronJob) => {
          if (!job.enabled) return;

          const { hours, daysOfWeek } = parseCronExpression(
            job.schedule.expr
          );

          hours.forEach((hour) => {
            daysOfWeek.forEach((day) => {
              calendarEvents.push({
                name: job.name,
                hour,
                dayOfWeek: day,
                color: getJobColor(job.name),
                id: job.id,
                description: job.schedule.expr,
              });
            });
          });
        });

        setEvents(calendarEvents);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading cron jobs:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-auto bg-gray-50 p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          📅 Calendario de Cron Jobs
        </h1>
        <p className="text-sm text-gray-600">
          {jobs.length} tareas activas • Hora Madrid
        </p>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-1">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: "#1DA1F2" }}
          />
          <span className="text-xs text-gray-600">Twitter</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: "#EA4335" }}
          />
          <span className="text-xs text-gray-600">Email</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: "#34A853" }}
          />
          <span className="text-xs text-gray-600">Reportes</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: "#E4405F" }}
          />
          <span className="text-xs text-gray-600">Instagram</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: "#0668E1" }}
          />
          <span className="text-xs text-gray-600">Meta Ads</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: "#7B68EE" }}
          />
          <span className="text-xs text-gray-600">CRM</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: "#F97316" }}
          />
          <span className="text-xs text-gray-600">Spiders</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: "#EC4899" }}
          />
          <span className="text-xs text-gray-600">Recordatorios</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="grid min-w-[1200px] grid-cols-8">
          {/* Header */}
          <div className="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-50 p-2">
            <span className="text-xs font-medium text-gray-500">Hora</span>
          </div>
          {DAYS.map((day) => (
            <div
              key={day}
              className="border-b border-r border-gray-200 bg-gray-50 p-2 text-center"
            >
              <span className="text-xs font-medium text-gray-700">
                {day}
              </span>
            </div>
          ))}

          {/* Time rows */}
          {HOURS.map((hour) => (
            <>
              <div
                key={`hour-${hour}`}
                className="sticky left-0 z-10 border-b border-r border-gray-200 bg-white p-2"
              >
                <span className="text-xs text-gray-600">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
              {DAYS.map((_, dayIndex) => {
                const cellEvents = events.filter(
                  (e) => e.hour === hour && e.dayOfWeek === dayIndex
                );
                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    className="relative min-h-[60px] border-b border-r border-gray-100 p-1"
                  >
                    <div className="flex flex-col gap-1">
                      {cellEvents.map((event, idx) => (
                        <div
                          key={`${event.id}-${idx}`}
                          className="group relative cursor-pointer rounded px-2 py-1 text-xs text-white transition-all hover:scale-105 hover:shadow-md"
                          style={{ backgroundColor: event.color }}
                          title={`${event.name}\n${cronstrue.toString(event.description, { locale: "es" })}`}
                        >
                          <div className="truncate font-medium">
                            {event.name}
                          </div>
                          {/* Tooltip on hover */}
                          <div className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden w-64 rounded border border-gray-200 bg-white p-2 text-gray-700 shadow-lg group-hover:block">
                            <div className="text-xs font-semibold">
                              {event.name}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {cronstrue.toString(event.description, {
                                locale: "es",
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
