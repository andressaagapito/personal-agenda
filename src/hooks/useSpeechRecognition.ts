import { useState, useEffect, useRef } from 'react';

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export type SpeechLanguage = 'pt-BR' | 'en-US' | 'fr-FR' | 'es-ES';

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  
  const SpeechRecognition = (window as any).SpeechRecognition || 
                           (window as any).webkitSpeechRecognition;
  
  return SpeechRecognition;
};

export function useSpeechRecognitionHook(language: SpeechLanguage = 'pt-BR'): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    
    if (!SpeechRecognition) {
      setError('Seu navegador não suporta reconhecimento de voz. Use Chrome, Edge ou Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript;
      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        setError('Nenhuma fala detectada. Tente falar mais alto ou verifique o microfone.');
      } else if (event.error === 'audio-capture') {
        setError('Não foi possível capturar áudio. Verifique se o microfone está conectado.');
      } else if (event.error === 'not-allowed') {
        setError('Permissão de microfone negada. Por favor, permita o acesso ao microfone.');
      } else {
        setError(`Erro no reconhecimento: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
        }
      }
    };
  }, [language]);

  const startListening = async () => {
    setError(null);
    finalTranscriptRef.current = '';
    setTranscript('');

    if (!recognitionRef.current) {
      setError('Reconhecimento de voz não está disponível.');
      return;
    }

    try {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permError) {
        setError('Permissão de microfone negada. Por favor, permita o acesso ao microfone nas configurações do navegador.');
        return;
      }

      recognitionRef.current.start();
    } catch (err: any) {
      setError('Erro ao iniciar reconhecimento de voz. Verifique as permissões do microfone.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
      }
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    finalTranscriptRef.current = '';
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
}
