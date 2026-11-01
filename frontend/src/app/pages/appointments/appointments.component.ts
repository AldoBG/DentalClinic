import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit {
  appointments: any[] = [];
  isLoading = true;
  statusMessage: string | null = null;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
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
      case 'PENDING': return 'Sin Respuesta';
      case 'NO_RESPONSE': return 'Sin Respuesta';
      case 'RESCHEDULED': return 'Reprogramar';
      case 'CANCELED': return 'Cancelado';
      default: return status;
    }
  }
}
