import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error('No se pudo conectar con el servidor en el puerto 3000.'));
  }

  getPatients(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + '/patients').pipe(catchError(this.handleError));
  }

  createPatient(patient: { name: string; phone: string }): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/patients', patient).pipe(catchError(this.handleError));
  }

  getAppointments(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + '/appointments').pipe(catchError(this.handleError));
  }

  createAppointment(data: { patientId: string; date: string; patientTreatmentId?: string }): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/appointments', data).pipe(catchError(this.handleError));
  }

  updateAppointmentStatus(id: string, status: string): Observable<any> {
    return this.http.patch(this.baseUrl + '/appointments/' + id, { status }).pipe(catchError(this.handleError));
  }

  getTreatments(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + '/treatments').pipe(catchError(this.handleError));
  }

  updateTreatmentProgress(id: string, data: { currentSession: number; status: string }): Observable<any> {
    return this.http.patch(this.baseUrl + '/treatments/' + id, data).pipe(catchError(this.handleError));
  }

  getAttentionItems(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + '/attention').pipe(catchError(this.handleError));
  }
}
