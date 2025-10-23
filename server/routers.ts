import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Profile management
  profile: router({
    // Get current user's profile
    me: protectedProcedure.query(async ({ ctx }) => {
      return db.getProfileByUserId(ctx.user.id);
    }),

    // Get all active profiles (public)
    list: publicProcedure.query(async () => {
      return db.getAllActiveProfiles();
    }),

    // Get profile by ID (public)
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const allProfiles = await db.getAllActiveProfiles();
        return allProfiles.find(p => p.id === input.id);
      }),

    // Update own profile
    update: protectedProcedure
      .input(z.object({
        fullName: z.string().min(1),
        title: z.string().optional(),
        bio: z.string().optional(),
        researchInterests: z.string().optional(),
        githubUrl: z.string().optional(),
        scholarUrl: z.string().optional(),
        linkedinUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        
        if (!profile) {
          // Create new profile
          return db.upsertProfile({
            userId: ctx.user.id,
            ...input,
          });
        } else {
          // Update existing profile
          return db.upsertProfile({
            ...profile,
            ...input,
          });
        }
      }),

    // Upload avatar
    uploadAvatar: protectedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
        data: z.string(), // base64
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.data, 'base64');
        const fileKey = `avatars/${ctx.user.id}-${Date.now()}.${input.filename.split('.').pop()}`;
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (profile) {
          await db.upsertProfile({
            ...profile,
            avatarUrl: url,
          });
        }
        
        return { url };
      }),

    // Upload CV
    uploadCV: protectedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
        data: z.string(), // base64
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.data, 'base64');
        const fileKey = `cvs/${ctx.user.id}-${Date.now()}.pdf`;
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (profile) {
          await db.upsertProfile({
            ...profile,
            cvUrl: url,
          });
        }
        
        return { url };
      }),
  }),

  // Publication management
  publication: router({
    // Get all publications (public)
    list: publicProcedure.query(async () => {
      return db.getAllPublications();
    }),

    // Get publications by profile ID (public)
    byProfile: publicProcedure
      .input(z.object({ profileId: z.number() }))
      .query(async ({ input }) => {
        return db.getPublicationsByProfileId(input.profileId);
      }),

    // Create publication (admin only)
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        authors: z.string().min(1),
        journalOrConference: z.string().min(1),
        year: z.number(),
        doiUrl: z.string().optional(),
        pdfUrl: z.string().optional(),
        authorProfileIds: z.array(z.number()).default([]),
      }))
      .mutation(async ({ input }) => {
        const { authorProfileIds, ...publicationData } = input;
        const publicationId = await db.createPublication(publicationData, authorProfileIds);
        return { id: publicationId };
      }),
  }),

  // Share management (internal only)
  share: router({
    // Get all shares (protected)
    list: protectedProcedure.query(async () => {
      return db.getAllShares();
    }),

    // Create share
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        type: z.enum(["paper", "blog", "slides", "other"]),
        url: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const shareId = await db.createShare({
          ...input,
          createdBy: ctx.user.id,
        });
        return { id: shareId };
      }),

    // Upload file for share
    uploadFile: protectedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
        data: z.string(), // base64
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.data, 'base64');
        const fileKey = `shares/${ctx.user.id}-${Date.now()}-${input.filename}`;
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        return { url };
      }),

    // Get comments for a share
    getComments: protectedProcedure
      .input(z.object({ shareId: z.number() }))
      .query(async ({ input }) => {
        return db.getCommentsByShareId(input.shareId);
      }),

    // Add comment
    addComment: protectedProcedure
      .input(z.object({
        shareId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const commentId = await db.createComment({
          ...input,
          createdBy: ctx.user.id,
        });
        return { id: commentId };
      }),
  }),

  // Admin management
  admin: router({
    // Get all users (admin only)
    listUsers: adminProcedure.query(async () => {
      const db_instance = await db.getDb();
      if (!db_instance) return [];
      const { users } = await import("../drizzle/schema");
      return db_instance.select().from(users);
    }),

    // Update user role (admin only)
    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "user"]),
      }))
      .mutation(async ({ input }) => {
        const db_instance = await db.getDb();
        if (!db_instance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db_instance.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

