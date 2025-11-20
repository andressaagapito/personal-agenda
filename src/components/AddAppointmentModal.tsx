import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import type { Appointment } from '../types';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (appointment: Appointment) => void;
  initialData?: Partial<Appointment> | null;
  mode?: 'add' | 'edit';
  selectedDate?: Date;
}

interface FormData {
  title: string;
  time: string;
  description: string;
}

export function AddAppointmentModal({ isOpen, onClose, onAdd, initialData, mode = 'add', selectedDate }: AddAppointmentModalProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    time: '',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        time: initialData.time || '',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        title: '',
        time: '',
        description: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.time) {
      const appointmentDate = initialData?.date 
        ? new Date(initialData.date) 
        : (selectedDate || new Date());
      
      const appointmentData: Appointment = {
        id: mode === 'edit' && initialData?.id ? initialData.id : Date.now(),
        title: formData.title,
        time: formData.time,
        description: formData.description,
        date: appointmentDate.toISOString()
      };
      onAdd(appointmentData);
      setFormData({ title: '', time: '', description: '' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`relative bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900 border-gray-700/30' : 'bg-white border-gray-200/60'} backdrop-blur-xl rounded-none sm:rounded-3xl p-6 sm:p-8 border-0 sm:border shadow-2xl max-w-md w-full h-full sm:h-auto sm:max-h-[90vh] sm:my-auto z-[101] flex flex-col transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className={`text-xl sm:text-2xl ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{mode === 'edit' ? String(t('editAppointment')) : String(t('addAppointment'))}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors flex-shrink-0 ${theme === 'dark' ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <FaTimes className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pb-4">
          <div>
            <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{String(t('title'))}</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700/40 border-gray-600/30 text-gray-100 placeholder-gray-400 focus:ring-gray-500/50 focus:border-gray-500/50' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500/50'}`}
              placeholder={String(t('appointmentName'))}
            />
          </div>

          <div>
            <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{String(t('time'))}</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700/40 border-gray-600/30 text-gray-100 placeholder-gray-400 focus:ring-gray-500/50 focus:border-gray-500/50' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500/50'}`}
            />
          </div>

          <div>
            <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{String(t('description'))}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-3 border rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 resize-none transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700/40 border-gray-600/30 text-gray-100 placeholder-gray-400 focus:ring-gray-500/50 focus:border-gray-500/50' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500/50'}`}
              placeholder={String(t('appointmentDetails'))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 backdrop-blur-sm rounded-xl border transition-colors ${theme === 'dark' ? 'bg-gray-700/40 hover:bg-gray-700/60 border-gray-600/30 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'}`}
            >
              {String(t('cancel'))}
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 backdrop-blur-sm rounded-xl border transition-colors text-white shadow-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 border-blue-700/40' : 'bg-blue-600 hover:bg-blue-700 border-blue-700/40'}`}
            >
              {mode === 'edit' ? String(t('save')) : String(t('add'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
