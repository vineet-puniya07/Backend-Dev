# Practice Exercises — Exercise 3: Schema Design

Design schemas for:
1. Course with prerequisites
2. Professor with multiple departments
3. Grade with student and course references

These are MongoDB-oriented designs (documents + references). The goal is to model relationships while keeping common reads efficient.

---

## 1) Course with prerequisites

### Option A (recommended): store prerequisite course *references* + cache key fields

**Collection:** `courses`

```json
{
  "_id": "ObjectId",
  "courseCode": "CS301",
  "courseName": "Data Structures",
  "department": "Computer Science",
  "credits": 3,

  "prerequisites": [
    {
      "courseId": "ObjectId",
      "courseCode": "CS101",
      "courseName": "Intro to Programming"
    },
    {
      "courseId": "ObjectId",
      "courseCode": "CS201",
      "courseName": "OOP Basics"
    }
  ],

  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Why:**
- Typical prerequisites are few (bounded array).
- Reading a course page needs prerequisites immediately (no `$lookup` most of the time).
- Storing `courseId` keeps the true relationship; caching `courseCode/courseName` avoids extra fetches.

**Indexes (common):**
- Unique: `{ courseCode: 1 }`
- Filter by department: `{ department: 1 }`

---

## 2) Professor with multiple departments

**Collection:** `professors`

```json
{
  "_id": "ObjectId",
  "name": "Dr. Priya Nair",
  "email": "priya.nair@university.edu",

  "departments": [
    {
      "departmentId": "ObjectId",
      "departmentName": "Computer Science",
      "role": "Associate Professor"
    },
    {
      "departmentId": "ObjectId",
      "departmentName": "Data Science",
      "role": "Adjunct"
    }
  ],

  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Why:**
- This is a many-to-many concept; embedding departments as an array works well when it stays reasonably small.
- Querying “all professors in CS” is easy with a multikey field.

**Indexes (common):**
- Unique: `{ email: 1 }`
- Query by department: `{ "departments.departmentName": 1 }`

---

## 3) Grade with student and course references

**Collections:** `students`, `courses`, `grades`

### `grades` collection (one doc per student-course attempt)

```json
{
  "_id": "ObjectId",

  "studentId": "ObjectId",
  "courseId": "ObjectId",

  "semester": "Fall 2026",

  "components": {
    "assignments": 30,
    "midterm": 25,
    "final": 45
  },

  "finalGrade": {
    "numeric": 87,
    "letter": "B",
    "gpaPoints": 3.0
  },

  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Why:**
- `studentId` and `courseId` are independent entities → reference them.
- Grades are transactional/append-style; a dedicated `grades` collection scales better than embedding all grades inside a student.

**Constraints / Indexes:**
- Prevent duplicates per attempt:
  - If one grade per course per student: unique `{ studentId: 1, courseId: 1, semester: 1 }`
- Common lookups:
  - `{ studentId: 1, semester: -1 }`
  - `{ courseId: 1, semester: -1 }`

---

## Notes (design choices)

- Prefer embedding when the related data is **bounded** and read together frequently.
- Prefer referencing when the related data is **large**, **unbounded**, or owned by another entity.
- If you cache fields (like `courseName` inside prerequisites), decide how you’ll keep them consistent (e.g., update script / application update).
