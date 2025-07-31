// Local: src/features/agenda/components/CustomToolbar.tsx

import React from 'react';
import { Navigate, View } from 'react-big-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// A biblioteca nos passa várias props, mas vamos usar apenas as que precisamos
interface CustomToolbarProps {
  label: string;
  view: View;
  views: View[];
  onNavigate: (action: Navigate) => void;
  onView: (view: View) => void;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ label, view, views, onNavigate, onView }) => {

  const navigate = (action: Navigate) => {
    onNavigate(action);
  };

  const viewNames: { [key in View]?: string } = {
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 mb-4 bg-white rounded-t-lg border-b border-gray-200">
      
      {/* Lado Esquerdo: Navegação e Título */}
      <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
        <button
          type="button"
          onClick={() => navigate(Navigate.TODAY)}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Hoje
        </button>
        <div className="flex items-center">
          <button onClick={() => navigate(Navigate.PREVIOUS)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => navigate(Navigate.NEXT)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
        </div>
        <h2 className="text-xl font-bold text-gray-800 capitalize">
          {label}
        </h2>
      </div>

      {/* Lado Direito: Seleção de Visualização */}
      <div className="inline-flex items-center bg-gray-100 p-1 rounded-lg">
        {views.map(viewName => (
          <button
            key={viewName}
            onClick={() => onView(viewName)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
              view === viewName
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {viewNames[viewName]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomToolbar;