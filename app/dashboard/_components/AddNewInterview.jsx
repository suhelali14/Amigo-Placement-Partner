"use client";
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAIModal';
import { LoaderCircle } from 'lucide-react';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { codingQuestions, testCases } from '@/utils/codingSchema';

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false);
    const [jobPosition, setJobPosition] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [jobExperience, setJobExperience] = useState('');
    const [loading, setLoading] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const router = useRouter();
    const { user } = useUser();

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const extractPdfText = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const maxPages = pdf.numPages;
        let textContent = '';

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map(item => item.str).join(' ') + ' ';
        }

        return textContent;
    };

    const sanitizeJsonResponse = (responseText) => {
        // Remove the code block markers
        let cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '');
    
        // Add commas between properties if they are missing
        cleanedResponse = cleanedResponse.replace(/}\s*{/g, '}, {');
    
        // Add missing commas after each property value
        cleanedResponse = cleanedResponse.replace(/"\s*"/g, '", "');
    
        // Ensure there is a comma after each property
        cleanedResponse = cleanedResponse.replace(/,(?=\s*})/g, '');
    
        // Close the array properly if not done already
        cleanedResponse = cleanedResponse.replace(/}\s*]/g, '}]');
    
        
    
        return cleanedResponse;
    };
    
    
    const cleanAndParseJson = (responseText) => {
        const sanitizedResponse = sanitizeJsonResponse(responseText);
        try {
            // Convert 'None' to null
            const fixedResponse = sanitizedResponse.replace(/: None/g, ': null');
            return JSON.parse(fixedResponse);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            console.error('Sanitized Response:', sanitizedResponse);
            throw error;
        }
    };
    
    
    const onSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
    
        let resumeText = '';
        if (pdfFile) {
            resumeText = await extractPdfText(pdfFile);
        }
    
        const interviewPrompt = `Job position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}, Resume: ${resumeText}, Based on the Job Position, Job Description, Years of Experience, and Resume, provide ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions along with answers in JSON format. Provide question and answer fields in JSON.`;
    
        const codingPrompt = `Job position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}, Resume: ${resumeText}, Based on the Job Position, Job Description, Years of Experience, and Resume, provide 3 coding Data structure and Algorithm questions with answers and test cases in JSON format. Provide question, answer, and test_cases fields in JSON.`;
    
        try {
            // Fetch interview questions
            const interviewResult = await chatSession.sendMessage(interviewPrompt);
            const interviewResponseText = await interviewResult.response.text();
            console.log('Interview Response Text:', interviewResponseText);
            const interviewQuestions = cleanAndParseJson(interviewResponseText);
    
            // Fetch coding questions
            const codingResult = await chatSession.sendMessage(codingPrompt);
            const codingResponseText = await codingResult.response.text();
            console.log('Coding Response Text:', codingResponseText);
            const codingQues = cleanAndParseJson(codingResponseText);
    
            const mockId = uuidv4();
    
            // Save mock interview questions
            const resp = await db.insert(MockInterview)
                .values({
                    mockId: mockId,
                    jsonMockResp: JSON.stringify(interviewQuestions),
                    jobPosition: jobPosition,
                    jobDesc: jobDesc,
                    jobExperience: jobExperience,
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format('DD-MM-yyyy')
                }).returning({ mockId: MockInterview.mockId });
    
            // Save coding questions and test cases
            for (const cq of codingQues) {
                // Insert coding question
                const codingQuestionResp = await db.insert(codingQuestions)
                    .values({
                        mockId: mockId,
                        title: cq.question,
                        description: cq.answer,
                        examples: JSON.stringify(cq.test_cases),
                    }).returning({ id: codingQuestions.id });
    
                const codingQuestionId = codingQuestionResp[0].id;
    
                // Insert test cases
                for (const tc of cq.test_cases) {
                    await db.insert(testCases)
                        .values({
                            mockId: mockId,
                            questionId: codingQuestionId,
                            input: JSON.stringify(tc.input),
                            expectedOutput: JSON.stringify(tc.expected_output || ''),
                        });
                }
            }
    
            setOpenDialog(false);
            router.push('/dashboard/interview/' + resp[0]?.mockId);
    
        } catch (error) {
            console.error('Error handling AI response:', error);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div>
            <div className='p-10 border rounded-lg bg-secondary
                hover:scale-105 hover:shadow-md cursor-pointer
                transition-all border-dashed'
                onClick={() => setOpenDialog(true)}
            >
                <h2 className='text-lg text-center'>+ Add New</h2>
            </div>
            <Dialog open={openDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Tell us more about your job interview</DialogTitle>
                        <DialogDescription>
                            <form onSubmit={onSubmit}>
                                <div>
                                    <h2>Add Details about your job position/role, Job description, years of experience, and upload your resume</h2>

                                    <div className='mt-7 my-3'>
                                        <label>Job Role/Job Position</label>
                                        <Input placeholder="Ex. Full Stack Developer" required
                                            onChange={(event) => setJobPosition(event.target.value)}
                                        />
                                    </div>
                                    <div className='my-3'>
                                        <label>Job Description/ Tech Stack (In Short)</label>
                                        <Textarea placeholder="Ex. React, Angular, NodeJs, MySql etc"
                                            required
                                            onChange={(event) => setJobDesc(event.target.value)} />
                                    </div>
                                    <div className='my-3'>
                                        <label>Years of experience</label>
                                        <Input placeholder="Ex. 5" type="number" max="100"
                                            required
                                            onChange={(event) => setJobExperience(event.target.value)}
                                        />
                                    </div>
                                    <div className='my-3'>
                                        <label>Upload Resume (PDF)</label>
                                        <Input type="file" accept="application/pdf" onChange={handleFileChange} />
                                    </div>
                                </div>
                                <div className='flex gap-5 justify-end'>
                                    <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ?
                                            <>
                                                <LoaderCircle className='animate-spin' /> Generating from AI
                                            </> : 'Start Interview'
                                        }
                                    </Button>
                                </div>
                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AddNewInterview;
