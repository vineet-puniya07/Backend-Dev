/**
 * Exercise 3: MongoDB Operations — Library System
 *
 * Operations required:
 * 1. Adding new books
 * 2. Finding books by author
 * 3. Updating book availability
 * 4. Tracking borrowed books by user
 *
 * How to run:
 * 1) npm i mongodb
 * 2) node Exercise3-LibraryMongoOps.js
 *
 * Connection:
 * - Set MONGO_URL env var if needed, else uses localhost.
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'practice_task2_library';

/** @type {MongoClient | null} */
let client = null;

async function connect() {
  client = new MongoClient(MONGO_URL);
  await client.connect();
  return client.db(DB_NAME);
}

async function ensureIndexes(db) {
  const books = db.collection('books');
  const users = db.collection('users');
  const borrows = db.collection('borrows');

  await books.createIndex({ isbn: 1 }, { unique: true });
  await books.createIndex({ author: 1 });
  await users.createIndex({ email: 1 }, { unique: true });
  await borrows.createIndex({ userId: 1, returnedAt: 1 });
  await borrows.createIndex({ bookId: 1, returnedAt: 1 });
}

// 1) Adding new books
async function addNewBook(db, { title, author, isbn, availableCopies }) {
  const books = db.collection('books');

  const doc = {
    title,
    author,
    isbn,
    availableCopies: typeof availableCopies === 'number' ? availableCopies : 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await books.insertOne(doc);
  return result.insertedId;
}

// 2) Finding books by author
async function findBooksByAuthor(db, author) {
  const books = db.collection('books');
  return books.find({ author }).sort({ title: 1 }).toArray();
}

// 3) Updating book availability
async function updateBookAvailability(db, isbn, newAvailableCopies) {
  const books = db.collection('books');

  if (typeof newAvailableCopies !== 'number' || newAvailableCopies < 0) {
    throw new Error('availableCopies must be a non-negative number');
  }

  return books.updateOne(
    { isbn },
    {
      $set: {
        availableCopies: newAvailableCopies,
        updatedAt: new Date(),
      },
    }
  );
}

async function upsertUser(db, { name, email }) {
  const users = db.collection('users');

  const result = await users.findOneAndUpdate(
    { email },
    {
      $setOnInsert: { name, email, createdAt: new Date() },
      $set: { updatedAt: new Date() },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return result.value;
}

// 4) Tracking borrowed books by user
async function borrowBook(db, userEmail, isbn) {
  const books = db.collection('books');
  const users = db.collection('users');
  const borrows = db.collection('borrows');

  const user = await users.findOne({ email: userEmail });
  if (!user) throw new Error(`User not found: ${userEmail}`);

  const book = await books.findOne({ isbn });
  if (!book) throw new Error(`Book not found: ${isbn}`);
  if (book.availableCopies <= 0) throw new Error(`No available copies for ISBN: ${isbn}`);

  // Decrease copies and insert borrow record
  const updateRes = await books.updateOne(
    { _id: book._id, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 }, $set: { updatedAt: new Date() } }
  );

  if (updateRes.modifiedCount !== 1) {
    throw new Error('Failed to borrow (book became unavailable)');
  }

  const borrowRes = await borrows.insertOne({
    userId: user._id,
    bookId: book._id,
    borrowedAt: new Date(),
    returnedAt: null,
  });

  return borrowRes.insertedId;
}

async function returnBook(db, borrowId) {
  const books = db.collection('books');
  const borrows = db.collection('borrows');

  const borrow = await borrows.findOne({ _id: new ObjectId(borrowId), returnedAt: null });
  if (!borrow) throw new Error('Active borrow record not found');

  const res = await borrows.updateOne(
    { _id: borrow._id, returnedAt: null },
    { $set: { returnedAt: new Date() } }
  );

  if (res.modifiedCount === 1) {
    await books.updateOne(
      { _id: borrow.bookId },
      { $inc: { availableCopies: 1 }, $set: { updatedAt: new Date() } }
    );
  }

  return res;
}

async function getBorrowedBooksByUser(db, userEmail) {
  const users = db.collection('users');
  const borrows = db.collection('borrows');

  const user = await users.findOne({ email: userEmail });
  if (!user) throw new Error(`User not found: ${userEmail}`);

  return borrows
    .aggregate([
      { $match: { userId: user._id, returnedAt: null } },
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      {
        $project: {
          _id: 0,
          borrowedAt: 1,
          title: '$book.title',
          author: '$book.author',
          isbn: '$book.isbn',
        },
      },
      { $sort: { borrowedAt: -1 } },
    ])
    .toArray();
}

async function demo() {
  const db = await connect();

  try {
    await ensureIndexes(db);

    // Clean start
    await Promise.all([
      db.collection('books').deleteMany({}),
      db.collection('users').deleteMany({}),
      db.collection('borrows').deleteMany({}),
    ]);

    // Seed
    await addNewBook(db, { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', availableCopies: 2 });
    await addNewBook(db, { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '9780201616224', availableCopies: 1 });
    await addNewBook(db, { title: 'Agile Principles, Patterns, and Practices', author: 'Robert C. Martin', isbn: '9780131857254', availableCopies: 1 });

    await upsertUser(db, { name: 'Aarav', email: 'aarav@uni.edu' });

    console.log('\n1) Find books by author: Robert C. Martin');
    console.table((await findBooksByAuthor(db, 'Robert C. Martin')).map((b) => ({ title: b.title, isbn: b.isbn, availableCopies: b.availableCopies })));

    console.log('\n2) Update availability for 9780201616224 to 3');
    const upd = await updateBookAvailability(db, '9780201616224', 3);
    console.log({ matched: upd.matchedCount, modified: upd.modifiedCount });

    console.log('\n3) Borrow a book for user aarav@uni.edu');
    const borrowId = await borrowBook(db, 'aarav@uni.edu', '9780132350884');
    console.log({ borrowId: String(borrowId) });

    console.log('\n4) Borrowed books by user');
    console.table(await getBorrowedBooksByUser(db, 'aarav@uni.edu'));

    console.log('\n(Optional) Return the borrowed book');
    await returnBook(db, borrowId);
    console.table(await getBorrowedBooksByUser(db, 'aarav@uni.edu'));
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  demo().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = {
  addNewBook,
  findBooksByAuthor,
  updateBookAvailability,
  borrowBook,
  returnBook,
  getBorrowedBooksByUser,
};
