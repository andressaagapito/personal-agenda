import { useState, useEffect, useRef } from 'react';
import { FaCog, FaMicrophone, FaEdit, FaEye, FaBook } from 'react-icons/fa';
import { AddAppointmentModal } from './AddAppointmentModal';
import { ViewAllModal } from './ViewAllModal';
import { useSpeechRecognitionHook } from '../hooks/useSpeechRecognition';
import { parseVoiceText, convertToAppointmentData } from '../utils/parseVoiceText';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import type { Appointment, FooterStatus } from '../types';
import { FEATURES } from '../config/features';

interface ControlsProps {
  onAddAppointment: (appointment: Appointment) => void;
  selectedDate: Date;
  appointments: Appointment[];
  onDeleteAppointment: (id: number) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onFooterStatusChange: (status: FooterStatus) => void;
  onCancelRecordingRef: React.MutableRefObject<(() => void) | null>;
}

export function Controls({ 
  onAddAppointment, 
  selectedDate, 
  appointments, 
  onDeleteAppointment, 
  onEditAppointment, 
  onFooterStatusChange, 
  onCancelRecordingRef 
}: ControlsProps) {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [voiceData, setVoiceData] = useState<Partial<Appointment> | null>(null);
  const processedTranscriptRef = useRef<string>('');
  
  const speechLang = language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'pt-BR';
  const speechRecognition = useSpeechRecognitionHook(speechLang);
  const { transcript, isListening, startListening, stopListening, resetTranscript, error } = FEATURES.VOICE_RECOGNITION 
    ? speechRecognition 
    : { transcript: '', isListening: false, startListening: async () => {}, stopListening: () => {}, resetTranscript: () => {}, error: null };

  useEffect(() => {
    onCancelRecordingRef.current = () => {
      stopListening();
      resetTranscript();
      onFooterStatusChange('ready');
    };

    return () => {
      onCancelRecordingRef.current = null;
    };
  }, [stopListening, resetTranscript, onFooterStatusChange, onCancelRecordingRef]);

  useEffect(() => {
    if (!FEATURES.VOICE_RECOGNITION) return;
    if (transcript && transcript.length > 0 && isListening) {
      const timeout = setTimeout(() => {
        stopListening();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [transcript, isListening, stopListening]);

  useEffect(() => {
    if (!FEATURES.VOICE_RECOGNITION) return;
    if (!isListening && transcript && transcript.trim().length > 0 && transcript !== processedTranscriptRef.current) {
      const currentTranscript = transcript;
      processedTranscriptRef.current = currentTranscript;
      
      const parseLang = language === 'en' ? 'en' : 'pt';
      const result = parseVoiceText(currentTranscript, parseLang);
      
      if (result.success && result.data) {
        const { date, time } = convertToAppointmentData(result.data, selectedDate.getFullYear());
        const newAppointment: Appointment = {
          id: Date.now(),
          title: result.data.title,
          time: time,
          description: '',
          date: date.toISOString()
        };
        
        onAddAppointment(newAppointment);
        onFooterStatusChange('success');
        
        setTimeout(() => {
          resetTranscript();
          processedTranscriptRef.current = '';
        }, 500);
      } else if (currentTranscript.trim().length > 10) {
        onFooterStatusChange('ready');
        alert(result.error || String(t('voiceParseError')));
        setTimeout(() => {
          resetTranscript();
          processedTranscriptRef.current = '';
        }, 100);
      }
    }
  }, [isListening, transcript, selectedDate, onAddAppointment, onFooterStatusChange, resetTranscript, t]);

  useEffect(() => {
    if (!FEATURES.VOICE_RECOGNITION) return;
    if (isListening) {
      const noVoiceTimeout = setTimeout(() => {
        if (!transcript || transcript.trim().length === 0) {
          stopListening();
          resetTranscript();
          onFooterStatusChange('ready');
          alert(String(t('noAudioCaptured')));
        }
      }, 3000);

      return () => clearTimeout(noVoiceTimeout);
    }
  }, [isListening, transcript, stopListening, resetTranscript, onFooterStatusChange, t]);

  useEffect(() => {
    if (!FEATURES.VOICE_RECOGNITION) return;
    if (error) {
      alert(error);
      onFooterStatusChange('ready');
      stopListening();
    }
  }, [error, onFooterStatusChange, stopListening]);

  const handleAddClick = async (mode: 'manual' | 'voice') => {
    if (mode === 'manual') {
      setVoiceData(null);
      setIsModalOpen(true);
    } else {
      resetTranscript();
      await startListening();
      onFooterStatusChange('recording');
    }
  };

  return (
    <div className={`bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900 border-gray-700/30' : 'bg-white border-gray-200/60'} backdrop-blur-xl rounded-3xl p-6 shadow-lg border transition-colors duration-300`}>
      <div className="flex items-center justify-center gap-3 mb-8">
        <FaCog className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
        <h2 className={theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}>{String(t('controls'))}</h2>
      </div>

      <div className="space-y-4">
        {FEATURES.VOICE_RECOGNITION && (
          <button
            onClick={() => handleAddClick('voice')}
            disabled={isListening}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 border-blue-700/40' : 'bg-blue-600 hover:bg-blue-700 border-blue-700/40'} text-white backdrop-blur-sm rounded-2xl transition-all border shadow-lg hover:shadow-xl hover:scale-[1.02] ${isListening ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaMicrophone className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            <span>{isListening ? '...' : String(t('addByVoice'))}</span>
          </button>
        )}

        <button
          onClick={() => handleAddClick('manual')}
          disabled={isListening}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600 border-blue-600/40' : 'bg-blue-500 hover:bg-blue-600 border-blue-600/40'} text-white backdrop-blur-sm rounded-2xl transition-all border shadow-lg hover:shadow-xl hover:scale-[1.02] ${isListening ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaEdit className="w-5 h-5" />
          <span>{String(t('addManual'))}</span>
        </button>

        <button
          onClick={() => setIsViewAllOpen(true)}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 ${theme === 'dark' ? 'bg-blue-400 hover:bg-blue-500 border-blue-500/40' : 'bg-blue-400 hover:bg-blue-500 border-blue-500/40'} text-white backdrop-blur-sm rounded-2xl transition-all border shadow-lg hover:shadow-xl hover:scale-[1.02]`}
        >
          <FaEye className="w-5 h-5" />
          <span>{String(t('viewAll'))}</span>
        </button>

        <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <FaBook className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
            <h3 className={theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}>{String(t('legend'))}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'}`} />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{String(t('oneAppointment'))}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`} />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{String(t('twoAppointments'))}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'}`} />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{String(t('threePlusAppointments'))}</span>
            </div>
          </div>
        </div>
      </div>

      <AddAppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setVoiceData(null);
        }}
        onAdd={(apt) => {
          onAddAppointment(apt);
          setIsModalOpen(false);
          setVoiceData(null);
        }}
        initialData={voiceData}
        selectedDate={selectedDate}
      />

      <ViewAllModal
        isOpen={isViewAllOpen}
        onClose={() => setIsViewAllOpen(false)}
        appointments={appointments}
        onDelete={onDeleteAppointment}
        onEdit={onEditAppointment}
      />
    </div>
  );
}
