import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  profiles, 
  InsertProfile,
  publications,
  InsertPublication,
  publicationAuthors,
  shares,
  InsertShare,
  comments,
  InsertComment
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
    const values: InsertUser = {
      openId: user.openId,
    };
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

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Profile queries
export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0];
}

export async function getAllActiveProfiles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(profiles).where(eq(profiles.isActive, 1)).orderBy(profiles.displayOrder);
}

export async function upsertProfile(profile: InsertProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getProfileByUserId(profile.userId);
  if (existing) {
    await db.update(profiles).set(profile).where(eq(profiles.userId, profile.userId));
    return getProfileByUserId(profile.userId);
  } else {
    await db.insert(profiles).values(profile);
    return getProfileByUserId(profile.userId);
  }
}

// Publication queries
export async function getAllPublications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publications).orderBy(desc(publications.year));
}

export async function getPublicationsByProfileId(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({ publication: publications })
    .from(publicationAuthors)
    .innerJoin(publications, eq(publicationAuthors.publicationId, publications.id))
    .where(eq(publicationAuthors.profileId, profileId))
    .orderBy(desc(publications.year));
  
  return result.map(r => r.publication);
}

export async function createPublication(publication: InsertPublication, authorProfileIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(publications).values(publication);
  const publicationId = Number(result[0].insertId);
  
  if (authorProfileIds.length > 0) {
    await db.insert(publicationAuthors).values(
      authorProfileIds.map(profileId => ({ publicationId, profileId }))
    );
  }
  
  return publicationId;
}

// Share queries
export async function getAllShares() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shares).orderBy(desc(shares.createdAt));
}

export async function createShare(share: InsertShare) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(shares).values(share);
  return Number(result[0].insertId);
}

// Comment queries
export async function getCommentsByShareId(shareId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comments).where(eq(comments.shareId, shareId)).orderBy(comments.createdAt);
}

export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(comments).values(comment);
  return Number(result[0].insertId);
}
