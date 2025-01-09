import { useState, useEffect } from 'react';
import Clock from 'react-clock';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import 'react-clock/dist/Clock.css';

interface TimeSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
  label: string;
}

export function TimeSelector({ value, onChange, label }: TimeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTimeClick = (hours: number, minutes: number) => {
    const newDate = new Date(value);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    onChange(newDate);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {format(value, 'hh:mm a')}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 mt-2 p-4 bg-white rounded-lg shadow-xl border"
        >
          <div className="flex flex-col items-center">
            <Clock
              value={value}
              renderNumbers={true}
              size={200}
              className="mb-4"
            />
            <div className="grid grid-cols-4 gap-2">
              {[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => (
                <button
                  key={hour}
                  onClick={() => handleTimeClick(hour, 0)}
                  className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-blue-100"
                >
                  {format(new Date().setHours(hour, 0), 'hh:mm a')}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}