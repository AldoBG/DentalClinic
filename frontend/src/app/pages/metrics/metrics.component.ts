import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.css'
})
export class MetricsComponent implements OnInit {
  isLoading = true;
  stats = {
    noShowRate: '0.0',
    confirmationRate: '0.0',
    activeTreatmentsCount: 0,
    atRiskTreatmentsCount: 0,
    totalAppointments: 0,
    noShowsCount: 0,
    confirmedCount: 0
  };

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.calculateMetrics();
  }

  calculateMetrics(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    forkJoin({
      appts: this.apiService.getAppointments(),
      treatments: this.apiService.getTreatments(),
      attention: this.apiService.getAttentionItems()
    }).subscribe({
      next: ({ appts, treatments, attention }) => {
        const total = appts.length;
        const noShows = appts.filter((a: any) => a.status === 'NO_SHOW').length;
        const confirmedOrCompleted = appts.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
        const activeTr = treatments.filter((t: any) => t.status === 'ACTIVE').length;
        const missingAppt = attention.filter((i: any) => i.reason === 'MISSING_APPOINTMENT').length;

        this.stats = {
          noShowRate: total > 0 ? ((noShows / total) * 100).toFixed(1) : '0.0',
          confirmationRate: total > 0 ? ((confirmedOrCompleted / total) * 100).toFixed(1) : '0.0',
          activeTreatmentsCount: activeTr,
          atRiskTreatmentsCount: missingAppt,
          totalAppointments: total,
          noShowsCount: noShows,
          confirmedCount: confirmedOrCompleted
        };

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error calculating metrics', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
