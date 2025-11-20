import { useState, Fragment } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import type { Appointment } from '../types';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointments: Appointment[];
}

interface Day {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
}

export function Calendar({ selectedDate, onDateSelect, appointments }: CalendarProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = Array.isArray(t('months')) ? t('months') as string[] : [];
  const weekDays = Array.isArray(t('weekDays')) ? t('weekDays') as string[] : [];

  const getDaysInMonth = (date: Date): Day[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: Day[] = [];
    
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }

    return days;
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getAppointmentCount = (date: Date): number => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    }).length;
  };

  const days = getDaysInMonth(currentMonth);
  const weeks: Day[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth()));
  };

  const prevYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth()));
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-6">
        <FaCalendarAlt className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
        <h2 className={theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}>{String(t('calendar'))}</h2>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-4 flex-wrap">
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={prevMonth}
            className={`w-8 h-8 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors border flex-shrink-0 ${theme === 'dark' ? 'bg-gray-700/40 hover:bg-gray-700/60 border-gray-600/30' : 'bg-blue-50 hover:bg-blue-100 border-blue-200/40'}`}
          >
            <FaChevronLeft className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
          </button>
          <span className={`min-w-[80px] sm:min-w-[100px] text-center text-sm sm:text-base ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{monthNames[currentMonth.getMonth()]}</span>
          <button 
            onClick={nextMonth}
            className={`w-8 h-8 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors border flex-shrink-0 ${theme === 'dark' ? 'bg-gray-700/40 hover:bg-gray-700/60 border-gray-600/30' : 'bg-blue-50 hover:bg-blue-100 border-blue-200/40'}`}
          >
            <FaChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={prevYear}
            className={`w-8 h-8 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors border flex-shrink-0 ${theme === 'dark' ? 'bg-gray-700/40 hover:bg-gray-700/60 border-gray-600/30' : 'bg-blue-50 hover:bg-blue-100 border-blue-200/40'}`}
          >
            <FaChevronLeft className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
          </button>
          <span className={`min-w-[50px] sm:min-w-[60px] text-center text-sm sm:text-base ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{currentMonth.getFullYear()}</span>
          <button 
            onClick={nextYear}
            className={`w-8 h-8 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors border flex-shrink-0 ${theme === 'dark' ? 'bg-gray-700/40 hover:bg-gray-700/60 border-gray-600/30' : 'bg-blue-50 hover:bg-blue-100 border-blue-200/40'}`}
          >
            <FaChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
          </button>
        </div>
      </div>

      <div className={`backdrop-blur-sm rounded-2xl p-3 border ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/30' : 'bg-white border-gray-200/60'}`}>
        <div className="grid grid-cols-8 gap-1">
          <div className={`text-center py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}></div>
          {weekDays.map(day => (
            <div key={day} className={`text-center py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {day}
            </div>
          ))}

          {weeks.map((week, weekIndex) => (
            <Fragment key={`week-row-${weekIndex}`}>
              <div className={`flex items-center justify-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {getWeekNumber(week[0].date)}
              </div>
              {week.map((day, dayIndex) => {
                const isSelected = day.date.toDateString() === selectedDate.toDateString();
                const isToday = day.date.toDateString() === new Date().toDateString();
                const count = getAppointmentCount(day.date);
                
                return (
                  <button
                    key={`${weekIndex}-${dayIndex}`}
                    onClick={() => onDateSelect(day.date)}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center relative transition-all
                      ${!day.isCurrentMonth 
                        ? (theme === 'dark' ? 'text-gray-600' : 'text-gray-300') 
                        : (theme === 'dark' ? 'text-gray-200' : 'text-gray-800')}
                      ${isSelected 
                        ? (theme === 'dark' ? 'bg-blue-600 shadow-lg scale-105 text-white' : 'bg-blue-600 shadow-lg scale-105 text-white') 
                        : isToday 
                          ? (theme === 'dark' ? 'bg-blue-500/50' : 'bg-blue-100') 
                          : (theme === 'dark' ? 'hover:bg-blue-500/40' : 'hover:bg-blue-50')}
                    `}
                  >
                    {day.day}
                    {count > 0 && day.isCurrentMonth && (
                      <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                        theme === 'dark' 
                          ? (count === 1 ? 'bg-blue-500' : count === 2 ? 'bg-blue-600' : 'bg-blue-700')
                          : (count === 1 ? 'bg-blue-400' : count === 2 ? 'bg-blue-500' : 'bg-blue-600')
                      }`} />
                    )}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
