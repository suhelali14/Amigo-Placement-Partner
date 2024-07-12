import { codingQuestions, testCases } from '@/utils/codingSchema';
import { db } from '@/lib/db';

export default async function handler(req, res) {
  const { interviewId } = req.query;

  try {
    const question = await db.select().from(codingQuestions).where({ id: interviewId }).first();
    const cases = await db.select().from(testCases).where({ questionId: interviewId });

    res.status(200).json({ question, testCases: cases });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coding question' });
  }
}
