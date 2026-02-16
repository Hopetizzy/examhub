import { supabase } from './supabase';
import { ExamResult, DashboardData, ExamHistoryItem, ReadinessScore, ExamSession, ExamType, ExamMode } from '../types';
import { MOCK_QUESTIONS } from '../constants'; // Fallback for questions until QuestionService is fully used everywhere?
import { QuestionService } from './QuestionService';

// Helper to calculate readiness (Ported from mockService)
export const calculateReadiness = (history: ExamHistoryItem[]): ReadinessScore => {
    if (history.length === 0) {
        return {
            total: 0,
            label: 'Not Ready',
            breakdown: { accuracy: 0, mastery: 0, speed: 0, consistency: 0 }
        };
    }

    const accuracy = history.reduce((acc, curr) => acc + curr.accuracy, 0) / history.length;
    // Simple Mastery Logic: Increases with number of exams taken, capped at 100
    const mastery = Math.min(100, (history.length * 5));

    // Speed: Placeholder logic, could be refined based on time vs questions
    const speed = 75;

    // Consistency: Placeholder
    const consistency = history.length > 2 ? 80 : 40;

    const total = (accuracy * 0.4) + (mastery * 0.3) + (speed * 0.2) + (consistency * 0.1);

    let label: ReadinessScore['label'] = 'Not Ready';
    if (total >= 80) label = 'Exam Ready';
    else if (total >= 60) label = 'Almost Ready';
    else if (total >= 40) label = 'Fair';

    return {
        total: Math.round(total),
        label,
        breakdown: {
            accuracy: Math.round(accuracy),
            mastery: Math.round(mastery),
            speed,
            consistency
        }
    };
};

export const ExamService = {

    // Start Exam: wrapper to reuse QuestionService
    // In a real app, this might create a "Session" record in DB.
    // For now, we keep session local but fetch questions from DB.
    async startExam(config: any): Promise<ExamSession> {
        // Fetch questions from DB
        let allQuestions = [];
        const countPerSubject = Math.max(5, Math.floor(40 / (config.subjects.length || 1)));

        if (config.subjects.length > 0) {
            for (const subject of config.subjects) {
                const qs = await QuestionService.getQuestions(subject, '', countPerSubject, config.examType);
                allQuestions.push(...qs);
            }
        } else {
            // Fallback if no subjects selected (shouldn't happen in UI)
            allQuestions = await QuestionService.getQuestions('Mathematics', '', 10, config.examType);
        }

        // Shuffle
        allQuestions.sort(() => Math.random() - 0.5);

        return {
            id: `SESSION-${Date.now()}`,
            examType: config.examType,
            mode: config.mode,
            config,
            startTime: Date.now(),
            durationMinutes: config.durationMinutes || (config.mode === 'TIMED' ? 120 : 60),
            questions: allQuestions,
            answers: {},
            isSubmitted: false
        };
    },

    // Save Exam Result to DB
    async saveExamResult(session: ExamSession): Promise<ExamResult> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Calculate Score
        let correct = 0;
        session.questions.forEach(q => {
            if (session.answers[q.id] === q.correctOptionId) correct++;
        });
        const accuracy = session.questions.length > 0 ? (correct / session.questions.length) * 100 : 0;
        const timeSpentSeconds = (Date.now() - session.startTime) / 1000;

        const subjects = Array.from(new Set(session.questions.map(q => q.subject)));

        // Identify Weak Areas: Topics where user got < 50%
        const topicPerformance: Record<string, { total: number, correct: number }> = {};
        session.questions.forEach(q => {
            if (!topicPerformance[q.topic]) topicPerformance[q.topic] = { total: 0, correct: 0 };
            topicPerformance[q.topic].total++;
            if (session.answers[q.id] === q.correctOptionId) topicPerformance[q.topic].correct++;
        });

        const weakAreas = Object.keys(topicPerformance).filter(topic => {
            const perf = topicPerformance[topic];
            return (perf.correct / perf.total) < 0.5;
        });

        const topicBreakdown = Object.entries(topicPerformance).map(([topic, stats]) => ({
            topic,
            correct: stats.correct,
            total: stats.total
        }));

        // DB Insert
        const dbPayload = {
            user_id: user.id,
            exam_type: session.examType,
            mode: session.mode,
            score: accuracy, // We store percentage score in 'score' column for compatibility? Or raw? Schema defaults to 0. Let's assume percentage for now or fix schema. Schema says 'numeric'.
            total_questions: session.questions.length,
            accuracy: accuracy,
            time_spent_seconds: Math.round(timeSpentSeconds),
            subjects: subjects,
            topic_breakdown: topicBreakdown,
            weak_areas: weakAreas,
            recommendation: accuracy > 70 ? "Excellent work!" : "Review the weak topics below.",
            session_data: session // Save full session for review
            // readiness_contribution: calculated later
        };

        const { data, error } = await supabase
            .from('exam_results')
            .insert(dbPayload)
            .select()
            .single();

        if (error) {
            console.error("Failed to save exam result:", error);
            throw error;
        }

        // Return formatted ExamResult
        // Note: We need to get history to map Readiness properly, or just return partial.
        // Dashboard will refresh anyway.
        return {
            id: data.id,
            date: data.created_at,
            examType: data.exam_type,
            mode: data.mode,
            score: data.score,
            totalQuestions: data.total_questions,
            accuracy: data.accuracy,
            timeSpentSeconds: data.time_spent_seconds,
            readinessContribution: { total: 0, label: 'Not Ready', breakdown: { accuracy: 0, mastery: 0, speed: 0, consistency: 0 } }, // Placeholder
            topicBreakdown: data.topic_breakdown,
            weakAreas: data.weak_areas,
            recommendation: data.recommendation
        };
    },

    // Get Dashboard Data (Stats + History)
    async getDashboardData(userId: string): Promise<DashboardData> {
        const { data, error } = await supabase
            .from('exam_results')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching dashboard data:", error);
            throw error;
        }

        const history: ExamHistoryItem[] = (data || []).map(row => ({
            id: row.id,
            date: row.created_at,
            examType: row.exam_type,
            mode: row.mode,
            score: row.score,
            total: row.total_questions,
            accuracy: row.accuracy,
            subjects: row.subjects || [],
            weakAreas: row.weak_areas || []
        }));

        // Calculate Stats
        const readinessScore = calculateReadiness(history);
        const totalExams = history.length;
        const averageScore = totalExams > 0 ? history.reduce((sum, h) => sum + h.accuracy, 0) / totalExams : 0;
        const bestScore = totalExams > 0 ? Math.max(...history.map(h => h.accuracy)) : 0;
        const timeSpentMinutes = totalExams > 0 ? Math.round(data.reduce((sum, row) => sum + (row.time_spent_seconds || 0), 0) / 60) : 0;

        // Weak Topic Analysis
        const failureMap: Record<string, number> = {};
        history.forEach(exam => {
            exam.weakAreas.forEach(topic => {
                failureMap[topic] = (failureMap[topic] || 0) + 1;
            });
        });

        const weakTopicAnalysis = Object.entries(failureMap)
            .map(([topic, count]) => ({ topic, failureCount: count }))
            .sort((a, b) => b.failureCount - a.failureCount);

        return {
            stats: {
                totalExams,
                averageScore,
                bestScore,
                timeSpentMinutes,
                readinessScore
            },
            recentActivity: history,
            weakTopicAnalysis
        };
    },
    // Get Single Exam Result
    async getResultById(id: string): Promise<ExamResult | null> {
        // console.log(`[ExamService] Querying Supabase for result: ${id}`);
        const { data, error } = await supabase
            .from('exam_results')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("[ExamService] Supabase Error:", error);
            return null;
        }

        if (!data) {
            console.error("[ExamService] No data returned for ID:", id);
            return null;
        }

        // console.log(`[ExamService] Found result found:`, data.id);

        return {
            id: data.id,
            date: data.created_at,
            examType: data.exam_type,
            mode: data.mode,
            score: data.score,
            totalQuestions: data.total_questions,
            accuracy: data.accuracy,
            timeSpentSeconds: data.time_spent_seconds,
            readinessContribution: { total: 0, label: 'Not Ready', breakdown: { accuracy: 0, mastery: 0, speed: 0, consistency: 0 } },
            topicBreakdown: data.topic_breakdown || [],
            weakAreas: data.weak_areas || [],
            recommendation: data.recommendation,
            sessionData: data.session_data // Map from DB column
        };
    },
};
