import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with realistic dental clinic scenarios...');

  await prisma.appointment.deleteMany();
  await prisma.patientTreatment.deleteMany();
  await prisma.treatmentType.deleteMany();
  await prisma.patient.deleteMany();

  // Treatment Types
  const endodoncia = await prisma.treatmentType.create({
    data: { name: 'Endodoncia Molar', totalSessions: 3 }
  });
  const ortodoncia = await prisma.treatmentType.create({
    data: { name: 'Ortodoncia Correctiva', totalSessions: 12 }
  });
  const rehabilitacion = await prisma.treatmentType.create({
    data: { name: 'Rehabilitación Corona', totalSessions: 2 }
  });

  // Patients
  const juan = await prisma.patient.create({
    data: { name: 'Juan Pérez', phone: '5491145678901' }
  });
  const maria = await prisma.patient.create({
    data: { name: 'María García', phone: '5491123456789' }
  });
  const carlos = await prisma.patient.create({
    data: { name: 'Carlos Ruiz', phone: '5491134567890' }
  });
  const ana = await prisma.patient.create({
    data: { name: 'Ana Martínez', phone: '5491156789012' }
  });
  const lucia = await prisma.patient.create({
    data: { name: 'Lucía Fernández', phone: '5491167890123' }
  });
  const roberto = await prisma.patient.create({
    data: { name: 'Roberto Gómez', phone: '5491178901234' }
  });

  // Active Treatments
  // 1. Juan: Endodoncia 1/3, completed session yesterday, NO future appointment -> MISSING_APPOINTMENT
  const tJuan = await prisma.patientTreatment.create({
    data: {
      patientId: juan.id,
      treatmentTypeId: endodoncia.id,
      currentSession: 1,
      status: 'ACTIVE'
    }
  });

  // 2. Ana: Rehabilitación Corona 1/2, NO future appointment -> MISSING_APPOINTMENT
  const tAna = await prisma.patientTreatment.create({
    data: {
      patientId: ana.id,
      treatmentTypeId: rehabilitacion.id,
      currentSession: 1,
      status: 'ACTIVE'
    }
  });

  // 3. Carlos: Ortodoncia 4/12, has future appointment tomorrow (NO_RESPONSE / PENDING)
  const tCarlos = await prisma.patientTreatment.create({
    data: {
      patientId: carlos.id,
      treatmentTypeId: ortodoncia.id,
      currentSession: 4,
      status: 'ACTIVE'
    }
  });

  // 4. Lucía: Endodoncia 2/3, has future appointment confirmed
  const tLucia = await prisma.patientTreatment.create({
    data: {
      patientId: lucia.id,
      treatmentTypeId: endodoncia.id,
      currentSession: 2,
      status: 'ACTIVE'
    }
  });

  const now = Date.now();
  const hour = 3600000;
  const day = 86400000;

  // Past / Today / Future Appointments
  await prisma.appointment.createMany({
    data: [
      {
        patientId: juan.id,
        date: new Date(now - day),
        status: 'COMPLETED',
        patientTreatmentId: tJuan.id
      },
      {
        patientId: maria.id,
        date: new Date(now - 6 * hour),
        status: 'NO_SHOW'
      },
      {
        patientId: roberto.id,
        date: new Date(now - 20 * hour),
        status: 'NO_SHOW'
      },
      {
        patientId: carlos.id,
        date: new Date(now + 18 * hour),
        status: 'PENDING',
        patientTreatmentId: tCarlos.id
      },
      {
        patientId: ana.id,
        date: new Date(now - 3 * day),
        status: 'COMPLETED',
        patientTreatmentId: tAna.id
      },
      {
        patientId: lucia.id,
        date: new Date(now + 2 * day),
        status: 'CONFIRMED',
        patientTreatmentId: tLucia.id
      }
    ]
  });

  console.log('Seed completed successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
