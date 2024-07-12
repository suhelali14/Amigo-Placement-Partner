export default async function handler(req, res) {
  const { code, testCases } = req.body;

  const results = testCases.map(testCase => {
    const input = JSON.parse(testCase.input);
    const expectedOutput = testCase.expectedOutput;

    // This is a simplified version. Use a safer method to run code.
    const output = eval(`(function() { ${code} return solution(${JSON.stringify(input)}); })()`);

    return {
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      output,
      passed: output === expectedOutput,
    };
  });

  res.status(200).json({ results });
}
