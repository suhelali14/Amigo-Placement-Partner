import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const codingQuestions = pgTable('coding_questions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  examples: text('examples').notNull(),
  mockId:text('mockId').notNull(),
});

export const testCases = pgTable('test_cases', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id').references(() => codingQuestions.id).notNull(),
  input: text('input').notNull(),
  expectedOutput: text('expected_output').notNull(),
  mockId:text('mockId').notNull(),
});

export const codingRoundResults = pgTable('coding_round_results', {
  id: serial('id').primaryKey(),
  mockId:text('mockId').notNull(),
  score: integer('score').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
