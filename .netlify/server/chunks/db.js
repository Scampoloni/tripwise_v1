import { MongoClient, ObjectId } from "mongodb";
import { b as private_env } from "./shared-server.js";
const DB_URI = private_env.DB_URI;
const DB_NAME = private_env.DB_NAME;
if (!DB_URI) {
  throw new Error("Missing DB_URI environment variable");
}
if (!DB_NAME) {
  throw new Error("Missing DB_NAME environment variable");
}
const client = new MongoClient(DB_URI);
let dbPromise;
function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function usersCollection() {
  const db = await getDb();
  return db.collection("tw_users");
}
async function getUserByEmail(email) {
  const col = await usersCollection();
  const cleanEmail = normalizeEmail(email);
  const query = cleanEmail ? { email: { $regex: `^${escapeRegex(cleanEmail)}$`, $options: "i" } } : { email };
  const doc = await col.findOne(query);
  return doc ? {
    id: doc._id.toString(),
    email: doc.email,
    password: doc.password,
    // spaeter passwordHash
    displayName: doc.displayName ?? null,
    createdAt: doc.createdAt
  } : null;
}
async function getUserById(id) {
  const col = await usersCollection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return doc ? {
    id: doc._id.toString(),
    email: doc.email,
    displayName: doc.displayName ?? null,
    createdAt: doc.createdAt
  } : null;
}
async function createUser({ email, password, displayName }) {
  const col = await usersCollection();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const safeEmail = normalizeEmail(email) || email;
  const insertDoc = {
    email: safeEmail,
    password,
    // fuer echtes Projekt passwordHash nehmen
    displayName: typeof displayName === "string" && displayName.trim() ? displayName.trim() : null,
    createdAt: now
  };
  const result = await col.insertOne(insertDoc);
  return {
    id: result.insertedId.toString(),
    email: insertDoc.email,
    displayName: insertDoc.displayName,
    createdAt: now
  };
}
async function getDb() {
  if (!dbPromise) {
    dbPromise = client.connect().then(() => {
      const name = DB_NAME || "tripwise";
      return client.db(name);
    });
  }
  return dbPromise;
}
async function tripsCollection() {
  const db = await getDb();
  return db.collection("tw_trips");
}
async function expensesCollection() {
  const db = await getDb();
  return db.collection("tw_expenses");
}
const DEFAULT_PARTICIPANTS = Object.freeze([{ id: "me", name: "Du" }]);
const DEFAULT_PAID_BY_PARTICIPANT_ID = "me";
function cloneDefaultParticipants() {
  return DEFAULT_PARTICIPANTS.map((participant) => ({ ...participant }));
}
function normalizeParticipants(value) {
  if (!Array.isArray(value)) {
    return cloneDefaultParticipants();
  }
  const cleaned = value.map((participant) => {
    if (!participant || typeof participant !== "object") return null;
    const id = typeof participant.id === "string" ? participant.id.trim() : "";
    const name = typeof participant.name === "string" ? participant.name.trim() : "";
    if (!id || !name) return null;
    return { id, name };
  }).filter(Boolean);
  return cleaned.length > 0 ? cleaned : cloneDefaultParticipants();
}
function normalizePaidByParticipantId(value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return DEFAULT_PAID_BY_PARTICIPANT_ID;
}
function normalizeSplitBetweenAll(value) {
  return typeof value === "boolean" ? value : true;
}
function mapTrip(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    userId: doc.userId ? doc.userId.toString() : null,
    name: doc.name ?? doc.title ?? "",
    title: doc.title ?? doc.name ?? "",
    destinationName: doc.destinationName ?? doc.destination ?? "",
    // Neue Geodaten (koennen null oder string aus der DB sein)
    destinationLat: doc.destinationLat != null ? Number(doc.destinationLat) : void 0,
    destinationLon: doc.destinationLon != null ? Number(doc.destinationLon) : void 0,
    destinationCountry: doc.destinationCountry ?? void 0,
    latitude: doc.latitude != null ? Number(doc.latitude) : void 0,
    longitude: doc.longitude != null ? Number(doc.longitude) : void 0,
    cityName: doc.cityName ?? void 0,
    countryName: doc.countryName ?? void 0,
    heroImageUrl: doc.heroImageUrl ?? null,
    weatherPreview: doc.weatherPreview ?? null,
    startDate: doc.startDate || "",
    endDate: doc.endDate || "",
    totalBudget: Number(doc.totalBudget) || 0,
    currency: doc.currency || "CHF",
    status: doc.status || "planning",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    participants: normalizeParticipants(doc.participants)
  };
}
function mapExpense(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    tripId: doc.tripId.toString(),
    amount: Number(doc.amount) || 0,
    currency: doc.currency || "CHF",
    category: doc.category || "Other",
    date: doc.date,
    description: doc.description || "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    paidByParticipantId: normalizePaidByParticipantId(doc.paidByParticipantId),
    splitBetweenAll: normalizeSplitBetweenAll(doc.splitBetweenAll)
  };
}
async function getTrips(userId) {
  const col = await tripsCollection();
  const query = userId ? { userId: new ObjectId(userId) } : {};
  const docs = await col.find(query).sort({ createdAt: -1 }).toArray();
  const trips = docs.map(mapTrip);
  return trips;
}
async function getTripById(id, userId) {
  const col = await tripsCollection();
  const query = { _id: new ObjectId(id) };
  if (userId) {
    query.userId = new ObjectId(userId);
  }
  const doc = await col.findOne(query);
  const trip = mapTrip(doc);
  console.log("=== RAW DB TRIP ===", trip);
  return trip;
}
async function createTrip(data, userId) {
  const col = await tripsCollection();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const insertDoc = {
    userId: userId ? new ObjectId(userId) : null,
    name: data.name ?? data.title ?? "",
    title: data.title ?? data.name ?? "",
    destinationName: data.destinationName?.trim() || (data.destination ?? ""),
    destinationLat: typeof data.destinationLat === "number" ? data.destinationLat : data.destinationLat != null ? Number(data.destinationLat) : null,
    destinationLon: typeof data.destinationLon === "number" ? data.destinationLon : data.destinationLon != null ? Number(data.destinationLon) : null,
    destinationCountry: data.destinationCountry ?? null,
    latitude: typeof data.latitude === "number" ? data.latitude : data.latitude != null ? Number(data.latitude) : null,
    longitude: typeof data.longitude === "number" ? data.longitude : data.longitude != null ? Number(data.longitude) : null,
    cityName: data.cityName ?? null,
    countryName: data.countryName ?? null,
    heroImageUrl: data.heroImageUrl ?? null,
    weatherPreview: data.weatherPreview ?? null,
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    totalBudget: Number(data.totalBudget ?? data.budget ?? 0) || 0,
    currency: data.currency || "CHF",
    status: data.status || "planning",
    participants: normalizeParticipants(data.participants),
    createdAt: now,
    updatedAt: now
  };
  const result = await col.insertOne(insertDoc);
  return mapTrip({ _id: result.insertedId, ...insertDoc });
}
async function updateTrip(id, data, userId) {
  const col = await tripsCollection();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (!userId) {
    return null;
  }
  const setDoc = { updatedAt: now };
  if (data.name !== void 0) {
    setDoc.name = data.name;
  }
  if (data.title !== void 0) {
    setDoc.title = data.title;
  }
  if (data.destinationName !== void 0) {
    setDoc.destinationName = data.destinationName?.trim() || "";
  } else if (data.destination !== void 0) {
    setDoc.destinationName = data.destination?.trim() || "";
  }
  if (data.destinationLat !== void 0) {
    setDoc.destinationLat = typeof data.destinationLat === "number" ? data.destinationLat : data.destinationLat == null ? null : Number(data.destinationLat);
  }
  if (data.destinationLon !== void 0) {
    setDoc.destinationLon = typeof data.destinationLon === "number" ? data.destinationLon : data.destinationLon == null ? null : Number(data.destinationLon);
  }
  if (data.destinationCountry !== void 0) {
    setDoc.destinationCountry = data.destinationCountry;
  }
  if (data.latitude !== void 0) {
    setDoc.latitude = data.latitude;
  }
  if (data.longitude !== void 0) {
    setDoc.longitude = data.longitude;
  }
  if (data.cityName !== void 0) {
    setDoc.cityName = data.cityName;
  }
  if (data.countryName !== void 0) {
    setDoc.countryName = data.countryName;
  }
  if (data.startDate !== void 0) {
    setDoc.startDate = data.startDate;
  }
  if (data.endDate !== void 0) {
    setDoc.endDate = data.endDate;
  }
  if (data.totalBudget !== void 0) {
    setDoc.totalBudget = Number(data.totalBudget) || 0;
  } else if (data.budget !== void 0) {
    setDoc.totalBudget = Number(data.budget) || 0;
  }
  if (data.currency !== void 0) {
    setDoc.currency = data.currency;
  }
  if (data.status !== void 0) {
    setDoc.status = data.status;
  }
  if (data.participants !== void 0) {
    setDoc.participants = normalizeParticipants(data.participants);
  }
  if (data.heroImageUrl !== void 0) {
    setDoc.heroImageUrl = data.heroImageUrl;
  }
  if (data.weatherPreview !== void 0) {
    setDoc.weatherPreview = data.weatherPreview;
  }
  const result = await col.updateOne(
    {
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    },
    { $set: setDoc }
  );
  if (result.matchedCount === 0) {
    return null;
  }
  return getTripById(id, userId);
}
async function deleteTrip(id, userId) {
  const col = await tripsCollection();
  if (!userId) {
    return false;
  }
  const result = await col.deleteOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId)
  });
  return result.deletedCount === 1;
}
async function getExpensesForTrip(tripId) {
  const col = await expensesCollection();
  const docs = await col.find({ tripId: new ObjectId(tripId) }).sort({ date: 1 }).toArray();
  return docs.map(mapExpense);
}
async function getExpenseById(id) {
  const col = await expensesCollection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return mapExpense(doc);
}
async function createExpense(tripId, data) {
  const col = await expensesCollection();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const insertDoc = {
    tripId: new ObjectId(tripId),
    amount: Number(data.amount),
    currency: data.currency || "CHF",
    category: data.category || "Other",
    date: data.date || now.substring(0, 10),
    description: data.description || "",
    paidByParticipantId: normalizePaidByParticipantId(data.paidByParticipantId),
    splitBetweenAll: normalizeSplitBetweenAll(data.splitBetweenAll),
    createdAt: now,
    updatedAt: now
  };
  const result = await col.insertOne(insertDoc);
  return mapExpense({ _id: result.insertedId, ...insertDoc });
}
async function updateExpense(id, data) {
  const col = await expensesCollection();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const updateDoc = {
    ...data.amount !== void 0 && { amount: Number(data.amount) },
    ...data.currency && { currency: data.currency },
    ...data.category && { category: data.category },
    ...data.date && { date: data.date },
    ...data.description && { description: data.description },
    ...data.paidByParticipantId !== void 0 && {
      paidByParticipantId: normalizePaidByParticipantId(data.paidByParticipantId)
    },
    ...data.splitBetweenAll !== void 0 && {
      splitBetweenAll: normalizeSplitBetweenAll(data.splitBetweenAll)
    },
    updatedAt: now
  };
  await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateDoc }
  );
  return getExpenseById(id);
}
async function deleteExpense(id) {
  const col = await expensesCollection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
async function deleteExpenseForTrip(tripId, expenseId) {
  const col = await expensesCollection();
  const result = await col.deleteOne({
    _id: new ObjectId(expenseId),
    tripId: new ObjectId(tripId)
  });
  return result.deletedCount === 1;
}
async function tripSplitGroupsCollection() {
  const db = await getDb();
  return db.collection("tw_tripsplit_groups");
}
function mapTripSplitGroup(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    userId: doc.userId ? doc.userId.toString() : null,
    name: doc.name || "",
    participants: Array.isArray(doc.participants) ? doc.participants : [],
    expenses: Array.isArray(doc.expenses) ? doc.expenses : [],
    createdAt: doc.createdAt || "",
    updatedAt: doc.updatedAt || ""
  };
}
async function getTripSplitGroups(userId) {
  const col = await tripSplitGroupsCollection();
  if (!userId) return [];
  const docs = await col.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
  return docs.map(mapTripSplitGroup);
}
async function getTripSplitGroupById(id, userId) {
  const col = await tripSplitGroupsCollection();
  if (!userId) return null;
  const doc = await col.findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId)
  });
  return mapTripSplitGroup(doc);
}
async function createTripSplitGroup(data, userId) {
  const col = await tripSplitGroupsCollection();
  if (!userId) return null;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const insertDoc = {
    userId: new ObjectId(userId),
    name: data.name || "",
    participants: Array.isArray(data.participants) ? data.participants : [],
    expenses: Array.isArray(data.expenses) ? data.expenses : [],
    createdAt: now,
    updatedAt: now
  };
  const result = await col.insertOne(insertDoc);
  return mapTripSplitGroup({ _id: result.insertedId, ...insertDoc });
}
async function updateTripSplitGroup(id, data, userId) {
  const col = await tripSplitGroupsCollection();
  if (!userId) return null;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const setDoc = {
    name: data.name || "",
    participants: Array.isArray(data.participants) ? data.participants : [],
    expenses: Array.isArray(data.expenses) ? data.expenses : [],
    updatedAt: now
  };
  const result = await col.updateOne(
    {
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    },
    { $set: setDoc }
  );
  if (result.matchedCount === 0) {
    return null;
  }
  return getTripSplitGroupById(id, userId);
}
async function deleteTripSplitGroup(id, userId) {
  const col = await tripSplitGroupsCollection();
  if (!userId) return false;
  const result = await col.deleteOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId)
  });
  return result.deletedCount === 1;
}
export {
  getTrips as a,
  createExpense as b,
  createUser as c,
  getExpenseById as d,
  deleteExpense as e,
  getTripSplitGroups as f,
  getUserByEmail as g,
  createTripSplitGroup as h,
  getTripSplitGroupById as i,
  updateTripSplitGroup as j,
  deleteTripSplitGroup as k,
  updateTrip as l,
  createTrip as m,
  getTripById as n,
  deleteTrip as o,
  getExpensesForTrip as p,
  deleteExpenseForTrip as q,
  getUserById as r,
  updateExpense as u
};
