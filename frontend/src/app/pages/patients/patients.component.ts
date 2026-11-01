import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];
  newPatient = { name: '', phone: '' };
  isLoading = true;
  feedbackMsg: string | null = null;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.apiService.getPatients().subscribe({
      next: (data) => {
        this.patients = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading patients', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createPatient(): void {
    if (!this.newPatient.name.trim() || !this.newPatient.phone.trim()) return;

    this.apiService.createPatient(this.newPatient).subscribe({
      next: () => {
        this.feedbackMsg = `Paciente "${this.newPatient.name}" registrado correctamente.`;
        this.newPatient = { name: '', phone: '' };
        this.loadPatients();
        setTimeout(() => {
          this.feedbackMsg = null;
          this.cdr.detectChanges();
        }, 3500);
      },
      error: (err) => console.error('Error creating patient', err)
    });
  }

  getActiveTreatment(p: any): any {
    return p.patientTreatments?.find((t: any) => t.status === 'ACTIVE');
  }

  hasFutureAppointment(p: any): boolean {
    const now = new Date();
    return (p.appointments || []).some((a: any) => new Date(a.date) > now && a.status !== 'CANCELED' && a.status !== 'NO_SHOW');
  }
}
