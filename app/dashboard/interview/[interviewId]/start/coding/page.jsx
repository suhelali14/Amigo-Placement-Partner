"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CodeEditor from '../_components/CodeEditor';
import { Button } from '@mui/material';
import { Box } from '@chakra-ui/react';

const CodingRoundPage = ({ params }) => {
  const { interviewId } = params;
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [testCases, setTestCases] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (interviewId) {
      axios.get(`/api/interview/${interviewId}/coding-question`)
        .then(response => {
          setQuestion(response.data.question);
          // Filter test cases that are associated with the current question
          const filteredTestCases = response.data.testCases.filter(testCase => testCase.questionId === response.data.question.id);
          setTestCases(filteredTestCases || []);
        }).catch(error => console.error('Error fetching question:', error));
    }
  }, [interviewId]);

  const handleRunCode = async () => {
    try {
      const response = await axios.post(`/api/interview/${interviewId}/run-code`, {
        code,
        testCases,
      });
      setResults(response.data.results);
    } catch (error) {
      console.error('Error running code:', error);
    }
  };

  // Function to clean up the data string (remove surrounding quotes)
  const cleanData = (data) => {
    return data.replace(/^"(.*)"$/, '$1');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {question ? (
        <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
            <h3 className="text-lg font-semibold mb-4">Examples</h3>
            
          </div>
          
          <div className="border-b bg-gray-100 p-4 rounded-lg m-3">
            <h3 className="text-lg font-semibold mb-4">Test Cases</h3>
            {testCases.length > 0 ? (
              <table className="min-w-full bg-white border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-gray-600 uppercase tracking-wider">Test Cases</th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-gray-600 uppercase tracking-wider">Input</th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-gray-600 uppercase tracking-wider">Expected Output</th>
                  </tr>
                </thead>
                <tbody>
                  {testCases.map((testCase, index) => (
                    <tr key={index} className="bg-white border-b border-gray-300">
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-900 border-r border-gray-300 ">Test Case {index + 1}</td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-900 border-r border-gray-300">{cleanData(testCase.input)}</td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-900">{cleanData(testCase.expectedOutput)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">No test cases available.</p>
            )}
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Code Editor</h3>
            <Box minH="60vh" bg="#2d2d30" color="#007acc" px={6} py={8} className="rounded-lg mb-4">
              <CodeEditor />
            </Box>
            <Button variant="contained" color="primary" onClick={handleRunCode} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Submit Code
            </Button>
            {results.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-4">Results</h3>
                <table className="min-w-full bg-white border-collapse border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-gray-600 uppercase tracking-wider">Test Case</th>
                      <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-gray-600 uppercase tracking-wider">Input</th>
                      <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-gray-600 uppercase tracking-wider">Expected Output</th>
                      <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-gray-600 uppercase tracking-wider">Result</th>
                      <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-gray-600 uppercase tracking-wider">Passed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className="bg-white border-b border-gray-300">
                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-900 border-r border-gray-300">Test Case {index + 1}</td>
                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-900 border-r border-gray-300">{cleanData(result.input)}</td>
                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-900 border-r border-gray-300">{cleanData(result.expectedOutput)}</td>
                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-900 border-r border-gray-300">{cleanData(result.result)}</td>
                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-900">{result.passed ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-gray-500">Loading question...</p>
        </div>
      )}
    </div>
  );
};

export default CodingRoundPage;
