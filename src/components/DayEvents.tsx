import { useState, useEffect } from 'react';
import { FaBookmark, FaClock } from 'react-icons/fa';
import { AddAppointmentModal } from './AddAppointmentModal';
import { useSpeechRecognitionHook } from '../hooks/useSpeechRecognition';
import { parseVoiceText, convertToAppointmentData } from '../utils/parseVoiceText';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import type { Appointment, FooterStatus } from '../types';
import { FEATURES } from '../config/features';

interface DayEventsProps {
  date: Date;
  appointments: Appointment[];
  onAddAppointment: (appointment: Appointment) => void;
  onFooterStatusChange: (status: FooterStatus) => void;
  onCancelRecordingRef: React.MutableRefObject<(() => void) | null>;
}

export function DayEvents({ 
  date, 
  appointments, 
  onAddAppointment, 
  onFooterStatusChange, 
  onCancelRecordingRef 
}: DayEventsProps) {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voiceData, setVoiceData] = useState<Partial<Appointment> | null>(null);
  
  const speechLang = language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'pt-BR';
  const speechRecognition = useSpeechRecognitionHook(speechLang);
  const { transcript, isListening, stopListening, resetTranscript, error } = FEATURES.VOICE_RECOGNITION 
    ? speechRecognition 
    : { transcript: '', isListening: false, stopListening: () => {}, resetTranscript: () => {}, error: null };

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
        onFooterStatusChange('ready');
        
        const parseLang = language === 'en' ? 'en' : 'pt';
        const result = parseVoiceText(transcript, parseLang);
        
        if (result.success && result.data) {
          const { date: parsedDate, time } = convertToAppointmentData(result.data, date.getFullYear());
          onAddAppointment({
            id: Date.now(),
            title: result.data.title,
            time: time,
            description: '',
            date: parsedDate.toISOString()
          });
          onFooterStatusChange('success');
        } else {
          onFooterStatusChange('ready');
          alert(result.error || String(t('voiceParseError')));
        }
        
        resetTranscript();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [transcript, isListening, stopListening, resetTranscript, onFooterStatusChange, date, onAddAppointment, t]);

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

  return (
    <div className={`backdrop-blur-sm rounded-2xl p-6 border transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/30' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-2 mb-4">
        <FaBookmark className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
        <h3 className={theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}>{String(t('events'))}</h3>
      </div>

      {appointments.length === 0 ? (
        <div className="py-8 text-center">
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{String(t('noEvents'))}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div 
              key={apt.id}
              className={`backdrop-blur-sm rounded-xl p-4 border transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700/40 border-gray-600/30' : 'bg-blue-50 border-blue-100/60'}`}
            >
              <div className="flex items-start gap-3">
                <FaClock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
                <div className="flex-1">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{apt.title}</h4>
                  <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{apt.time}</p>
                  {apt.description && apt.description.trim() && (
                    <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{apt.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
        selectedDate={date}
      />
    </div>
  );
}
