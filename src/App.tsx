import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar } from './components/Calendar';
import { DayEvents } from './components/DayEvents';
import { Controls } from './components/Controls';
import { CreateAgendaModal } from './components/CreateAgendaModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { ConfirmDeleteAllModal } from './components/ConfirmDeleteAllModal';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { FaCalendarAlt, FaMinus, FaTimes, FaCheck, FaGlobe, FaMoon, FaSun, FaPlus } from 'react-icons/fa';
import type { Appointment, FooterStatus, Agenda, Language } from './types';
import { FEATURES } from './config/features';

interface AgendaContentProps {
  agenda: Agenda;
  theme: 'light' | 'dark';
  t: (key: keyof typeof import('./utils/translations').translations.pt) => string | string[];
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  isLanguageMenuOpen: boolean;
  setIsLanguageMenuOpen: (open: boolean) => void;
  FEATURES: typeof FEATURES;
  onAddAppointment: (apt: Appointment) => void;
  onDeleteAppointment: (id: number) => void;
  onEditAppointment: (apt: Appointment) => void;
  setFooterStatus: (status: FooterStatus) => void;
  footerStatus: FooterStatus;
  cancelRecordingRef: React.MutableRefObject<(() => void) | null>;
  handleCancelRecording: () => void;
}

