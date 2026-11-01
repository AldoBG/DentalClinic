import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface TreatmentOption {
  kind: 'patientTreatment' | 'treatmentType';
  patientTreatmentId?: string;
  treatmentTypeId?: string;
  label: string;
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit {
  appointments: any[] = [];
  patients: any[] = [];
  treatmentTypes: any[] = [];
  patientTreatments: any[] = [];
  isLoading = true;
  statusMessage: string | null = null;
  formError: string | null = null;

  form = {
    patientId: '',
    date: '',
    treatment: ''
  };

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadPatients();
    this.loadTreatments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.apiService.getAppointments().subscribe({
      next: (data) => {
        this.appointments = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading appointments', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPatients(): void {
    this.apiService.getPatients().subscribe({
      next: (data) => {
        this.patients = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading patients', err)
    });
  }

  loadTreatments(): void {
    this.apiService.getTreatmentTypes().subscribe({
      next: (data) => {
        this.treatmentTypes = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading treatment types', err)
    });
    this.apiService.getTreatments().subscribe({
      next: (data) => {
        this.patientTreatments = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading treatments', err)
    });
  }

  // Options for the treatment selector: the patient's own active treatments first,
  // then the full catalog as "start new treatment" options when nothing exists.
  get treatmentOptions(): TreatmentOption[] {
    const options: TreatmentOption[] = [];
    const selectedPatient = this.patients.find((p) => p.id === this.form.patientId);

    if (selectedPatient) {
      const own = this.patientTreatments.filter(
        (pt) => pt.patientId === selectedPatient.id && pt.status === 'ACTIVE'
      );
      for (const pt of own) {
        options.push({
          kind: 'patientTreatment',
          patientTreatmentId: pt.id,
          label: `${pt.treatmentType?.name} — sesión ${pt.currentSession} de ${pt.treatmentType?.totalSessions}`
        });
      }
      if (own.length === 0) {
        for (const type of this.treatmentTypes) {
          options.push({
            kind: 'treatmentType',
            treatmentTypeId: type.id,
            label: `Nuevo tratamiento: ${type.name}`
          });
        }
      }
    }
    return options;
  }

  // Attendance metric: appointments that reached a final state
  // (COMPLETED = attended/completed vs NO_SHOW = did not attend).
  get attendanceCompleted(): number {
    return this.appointments.filter((a) => a.status === 'COMPLETED').length;
  }

  get attendanceNoShow(): number {
    return this.appointments.filter((a) => a.status === 'NO_SHOW').length;
  }

  get attendanceRate(): string {
    const rate = this.apiService.getAttendanceMetric({
      completed: this.attendanceCompleted,
      noShow: this.attendanceNoShow
    });
    return rate === null ? '—' : `${rate}%`;
  }

  // The appointment date cannot be before the day the patient was registered.
  private registrationDayStart(patientId: string): Date | null {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient?.createdAt) {
      return null;
    }
    const created = new Date(patient.createdAt);
    return new Date(created.getFullYear(), created.getMonth(), created.getDate());
  }

  submitRegistration(): void {
    this.formError = null;
    const { patientId, date, treatment } = this.form;
    const missing = [
      !patientId && 'paciente',
      !date && 'fecha/hora',
      !treatment && 'tratamiento'
    ].filter(Boolean);
    if (missing.length > 0) {
      this.formError = `Faltan datos requeridos: ${missing.join(', ')}`;
      this.cdr.detectChanges();
      return;
    }

    const appointmentDate = new Date(date);
    const dayStart = this.registrationDayStart(patientId);
    if (!dayStart || isNaN(appointmentDate.getTime())) {
      this.formError = 'Datos inválidos: revisá paciente y fecha/hora.';
      this.cdr.detectChanges();
      return;
    }
    if (appointmentDate < dayStart) {
      this.formError = 'No se puede agendar con fecha anterior al día de alta del paciente.';
      this.cdr.detectChanges();
      return;
    }

    const option = this.treatmentOptions.find(
      (o) => treatment === (o.kind === 'patientTreatment'
        ? o.patientTreatmentId
        : o.treatmentTypeId)
    );
    if (!option) {
      this.formError = 'Tratamiento inválido: volvé a seleccionar.';
      this.cdr.detectChanges();
      return;
    }

    const payload = option.kind === 'patientTreatment'
      ? { patientId, date, patientTreatmentId: option.patientTreatmentId }
      : { patientId, date, treatmentTypeId: option.treatmentTypeId };

    this.apiService.createAppointment(payload).subscribe({
      next: () => {
        const patient = this.patients.find((p) => p.id === patientId);
        this.form = { patientId: '', date: '', treatment: '' };
        this.showFeedback(
          `Cita agendada para ${patient?.name}. Nace con estatus Pendiente.`
        );
        this.loadAppointments();
      },
      error: (err) => {
        this.formError = err?.error?.error || 'No se pudo agendar la cita.';
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(id: string, status: string, patientName: string): void {
    this.apiService.updateAppointmentStatus(id, status).subscribe({
      next: () => {
        this.statusMessage = `Estado de cita de ${patientName} actualizado a ${this.getStatusLabel(status)}.`;
        this.loadAppointments();
        setTimeout(() => {
          this.statusMessage = null;
          this.cdr.detectChanges();
        }, 3500);
      },
      error: (err) => console.error('Error updating status', err)
    });
  }

  showFeedback(msg: string): void {
    this.statusMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.statusMessage = null;
      this.cdr.detectChanges();
    }, 3500);
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-800 border border-emerald-300';
      case 'COMPLETED': return 'bg-cyan-50 text-cyan-900 border border-cyan-300';
      case 'NO_SHOW': return 'bg-red-50 text-red-800 border border-red-300';
      case 'PENDING':
      case 'NO_RESPONSE': return 'bg-amber-50 text-amber-800 border border-amber-300';
      case 'RESCHEDULED': return 'bg-blue-50 text-blue-800 border border-blue-300';
      case 'CANCELED': return 'bg-slate-100 text-slate-700 border border-slate-300';
      default: return 'bg-slate-100 text-slate-700 border border-slate-300';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'CONFIRMED': return 'Confirmado';
      case 'COMPLETED': return 'Completado';
      case 'NO_SHOW': return 'No Asistió';
      case 'PENDING': return 'Pendiente';
      case 'NO_RESPONSE': return 'Sin Respuesta';
      case 'RESCHEDULED': return 'Reprogramar';
      case 'CANCELED': return 'Cancelado';
      default: return status;
    }
  }
}
