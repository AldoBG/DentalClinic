
export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface INotificationService {
  sendReminder(phone: string, message: string): Promise<NotificationResult>;
  sendFollowUp(phone: string, message: string): Promise<NotificationResult>;
  sendConfirmationRequest(phone: string, appointmentDate: Date): Promise<NotificationResult>;
}

export class MockWhatsAppService implements INotificationService {
  async sendReminder(phone: string, message: string): Promise<NotificationResult> {
    console.log(`[MockWhatsAppService] 📱 SENDING REMINDER to ${phone}: "${message}"`);
    return { 
      success: true, 
      messageId: 'msg_' + Math.random().toString(36).substr(2, 9) 
    };
  }

  async sendFollowUp(phone: string, message: string): Promise<NotificationResult> {
    console.log(`[MockWhatsAppService] ⚠️ SENDING FOLLOW-UP to ${phone}: "${message}"`);
    return { 
      success: true, 
      messageId: 'msg_' + Math.random().toString(36).substr(2, 9) 
    };
  }

  async sendConfirmationRequest(phone: string, appointmentDate: Date): Promise<NotificationResult> {
    const dateStr = appointmentDate.toLocaleString('es-AR');
    const message = `Hola! Te recordamos tu cita el ${dateStr}. ¿Confirmás tu asistencia?`;
    console.log(`[MockWhatsAppService] ❓ SENDING CONFIRMATION REQUEST to ${phone}: "${message}"`);
    return { 
      success: true, 
      messageId: 'msg_' + Math.random().toString(36).substr(2, 9) 
    };
  }
}
