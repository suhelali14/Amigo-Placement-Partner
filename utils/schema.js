import { pgTable, serial, text, varchar, integer } from "drizzle-orm/pg-core";

export const MockInterview = pgTable('mockInterview', {
  id: serial('id').primaryKey(),
  jsonMockResp: text('jsonMockResp').notNull(),
  jobPosition: varchar('jobPosition').notNull(),
  jobDesc: varchar('jobDesc').notNull(),
  jobExperience: varchar('jobExperience').notNull(),
  createdBy: varchar('createdBy').notNull(),
  createdAt: varchar('createdAt'),
  mockId: varchar('mockId').notNull()
});

export const UserAnswer = pgTable('userAnswer', {
  id: serial('id').primaryKey(),
  mockIdRef: varchar('mockId').notNull(),
  question: varchar('question').notNull(),
  correctAns: text('correctAns'),
  userAns: text('userAns'),
  feedback: text('feedback'),
  rating: varchar('rating'),
  userEmail: varchar('userEmail'),
  createdAt: varchar('createdAt'),
});

export const Leaderboard = pgTable('leaderboard', {
  id: serial('id').primaryKey(),
  userEmail: varchar('userEmail').notNull().unique(),
  interviewsGiven: integer('interviewsGiven').notNull().default(0),
  answersGiven: integer('answersGiven').notNull().default(0),
  totalRating: integer('totalRating').notNull().default(0),
  efficiency: integer('efficiency').notNull().default(0),
});
