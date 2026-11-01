import { prisma } from '../lib/prisma';

export interface AttentionItem {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  reason: 'MISSING_APPOINTMENT' | 'NO_SHOW' | 'NO_RESPONSE';
  priority: 'HIGH' | 'MEDIUM';
  details: string;
  treatmentName?: string;
  sessionProgress?: string;
  whatsappMessage: string;
  appointmentId?: string;
  treatmentId?: string;
}

export class AttentionService {
  async getPatientsRequiringAttention(): Promise<AttentionItem[]> {
    const attentionItems: AttentionItem[] = [];

    // 1. Active treatment without future appointment
    const activeTreatments = await prisma.patientTreatment.findMany({
      where: { status: 'ACTIVE' },
      include: {
        patient: true,
        treatmentType: true,
        appointments: {
          where: {
            date: { gt: new Date() },
            status: { notIn: ['CANCELED', 'NO_SHOW'] }
          }
        }
      }
    });

    for (const treatment of activeTreatments) {
      if (treatment.appointments.length === 0 && treatment.currentSession < treatment.treatmentType.totalSessions) {
        const nextSession = treatment.currentSession + 1;
        const total = treatment.treatmentType.totalSessions;
        attentionItems.push({
          id: 'att_tr_' + treatment.id,
          patientId: treatment.patientId,
          patientName: treatment.patient.name,
          phone: treatment.patient.phone,
          reason: 'MISSING_APPOINTMENT',
          priority: 'HIGH',
          details: `Completada sesión ${treatment.currentSession} de ${total}. Sin próxima cita agendada para continuar el tratamiento.`,
          treatmentName: treatment.treatmentType.name,
          sessionProgress: `${treatment.currentSession}/${total} sesiones`,
          whatsappMessage: `Hola ${treatment.patient.name}, te escribimos del consultorio de la Dra. Laura para coordinar tu sesión ${nextSession} de ${total} de ${treatment.treatmentType.name}. ¿Qué día te queda cómodo?`,
          treatmentId: treatment.id
        });
      }
    }

    // 2. Recent No-shows (last 48h)
    const recentNoShows = await prisma.appointment.findMany({
      where: {
        status: 'NO_SHOW',
        date: { gt: new Date(Date.now() - 172800000) }
      },
      include: { patient: true, patientTreatment: { include: { treatmentType: true } } }
    });

    for (const appt of recentNoShows) {
      const dateStr = appt.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      attentionItems.push({
        id: 'att_ns_' + appt.id,
        patientId: appt.patientId,
        patientName: appt.patient.name,
        phone: appt.patient.phone,
        reason: 'NO_SHOW',
        priority: 'HIGH',
        details: `No asistió a su cita programada (${dateStr}). Espacio perdido en agenda.`,
        treatmentName: appt.patientTreatment?.treatmentType.name || 'Consulta General',
        whatsappMessage: `Hola ${appt.patient.name}, notamos que no pudiste asistir a tu cita hoy con la Dra. Laura. ¿Te gustaría reprogramarla para esta semana?`,
        appointmentId: appt.id
      });
    }

    // 3. Pending confirmation for upcoming 48h
    const next48h = new Date(Date.now() + 172800000);
    const pendingUpcoming = await prisma.appointment.findMany({
      where: {
        status: { in: ['PENDING', 'NO_RESPONSE'] },
        date: {
          gt: new Date(),
          lt: next48h
        }
      },
      include: { patient: true, patientTreatment: { include: { treatmentType: true } } }
    });

    for (const appt of pendingUpcoming) {
      const dateStr = appt.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      attentionItems.push({
        id: 'att_nr_' + appt.id,
        patientId: appt.patientId,
        patientName: appt.patient.name,
        phone: appt.patient.phone,
        reason: 'NO_RESPONSE',
        priority: 'MEDIUM',
        details: `Cita próxima (${dateStr}) aún sin confirmación de asistencia.`,
        treatmentName: appt.patientTreatment?.treatmentType.name || 'Consulta General',
        sessionProgress: appt.patientTreatment
          ? `${appt.patientTreatment.currentSession}/${appt.patientTreatment.treatmentType.totalSessions} sesiones`
          : undefined,
        whatsappMessage: `Hola ${appt.patient.name}, te recordamos tu cita con la Dra. Laura el ${dateStr}. Por favor confírmanos tu asistencia respondiendo este mensaje.`,
        appointmentId: appt.id
      });
    }

    return attentionItems;
  }
}
