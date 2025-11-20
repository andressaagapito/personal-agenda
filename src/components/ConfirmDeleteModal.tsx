import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agendaName: string;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, agendaName }: ConfirmDeleteModalProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onConfirm) {
      onConfirm();
    }
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 100);
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
          <h2 className={`text-xl sm:text-2xl ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{String(t('deleteAgendaTitle'))}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors flex-shrink-0 ${theme === 'dark' ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <FaTimes className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pb-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <FaExclamationTriangle className={`w-6 h-6 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <div className="flex-1">
              <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                {String(t('confirmDeleteAgenda')).replace('{name}', agendaName)}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {String(t('deleteAgendaWarning'))}
              </p>
            </div>
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
              type="button"
              onClick={handleConfirm}
              className={`flex-1 px-6 py-3 backdrop-blur-sm rounded-xl border transition-colors text-white shadow-lg ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700 border-red-700/40' : 'bg-red-600 hover:bg-red-700 border-red-700/40'}`}
            >
              {String(t('delete'))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

