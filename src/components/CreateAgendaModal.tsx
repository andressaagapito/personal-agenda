import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface CreateAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreateAgendaModal({ isOpen, onClose, onCreate }: CreateAgendaModalProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [agendaName, setAgendaName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agendaName.trim()) {
      onCreate(agendaName.trim());
      setAgendaName('');
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgendaName(e.target.value);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        style={{ position: 'fixed', zIndex: 9999 }}
      />
      
      <div 
        className={`relative bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900 border-gray-700/30' : 'bg-white border-gray-200/60'} backdrop-blur-xl rounded-3xl p-6 sm:p-8 border shadow-2xl max-w-md w-full max-h-[calc(100vh-2rem)] my-auto z-[10000] flex flex-col transition-colors duration-300`} 
        style={{ position: 'relative', zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className={`text-xl sm:text-2xl ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{String(t('newAgenda'))}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors flex-shrink-0 ${theme === 'dark' ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <FaTimes className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pb-4">
          <div>
            <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{String(t('agendaName'))}</label>
            <input
              type="text"
              value={agendaName}
              onChange={handleChange}
              required
              autoFocus
              className={`w-full px-4 py-3 border rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700/40 border-gray-600/30 text-gray-100 placeholder-gray-400 focus:ring-gray-500/50 focus:border-gray-500/50' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500/50'}`}
              placeholder={String(t('agendaNamePlaceholder'))}
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
              {String(t('create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

