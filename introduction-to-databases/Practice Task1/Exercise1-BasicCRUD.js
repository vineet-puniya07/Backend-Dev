/**
 * Practice Exercises — Exercise 1: Basic CRUD
 * Student Management System (MongoDB + Node.js)
 *
 * Features:
 * 1. Add new student
 * 2. View all students
 * 3. Find student by email
 * 4. Update student GPA
 * 5. Delete student
 *
 * How to run:
 * 1) npm i mongodb
 * 2) node Exercise1-BasicCRUD.js
 */

const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'practice_task1_db';
const COLLECTION_NAME = 'students';

/** @type {MongoClient | null} */
let client = null;

async function getStudentsCollection() {
  client = new MongoClient(MONGO_URL);
  await client.connect();

  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  // Ensure emails are unique
  await collection.createIndex({ email: 1 }, { unique: true });

  return collection;
}

/**
 * 1) Add new student
 */
async function addNewStudent(students, { name, email, gpa, city, department, courses }) {
  const doc = {
    name,
    email,
    gpa: typeof gpa === 'number' ? gpa : 0.0,
    city: city || null,
    department: department || null,
    courses: Array.isArray(courses) ? courses : [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await students.insertOne(doc);
  return result.insertedId;
}

/**
 * 2) View all students
 */
async function viewAllStudents(students) {
  return students.find({}).sort({ createdAt: -1 }).toArray();
}

/**
 * 3) Find student by email
 */
async function findStudentByEmail(students, email) {
  return students.findOne({ email });
}

/**
 * 4) Update student GPA
 */
async function updateStudentGpa(students, email, newGpa) {
  if (typeof newGpa !== 'number' || Number.isNaN(newGpa) || newGpa < 0 || newGpa > 4) {
    throw new Error('Invalid GPA. Expected a number between 0 and 4.');
  }

  return students.updateOne(
    { email },
    {
      $set: {
        gpa: newGpa,
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * 5) Delete student
 */
async function deleteStudent(students, email) {
  return students.deleteOne({ email });
}

async function runDemo() {
  const students = await getStudentsCollection();

  try {
    // Start clean for practice
    await students.deleteMany({});

    console.log('--- ADD ---');
    await addNewStudent(students, {
      name: 'Alice Johnson',
      email: 'alice@university.edu',
      gpa: 3.6,
      city: 'Pune',
      department: 'Computer Science',
      courses: ['CS101', 'MATH101'],
    });

    await addNewStudent(students, {
      name: 'Bob Smith',
      email: 'bob@university.edu',
      gpa: 3.2,
      city: 'Mumbai',
      department: 'Computer Science',
      courses: ['CS101', 'CS102', 'ENG101'],
    });

    console.log('--- VIEW ALL ---');
    console.table(
      (await viewAllStudents(students)).map((s) => ({
        name: s.name,
        email: s.email,
        gpa: s.gpa,
        city: s.city,
        department: s.department,
        courseCount: s.courses?.length ?? 0,
      }))
    );

    console.log('--- FIND BY EMAIL ---');
    const alice = await findStudentByEmail(students, 'alice@university.edu');
    console.log(alice ? { name: alice.name, email: alice.email, gpa: alice.gpa } : 'Not found');

    console.log('--- UPDATE GPA ---');
    const updateResult = await updateStudentGpa(students, 'bob@university.edu', 3.9);
    console.log({ matched: updateResult.matchedCount, modified: updateResult.modifiedCount });

    console.log('--- DELETE ---');
    const deleteResult = await deleteStudent(students, 'alice@university.edu');
    console.log({ deleted: deleteResult.deletedCount });

    console.log('--- FINAL ---');
    console.table(
      (await viewAllStudents(students)).map((s) => ({
        name: s.name,
        email: s.email,
        gpa: s.gpa,
      }))
    );
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  runDemo().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = {
  addNewStudent,
  viewAllStudents,
  findStudentByEmail,
  updateStudentGpa,
  deleteStudent,
};
