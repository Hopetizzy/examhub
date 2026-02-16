import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question, ExamType, Subject, ExamResult } from '../types';
import { JAMB_SYLLABUS_2025 } from '../data/SyllabusData';
import { getQuestionsForSubject } from '../data/QuestionBank';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export interface GeneratedQuestion extends Question {
    syllabusTopic: string;
}

// Helper to shuffle array
const shuffle = <T>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
};

export const GeminiService = {

    async generatePerformanceAnalysis(result: ExamResult): Promise<string> {
        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            return "AI Analysis unavailable: Missing API Key. Great job on completing the exam! Focus on reviewing your incorrect answers to improve.";
        }

        try {
            const weakList = result.weakAreas.join(", ");
            const prompt = `
                Analyze this student's exam performance:
                - Subject: ${result.examType}
                - Score: ${Math.round(result.score)}%
                - Weak Areas: ${weakList || "None detected"}
                
                Provide a friendly, encouraging 3-sentence summary. 
                First sentence: Comment on the score. 
                Second sentence: Highlight specific areas to improve. If score is under 50%, recommend "Smart Practice Mode" to build confidence before Timed Exams.
                Third sentence: A motivating closing.
                Keep it concise and professional.
            `;

            const resultAI = await model.generateContent(prompt);
            const response = await resultAI.response;
            return response.text();
        } catch (error) {
            console.error("AI Generation Error:", error);
            return "Great job completing your exam! Review your answers to understand your mistakes and improve for next time.";
        }
    },

    async generateQuestions(
        subject: Subject,
        topic: string,
        count: number = 5,
        examType: ExamType = 'JAMB'
    ): Promise<GeneratedQuestion[]> {
        // ... (existing implementation)
        // user requested static DB access instead of AI generation
        // Simulate DB fetch latency
        await new Promise(resolve => setTimeout(resolve, 600));

        let pool = getQuestionsForSubject(subject);

        // Filter by topic if feasible, or just return random mix for "General" if not found
        // In a real app we'd map syllabus "Topic" to QuestionBank "Topic" exactly
        // For now, if we don't have enough specific topic questions, we return mixed subject questions
        const topicMatches = pool.filter(q => q.topic.toLowerCase().includes(topic.toLowerCase()) || q.syllabusTopic.toLowerCase().includes(topic.toLowerCase()));

        const finalPool = topicMatches.length >= 1 ? topicMatches : pool;

        // If completely empty (unsupported subject in bank), return mock fallback
        if (finalPool.length === 0) {
            return Array.from({ length: count }).map((_, i) => ({
                id: `mock-${Date.now()}-${i}`,
                examType,
                subject,
                topic,
                text: `[Coming Soon] Standardized ${subject} Question #${i + 1} on ${topic}.`,
                options: [
                    { id: "a", text: "Option A" },
                    { id: "b", text: "Option B" },
                    { id: "c", text: "Option C" },
                    { id: "d", text: "Option D" }
                ],
                correctOptionId: "a",
                explanation: "This subject is currently being updated in our database.",
                difficulty: "MEDIUM",
                syllabusTopic: topic
            }));
        }

        // Shuffle and slice
        return shuffle(finalPool).slice(0, count).map(q => ({
            ...q,
            syllabusTopic: topic // Ensure it maps back to requested topic for UI consistency
        })) as GeneratedQuestion[];
    },

    async explainConcept(subject: string, topic: string, concept: string) {
        // Service deprecated in favor of static Study Guides
        return null;
    }
};
