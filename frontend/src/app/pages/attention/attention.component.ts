import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';

interface AttentionItem {
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

export interface MusicalPreset {
  id: 'bossa' | 'jazz' | 'classical';
  label: string;
  bpm: number;
  tempoLabel: string;
  orthoPhaseNote: string;
  barDurations: string[];
}

export interface BracketStep {
  index: number;
  completed: boolean;
  current: boolean;
}

@Component({
  selector: 'app-attention',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attention.component.html',
  styleUrl: './attention.component.css'
})
export class AttentionComponent implements OnInit {
  attentionItems: AttentionItem[] = [];
  filteredItems: AttentionItem[] = [];
  treatments: any[] = [];
  selectedFilter: 'ALL' | 'MISSING_APPOINTMENT' | 'NO_SHOW' | 'NO_RESPONSE' = 'ALL';
  isLoading = true;
  actionFeedback: string | null = null;

  isRhythmPlaying = true;

  musicalPresets: MusicalPreset[] = [
    {
      id: 'bossa',
      label: 'Bossa Clínica',
      bpm: 76,
      tempoLabel: 'Andante Armónico',
      orthoPhaseNote: 'Ideal para ajuste fino de arcos NiTi y control de ligaduras sin estrés.',
      barDurations: ['1.1s', '0.85s', '1.25s', '0.95s', '1.15s', '0.8s', '1.05s', '0.9s']
    },
    {
      id: 'jazz',
      label: 'Acoustic Jazz',
      bpm: 92,
      tempoLabel: 'Moderato Fluido',
      orthoPhaseNote: 'Cadencia ágil para recambio de módulos elásticos y seguimiento de alineadores.',
      barDurations: ['0.75s', '0.6s', '0.9s', '0.65s', '0.8s', '0.58s', '0.72s', '0.68s']
    },
    {
      id: 'classical',
      label: 'Piano Sereno',
      bpm: 64,
      tempoLabel: 'Adagio Preciso',
      orthoPhaseNote: 'Concentración profunda para cementado directo de brackets y detallado oclusal.',
      barDurations: ['1.45s', '1.15s', '1.6s', '1.25s', '1.5s', '1.1s', '1.35s', '1.2s']
    }
  ];

  selectedPreset: MusicalPreset = this.musicalPresets[0];

  archwireNodes = [
    { cx: 28, cy: 48, label: 'Molar 16' },
    { cx: 68, cy: 32, label: 'Premolar 14' },
    { cx: 112, cy: 21, label: 'Canino 13' },
    { cx: 160, cy: 16, label: 'Incisivo Central' },
    { cx: 208, cy: 21, label: 'Canino 23' },
    { cx: 252, cy: 32, label: 'Premolar 24' },
    { cx: 292, cy: 48, label: 'Molar 26' }
  ];

  counts = {
    total: 0,
    missingAppointment: 0,
    noShow: 0,
    noResponse: 0
  };

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  toggleRhythm(): void {
    this.isRhythmPlaying = !this.isRhythmPlaying;
    this.cdr.detectChanges();
  }

  selectPreset(presetId: 'bossa' | 'jazz' | 'classical'): void {
    const found = this.musicalPresets.find(p => p.id === presetId);
    if (found) {
      this.selectedPreset = found;
      this.cdr.detectChanges();
    }
  }

  isOrthodonticTreatment(name?: string): boolean {
    if (!name) return false;
    const normalized = name.toLowerCase();
    return normalized.includes('ortodoncia') || normalized.includes('bracket') || normalized.includes('alineador') || normalized.includes('arco');
  }

  getBracketSteps(t: any): BracketStep[] {
    const total = Math.min(Math.max(t?.treatmentType?.totalSessions || 6, 1), 12);
    const current = t?.currentSession || 0;
    return Array.from({ length: total }, (_, idx) => {
      const stepNumber = idx + 1;
      return {
        index: stepNumber,
        completed: stepNumber <= current,
        current: stepNumber === current + 1
      };
    });
  }

