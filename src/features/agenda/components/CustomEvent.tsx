// Local: src/features/agenda/components/CustomEvent.tsx

import React from 'react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';
import { Circle } from 'lucide-react'; // Ícone de bolinha

interface CustomEventProps {
  event: CalendarEvent;
  [key: string]: any; // Permite outras props desconhecidas do RBC
}

const CustomEvent: React.FC<CustomEventProps> = ({ event, view, count, ...props }) => {
  const candidate = event.resource.Candidato?.[0];
  const startTime = format(event.start, 'HH:mm');
  const endTime = format(event.end, 'HH:mm');

  // Determinar se estamos na visualização mensal ou semanal/diária
  const isMonthView = view === 'month';

  if (isMonthView) {
    // Renderização compacta para a visualização mensal: bolinha com contagem
    // A cor de fundo da bolinha virá do eventPropGetter.style.backgroundColor do rbc-event
    return (
      <div 
        className="rbc-event-dot-wrapper" /* Classe para o wrapper da bolinha (estilizado no CSS) */
        title={`${event.title} (${startTime} - ${endTime})`} /* Tooltip ao passar o mouse */
        // O background-color é aplicado diretamente ao div interno .rbc-event-content no CSS
        // aqui passamos apenas para o elemento raiz do evento para manter a consistência do RBC
      >
        {/* O conteúdo (número da bolinha) será estilizado pelo CSS dentro do .rbc-event-content */}
        <div className="rbc-event-content" style={{ backgroundColor: props.style?.backgroundColor }}>
          {count > 0 ? count : ''} {/* Exibe a contagem na bolinha */}
        </div>
      </div>
    );
  } else {
    // Renderização detalhada para visualizações semanais/diárias (como cards coloridos)
    const backgroundColor = props.style?.backgroundColor || '#6366f1'; // Fallback color
    const textColor = 'white';

    return (
      <div 
        className="flex flex-col h-full p-1 rounded-md text-white overflow-hidden" 
        style={{ backgroundColor }} 
      >
        <strong className="text-xs font-bold truncate" style={{ color: textColor }}>{event.title}</strong>
        {candidate && (
          <span className="text-xs opacity-80 truncate" style={{ color: textColor }}>Com: {candidate.nome || candidate.value}</span>
        )}
        <span className="text-xs opacity-90" style={{ color: textColor }}>{startTime} - {endTime}</span>
      </div>
    );
  }
};

export default CustomEvent;