export interface Appointment {
  id: number;
  title: string;
  time: string;
  description: string;
  date: string;
}

export interface Agenda {
  id: number;
  name: string;
  appointments: Appointment[];
}

export type FooterStatus = 'ready' | 'recording' | 'success';

export type Theme = 'light' | 'dark';

export type Language = 'pt' | 'en' | 'fr' | 'es';

