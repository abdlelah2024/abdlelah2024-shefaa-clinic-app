
import type { Patient, Doctor, Appointment, User, Permission, ActivityLog } from './types';

export const allPermissions: { id: Permission, label: string }[] = [
    { id: 'view_dashboard', label: 'عرض اللوحة الرئيسية' },
    { id: 'manage_appointments', label: 'إدارة المواعيد' },
    { id: 'manage_patients', label: 'إدارة المرضى' },
    { id: 'manage_doctors', label: 'إدارة الأطباء' },
    { id: 'view_queue', label: 'عرض قائمة الانتظار' },
    { id: 'view_financials', label: 'عرض التقارير المالية' },
    { id: 'manage_settings', label: 'إدارة الإعدادات العامة' },
    { id: 'manage_users', label: 'إدارة المستخدمين والصلاحيات' },
    { id: 'view_activity_log', label: 'عرض سجل النشاط' },
];

export const permissionsByRole: Record<User['role'], Permission[]> = {
    'مدير النظام': [
        'view_dashboard',
        'manage_appointments',
        'manage_patients',
        'manage_doctors',
        'view_queue',
        'view_financials',
        'manage_settings',
        'manage_users',
        'view_activity_log',
    ],
    'طبيب': [
        'view_dashboard',
        'manage_appointments',
        'manage_patients',
        'view_queue',
    ],
    'موظف استقبال': [
        'view_dashboard',
        'manage_appointments',
        'manage_patients',
        'view_queue',
        'view_financials',
    ],
};

export const users: User[] = [
  {
    id: 'user0',
    name: 'عبدالإله',
    email: 'abdlelah2024@gmail.com',
    phone: '0550000000',
    password: 'password123',
    role: 'مدير النظام',
    avatar: 'https://placehold.co/100x100.png',
    permissions: permissionsByRole['مدير النظام']
  },
  {
    id: 'user1',
    name: 'د. أحمد قايد',
    email: 'admin@clinic.com',
    phone: '0501234567',
    password: 'password123',
    role: 'مدير النظام',
    avatar: 'https://placehold.co/100x100.png',
    permissions: permissionsByRole['مدير النظام']
  },
  {
    id: 'user2',
    name: 'فاطمة علي',
    email: 'reception@clinic.com',
    phone: '0507654321',
    password: 'password123',
    role: 'موظف استقبال',
    avatar: 'https://placehold.co/100x100.png',
    permissions: permissionsByRole['موظف استقبال']
  },
  {
    id: 'user3',
    name: 'د. خالد عبد الله',
    email: 'doctor@clinic.com',
    phone: '0551122334',
    password: 'password123',
    role: 'طبيب',
    avatar: 'https://placehold.co/100x100.png',
    permissions: permissionsByRole['طبيب']
  }
];

export const doctors: Doctor[] = [
    {
      id: 'doc1',
      name: 'د. أحمد قايد سالم',
      specialty: 'أسنان عام',
      avatar: 'https://placehold.co/128x128.png',
      workHours: {
        Sunday: { start: '09:00', end: '17:00' },
        Monday: { start: '09:00', end: '17:00' },
        Tuesday: { start: '09:00', end: '17:00' },
        Wednesday: { start: '09:00', end: '17:00' },
        Thursday: { start: '09:00', end: '13:00' },
        Friday: null,
        Saturday: { start: '10:00', end: '15:00' },
      },
      serviceCost: 150,
      freeReturnDays: 7,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'doc2',
      name: 'د. سارة محمود',
      specialty: 'تقويم أسنان',
      avatar: 'https://placehold.co/128x128.png',
      workHours: {
        Sunday: { start: '10:00', end: '18:00' },
        Monday: { start: '10:00', end: '18:00' },
        Tuesday: null,
        Wednesday: { start: '10:00', end: '18:00' },
        Thursday: { start: '10:00', end: '14:00' },
        Friday: null,
        Saturday: null,
      },
      serviceCost: 250,
      freeReturnDays: 14,
      createdAt: new Date().toISOString(),
    },
];

export const patients: Patient[] = [
    {
        id: 'pat1',
        name: 'علي محمد',
        phone: '0512345678',
        age: 34,
        gender: 'ذكر',
        avatar: 'https://placehold.co/100x100.png',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        medicalHistory: [
            {
                date: '2023-10-15',
                doctor: 'د. أحمد قايد سالم',
                diagnosis: 'فحص دوري وتسوس بسيط',
                notes: 'تم عمل حشوة للضرس الخلفي الأيمن. يوصى بالمتابعة بعد 6 أشهر.',
            }
        ]
    },
    {
        id: 'pat2',
        name: 'نورة عبد العزيز',
        phone: '0598765432',
        age: 28,
        gender: 'أنثى',
        avatar: 'https://placehold.co/100x100.png',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
        medicalHistory: []
    }
];

export const appointments: Appointment[] = [
    {
        id: 'apt1',
        patientId: 'pat1',
        patientName: 'علي محمد',
        patientAvatar: 'https://placehold.co/100x100.png',
        doctorId: 'doc1',
        doctorName: 'د. أحمد قايد سالم',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00',
        reason: 'فحص ومتابعة',
        status: 'مجدول',
        cost: 150,
    },
    {
        id: 'apt2',
        patientId: 'pat2',
        patientName: 'نورة عبد العزيز',
        patientAvatar: 'https://placehold.co/100x100.png',
        doctorId: 'doc2',
        doctorName: 'د. سارة محمود',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '11:30',
        reason: 'استشارة تقويم',
        status: 'في الانتظار',
        cost: 250,
    }
];


export const activityLogs: ActivityLog[] = [
    {
        id: 'log1',
        user: { name: 'فاطمة علي', avatar: 'https://placehold.co/100x100.png' },
        action: 'إضافة مريض جديد',
        target: 'سالم حمد',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    {
        id: 'log2',
        user: { name: 'د. أحمد قايد', avatar: 'https://placehold.co/100x100.png' },
        action: 'تحديث صلاحيات',
        target: 'فاطمة علي',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
        id: 'log3',
        user: { name: 'فاطمة علي', avatar: 'https://placehold.co/100x100.png' },
        action: 'إضافة سجل طبي',
        target: 'للمريض علي محمد',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    }
]
