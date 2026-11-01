
import { Routes } from '@angular/router';
import { AttentionComponent } from './pages/attention/attention.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { MetricsComponent } from './pages/metrics/metrics.component';

export const routes: Routes = [
  { path: 'attention', component: AttentionComponent },
  { path: 'patients', component: PatientsComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'metrics', component: MetricsComponent },
  { path: '', redirectTo: '/attention', pathMatch: 'full' },
];
