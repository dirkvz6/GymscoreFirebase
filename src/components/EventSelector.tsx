import React from 'react';
import { Event } from '../types';
import * as LucideIcons from 'lucide-react';

interface EventSelectorProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventSelect: (event: Event) => void;
}

const EventSelector: React.FC<EventSelectorProps> = ({ events, selectedEvent, onEventSelect }) => {
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : <LucideIcons.Circle className="w-5 h-5" />;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Event</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {events.map(event => (
          <button
            key={event.id}
            onClick={() => onEventSelect(event)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
              selectedEvent?.id === event.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {getIcon(event.icon)}
            <span className="text-sm font-medium">{event.shortName}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventSelector;