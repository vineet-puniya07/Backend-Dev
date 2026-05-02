/**
 * Practice Exercises — Exercise 2: Advanced Queries
 *
 * Requirements:
 * 1. Find all students with GPA between 3.0 and 3.5
 * 2. Find students enrolled in more than 5 courses
 * 3. Get top 10 students by GPA
 * 4. Count students by city
 *
 * How to run:
 * 1) npm i mongodb
 * 2) node Exercise2-AdvancedQueries.js
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

  // Useful indexes for these queries
  await collection.createIndex({ gpa: -1 });
  await collection.createIndex({ city: 1 });

  return collection;
}

async function seedSampleStudents(students) {
  await students.deleteMany({});

  await students.insertMany([
    { name: 'Aarav', email: 'aarav@uni.edu', gpa: 3.1, city: 'Pune', courses: ['C1', 'C2'] },
    { name: 'Diya', email: 'diya@uni.edu', gpa: 3.4, city: 'Mumbai', courses: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'] },
    { name: 'Ishaan', email: 'ishaan@uni.edu', gpa: 3.8, city: 'Pune', courses: ['C1', 'C2', 'C3'] },
    { name: 'Meera', email: 'meera@uni.edu', gpa: 3.5, city: 'Delhi', courses: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'] },
    { name: 'Rohan', email: 'rohan@uni.edu', gpa: 2.9, city: 'Mumbai', courses: [] },
    { name: 'Sara', email: 'sara@uni.edu', gpa: 3.2, city: 'Delhi', courses: ['C1', 'C2', 'C3', 'C4'] },
    { name: 'Vikram', email: 'vikram@uni.edu', gpa: 3.95, city: 'Pune', courses: ['C1'] },
    { name: 'Zara', email: 'zara@uni.edu', gpa: 3.0, city: 'Mumbai', courses: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'] },
    { name: 'Kabir', email: 'kabir@uni.edu', gpa: 3.7, city: 'Delhi', courses: ['C1', 'C2', 'C3', 'C4', 'C5'] },
    { name: 'Ananya', email: 'ananya@uni.edu', gpa: 3.45, city: 'Pune', courses: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'] },
  ].map((s) => ({ ...s, createdAt: new Date(), updatedAt: new Date() })));
}

// 1) Find all students with GPA between 3.0 and 3.5
async function queryGpaBetween(students, min = 3.0, max = 3.5) {
  return students
    .find({ gpa: { $gte: min, $lte: max } })
    .sort({ gpa: -1, name: 1 })
    .toArray();
}

// 2) Find students enrolled in more than 5 courses
// Note: $size cannot be combined with $gt directly in find(); use $expr or aggregation.
async function queryMoreThanNCourses(students, minCourses = 5) {
  return students
    .find({ $expr: { $gt: [{ $size: '$courses' }, minCourses] } })
    .sort({ name: 1 })
    .toArray();
}

// 3) Get top 10 students by GPA
async function queryTopStudentsByGpa(students, limit = 10) {
  return students.find({}).sort({ gpa: -1, name: 1 }).limit(limit).toArray();
}

// 4) Count students by city
async function queryCountByCity(students) {
  return students
    .aggregate([
      { $match: { city: { $ne: null } } },
      {
        $group: {
          _id: '$city',
          studentCount: { $sum: 1 },
          averageGpa: { $avg: '$gpa' },
        },
      },
      { $sort: { studentCount: -1, _id: 1 } },
      {
        $project: {
          _id: 0,
          city: '$_id',
          studentCount: 1,
          averageGpa: { $round: ['$averageGpa', 2] },
        },
      },
    ])
    .toArray();
}

async function run() {
  const students = await getStudentsCollection();

  try {
    await seedSampleStudents(students);

    console.log('\n1) GPA between 3.0 and 3.5');
    console.table((await queryGpaBetween(students)).map((s) => ({ name: s.name, gpa: s.gpa })));

    console.log('\n2) Enrolled in more than 5 courses');
    console.table(
      (await queryMoreThanNCourses(students)).map((s) => ({
        name: s.name,
        courses: s.courses.length,
      }))
    );

    console.log('\n3) Top 10 students by GPA');
    console.table((await queryTopStudentsByGpa(students)).map((s) => ({ name: s.name, gpa: s.gpa })));

    console.log('\n4) Count students by city');
    console.table(await queryCountByCity(students));
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = {
  queryGpaBetween,
  queryMoreThanNCourses,
  queryTopStudentsByGpa,
  queryCountByCity,
};
