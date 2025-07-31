// Local: src/features/agenda/components/CustomEvent.tsx

import React from 'react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';

interface CustomEventProps {
  event: CalendarEvent;
}

const CustomEvent: React.FC<CustomEventProps> = ({ event }) => {
  const candidate = event.resource.Candidato?.[0];
  const startTime = format(event.start, 'HH:mm');
  const endTime = format(event.end, 'HH:mm');

  return (
    <div className="flex flex-col h-full p-1 text-white">
      <strong className="text-xs font-bold truncate">{event.title}</strong>
      {candidate && (
        <span className="text-xs opacity-80 truncate">{candidate.nome || candidate.value}</span>
      )}
      <span className="text-xs opacity-90">{startTime} - {endTime}</span>
    </div>
  );
};

export default CustomEvent;