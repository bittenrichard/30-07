// Local: src/features/agenda/components/DailyEventsSidebar.tsx

import React from 'react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dot } from 'lucide-react';

interface DailyEventsSidebarProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onViewDetails: (event: CalendarEvent) => void;
}

const DailyEventsSidebar: React.FC<DailyEventsSidebarProps> = ({ selectedDate, events, onViewDetails }) => {
  const formattedDayOfWeek = format(selectedDate, 'EEEE', { locale: ptBR });
  const formattedFullDate = format(selectedDate, "dd 'de' MMMM", { locale: ptBR });

  const sidebarEventColors = [
    'bg-indigo-500', 'bg-green-500', 'bg-pink-500', 'bg-yellow-500', 'bg-purple-500',
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Compromissos do Dia</h3>
      <p className="text-sm text-gray-500 mb-6 capitalize">{formattedDayOfWeek}, {formattedFullDate}</p>

      <div className="flex-grow overflow-y-auto hide-scrollbar">
        {events.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">
            Nenhum compromisso para este dia.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => {
              const eventColorClass = sidebarEventColors[index % sidebarEventColors.length];
              return (
                <div
                  key={event.resource.id}
                  // Removido hover:shadow-md transition-shadow para evitar bugs de hover
                  // Adicionado hover:scale-105 para um efeito de zoom mais simples e menos propenso a bugs
                  className={`p-3 rounded-lg cursor-pointer flex items-start text-white ${eventColorClass} shadow-sm hover:scale-[1.02] transition-transform duration-150 ease-out`} 
                  onClick={() => onViewDetails(event)}
                >
                  <div className="flex flex-col items-center flex-shrink-0 mr-3">
                      <span className="text-xs font-semibold">
                          {format(event.start, 'HH:mm')}
                      </span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-semibold leading-tight">
                      {event.title}
                    </p>
                    {event.resource.Candidato?.[0] && (
                      <p className="text-xs mt-1 leading-tight opacity-90">
                        Com: {event.resource.Candidato[0].nome || event.resource.Candidato[0].value}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyEventsSidebar;