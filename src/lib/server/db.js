// src/lib/server/db.js
import { MongoClient, ObjectId } from 'mongodb';
import { DB_URI, DB_NAME } from '$env/static/private';

if (!DB_URI) {
  throw new Error('DB_URI ist nicht gesetzt, bitte .env pruefen');
}

const client = new MongoClient(DB_URI);

let dbPromise;

// Login

async function usersCollection() {
  const db = await getDb();
  return db.collection('tw_users');
}

export async function getUserByEmail(email) {
  const col = await usersCollection();
  const doc = await col.findOne({ email });
  return doc
    ? {
        id: doc._id.toString(),
        email: doc.email,
        password: doc.password, // spaeter passwordHash
        createdAt: doc.createdAt
      }
    : null;
}

export async function createUser({ email, password }) {
  const col = await usersCollection();
  const now = new Date().toISOString();

  const insertDoc = {
    email,
    password, // fuer echtes Projekt passwordHash nehmen
    createdAt: now
  };

  const result = await col.insertOne(insertDoc);
  return {
    id: result.insertedId.toString(),
    email,
    createdAt: now
  };
}


/**
 * Stellt sicher, dass wir nur eine DB Verbindung pro Server haben
 */
async function getDb() {
  if (!dbPromise) {
    dbPromise = client.connect().then(() => {
      const name = DB_NAME || 'tripwise';
      return client.db(name);
    });
  }
  return dbPromise;
}

async function tripsCollection() {
  const db = await getDb();
  return db.collection('tw_trips');
}

async function expensesCollection() {
  const db = await getDb();
  return db.collection('tw_expenses');
}

const DEFAULT_PARTICIPANTS = Object.freeze([{ id: 'me', name: 'Du' }]);
const DEFAULT_PAID_BY_PARTICIPANT_ID = 'me';

function cloneDefaultParticipants() {
  return DEFAULT_PARTICIPANTS.map((participant) => ({ ...participant }));
}

function normalizeParticipants(value) {
  if (!Array.isArray(value)) {
    return cloneDefaultParticipants();
  }

  const cleaned = value
    .map((participant) => {
      if (!participant || typeof participant !== 'object') return null;
      const id = typeof participant.id === 'string' ? participant.id.trim() : '';
      const name = typeof participant.name === 'string' ? participant.name.trim() : '';
      if (!id || !name) return null;
      return { id, name };
    })
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned : cloneDefaultParticipants();
}

function normalizePaidByParticipantId(value) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return DEFAULT_PAID_BY_PARTICIPANT_ID;
}

function normalizeSplitBetweenAll(value) {
  return typeof value === 'boolean' ? value : true;
}

// Hilfsfunktion zum Mappen von Mongo Dokumenten
function mapTrip(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    userId: doc.userId ? doc.userId.toString() : null,
    name: doc.name,
    destination: doc.destination,
    startDate: doc.startDate || '',
    endDate: doc.endDate || '',
    totalBudget: Number(doc.totalBudget) || 0,
    currency: doc.currency || 'CHF',
    status: doc.status || 'planning',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    participants: normalizeParticipants(doc.participants),
  };
}


function mapExpense(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    tripId: doc.tripId.toString(),
    amount: Number(doc.amount) || 0,
    currency: doc.currency || 'CHF',
    category: doc.category || 'Other',
    date: doc.date,
    description: doc.description || '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    paidByParticipantId: normalizePaidByParticipantId(doc.paidByParticipantId),
    splitBetweenAll: normalizeSplitBetweenAll(doc.splitBetweenAll),
  };
}

/* ---------- TRIPS ---------- */

export async function getTrips(userId) {
  const col = await tripsCollection();
  const query = userId ? { userId: new ObjectId(userId) } : {};
  const docs = await col.find(query).sort({ createdAt: -1 }).toArray();
  return docs.map(mapTrip);
}

export async function getTripById(id, userId) {
  const col = await tripsCollection();
  const query = { _id: new ObjectId(id) };
  if (userId) {
    query.userId = new ObjectId(userId);
  }
  const doc = await col.findOne(query);
  return mapTrip(doc);
}


export async function createTrip(data, userId) {
  const col = await tripsCollection();
  const now = new Date().toISOString();

  const insertDoc = {
    userId: userId ? new ObjectId(userId) : null,
    name: data.name,
    destination: data.destination || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    totalBudget: Number(data.totalBudget) || 0,
    currency: data.currency || 'CHF',
    status: data.status || 'planning',
    participants: normalizeParticipants(data.participants),
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(insertDoc);
  return mapTrip({ _id: result.insertedId, ...insertDoc });
}

export async function updateTrip(id, data, userId) {
  const col = await tripsCollection();
  const now = new Date().toISOString();

  if (!userId) {
    return null; // Kein User = Kein Update
  }

  const updateDoc = {
    ...(data.name && { name: data.name }),
    ...(data.destination && { destination: data.destination }),
    ...(data.startDate && { startDate: data.startDate }),
    ...(data.endDate && { endDate: data.endDate }),
    ...(data.totalBudget !== undefined && {
      totalBudget: Number(data.totalBudget),
    }),
    ...(data.currency && { currency: data.currency }),
    ...(data.status && { status: data.status }),
    ...(data.participants !== undefined && {
      participants: normalizeParticipants(data.participants)
    }),
    updatedAt: now
  };

  // Update nur, wenn Trip dem User gehoert
  const result = await col.updateOne(
    {
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    },
    { $set: updateDoc }
  );

  if (result.matchedCount === 0) {
    return null; // Trip existiert nicht oder gehoert nicht diesem User
  }

  return getTripById(id, userId);
}


/**
 * Alle Expenses zu einem Trip löschen (fuer Cascade Delete)
 */
export async function deleteExpensesForTrip(tripId) {
  const col = await expensesCollection();
  await col.deleteMany({ tripId: new ObjectId(tripId) });
}

/**
 * Trip löschen und dazugehoerige Expenses aufraeumen
 */
export async function deleteTrip(id, userId) {
  const col = await tripsCollection();

  if (!userId) {
    return false;
  }

  // Löschen nur, wenn Trip dem User gehoert
  const result = await col.deleteOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId)
  });

  return result.deletedCount === 1;
}


/* ---------- EXPENSES ---------- */

export async function getExpensesForTrip(tripId) {
  const col = await expensesCollection();
  const docs = await col
    .find({ tripId: new ObjectId(tripId) })
    .sort({ date: 1 })
    .toArray();
  return docs.map(mapExpense);
}

export async function getExpenseById(id) {
  const col = await expensesCollection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return mapExpense(doc);
}

export async function createExpense(tripId, data) {
  const col = await expensesCollection();
  const now = new Date().toISOString();

  const insertDoc = {
    tripId: new ObjectId(tripId),
    amount: Number(data.amount),
    currency: data.currency || 'CHF',
    category: data.category || 'Other',
    date: data.date || now.substring(0, 10),
    description: data.description || '',
    paidByParticipantId: normalizePaidByParticipantId(data.paidByParticipantId),
    splitBetweenAll: normalizeSplitBetweenAll(data.splitBetweenAll),
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(insertDoc);
  return mapExpense({ _id: result.insertedId, ...insertDoc });
}

export async function updateExpense(id, data) {
  const col = await expensesCollection();
  const now = new Date().toISOString();

  const updateDoc = {
    ...(data.amount !== undefined && { amount: Number(data.amount) }),
    ...(data.currency && { currency: data.currency }),
    ...(data.category && { category: data.category }),
    ...(data.date && { date: data.date }),
    ...(data.description && { description: data.description }),
    ...(data.paidByParticipantId !== undefined && {
      paidByParticipantId: normalizePaidByParticipantId(data.paidByParticipantId)
    }),
    ...(data.splitBetweenAll !== undefined && {
      splitBetweenAll: normalizeSplitBetweenAll(data.splitBetweenAll)
    }),
    updatedAt: now,
  };

  await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateDoc }
  );

  return getExpenseById(id);
}

/**
 * Einzelne Expense nur nach ID loeschen
 * (wird evtl. an anderer Stelle genutzt)
 */
export async function deleteExpense(id) {
  const col = await expensesCollection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

/**
 * Expense fuer einen bestimmten Trip loeschen
 * wird von DELETE /api/trips/[id]/expenses/[expenseId] benutzt
 */
export async function deleteExpenseForTrip(tripId, expenseId) {
  const col = await expensesCollection();
  const result = await col.deleteOne({
    _id: new ObjectId(expenseId),
    tripId: new ObjectId(tripId),
  });
  return result.deletedCount === 1;
}
