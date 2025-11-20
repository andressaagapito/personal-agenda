import { useState } from 'react';
import { FaTimes, FaClock, FaEdit, FaTrash } from 'react-icons/fa';
import { AddAppointmentModal } from './AddAppointmentModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import type { Appointment } from '../types';

interface ViewAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onDelete: (id: number) => void;
  onEdit: (appointment: Appointment) => void;
}

export function ViewAllModal({ isOpen, onClose, appointments, onDelete, onEdit }: ViewAllModalProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleEdit = (apt: Appointment) => {
    setEditingAppointment(apt);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (appointmentData: Appointment) => {
    if (editingAppointment) {
      onEdit(appointmentData);
      setIsEditModalOpen(false);
      setEditingAppointment(null);
    }
  };

  const groupedAppointments = appointments.reduce((groups, apt) => {
    const date = new Date(apt.date).toLocaleDateString(String(t('locale')));
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => {
    const dateA = a.split('/').reverse().join('-');
    const dateB = b.split('/').reverse().join('-');
    return dateA.localeCompare(dateB);
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`relative bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900 border-gray-700/30' : 'bg-white border-gray-200/60'} backdrop-blur-xl rounded-3xl p-8 border shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}>{String(t('allAppointments'))}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <FaTimes className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} />
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="py-8 text-center">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{String(t('noAppointments'))}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((date) => (
              <div key={date}>
                <div className={`backdrop-blur-sm rounded-xl px-4 py-3 mb-3 border ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700/30' : 'bg-blue-50 border-blue-100/60'}`}>
                  <p className={`text-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{date}</p>
                </div>

                <div className="space-y-3">
                  {groupedAppointments[date].map((apt) => (
                    <div
                      key={apt.id}
                      className={`backdrop-blur-sm rounded-xl p-4 border transition-colors ${theme === 'dark' ? 'bg-gray-700/40 border-gray-600/30 hover:bg-gray-700/50' : 'bg-blue-50 border-blue-100/60 hover:bg-blue-100'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <FaClock className={`w-4 h-4 flex-shrink-0 mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}>
                              {apt.title} - {apt.time}
                            </p>
                            {apt.description && apt.description.trim() && (
                              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{apt.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(apt)}
                            className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-600/50' : 'hover:bg-blue-100'}`}
                            title={String(t('edit'))}
                          >
                            <FaEdit className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} />
                          </button>
                          <button
                            onClick={() => onDelete(apt.id)}
                            className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-600/50' : 'hover:bg-blue-100'}`}
                            title={String(t('delete'))}
                          >
                            <FaTrash className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

              <AddAppointmentModal
                isOpen={isEditModalOpen}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setEditingAppointment(null);
                }}
                onAdd={handleSaveEdit}
                initialData={editingAppointment}
                mode="edit"
                selectedDate={editingAppointment ? new Date(editingAppointment.date) : new Date()}
              />
    </div>
  );
}
