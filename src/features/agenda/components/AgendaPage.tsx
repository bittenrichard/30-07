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
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import EventDetailModal from './EventDetailModal';
import CustomEvent from './CustomEvent';
import CustomToolbar from './CustomToolbar';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import DailyEventsSidebar from './DailyEventsSidebar'; 

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
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
  ];
  return colors[id % colors.length];
};

const AgendaPage: React.FC = () => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date()); // Data atual do calendário (para navegação)
  const [selectedDayForSidebar, setSelectedDayForSidebar] = useState(new Date()); // Data selecionada para a sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado da sidebar
  const [currentView, setCurrentView] = useState<Views>(Views.MONTH); // Visualização atual do calendário

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

  // Calcula a contagem de eventos por dia para a visualização mensal
  const eventCountsByDay = useMemo(() => {
    const counts = new Map<string, number>(); // Key: 'YYYY-MM-DD'
    events.forEach(event => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
    });
    return counts;
  }, [events]);

  const dailyEvents = useMemo(() => {
    // Filtrar eventos para o dia selecionado na sidebar
    const day = selectedDayForSidebar.getDate();
    const month = selectedDayForSidebar.getMonth();
    const year = selectedDayForSidebar.getFullYear();
    return events.filter(event => 
      event.start.getDate() === day &&
      event.start.getMonth() === month &&
      event.start.getFullYear() === year
    ).sort((a, b) => a.start.getTime() - b.start.getTime()); // Ordena por hora
  }, [events, selectedDayForSidebar]);

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

  // Handler para quando uma "slot" (um dia ou intervalo) é selecionada no calendário principal
  const handleSelectSlot = useCallback(({ start }: { start: Date; end: Date; action: string }) => {
    setSelectedDayForSidebar(start); // Atualiza o dia selecionado para a sidebar
    setCurrentDate(start); // Também atualiza a data principal do calendário para a slot selecionada
    setCurrentView(Views.DAY); // Mudar para visualização de Dia ao selecionar um slot
    setIsSidebarOpen(true); // Abre a sidebar se estiver fechada
  }, []);

  // Handler para mudança de visualização (Mês, Semana, Dia) na Toolbar
  const handleViewChange = useCallback((newView: Views) => {
    setCurrentView(newView);
  }, []);

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const vagaId = event.resource.Vaga?.[0]?.id;
    const backgroundColor = vagaId ? vagaColorMap.get(vagaId) || '#3182ce' : '#3182ce';
    
    // Adiciona a contagem de eventos para o CustomEvent na visualização mensal
    const dateKey = format(event.start, 'yyyy-MM-dd');
    const count = eventCountsByDay.get(dateKey) || 0;
    
    return { 
        style: { backgroundColor }, 
        count: count, // Passa a contagem de eventos
        view: currentView // Passa a visualização atual para o CustomEvent
    };
  }, [vagaColorMap, eventCountsByDay, currentView]);


  const components = {
    event: CustomEvent, // Usa CustomEvent para todos os tipos de visualização
  };

  // Função para adicionar classe `rbc-selected-day` ao dia clicado
  const dayPropGetter = useCallback((date: Date) => {
    const isSelected = 
      date.getDate() === selectedDayForSidebar.getDate() && 
      date.getMonth() === selectedDayForSidebar.getMonth() &&
      date.getFullYear() === selectedDayForSidebar.getFullYear();
    
    return {
      className: isSelected ? 'rbc-selected-day' : '',
    };
  }, [selectedDayForSidebar]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fade-in flex h-full gap-6 p-6">
      {/* Container principal do calendário */}
      <div className="flex flex-col flex-grow bg-white rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Toolbar customizada */}
        <CustomToolbar
          label={format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          view={currentView}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          onNavigate={(action, newDate) => {
            const navigatedDate = newDate || new Date();
            setCurrentDate(navigatedDate);
            setSelectedDayForSidebar(navigatedDate); 
          }}
          onView={handleViewChange}
          date={currentDate}
        />

        {/* Calendar com ajuste de altura e foco */}
        <div className="flex flex-col flex-grow relative h-full">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            culture="pt-BR"
            defaultView={Views.MONTH}
            view={currentView}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventPropGetter}
            dayPropGetter={dayPropGetter}
            components={components}
            date={currentDate}
            onNavigate={setCurrentDate}
            onView={handleViewChange}
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
            showOutsideDays={false}
          />
        </div>
      </div>
      
      {/* Sidebar de eventos diários */}
      <div className={`
        flex-shrink-0 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-80 ml-6' : 'w-12 ml-6'}
        bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col relative
      `}>
        {/* Botão de esconder/mostrar sidebar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`
            absolute p-1 rounded-full shadow-sm z-10 transition-transform duration-300
            flex items-center justify-center border border-gray-200
            ${isSidebarOpen 
              ? '-left-3 top-4 bg-white text-gray-500 hover:bg-gray-100'
              : 'left-1/2 -translate-x-1/2 top-4 bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
          title={isSidebarOpen ? "Esconder eventos diários" : "Mostrar eventos diários"}
        >
          {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        {isSidebarOpen && (
          <DailyEventsSidebar
            selectedDate={selectedDayForSidebar}
            events={dailyEvents}
            onViewDetails={handleSelectEvent}
          />
        )}
      </div>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

export default AgendaPage;