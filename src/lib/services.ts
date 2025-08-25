
'use server';

import { db } from './firebase';
import { collection, getDocs, query, where, addDoc, doc, DocumentReference, setDoc } from 'firebase/firestore';
import type { Doctor, Appointment, Patient, User } from './types';
import { users, doctors, patients, appointments } from './data';

/**
 * Fetches all doctors from the Firestore database.
 * @returns A promise that resolves to an array of Doctor objects.
 */
export async function getDoctors(): Promise<Doctor[]> {
    const doctorsCollection = collection(db, 'doctors');
    const doctorSnapshot = await getDocs(doctorsCollection);
    const doctorsList = doctorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
    return doctorsList;
}

/**
 * Fetches all appointments from the Firestore database.
 * @returns A promise that resolves to an array of Appointment objects.
 */
export async function getAppointments(): Promise<Appointment[]> {
    const appointmentsCollection = collection(db, 'appointments');
    const appointmentSnapshot = await getDocs(appointmentsCollection);
    const appointmentsList = appointmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
    return appointmentsList;
}

/**
 * Fetches all patients from the Firestore database.
 * @returns A promise that resolves to an array of Patient objects.
 */
export async function getPatients(): Promise<Patient[]> {
    const patientsCollection = collection(db, 'patients');
    const patientSnapshot = await getDocs(patientsCollection);
    const patientsList = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
    return patientsList;
}


/**
 * Fetches a patient by their phone number.
 * @param phone The patient's phone number.
 * @returns A promise that resolves to the Patient object or null if not found.
 */
export async function getPatientByPhone(phone: string): Promise<Patient | null> {
    const patientsCollection = collection(db, 'patients');
    const q = query(patientsCollection, where("phone", "==", phone));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    const patientDoc = querySnapshot.docs[0];
    return { id: patientDoc.id, ...patientDoc.data() } as Patient;
}

/**
 * Adds a new patient to the Firestore database.
 * @param patientData The data for the new patient.
 * @returns A promise that resolves to the new patient's ID.
 */
export async function addPatient(patientData: Omit<Patient, 'id'>): Promise<string> {
    const patientsCollection = collection(db, 'patients');
    const docRef = await addDoc(patientsCollection, patientData);
    return docRef.id;
}


/**
 * Adds a new appointment to the Firestore database.
 * @param appointmentData The data for the new appointment.
 * @returns A promise that resolves to the new appointment's ID.
 */
export async function addAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<string> {
    const appointmentsCollection = collection(db, 'appointments');
    const docRef = await addDoc(appointmentsCollection, appointmentData);
    return docRef.id;
}


/**
 * Seeds the database with initial data.
 * @returns A promise that resolves with a success message or rejects with an error.
 */
export async function seedDatabase(): Promise<string> {
  try {
    console.log('Starting to seed database from server action...');

    // Seed users
    console.log('Seeding users...');
    const usersCollection = collection(db, 'users');
    for (const user of users) {
      const { password, ...userData } = user;
      await setDoc(doc(usersCollection, user.id), userData);
    }
    console.log('Users seeded successfully.');

    // Seed doctors
    console.log('Seeding doctors...');
    const doctorsCollection = collection(db, 'doctors');
    for (const doctor of doctors) {
      await setDoc(doc(doctorsCollection, doctor.id), doctor);
    }
    console.log('Doctors seeded successfully.');

    // Seed patients
    console.log('Seeding patients...');
    const patientsCollection = collection(db, 'patients');
    for (const patient of patients) {
      await setDoc(doc(patientsCollection, patient.id), patient);
    }
    console.log('Patients seeded successfully.');

    // Seed appointments
    console.log('Seeding appointments...');
    const appointmentsCollection = collection(db, 'appointments');
    for (const appointment of appointments) {
      await setDoc(doc(appointmentsCollection, appointment.id), appointment);
    }
    console.log('Appointments seeded successfully.');

    const successMessage = 'Database seeding completed successfully!';
    console.log(successMessage);
    return successMessage;
  } catch (error: any) {
    console.error('Error seeding database:', error);
    throw new Error(`Database seeding failed: ${error.message}`);
  }
}
    
