
import { db } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { users, doctors, patients, appointments } from './data';

async function seedDatabase() {
  try {
    console.log('Starting to seed database...');

    // Seed users
    console.log('Seeding users...');
    const usersCollection = collection(db, 'users');
    for (const user of users) {
      // It's better to not store plain text passwords. 
      // In a real app, you'd use Firebase Auth and only store user info here.
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

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
