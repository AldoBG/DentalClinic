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
});
