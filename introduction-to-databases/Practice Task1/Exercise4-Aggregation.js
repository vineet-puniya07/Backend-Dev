/**
 * Practice Exercises — Exercise 4: Aggregation
 *
 * Requirements (pipelines):
 * 1. Calculate average GPA by department
 * 2. Find most popular courses
 * 3. Generate student performance report
 *
 * How to run:
 * 1) npm i mongodb
 * 2) node Exercise4-Aggregation.js
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'practice_task1_db';

/** @type {MongoClient | null} */
let client = null;

async function getDb() {
  client = new MongoClient(MONGO_URL);
  await client.connect();
  return client.db(DB_NAME);
}

async function seed(db) {
  const students = db.collection('students');
  const courses = db.collection('courses');
  const grades = db.collection('grades');

  await Promise.all([students.deleteMany({}), courses.deleteMany({}), grades.deleteMany({})]);

  const insertedStudents = await students.insertMany([
    { name: 'Aarav', email: 'aarav@uni.edu', department: 'CS', gpa: 3.1 },
    { name: 'Diya', email: 'diya@uni.edu', department: 'CS', gpa: 3.4 },
    { name: 'Meera', email: 'meera@uni.edu', department: 'Math', gpa: 3.5 },
    { name: 'Sara', email: 'sara@uni.edu', department: 'Math', gpa: 3.2 },
    { name: 'Vikram', email: 'vikram@uni.edu', department: 'Physics', gpa: 3.9 },
  ].map((s) => ({ ...s, createdAt: new Date(), updatedAt: new Date(), isActive: true, courses: [] })));

  const studentIds = Object.values(insertedStudents.insertedIds);

  const insertedCourses = await courses.insertMany([
    { courseCode: 'CS101', courseName: 'Intro to Programming', capacity: 60, enrolled: 58, department: 'CS' },
    { courseCode: 'CS201', courseName: 'OOP Basics', capacity: 50, enrolled: 45, department: 'CS' },
    { courseCode: 'MATH101', courseName: 'Calculus I', capacity: 70, enrolled: 66, department: 'Math' },
    { courseCode: 'PHY101', courseName: 'Mechanics', capacity: 55, enrolled: 20, department: 'Physics' },
  ].map((c) => ({ ...c, createdAt: new Date(), updatedAt: new Date() })));

  const courseIds = Object.values(insertedCourses.insertedIds);

  // Create grades that reference studentId + courseId
  await grades.insertMany([
    {
      studentId: studentIds[0],
      courseId: courseIds[0],
      semester: 'Fall 2026',
      finalGrade: { numeric: 78, letter: 'C' },
    },
    {
      studentId: studentIds[0],
      courseId: courseIds[1],
      semester: 'Fall 2026',
      finalGrade: { numeric: 84, letter: 'B' },
    },
    {
      studentId: studentIds[1],
      courseId: courseIds[0],
      semester: 'Fall 2026',
      finalGrade: { numeric: 91, letter: 'A' },
    },
    {
      studentId: studentIds[2],
      courseId: courseIds[2],
      semester: 'Fall 2026',
      finalGrade: { numeric: 88, letter: 'B' },
    },
    {
      studentId: studentIds[3],
      courseId: courseIds[2],
      semester: 'Fall 2026',
      finalGrade: { numeric: 73, letter: 'C' },
    },
    {
      studentId: studentIds[4],
      courseId: courseIds[3],
      semester: 'Fall 2026',
      finalGrade: { numeric: 95, letter: 'A' },
    },
  ].map((g) => ({ ...g, createdAt: new Date(), updatedAt: new Date() })));
}

// 1) Calculate average GPA by department
async function averageGpaByDepartment(db) {
  const students = db.collection('students');

  return students
    .aggregate([
      { $match: { isActive: true, department: { $ne: null } } },
      {
        $group: {
          _id: '$department',
          avgGpa: { $avg: '$gpa' },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgGpa: -1 } },
      {
        $project: {
          _id: 0,
          department: '$_id',
          count: 1,
          avgGpa: { $round: ['$avgGpa', 2] },
        },
      },
    ])
    .toArray();
}

// 2) Find most popular courses (by enrolled)
async function mostPopularCourses(db, limit = 10) {
  const courses = db.collection('courses');

  return courses
    .aggregate([
      { $match: { enrolled: { $gte: 0 }, capacity: { $gt: 0 } } },
      {
        $addFields: {
          fillRate: {
            $round: [{ $multiply: [{ $divide: ['$enrolled', '$capacity'] }, 100] }, 2],
          },
        },
      },
      { $sort: { enrolled: -1, fillRate: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          courseCode: 1,
          courseName: 1,
          department: 1,
          enrolled: 1,
          capacity: 1,
          fillRate: 1,
        },
      },
    ])
    .toArray();
}

// 3) Generate student performance report
// Joins students -> grades -> courses, then computes per-student stats.
async function studentPerformanceReport(db, semester = 'Fall 2026') {
  const students = db.collection('students');

  return students
    .aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'grades',
          let: { studentId: '$_id', targetSemester: semester },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$studentId', '$$studentId'] },
                    { $eq: ['$semester', '$$targetSemester'] },
                  ],
                },
              },
            },
          ],
          as: 'grades',
        },
      },
      { $unwind: { path: '$grades', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'courses',
          localField: 'grades.courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          email: { $first: '$email' },
          department: { $first: '$department' },
          avgNumeric: { $avg: '$grades.finalGrade.numeric' },
          coursesTaken: {
            $addToSet: {
              courseCode: '$course.courseCode',
              courseName: '$course.courseName',
              numeric: '$grades.finalGrade.numeric',
              letter: '$grades.finalGrade.letter',
            },
          },
        },
      },
      {
        $addFields: {
          coursesCount: { $size: '$coursesTaken' },
          avgNumeric: { $round: ['$avgNumeric', 2] },
        },
      },
      { $sort: { avgNumeric: -1 } },
      {
        $project: {
          _id: 0,
          name: 1,
          email: 1,
          department: 1,
          coursesCount: 1,
          avgNumeric: 1,
          coursesTaken: 1,
        },
      },
    ])
    .toArray();
}

async function run() {
  const db = await getDb();

  try {
    await seed(db);

    console.log('\n1) Average GPA by department');
    console.table(await averageGpaByDepartment(db));

    console.log('\n2) Most popular courses');
    console.table(await mostPopularCourses(db, 10));

    console.log('\n3) Student performance report');
    const report = await studentPerformanceReport(db, 'Fall 2026');
    // Print a summarized view
    console.table(report.map((r) => ({ name: r.name, department: r.department, coursesCount: r.coursesCount, avgNumeric: r.avgNumeric })));
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
  averageGpaByDepartment,
  mostPopularCourses,
  studentPerformanceReport,
};
