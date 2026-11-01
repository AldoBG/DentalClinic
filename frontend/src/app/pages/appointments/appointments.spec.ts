import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsComponent } from './appointments.component';

describe('Appointments', () => {
  let component: AppointmentsComponent;
  let fixture: ComponentFixture<AppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('newly registered appointments display as "Pendiente" (born PENDING)', () => {
    expect(component.getStatusLabel('PENDING')).toBe('Pendiente');
  });

  it('attendance metric only counts final statuses (COMPLETED vs NO_SHOW)', () => {
    component.appointments = [
      { status: 'COMPLETED' },
      { status: 'COMPLETED' },
      { status: 'NO_SHOW' },
      { status: 'PENDING' },
      { status: 'CONFIRMED' }
    ];
    expect(component.attendanceCompleted).toBe(2);
    expect(component.attendanceNoShow).toBe(1);
    expect(component.attendanceRate).toBe('66.7%');
  });

  it('attendance rate is "—" when no appointment reached a final status', () => {
    component.appointments = [
      { status: 'PENDING' },
      { status: 'CONFIRMED' }
    ];
    expect(component.attendanceRate).toBe('—');
  });

  it('treatment select is preloaded with at least 3 options before choosing a patient (S6)', () => {
    component.patients = [{ id: 'p1', name: 'Laura', createdAt: '2026-11-01T00:00:00Z' }];
    component.treatmentTypes = [
      { id: 't1', name: 'Endodoncia Molar' },
      { id: 't2', name: 'Ortodoncia Correctiva' },
      { id: 't3', name: 'Rehabilitación Corona' }
    ];
    component.patientTreatments = [];
    component.form = { patientId: '', date: '', treatment: '' };
    expect(component.treatmentOptions.length).toBeGreaterThanOrEqual(3);
  });

  it('a patient with an active treatment still sees at least 3 options: own + catalog supplement (S6)', () => {
    component.patients = [{ id: 'p1', name: 'Laura', createdAt: '2026-11-01T00:00:00Z' }];
    component.treatmentTypes = [
      { id: 't1', name: 'Endodoncia Molar' },
      { id: 't2', name: 'Ortodoncia Correctiva' },
      { id: 't3', name: 'Rehabilitación Corona' }
    ];
    component.patientTreatments = [
      { id: 'pt1', patientId: 'p1', status: 'ACTIVE', currentSession: 2, treatmentType: { id: 't1', name: 'Endodoncia Molar', totalSessions: 5 } }
    ];
    component.form = { patientId: 'p1', date: '', treatment: '' };
    const options = component.treatmentOptions;
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(options.some((o) => o.kind === 'patientTreatment')).toBe(true);
    expect(options.filter((o) => o.kind === 'treatmentType')).toHaveLength(2);
  });
});
