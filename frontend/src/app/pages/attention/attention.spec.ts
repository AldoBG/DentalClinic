import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AttentionComponent } from './attention.component';
import { ApiService } from '../../services/api.service';

describe('AttentionComponent (Orthodontics & Musical UX)', () => {
  let component: AttentionComponent;
  let fixture: ComponentFixture<AttentionComponent>;

  const mockAttentionItems = [
    {
      id: 'att_1',
      patientId: 'p1',
      patientName: 'Carlos Ruiz',
      phone: '5491134567890',
      reason: 'NO_RESPONSE' as const,
      priority: 'MEDIUM' as const,
      details: 'Control de Arco de Ortodoncia pendiente de confirmar.',
      treatmentName: 'Ortodoncia Correctiva',
      sessionProgress: '4/12 sesiones',
      whatsappMessage: 'Hola Carlos',
      appointmentId: 'app_1'
    }
  ];

  const mockTreatments = [
    {
      id: 't1',
      currentSession: 4,
      patient: { name: 'Carlos Ruiz' },
      treatmentType: { name: 'Ortodoncia Correctiva', totalSessions: 12 },
      appointments: [{ id: 'app_1' }]
    },
    {
      id: 't2',
      currentSession: 1,
      patient: { name: 'Juan Pérez' },
      treatmentType: { name: 'Endodoncia Molar', totalSessions: 3 },
      appointments: []
    }
  ];

  const apiServiceMock = {
    getAttentionItems: () => of(mockAttentionItems),
    getTreatments: () => of(mockTreatments),
    updateAppointmentStatus: () => of({}),
    createAppointment: () => of({})
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttentionComponent],
      providers: [{ provide: ApiService, useValue: apiServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(AttentionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should detect orthodontic treatments and generate bracket nodes for multi-session progress', () => {
    expect(component.isOrthodonticTreatment('Ortodoncia Correctiva')).toBe(true);
    expect(component.isOrthodonticTreatment('Endodoncia Molar')).toBe(false);
    const steps = component.getBracketSteps(mockTreatments[0]);
    expect(steps.length).toBe(12);
    expect(steps.filter(s => s.completed).length).toBe(4);
    expect(steps.find(s => s.current)?.index).toBe(5);
  });

  it('should preserve existing filter behavior for exception items', () => {
    expect(component.counts.total).toBe(1);
    expect(component.counts.noResponse).toBe(1);
    component.applyFilter('MISSING_APPOINTMENT');
    expect(component.filteredItems.length).toBe(0);
    component.applyFilter('NO_RESPONSE');
    expect(component.filteredItems.length).toBe(1);
  });
});
