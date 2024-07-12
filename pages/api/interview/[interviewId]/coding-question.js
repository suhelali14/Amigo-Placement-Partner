import { codingQuestions, testCases } from '@/utils/codingSchema';
import { db } from '@/utils/db';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  const { interviewId } = req.query;
  const { code } = req.body;

  try {
    // Log the interviewId and code to debug the issue
    console.log('Running code for interviewId:', interviewId);
    console.log('Code:', code);

    // Ensure the interviewId is a string
    if (typeof interviewId !== 'string') {
      throw new Error('Invalid interview ID');
    }

    // Fetch the coding question and test cases for the given interview ID
    const questionPromise = db.select().from(codingQuestions).where(eq(codingQuestions.mockId, interviewId));
    const casesPromise = db.select().from(testCases).where(eq(testCases.mockId, interviewId));

    // Wait for both promises to resolve
    const [questionResult, casesResult] = await Promise.all([questionPromise, casesPromise]);

    // Check if question or cases are empty
    if (questionResult.length === 0 || casesResult.length === 0) {
      return res.status(404).json({ error: 'No coding questions or test cases found for this interview ID' });
    }

    // Return the question, test cases, and examples
    const question = questionResult[0];
    const examples = JSON.parse(question.examples); // Assuming examples are stored as JSON string in the database

    // Prepare the function to evaluate the code with the test cases
    const results = casesResult.map(testCase => {
      const { input, expectedOutput } = testCase;
      let result;
      try {
        result = eval(`(function(solution) { return ${code} })(${input})`);
      } catch (e) {
        result = e.message;
      }
      return { input, expectedOutput, result, passed: result === expectedOutput };
    });

    // Return the question, test cases, examples, and results
    res.status(200).json({ question, testCases: casesResult, examples, results });
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ error: 'Failed to run code' });
  }
}