  getOrthodonticHarmonicSummary(): { activeOrthoCount: number; onBeatPercent: number } {
    const orthoTreatments = this.treatments.filter(t => this.isOrthodonticTreatment(t?.treatmentType?.name));
    if (orthoTreatments.length === 0) {
      return { activeOrthoCount: 1, onBeatPercent: 100 };
    }
    const scheduledCount = orthoTreatments.filter(t => t.appointments && t.appointments.length > 0).length;
    return {
      activeOrthoCount: orthoTreatments.length,
      onBeatPercent: Math.round((scheduledCount / orthoTreatments.length) * 100)
    };
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    forkJoin({
      attention: this.apiService.getAttentionItems(),
      treatments: this.apiService.getTreatments()
    }).subscribe({
      next: ({ attention, treatments }) => {
        this.attentionItems = attention || [];
        this.treatments = treatments || [];
        this.updateCounts();
        this.applyFilter(this.selectedFilter);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateCounts(): void {
    this.counts.total = this.attentionItems.length;
    this.counts.missingAppointment = this.attentionItems.filter(i => i.reason === 'MISSING_APPOINTMENT').length;
    this.counts.noShow = this.attentionItems.filter(i => i.reason === 'NO_SHOW').length;
    this.counts.noResponse = this.attentionItems.filter(i => i.reason === 'NO_RESPONSE').length;
  }

  applyFilter(filter: 'ALL' | 'MISSING_APPOINTMENT' | 'NO_SHOW' | 'NO_RESPONSE'): void {
    this.selectedFilter = filter;
    if (filter === 'ALL') {
      this.filteredItems = [...this.attentionItems];
    } else {
      this.filteredItems = this.attentionItems.filter(item => item.reason === filter);
    }
    this.cdr.detectChanges();
  }

  getWhatsAppUrl(item: AttentionItem): string {
    const encoded = encodeURIComponent(item.whatsappMessage);
    return `https://wa.me/${item.phone}?text=${encoded}`;
  }

  resolveItem(item: AttentionItem): void {
    if (item.reason === 'NO_RESPONSE' && item.appointmentId) {
      this.apiService.updateAppointmentStatus(item.appointmentId, 'CONFIRMED').subscribe({
        next: () => {
          this.showFeedback(`Cita de ${item.patientName} marcada como confirmada en compás clínico.`);
          this.loadDashboardData();
        }
      });
    } else if (item.reason === 'MISSING_APPOINTMENT') {
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
      this.apiService.createAppointment({
        patientId: item.patientId,
        date: nextWeek,
        patientTreatmentId: item.treatmentId
      }).subscribe({
        next: () => {
          this.showFeedback(`Próxima sesión agendada para ${item.patientName} en Google Calendar.`);
          this.loadDashboardData();
        }
      });
    } else if (item.reason === 'NO_SHOW' && item.appointmentId) {
      this.apiService.updateAppointmentStatus(item.appointmentId, 'RESCHEDULED').subscribe({
        next: () => {
          this.showFeedback(`Inasistencia de ${item.patientName} marcada como reprogramada.`);
          this.loadDashboardData();
        }
      });
    }
  }

  showFeedback(msg: string): void {
    this.actionFeedback = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.actionFeedback = null;
      this.cdr.detectChanges();
    }, 4000);
  }

  getReasonBadgeClass(reason: string): string {
    switch(reason) {
      case 'MISSING_APPOINTMENT': return 'bg-amber-50 text-amber-800 border border-amber-300';
      case 'NO_SHOW': return 'bg-red-50 text-red-800 border border-red-300';
      case 'NO_RESPONSE': return 'bg-cyan-50 text-cyan-800 border border-cyan-300';
      default: return 'bg-slate-100 text-slate-700 border border-slate-300';
    }
  }

  getReasonLabel(reason: string): string {
    switch(reason) {
      case 'MISSING_APPOINTMENT': return 'Riesgo de Abandono — Sin Próxima Cita';
      case 'NO_SHOW': return 'Inasistencia Reciente (No-Show)';
      case 'NO_RESPONSE': return 'Sin Respuesta de Confirmación';
      default: return 'Requiere Seguimiento';
    }
  }

  getResolveButtonLabel(reason: string): string {
    switch(reason) {
      case 'MISSING_APPOINTMENT': return 'Agendar Próxima Sesión';
      case 'NO_SHOW': return 'Marcar Reprogramado';
      case 'NO_RESPONSE': return 'Confirmar Asistencia';
      default: return 'Marcar Gestionado';
    }
  }

  getProgressPercent(t: any): number {
    if (!t.treatmentType?.totalSessions) return 0;
    return Math.round((t.currentSession / t.treatmentType.totalSessions) * 100);
  }
}
