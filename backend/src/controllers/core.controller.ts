import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { MockWhatsAppService } from '../services/whatsapp.service';
import { AttentionService } from '../services/attention.service';

const whatsappService = new MockWhatsAppService();
const attentionService = new AttentionService();

export const PatientController = {
  async getAll(req: Request, res: Response) {
    const patients = await prisma.patient.findMany({
      include: {
        appointments: { orderBy: { date: 'desc' } },
        patientTreatments: { include: { treatmentType: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(patients);
  },
  async create(req: Request, res: Response) {
    const { name, phone } = req.body;
    const patient = await prisma.patient.create({ data: { name, phone } });
    res.status(201).json(patient);
  }
};

export const AppointmentController = {
  async getAll(req: Request, res: Response) {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        patientTreatment: { include: { treatmentType: true } }
      },
      orderBy: { date: 'asc' }
    });
    res.json(appointments);
  },
  async create(req: Request, res: Response) {
    const { patientId, date, treatmentTypeId, patientTreatmentId } = req.body;
    const missing = [
      !patientId && 'paciente',
      !date && 'fecha/hora',
      !treatmentTypeId && !patientTreatmentId && 'tratamiento'
    ].filter(Boolean);
    if (missing.length > 0) {
      return res.status(400).json({ error: `Faltan datos requeridos para agendar: ${missing.join(', ')}` });
    }
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      return res.status(400).json({ error: 'Paciente no encontrado' });
    }
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ error: 'Fecha/hora inválida' });
    }
    // The appointment cannot be scheduled before the day the patient was registered.
    const registeredDayStart = new Date(
      patient.createdAt.getFullYear(),
      patient.createdAt.getMonth(),
      patient.createdAt.getDate()
    );
    if (appointmentDate < registeredDayStart) {
      return res.status(400).json({
        error: `No se puede agendar con fecha anterior al día de alta del paciente (${patient.createdAt.toISOString().slice(0, 10)})`
      });
    }
    let linkedTreatmentId = patientTreatmentId || null;
    if (!linkedTreatmentId) {
      const activeTreatment = await prisma.patientTreatment.findFirst({
        where: { patientId, treatmentTypeId, status: 'ACTIVE' }
      });
      linkedTreatmentId = activeTreatment
        ? activeTreatment.id
        : (await prisma.patientTreatment.create({
            data: { patientId, treatmentTypeId, status: 'ACTIVE' }
          })).id;
    }
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        date: appointmentDate,
        status: 'PENDING',
        patientTreatmentId: linkedTreatmentId
      },
      include: {
        patient: true,
        patientTreatment: { include: { treatmentType: true } }
      }
    });
    res.status(201).json(appointment);
  },
  async updateStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const { status } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    if (status === 'CONFIRMED') {
      const patient = await prisma.patient.findUnique({ where: { id: appointment.patientId } });
      if (patient) {
        await whatsappService.sendReminder(patient.phone, 'Tu cita ha sido confirmada.');
      }
    }

    res.json(appointment);
  }
};

export const TreatmentController = {
  async getAll(req: Request, res: Response) {
    const treatments = await prisma.patientTreatment.findMany({
      include: {
        patient: true,
        treatmentType: true,
        appointments: {
          where: { date: { gt: new Date() }, status: { notIn: ['CANCELED', 'NO_SHOW'] } },
          orderBy: { date: 'asc' }
        }
      }
    });
    res.json(treatments);
  },
  async updateProgress(req: Request, res: Response) {
    const id = req.params.id as string;
    const { currentSession, status } = req.body;
    const treatment = await prisma.patientTreatment.update({
      where: { id },
      data: { currentSession, status }
    });
    res.json(treatment);
  }
};

export const TreatmentCatalogController = {
  async getAll(req: Request, res: Response) {
    const treatmentTypes = await prisma.treatmentType.findMany();
    res.json(treatmentTypes);
  }
};

export const AttentionController = {
  async getRequiredAttention(req: Request, res: Response) {
    const items = await attentionService.getPatientsRequiringAttention();
    res.json(items);
  }
};
