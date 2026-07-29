import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  collections, type Collection, type InsertCollection,
  echoes, type Echo, type InsertEcho,
  insightSnapshots, type InsightSnapshot, type InsertInsightSnapshot,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Collections ───

export async function getCollectionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(collections).where(eq(collections.userId, userId));
}

export async function createCollection(data: InsertCollection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(collections).values(data).$returningId();
  return { ...data, id: result[0]?.id, createdAt: new Date() };
}

export async function deleteCollection(collectionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(collections).where(
    and(eq(collections.id, collectionId), eq(collections.userId, userId))
  );
}

// ─── Echoes ───

export async function createEcho(data: InsertEcho) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(echoes).values(data).$returningId();
  return { ...data, id: result[0]?.id, createdAt: new Date() } as Echo;
}

export async function getEchoById(echoId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(echoes)
    .where(and(eq(echoes.id, echoId), eq(echoes.userId, userId)))
    .limit(1);
  return result[0];
}

export async function getEchoesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(echoes)
    .where(eq(echoes.userId, userId))
    .orderBy(desc(echoes.createdAt));
}

export async function getRecentEchoes(userId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(echoes)
    .where(eq(echoes.userId, userId))
    .orderBy(desc(echoes.createdAt))
    .limit(limit);
}

export async function getEchoesByMode(userId: number, mode: 'vault' | 'future_self') {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(echoes)
    .where(and(eq(echoes.userId, userId), eq(echoes.mode, mode)))
    .orderBy(desc(echoes.createdAt));
}

export async function getEchoesByCollection(collectionId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(echoes)
    .where(and(eq(echoes.collectionId, collectionId), eq(echoes.userId, userId)))
    .orderBy(desc(echoes.createdAt));
}

export async function updateEcho(echoId: number, userId: number, updates: Partial<InsertEcho>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Record<string, unknown> = {};
  if (updates.mood !== undefined) updateSet.mood = updates.mood;
  if (updates.collectionId !== undefined) updateSet.collectionId = updates.collectionId;
  if (updates.title !== undefined) updateSet.title = updates.title;
  if (updates.ambience !== undefined) updateSet.ambience = updates.ambience;
  if (updates.transcript !== undefined) updateSet.transcript = updates.transcript;
  if (updates.audioUrl !== undefined) updateSet.audioUrl = updates.audioUrl;
  if (updates.encryptedAudioKey !== undefined) updateSet.encryptedAudioKey = updates.encryptedAudioKey;
  if (updates.encrypted !== undefined) updateSet.encrypted = updates.encrypted;

  if (Object.keys(updateSet).length === 0) return;

  await db.update(echoes).set(updateSet as any)
    .where(and(eq(echoes.id, echoId), eq(echoes.userId, userId)));
}

// ─── Insights ───

export async function getInsightByUserIdAndPeriod(userId: number, periodMonth: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(insightSnapshots)
    .where(and(eq(insightSnapshots.userId, userId), eq(insightSnapshots.periodMonth, periodMonth)))
    .limit(1);
  return result[0];
}

export async function createOrUpdateInsight(data: InsertInsightSnapshot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(insightSnapshots).values(data).onDuplicateKeyUpdate({
    set: {
      topWords: data.topWords,
      avgDurationSec: data.avgDurationSec,
      generatedObservation: data.generatedObservation,
    }
  }).$returningId();
  return { ...data, id: result[0]?.id, createdAt: new Date() };
}

export async function getUserInsights(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(insightSnapshots)
    .where(eq(insightSnapshots.userId, userId))
    .orderBy(desc(insightSnapshots.periodMonth));
}

// ─── Export ───

export async function getAllUserData(userId: number) {
  const db = await getDb();
  if (!db) return { echoes: [], collections: [] };
  const [userEchoes, userCollections] = await Promise.all([
    db.select().from(echoes).where(eq(echoes.userId, userId)),
    db.select().from(collections).where(eq(collections.userId, userId)),
  ]);
  return { echoes: userEchoes, collections: userCollections };
}

// ─── Future Self unlock check (server-computed) ───

export function computeIsUnlocked(echo: Echo): boolean {
  if (echo.mode !== 'future_self') return true;
  if (!echo.unlockDate) return true;
  const now = new Date();
  const unlockDate = new Date(echo.unlockDate);
  return now >= unlockDate;
}
