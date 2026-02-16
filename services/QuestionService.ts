
import { supabase } from './supabase';
import { Question, Subject, ExamType } from '../types';
import { toast } from 'sonner';

export const QuestionService = {

    // Fetch random questions for exam
    async getQuestions(
        subject: Subject,
        topic: string, // if empty, random across subject
        count: number = 5,
        examType: ExamType = 'JAMB'
    ): Promise<Question[]> {

        let query = supabase
            .from('questions')
            .select('*')
            .eq('exam_type', examType)
            .eq('subject', subject);

        if (topic && topic !== 'General') {
            // Only filter by topic if it's not a generic request
            query = query.ilike('topic', `%${topic}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching questions:", error);
            return [];
        }

        if (!data) return [];

        // Map DB rows to Question type
        const mappedQuestions: Question[] = data.map(row => ({
            id: row.id,
            examType: row.exam_type as ExamType,
            subject: row.subject as Subject,
            topic: row.topic,
            syllabusTopic: row.sub_topic, // Mapping sub_topic to syllabusTopic
            difficulty: row.difficulty,
            text: row.content.text,
            options: row.content.options,
            correctOptionId: row.content.correctOptionId,
            explanation: row.content.explanation
        }));

        // Deduplicate logic: Keep only unique question texts (normalize whitespace)
        const uniqueQuestions = Array.from(new Map(mappedQuestions.map(q => [
            q.text.replace(/\s+/g, ' ').trim().toLowerCase(),
            q
        ])).values());

        // Shuffle and slice
        return uniqueQuestions.sort(() => 0.5 - Math.random()).slice(0, count);
    },

    // Admin: Bulk Upload
    async bulkUploadQuestions(questions: Partial<Question>[]): Promise<{ success: boolean, count: number, error?: any }> {
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) return { success: false, count: 0, error: 'Unauthorized' };

        // Transform to DB format
        // Expecting questions to have flat structure or already be shaped. 
        // The CSV parser we'll write in AdminDashboard will shape them.

        const dbRows = questions.map(q => ({
            exam_type: q.examType,
            subject: q.subject,
            topic: q.topic,
            sub_topic: q.syllabusTopic,
            difficulty: q.difficulty || 'MEDIUM',
            content: {
                text: q.text,
                options: q.options,
                correctOptionId: q.correctOptionId,
                explanation: q.explanation
            }
        }));

        const { data, error } = await supabase.from('questions').insert(dbRows).select();

        if (error) {
            console.error("Bulk upload error:", error);
            // Return the full error object so the UI can show the message/details
            return { success: false, count: 0, error };
        }

        return { success: true, count: data?.length || 0 };
    },

    // Admin: Get All Questions (Paginated)
    async getAllQuestions(page: number = 0, limit: number = 20, subjectFilter?: string, examTypeFilter?: string) {
        let query = supabase
            .from('questions')
            .select('*', { count: 'exact' })
            .range(page * limit, (page + 1) * limit - 1)
            .order('created_at', { ascending: false });

        if (subjectFilter) {
            query = query.eq('subject', subjectFilter);
        }

        if (examTypeFilter) {
            query = query.eq('exam_type', examTypeFilter);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        const questions: Question[] = (data || []).map(row => ({
            id: row.id,
            examType: row.exam_type as ExamType,
            subject: row.subject as Subject,
            topic: row.topic,
            syllabusTopic: row.sub_topic,
            difficulty: row.difficulty,
            text: row.content.text,
            options: row.content.options,
            correctOptionId: row.content.correctOptionId,
            explanation: row.content.explanation
        }));

        return { questions, total: count || 0 };
    },

    // Admin: Delete
    async deleteQuestion(id: string) {
        return await supabase.from('questions').delete().eq('id', id);
    },

    // Admin: Update
    async updateQuestion(id: string, updates: Partial<Question>) {
        const dbRow: any = {};
        if (updates.examType) dbRow.exam_type = updates.examType;
        if (updates.subject) dbRow.subject = updates.subject;
        if (updates.topic) dbRow.topic = updates.topic;
        if (updates.syllabusTopic) dbRow.sub_topic = updates.syllabusTopic;
        if (updates.difficulty) dbRow.difficulty = updates.difficulty;

        if (updates.text || updates.options) {
            dbRow.content = {
                text: updates.text, // Will use existing if not provided, ideally we fetch first but for now assuming partial updates might be risky if not careful.
                // Actually, looking at usages, we usually pass full object.
                // But to be safe, if we are doing partial, we might overwrite content.
                // Let's assume the UI sends the full object for content fields.
                options: updates.options,
                correctOptionId: updates.correctOptionId,
                explanation: updates.explanation
            };

            // Clean undefined
            if (!dbRow.content.text) delete dbRow.content.text;
            if (!dbRow.content.options) delete dbRow.content.options;
        }

        return await supabase.from('questions').update(dbRow).eq('id', id);
    },

    // Check availability
    async hasQuestions(examType: string, subject: string): Promise<boolean> {
        // console.log(`[QuestionService] Checking availability for ${examType} - ${subject}`);
        const { count, error } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('exam_type', examType)
            .eq('subject', subject);

        if (error) {
            console.error("Check questions error", error);
            return false;
        }

        // console.log(`[QuestionService] Result for ${subject}: ${count}`);
        return (count || 0) > 0;
    }
};
