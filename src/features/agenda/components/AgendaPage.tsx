// Local: src/features/agenda/components/AgendaPage.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent, ScheduleEvent } from '../types';
import { Loader2 } from 'lucide-react';
import EventDetailModal from './EventDetailModal';
import CustomEvent from './CustomEvent';
import CustomToolbar from './CustomToolbar';
import { useAuth } from '../../../features/auth/hooks/useAuth';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const generateColorForId = (id: number) => {
  const colors = [
    '#4f46e5', '#059669', '#db2777', '#d97706', '#0891b2', '#6d28d9', '#be185d',
  ];
  return colors[id % colors.length];
};

const AgendaPage: React.FC = () => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const vagaColorMap = useMemo(() => {
    const map = new Map<number, string>();
    events.forEach(event => {
      const vagaId = event.resource.Vaga?.[0]?.id;
      if (vagaId && !map.has(vagaId)) {
        map.set(vagaId, generateColorForId(vagaId));
      }
    });
    return map;
  }, [events]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!profile?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/schedules/${profile.id}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar agendamentos do backend.');
        }
        const { results } = await response.json();
        
        if (results) {
          const formattedEvents: CalendarEvent[] = results.map((event: ScheduleEvent) => ({
            title: event.Título,
            start: new Date(event.Início),
            end: new Date(event.Fim),
            resource: event,
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedules();
  }, [profile?.id]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const vagaId = event.resource.Vaga?.[0]?.id;
    const backgroundColor = vagaId ? vagaColorMap.get(vagaId) || '#3182ce' : '#3182ce';
    return { style: { backgroundColor } };
  }, [vagaColorMap]);
  
  const components = {
    toolbar: CustomToolbar,
    event: CustomEvent,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="fade-in bg-white p-6 rounded-lg shadow-sm h-[calc(100vh-8rem)]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="pt-BR"
          defaultView={Views.MONTH}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
          components={components}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
          }}
        />
      </div>
      
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
};

export default AgendaPage;