
import { supabase } from './supabase';
import { Profile, ExamHistoryItem } from '../types';
import { calculateReadiness } from './ExamService';

export const AdminService = {
    // Get all users with basic info
    async getAllUsers() {
        // We select from profiles.
        // In a real app we might paginate or filter.
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("AdminService.getAllUsers Error:", error);
            throw error;
        }
        return data as Profile[];
    },

    // Toggle Free Access
    async toggleFreeAccess(userId: string, status: boolean) {
        const { error } = await supabase
            .from('profiles')
            .update({ has_free_access: status })
            .eq('id', userId);

        if (error) throw error;
    },

    // Get System Stats (Aggregated)
    async getSystemStats() {
        // This is a bit expensive if we count *all* rows, but fine for MVP.
        const { count: userCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        const { count: examCount } = await supabase
            .from('exam_results')
            .select('*', { count: 'exact', head: true });

        // Calculate Revenue (mocked or aggregated from payments table)
        const { data: payments } = await supabase
            .from('payments') // Assuming a payments table exists or we add one later
            .select('amount');

        const revenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        // Recent Activity
        const { data: recentUsers } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        return {
            totalUsers: userCount || 0,
            totalExams: examCount || 0,
            totalRevenue: revenue,
            recentUsers: recentUsers || []
        };
    },

    // Get Tutor Analytics
    async getTutorAnalytics() {
        // 1. Get all Tutors
        const { data: tutors, error: tutorError } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'tutor');

        if (tutorError) throw tutorError;

        // 2. Get all Students linked to any tutor
        const { data: students, error: studentError } = await supabase
            .from('profiles')
            .select('id, tutor_id')
            .eq('role', 'student')
            .not('tutor_id', 'is', null);

        if (studentError) throw studentError;

        // 3. Get Exam Results for these students (to calc readiness)
        const studentIds = students.map(s => s.id);
        const { data: results, error: resultError } = await supabase
            .from('exam_results')
            .select('user_id, score, total_questions, created_at, subjects, weak_areas, exam_type, mode, accuracy')
            .in('user_id', studentIds);

        if (resultError) throw resultError;

        // 4. Process Data
        const studentStats: Record<string, number> = {}; // studentId -> readiness

        // Group results by student to calc individual readiness first
        const resultsByStudent: Record<string, any[]> = {};
        results?.forEach(r => {
            if (!resultsByStudent[r.user_id]) resultsByStudent[r.user_id] = [];
            resultsByStudent[r.user_id].push({
                id: 'temp', // minimal mock for calc
                date: r.created_at,
                examType: r.exam_type,
                mode: r.mode,
                score: r.score,
                total: r.total_questions,
                accuracy: r.accuracy,
                subjects: r.subjects || [],
                weakAreas: r.weak_areas || []
            } as ExamHistoryItem);
        });

        Object.keys(resultsByStudent).forEach(studentId => {
            const history = resultsByStudent[studentId];
            studentStats[studentId] = calculateReadiness(history).total;
        });

        // Map Tutors
        return tutors.map(tutor => {
            const myStudents = students.filter(s => s.tutor_id === tutor.id);
            const myStudentIds = myStudents.map(s => s.id);

            const totalReadiness = myStudentIds.reduce((sum, skid) => sum + (studentStats[skid] || 0), 0);
            const avgReadiness = myStudentIds.length > 0 ? Math.round(totalReadiness / myStudentIds.length) : 0;

            return {
                ...tutor,
                studentCount: myStudents.length,
                avgReadiness: avgReadiness,
                plan: 'Standard' // Placeholder until we link subscription table
            };
        });
    },

    // Get Analytics Data for Charts
    async getAnalyticsData() {
        // 1. User Growth (Last 6 Months)
        // Fetch all users created_at
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('created_at');

        if (userError) throw userError;

        // Group by Month
        const growthMap: Record<string, number> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize last 6 months
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = months[d.getMonth()];
            growthMap[key] = 0;
        }

        users.forEach(u => {
            const d = new Date(u.created_at);
            const key = months[d.getMonth()];
            // Only count if it's in our map (last 6 months roughly, or just all time mapped to months)
            // For simplicity, let's just map all time to months to show total volume per month
            if (growthMap[key] !== undefined) {
                growthMap[key]++;
            } else if (d.getFullYear() === today.getFullYear()) {
                // If it's this year but not in the initialized last 6 months (unlikely if logic correct)
                // Let's just use the month name.
                growthMap[key] = (growthMap[key] || 0) + 1;
            }
        });

        const growthData = Object.keys(growthMap).map(name => ({ name, users: growthMap[name] }));

        // 2. Exam Activity (Last 7 Days)
        const { data: exams, error: examError } = await supabase
            .from('exam_results')
            .select('created_at')
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

        if (examError) throw examError;

        const activityMap: Record<string, number> = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Init last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = days[d.getDay()];
            activityMap[key] = 0;
        }

        exams?.forEach(e => {
            const d = new Date(e.created_at);
            const key = days[d.getDay()];
            if (activityMap[key] !== undefined) activityMap[key]++;
        });

        const examData = Object.keys(activityMap).map(name => ({ name, exams: activityMap[name] }));

        // Sort examData by day order relative to today? 
        // Or just returned standard days. The map iteration order is not guaranteed, so let's sort via the init loop order if strict.
        // Re-mapping based on days array order for consistency? 
        // Actually, the keys loop might shuffle. Let's force order.
        const sortedExamData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = days[d.getDay()];
            sortedExamData.push({ name: key, exams: activityMap[key] });
        }

        return { growthData, examData: sortedExamData };
    }
};
