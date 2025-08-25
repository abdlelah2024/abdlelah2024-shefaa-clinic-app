

export type Permission = 
  | 'view_dashboard'
  | 'manage_appointments'
  | 'manage_patients'
  | 'manage_doctors'
  | 'view_queue'
  | 'view_financials'
  | 'manage_settings'
  | 'manage_users'
  | 'view_activity_log';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  age: number;
  gender: 'ذكر' | 'أنثى';
  medicalHistory: MedicalRecord[];
  createdAt: string; // Keep as string for consistency, can be ISO string
}

export interface MedicalRecord {
  date: string;
  doctor: string;
  diagnosis: string;
  notes: string; // This will now hold combined notes, treatment, and follow-up
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  workHours: {
    [day: string]: { start: string; end: string } | null;
  };
  serviceCost: number;
  freeReturnDays: number;
  createdAt: string;
}

export type AppointmentStatus = 'مجدول' | 'في الانتظار' | 'مكتمل' | 'عودة' | 'ملغي';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  reason: string;
  cost?: number;
}

export type UserRole = 'مدير النظام' | 'موظف استقبال' | 'طبيب';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole; // Keeping role for display purposes, but permissions will drive access.
    avatar: string;
    permissions: Permission[];
}

export type ActivityLog = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  timestamp: string;
};
