interface ParsedAppointment {
  title: string;
  day: number;
  month: number;
  hour: number;
  minute: number;
}

interface ParseResult {
  success: boolean;
  data?: ParsedAppointment;
  error?: string;
}

type ParseLanguage = 'pt' | 'en';

export function parseVoiceText(text: string, language: ParseLanguage = 'pt'): ParseResult {
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: language === 'en' ? 'No text was captured. Please try again.' : 'Nenhum texto foi capturado. Tente novamente.'
    };
  }

  let normalized = text.trim()
    .toLowerCase()
    .replace(/[.,;:!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let parts = normalized.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  let title = '';
  let dateMatch: RegExpMatchArray | null = null;
  let timeMatch: RegExpMatchArray | null = null;

  if (language === 'en') {
    if (parts.length >= 3) {
      title = parts[0].trim();
      const datePart = parts[1].trim();
      const timePart = parts[2].trim();
      
      dateMatch = datePart.match(/(\d+)\s+(?:of|\/)\s*(\d+)/i) || 
                  datePart.match(/(\d+)\s+(\d+)/) ||
                  datePart.match(/(\d+)\/(\d+)/);
      
      timeMatch = timePart.match(/(\d{1,2})\s*:\s*(\d{2})/) ||
                  timePart.match(/(\d+)\s+(?:and|:)\s*(\d+)/i) ||
                  timePart.match(/(\d+)\s+(\d+)/);
    } else {
      const datePattern = /(\d{1,2})\s*(?:\/|of)\s*(\d{1,2})/i;
      const dateIndex = normalized.search(datePattern);
      
      if (dateIndex > 0) {
        title = normalized.substring(0, dateIndex).trim();
        
        const datePart = normalized.substring(dateIndex);
        dateMatch = datePart.match(datePattern);
        
        const afterDate = normalized.substring(dateIndex + (dateMatch ? dateMatch[0].length : 0)).trim();
        
        const fourDigitsMatch = afterDate.match(/^(\d{2})(\d{2})/);
        if (fourDigitsMatch) {
          timeMatch = fourDigitsMatch;
        } else {
          timeMatch = afterDate.match(/(\d{1,2})\s*(?:and|:)\s*(\d{2})/i) ||
                      afterDate.match(/(\d{1,2})\s*:\s*(\d{2})/) ||
                      afterDate.match(/(\d{1,2})\s+(\d{2})/);
        }
      } else {
        const allNumbers = normalized.match(/\d+/g);
        if (allNumbers && allNumbers.length >= 4) {
          const numbers = allNumbers.map(n => parseInt(n, 10));
          
          const firstNumIndex = normalized.search(/\d/);
          title = normalized.substring(0, firstNumIndex).trim();
          
          dateMatch = [null, numbers[0].toString(), numbers[1].toString()] as any;
          
          const lastNumStr = numbers[numbers.length - 1].toString();
          if (lastNumStr.length === 4) {
            timeMatch = [null, lastNumStr.substring(0, 2), lastNumStr.substring(2)] as any;
          } else if (numbers.length >= 4) {
            timeMatch = [null, numbers[numbers.length - 2].toString(), numbers[numbers.length - 1].toString()] as any;
          } else if (numbers.length === 3) {
            timeMatch = [null, numbers[1].toString(), numbers[2].toString()] as any;
          }
        }
      }
    }
  } else {
    if (parts.length >= 3) {
      title = parts[0].trim();
      const datePart = parts[1].trim();
      const timePart = parts[2].trim();
      
      dateMatch = datePart.match(/(\d+)\s+(?:do|de|\/)\s*(\d+)/i) || 
                  datePart.match(/(\d+)\s+(\d+)/);
      
      timeMatch = timePart.match(/(\d+)\s+(?:e|:|h)\s*(\d+)/i) ||
                  timePart.match(/(\d{1,2})\s*:\s*(\d{2})/) ||
                  timePart.match(/(\d+)\s+(\d+)/);
    } else {
      const datePattern = /(\d{1,2})\s*(?:\/|do|de)\s*(\d{1,2})/i;
      const dateIndex = normalized.search(datePattern);
      
      if (dateIndex > 0) {
        title = normalized.substring(0, dateIndex).trim();
        
        const datePart = normalized.substring(dateIndex);
        dateMatch = datePart.match(datePattern);
        
        const afterDate = normalized.substring(dateIndex + (dateMatch ? dateMatch[0].length : 0)).trim();
        
        const fourDigitsMatch = afterDate.match(/^(\d{2})(\d{2})/);
        if (fourDigitsMatch) {
          timeMatch = fourDigitsMatch;
        } else {
          timeMatch = afterDate.match(/(\d{1,2})\s+(?:e|h)\s*(\d{2})/i) ||
                      afterDate.match(/(\d{1,2})\s*:\s*(\d{2})/) ||
                      afterDate.match(/(\d{1,2})\s+(\d{2})/);
        }
      } else {
        const allNumbers = normalized.match(/\d+/g);
        if (allNumbers && allNumbers.length >= 4) {
          const numbers = allNumbers.map(n => parseInt(n, 10));
          
          const firstNumIndex = normalized.search(/\d/);
          title = normalized.substring(0, firstNumIndex).trim();
          
          dateMatch = [null, numbers[0].toString(), numbers[1].toString()] as any;
          
          const lastNumStr = numbers[numbers.length - 1].toString();
          if (lastNumStr.length === 4) {
            timeMatch = [null, lastNumStr.substring(0, 2), lastNumStr.substring(2)] as any;
          } else if (numbers.length >= 4) {
            timeMatch = [null, numbers[numbers.length - 2].toString(), numbers[numbers.length - 1].toString()] as any;
          } else if (numbers.length === 3) {
            timeMatch = [null, numbers[1].toString(), numbers[2].toString()] as any;
          }
        }
      }
    }
  }

  if (!dateMatch) {
    return {
      success: false,
      error: language === 'en' 
        ? 'Invalid date format. Use: "day of month" or "day/month". Example: "15 of 12" or "15/12"'
        : 'Formato de data inválido. Use: "dia do mês" ou "dia/mês". Exemplo: "19 do 11" ou "19/12"'
    };
  }

  const day = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);

  if (day < 1 || day > 31) {
    return {
      success: false,
      error: language === 'en'
        ? 'Invalid day. Use a day between 1 and 31.'
        : 'Dia inválido. Use um dia entre 1 e 31.'
    };
  }

  if (month < 1 || month > 12) {
    return {
      success: false,
      error: language === 'en'
        ? 'Invalid month. Use a month between 1 and 12.'
        : 'Mês inválido. Use um mês entre 1 e 12.'
    };
  }

  if (!timeMatch) {
    return {
      success: false,
      error: language === 'en'
        ? 'Invalid time format. Use: "hour and minute" or "hour:minute". Example: "14 and 35" or "14:35"'
        : 'Formato de horário inválido. Use: "hora e minuto" ou "hora:minuto". Exemplo: "14 e 35" ou "14:35"'
    };
  }

  const hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);

  if (!title || title.trim().length === 0) {
    return {
      success: false,
      error: language === 'en'
        ? 'Title not found. Speak the appointment title before the date.'
        : 'Título não encontrado. Fale o título do compromisso antes da data.'
    };
  }

  if (hour < 0 || hour > 23) {
    return {
      success: false,
      error: language === 'en'
        ? 'Invalid hour. Use an hour between 0 and 23.'
        : 'Hora inválida. Use uma hora entre 0 e 23.'
    };
  }

  if (minute < 0 || minute > 59) {
    return {
      success: false,
      error: language === 'en'
        ? 'Invalid minute. Use a minute between 0 and 59.'
        : 'Minuto inválido. Use um minuto entre 0 e 59.'
    };
  }

  return {
    success: true,
    data: {
      title,
      day,
      month,
      hour,
      minute
    }
  };
}

export function convertToAppointmentData(
  parsed: ParsedAppointment,
  currentYear: number = new Date().getFullYear()
): { date: Date; time: string } {
  const date = new Date(currentYear, parsed.month - 1, parsed.day);
  const time = `${parsed.hour.toString().padStart(2, '0')}:${parsed.minute.toString().padStart(2, '0')}`;
  
  return { date, time };
}
