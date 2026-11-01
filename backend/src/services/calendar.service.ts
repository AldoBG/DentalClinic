
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string };
  end: { dateTime: string };
  attendeeEmail?: string;
}

export interface ICalendarService {
  getUpcomingAppointments(patientId?: string): Promise<CalendarEvent[]>;
  createAppointment(data: { summary: string; start: Date; end: Date; email: string }): Promise<CalendarEvent>;
  updateAppointmentStatus(eventId: string, status: string): Promise<boolean>;
}

export class MockCalendarService implements ICalendarService {
  private mockEvents: CalendarEvent[] = [
    {
      id: 'evt_1',
      summary: 'Cita: Juan Perez - Endodoncia S1',
      start: { dateTime: new Date(Date.now() + 86400000).toISOString() }, // Tomorrow
      end: { dateTime: new Date(Date.now() + 86400000 + 3600000).toISOString() },
      attendeeEmail: 'juan@example.com'
    },
    {
      id: 'evt_2',
      summary: 'Cita: Maria Garcia - Limpieza',
      start: { dateTime: new Date(Date.now() + 172800000).toISOString() }, // In 2 days
      end: { dateTime: new Date(Date.now() + 172800000 + 3600000).toISOString() },
      attendeeEmail: 'maria@example.com'
    },
    {
      id: 'evt_3',
      summary: 'Cita: Carlos Ruiz - Ortodoncia S2',
      start: { dateTime: new Date(Date.now() + 259200000).toISOString() }, // In 3 days
      end: { dateTime: new Date(Date.now() + 259200000 + 3600000).toISOString() },
      attendeeEmail: 'carlos@example.com'
    }
  ];

  async getUpcomingAppointments(patientId?: string): Promise<CalendarEvent[]> {
    console.log(`[MockCalendarService] Fetching upcoming appointments${patientId ? ' for patient ' + patientId : ''}`);
    // In a real scenario, we would filter by patient email/id
    return this.mockEvents;
  }

  async createAppointment(data: { summary: string; start: Date; end: Date; email: string }): Promise<CalendarEvent> {
    const newEvent: CalendarEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      summary: data.summary,
      start: { dateTime: data.start.toISOString() },
      end: { dateTime: data.end.toISOString() },
      attendeeEmail: data.email
    };
    this.mockEvents.push(newEvent);
    console.log(`[MockCalendarService] Created appointment: ${newEvent.id}`);
    return newEvent;
  }

  async updateAppointmentStatus(eventId: string, status: string): Promise<boolean> {
    console.log(`[MockCalendarService] Updating appointment ${eventId} to status ${status}`);
    return true; // Always succeed in mock
  }
}
