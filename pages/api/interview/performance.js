// pages/api/performance.js

import { db } from '@/utils/db';
import { MockInterview, UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  console.log('API handler called');

  if (req.method !== 'GET') {
    console.log('Invalid method');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userEmail } = req.query;
  console.log('userEmail:', userEmail);

  if (!userEmail) {
    console.log('Missing userEmail parameter');
    return res.status(400).json({ error: 'Missing userEmail parameter' });
  }

  try {
    // Fetch mock interviews for the user
    const userMockInterviews = await db.select().from(MockInterview).where(eq(MockInterview.createdBy, userEmail));
    console.log('User Mock Interviews:', userMockInterviews);

    // Fetch all mock interviews
    const allMockInterviews = await db.select().from(MockInterview);
    console.log('All Mock Interviews:', allMockInterviews);

    // Fetch user answers
    const userAnswers = await db.select().from(UserAnswer).where(eq(UserAnswer.userEmail, userEmail));
    console.log('User Answers:', userAnswers);

    // Fetch all answers
    const allAnswers = await db.select().from(UserAnswer);
    console.log('All Answers:', allAnswers);

    // Calculate total and user's interviews and answers
    const totalInterviewsAttended = userMockInterviews.length;
    const totalQuestionsAnswered = userAnswers.length;

    const totalInterviews = allMockInterviews.length;
    const totalQuestions = allAnswers.length;

    const totalRating = userAnswers.reduce((sum, answer) => {
      const rating = parseFloat(answer.rating);
      return sum + (isNaN(rating) ? 0 : rating);
    }, 0);
    const averageRating = totalQuestionsAnswered > 0 ? (totalRating / totalQuestionsAnswered).toFixed(2) : 0;

    // Calculate ratios
    const interviewRatio = totalInterviews > 0 ? (totalInterviewsAttended / totalInterviews).toFixed(2) : 0;
    const answerRatio = totalQuestions > 0 ? (totalQuestionsAnswered / totalQuestions).toFixed(2) : 0;

    res.status(200).json({
      totalInterviewsAttended,
      totalQuestionsAnswered,
      averageRating,
      totalInterviews,
      totalQuestions,
      interviewRatio,
      answerRatio,
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
}