function AgendaContent({
  agenda,
  theme,
  t,
  language,
  setLanguage,
  toggleTheme,
  isLanguageMenuOpen,
  setIsLanguageMenuOpen,
  FEATURES,
  onAddAppointment,
  onDeleteAppointment,
  onEditAppointment,
  setFooterStatus,
  footerStatus,
  cancelRecordingRef,
  handleCancelRecording
}: AgendaContentProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const languageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLanguageMenuOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (languageMenuRef.current && !languageMenuRef.current.contains(target)) {
        setIsLanguageMenuOpen(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isLanguageMenuOpen, setIsLanguageMenuOpen]);

  const getAppointmentsForDate = (appointments: Appointment[], date: Date): Appointment[] => {
    const targetDateStr = date.toDateString();
    return appointments.filter(apt => {
      try {
        const aptDate = new Date(apt.date);
        return aptDate.toDateString() === targetDateStr;
      } catch (error) {
        return false;
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 mb-6">
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-gray-900 border-gray-700/30' : 'from-blue-50 to-blue-100 border-blue-200/40'} backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-lg border relative z-[9998] transition-colors duration-300`}>
        <div className="flex items-center justify-between gap-2 sm:justify-center sm:gap-3 relative">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none justify-center sm:justify-start">
            <FaCalendarAlt className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
            <h1 className={`text-lg sm:text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{agenda.name}</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 z-[9999] flex-shrink-0">
            {FEATURES.DARK_MODE && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTheme();
                }}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-white/60 hover:bg-white/80'}`}
                title={theme === 'light' ? String(t('activateDarkMode')) : String(t('activateLightMode'))}
                type="button"
              >
                {theme === 'light' ? (
                  <FaMoon className="w-5 h-5 text-gray-700" />
                ) : (
                  <FaSun className="w-5 h-5 text-yellow-300" />
                )}
              </button>
            )}
            {FEATURES.TRANSLATIONS && (
              <div className="relative group">
                <button 
                  className={`p-2 rounded-lg transition-colors relative z-[9999] ${theme === 'dark' ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-white/60 hover:bg-white/80'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLanguageMenuOpen(!isLanguageMenuOpen);
                  }}
                >
                  <FaGlobe className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} />
                </button>
                <div 
                  ref={languageMenuRef}
                  data-language-menu
                  className={`absolute right-0 top-full mt-2 rounded-lg shadow-lg border transition-all z-[10000] min-w-[120px] ${theme === 'dark' ? 'bg-gray-800 border-gray-700/30' : 'bg-white border-gray-200/60'} ${
                    isLanguageMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ zIndex: 10000 }}
                >
                  <button
                    onClick={() => {
                      setLanguage('pt');
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left rounded-t-lg transition-colors ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50'} ${language === 'pt' ? (theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                  >
                    🇧🇷 Português
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left transition-colors ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50'} ${language === 'en' ? (theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('fr');
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left transition-colors ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50'} ${language === 'fr' ? (theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                  >
                    🇫🇷 Français
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('es');
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left rounded-b-lg transition-colors ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50'} ${language === 'es' ? (theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                  >
                    🇪🇸 Español
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900 border-gray-700/30' : 'bg-white border-gray-200/60'} backdrop-blur-xl rounded-3xl p-6 shadow-lg border space-y-6 transition-colors duration-300`}>
          <Calendar 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            appointments={agenda.appointments}
          />
          <DayEvents 
            date={selectedDate}
            appointments={getAppointmentsForDate(agenda.appointments, selectedDate)}
            onAddAppointment={onAddAppointment}
            onFooterStatusChange={setFooterStatus}
            onCancelRecordingRef={cancelRecordingRef}
          />
        </div>

        <Controls 
          onAddAppointment={onAddAppointment}
          selectedDate={selectedDate}
          appointments={agenda.appointments}
          onDeleteAppointment={onDeleteAppointment}
          onEditAppointment={onEditAppointment}
          onFooterStatusChange={setFooterStatus}
          onCancelRecordingRef={cancelRecordingRef}
        />
      </div>

      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-900 to-gray-950 border-gray-800/30' : 'bg-white border-gray-200/60'} backdrop-blur-xl rounded-3xl p-4 shadow-lg border transition-colors duration-300`}>
        <div className={`flex items-center justify-center gap-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-700'}`}>
          {footerStatus === 'ready' ? (
            <>
              <FaCheck className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`} />
              <span>{String(t('ready'))}</span>
            </>
          ) : footerStatus === 'success' ? (
            <>
              <FaCheck className="w-5 h-5 text-green-500" />
              <span>{String(t('success'))}</span>
            </>
          ) : (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <span>{String(t('recording'))}</span>
              <button
                onClick={handleCancelRecording}
                className={`ml-3 p-1.5 rounded-lg transition-colors flex items-center justify-center ${theme === 'dark' ? 'hover:bg-white/20' : 'hover:bg-gray-100'}`}
                title={String(t('cancel'))}
              >
                <FaTimes className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCreateAgendaModalOpen, setIsCreateAgendaModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [isDeleteAllConfirmModalOpen, setIsDeleteAllConfirmModalOpen] = useState(false);
  const [agendaToDeleteId, setAgendaToDeleteId] = useState<number | null>(null);
  
  const [agendas, setAgendas] = useState<Agenda[]>(() => {
    try {
      const saved = localStorage.getItem('agendas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      
      const oldAppointments = localStorage.getItem('agenda-appointments');
      if (oldAppointments) {
        try {
          const parsedAppointments = JSON.parse(oldAppointments);
          const defaultAgenda: Agenda = {
            id: Date.now(),
            name: 'Minha Agenda',
            appointments: parsedAppointments
          };
          localStorage.removeItem('agenda-appointments');
          return [defaultAgenda];
        } catch (error) {
          console.error('Erro ao migrar dados antigos:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar agendas do localStorage:', error);
    }
    return [];
  });

  const [expandedAgendaIds, setExpandedAgendaIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('expanded-agenda-ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar agendas expandidas do localStorage:', error);
    }
    return [];
  });

  const expandedAgendaIdsRef = useRef<number[]>(expandedAgendaIds);
  useEffect(() => {
    expandedAgendaIdsRef.current = expandedAgendaIds;
  }, [expandedAgendaIds]);

  const [footerStatus, setFooterStatus] = useState<FooterStatus>('ready');
  const cancelRecordingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('agendas', JSON.stringify(agendas));
      localStorage.setItem('expanded-agenda-ids', JSON.stringify(expandedAgendaIds));
    } catch (error) {
      console.error('Erro ao salvar agendas no localStorage:', error);
    }
  }, [agendas, expandedAgendaIds]);

  useEffect(() => {
    if (agendas.length > 0) {
      const validExpandedIds = expandedAgendaIds.filter(id => agendas.some(a => a.id === id));
      if (validExpandedIds.length === 0) {
        setExpandedAgendaIds([agendas[0].id]);
      } else if (validExpandedIds.length !== expandedAgendaIds.length) {
        setExpandedAgendaIds(validExpandedIds);
      }
    }
  }, [agendas.length]);

  const setAppointments = (agendaId: number, updater: Appointment[] | ((prev: Appointment[]) => Appointment[])) => {
    setAgendas(prevAgendas => {
      const agendaInState = prevAgendas.find(a => a.id === agendaId);
      const newAppointments = typeof updater === 'function' 
        ? updater(agendaInState?.appointments || [])
        : updater;
      
      return prevAgendas.map(agenda => 
        agenda.id === agendaId 
          ? { ...agenda, appointments: newAppointments }
          : agenda
      );
    });
  };

  const addAppointment = (agendaId: number, appointment: Appointment) => {
    setAppointments(agendaId, prevAppointments => {
      const existingIndex = prevAppointments.findIndex(apt => apt.id === appointment.id);
      if (existingIndex >= 0) {
        return prevAppointments.map(apt => 
          apt.id === appointment.id ? { ...appointment } : apt
        );
      } else {
        return [...prevAppointments, appointment];
      }
    });
  };

  const deleteAppointment = (agendaId: number, id: number) => {
    const agenda = agendas.find(a => a.id === agendaId);
    if (agenda) {
      setAppointments(agendaId, agenda.appointments.filter(apt => apt.id !== id));
    }
  };

  const handleCancelRecording = () => {
    if (cancelRecordingRef.current) {
      cancelRecordingRef.current();
    }
    setFooterStatus('ready');
  };

  useEffect(() => {
    if (footerStatus === 'success') {
      const timeout = setTimeout(() => {
        setFooterStatus('ready');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [footerStatus]);

  const languageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLanguageMenuOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (languageMenuRef.current && !languageMenuRef.current.contains(target)) {
        setIsLanguageMenuOpen(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isLanguageMenuOpen]);

  const handleCreateAgenda = (name: string) => {
    const newAgenda: Agenda = {
      id: Date.now(),
      name: name.trim() || 'Nova Agenda',
      appointments: []
    };
    setAgendas(prev => {
      const updated = [...prev, newAgenda];
      return updated;
    });
    setExpandedAgendaIds(prev => [...prev, newAgenda.id]);
  };

  const handleSwitchAgenda = (agendaId: number) => {
    setExpandedAgendaIds(prev => {
      if (prev.includes(agendaId)) {
        return prev.filter(id => id !== agendaId);
      } else {
        return [...prev, agendaId];
      }
    });
  };

  const handleDeleteAgenda = useCallback(() => {
    if (agendaToDeleteId === null) return;
    
    setAgendas(prev => {
      const filtered = prev.filter(agenda => agenda.id !== agendaToDeleteId);
      
      setExpandedAgendaIds(prevExpanded => prevExpanded.filter(id => id !== agendaToDeleteId));
      
      if (filtered.length > 0 && expandedAgendaIdsRef.current.filter(id => id !== agendaToDeleteId).length === 0) {
        setExpandedAgendaIds([filtered[0].id]);
      }
      
      setAgendaToDeleteId(null);
      return filtered;
    });
  }, [agendaToDeleteId]);

  const handleDeleteAllAgendas = useCallback(() => {
    setAgendas([]);
    setExpandedAgendaIds([]);
  }, []);

  const sortedAgendas = [...agendas].sort((a, b) => {
    const aExpanded = expandedAgendaIds.includes(a.id);
    const bExpanded = expandedAgendaIds.includes(b.id);
    if (aExpanded && !bExpanded) return -1;
    if (!aExpanded && bExpanded) return 1;
    return 0;
  });

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme === 'dark' ? 'from-gray-900 to-gray-800' : 'from-gray-100 to-gray-200'} p-4 sm:p-8 transition-colors duration-300 overflow-y-auto`}>
      <div className="max-w-7xl mx-auto mb-4">
        <div className={`flex items-center gap-3 backdrop-blur-xl rounded-t-2xl px-3 sm:px-4 py-2 sm:py-3 border transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-gray-300/40'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-indigo-500'}`}>
              <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className={`text-base sm:text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{String(t('home'))}</span>
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => setIsCreateAgendaModalOpen(true)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'}`}
              title={String(t('createNewAgenda'))}
            >
              <FaPlus className={`w-3 h-3 sm:w-4 sm:h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'}`}
              title={isMinimized ? String(t('expand')) : String(t('minimize'))}
            >
              <FaMinus className={`w-3 h-3 sm:w-4 sm:h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
            <button 
              onClick={() => setIsDeleteAllConfirmModalOpen(true)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'hover:bg-red-900/50' : 'hover:bg-red-100'}`}
              title={String(t('deleteAllAgendas'))}
            >
              <FaTimes className={`w-3 h-3 sm:w-4 sm:h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        <div className="relative">
          {agendas.length > 0 ? sortedAgendas.map((agenda, index) => {
              const isExpanded = expandedAgendaIds.includes(agenda.id);
              return (
                <div key={agenda.id}>
                  <div
                    className={`flex items-center gap-2 sm:gap-3 backdrop-blur-xl rounded-t-2xl px-3 sm:px-4 py-2 ${isExpanded ? 'sm:py-3' : ''} border transition-all mb-1 ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-gray-300/40'}`}
                    style={{ 
                      zIndex: agendas.length - index,
                      position: 'relative'
                    }}
                  >
                    <div 
                      onClick={() => handleSwitchAgenda(agenda.id)}
                      className="flex items-center gap-2 flex-1 cursor-pointer hover:scale-[1.02]"
                    >
                      <div className={`${isExpanded ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-5 h-5 sm:w-6 sm:h-6'} rounded-lg flex items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-indigo-500'}`}>
                        <FaCalendarAlt className={`${isExpanded ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-3 h-3 sm:w-4 sm:h-4'} text-white`} />
                      </div>
                      <span className={`${isExpanded ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{agenda.name}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setAgendaToDeleteId(agenda.id);
                          setIsDeleteConfirmModalOpen(true);
                        }}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'hover:bg-red-900/50' : 'hover:bg-red-100'}`}
                        title={String(t('deleteAgenda'))}
                      >
                        <FaTimes className={`w-3 h-3 sm:w-4 sm:h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                      </button>
                    </div>
                  </div>

                  {!isMinimized && isExpanded && (
                    <AgendaContent
                      agenda={agenda}
                      theme={theme}
                      t={t}
                      language={language}
                      setLanguage={setLanguage}
                      toggleTheme={toggleTheme}
                      isLanguageMenuOpen={isLanguageMenuOpen}
                      setIsLanguageMenuOpen={setIsLanguageMenuOpen}
                      FEATURES={FEATURES}
                      onAddAppointment={(apt) => addAppointment(agenda.id, apt)}
                      onDeleteAppointment={(id) => deleteAppointment(agenda.id, id)}
                      onEditAppointment={(apt) => addAppointment(agenda.id, apt)}
                      setFooterStatus={setFooterStatus}
                      footerStatus={footerStatus}
                      cancelRecordingRef={cancelRecordingRef}
                      handleCancelRecording={handleCancelRecording}
                    />
                  )}
                </div>
              );
            }) : (
            <div className={`flex items-center gap-2 sm:gap-3 backdrop-blur-xl rounded-t-2xl px-3 sm:px-4 py-2 border transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-gray-300/40'}`}>
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'}`}>
                  <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {String(t('noAppointments'))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateAgendaModal
        isOpen={isCreateAgendaModalOpen}
        onClose={() => setIsCreateAgendaModalOpen(false)}
        onCreate={handleCreateAgenda}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => {
          setIsDeleteConfirmModalOpen(false);
          setAgendaToDeleteId(null);
        }}
        onConfirm={() => {
          handleDeleteAgenda();
          setIsDeleteConfirmModalOpen(false);
        }}
        agendaName={agendas.find(a => a.id === agendaToDeleteId)?.name || String(t('appTitle'))}
      />

      <ConfirmDeleteAllModal
        isOpen={isDeleteAllConfirmModalOpen}
        onClose={() => setIsDeleteAllConfirmModalOpen(false)}
        onConfirm={handleDeleteAllAgendas}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider enabled={FEATURES.DARK_MODE}>
      <LanguageProvider enabled={FEATURES.TRANSLATIONS}>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

