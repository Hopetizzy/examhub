import { supabase } from './supabase';
import { TutorStudent, Profile, ExamHistoryItem } from '../types';
import { calculateReadiness } from './ExamService';

export const tutorService = {
    // Fetch students linked to the tutor
    async getStudents(tutorId: string): Promise<TutorStudent[]> {
        // 1. Get Profiles
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('tutor_id', tutorId)
            .eq('role', 'student');

        if (profileError) {
            console.error('Error fetching students:', profileError);
            throw profileError;
        }

        if (!profiles || profiles.length === 0) return [];

        // 2. Get Exam Results for these students
        // We can do an `in` query.
        const studentIds = profiles.map(p => p.id);
        const { data: results, error: resultError } = await supabase
            .from('exam_results')
            .select('*')
            .in('user_id', studentIds);

        if (resultError) {
            console.error('Error fetching student results:', resultError);
            // Fail gracefully? Or throw? Let's log and proceed with empty results.
        }

        const statsByStudent: Record<string, any> = {};

        // Group results by student
        (results || []).forEach((r: any) => {
            if (!statsByStudent[r.user_id]) statsByStudent[r.user_id] = [];
            statsByStudent[r.user_id].push({
                id: r.id,
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

        // Map to TutorStudent
        return profiles.map((p: any) => {
            const history: ExamHistoryItem[] = statsByStudent[p.id] || [];
            const readiness = calculateReadiness(history);

            // Collect all unique weak topics
            const allWeakTopics = new Set<string>();
            history.forEach(h => h.weakAreas.forEach(w => allWeakTopics.add(w)));

            // Last Active
            const lastExamDate = history.length > 0
                ? new Date(Math.max(...history.map(h => new Date(h.date).getTime())))
                : new Date(p.created_at);

            return {
                id: p.id,
                name: `${p.full_name || ''} ${p.surname || ''}`.trim(),
                email: p.email,
                readinessScore: readiness.total,
                totalExams: history.length,
                lastActive: lastExamDate.toLocaleDateString(),
                weakTopics: Array.from(allWeakTopics)
            };
        });
    },

    // Bulk register students via Edge Function
    async bulkRegister(tutorId: string, students: any[]) {
        // We invoke a Supabase Edge Function because creating users (Auth) requires admin privileges
        // which cannot be safely done from the client.
        const { data, error } = await supabase.functions.invoke('tutor-bulk-register', {
            body: { tutorId, students },
        });

        if (error) {
            console.error('Bulk registration failed:', error);
            throw error;
        }

        return data;
    },

    // Manual register single student
    async registerStudent(tutorId: string, student: { name: string; email: string }) {
        // Re-use bulk logic for simplicity, or separate if needed.
        // For a single student, we just wrap in an array.
        const names = student.name.split(' ');
        const surname = names.pop() || '';
        const full_name = names.join(' ');

        return this.bulkRegister(tutorId, [{
            email: student.email,
            surname: surname,
            full_name: full_name // Basic split, can be improved
        }]);
    },

    // Assign work using the AssignmentService
    async assignWork(tutorId: string, studentIds: string[], config: any, options?: any) {
        try {
            await Promise.all(studentIds.map(studentId =>
                import('./AssignmentService').then(m =>
                    m.assignmentService.createAssignment(tutorId, studentId, config, options)
                )
            ));
            return true;
        } catch (error) {
            console.error("Failed to assign work:", error);
            throw error;
        }
    },

    // Upgrade Subscription (MVP: Client-side update after payment verification)
    async upgradeSubscription(tutorId: string, planId: string, maxStudents: number) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 Month validity

        const { error } = await supabase
            .from('profiles')
            .update({
                subscription_plan_id: planId,
                max_students: maxStudents,
                subscription_expiry: expiryDate.toISOString(),
                subscription_status: 'active'
            })
            .eq('id', tutorId);

        if (error) {
            console.error("Failed to upgrade subscription:", error);
            throw error;
        }

        return { success: true };
    },

    // Send Performance Reminder
    async sendPerformanceReminder(tutorId: string, studentId: string) {
        // Create a notification for the student
        await import('./NotificationService').then(m =>
            m.notificationService.createNotification(
                studentId,
                "Performance Reminder",
                "Your tutor has noticed a dip in your performance. Please review your recent weak topics.",
                "WARNING"
            )
        );

        // console.log(`[TutorService] Reminder sent to ${studentId}`);
        return { success: true };
    },

    // Send Bulk Email (Simulated via Notifications for now)
    async sendBulkEmail(tutorId: string, studentIds: string[], subject: string, message: string) {
        // In a real app, this would trigger an email. Here we also add a dashboard notification.
        const notificationService = await import('./NotificationService').then(m => m.notificationService);

        // Parallel execution for speed
        await Promise.all(studentIds.map(studentId =>
            notificationService.createNotification(
                studentId,
                subject,
                message,
                "INFO",
                undefined, // link
                { isPopup: true } // metadata

            )
        ));

        // console.log(`[TutorService] Bulk notification sent to ${studentIds.length} students`);
        return { success: true };
    },

    // Export all student data
    async exportStudentData(tutorId: string) {
        return this.getStudents(tutorId);
    },

    // Invite Sub-Admin
    async inviteSubAdmin(tutorId: string, admin: { name: string; email: string; role: 'ADMIN' | 'VIEWER' }) {
        // We use the bulk register function but pass role='tutor' (since they need tutor dashboard access)
        // We can store their specific permission 'ADMIN' vs 'VIEWER' in metadata or handled via RLS later.
        // For now, we make them a 'tutor'.
        const names = admin.name.split(' ');
        const surname = names.pop() || 'Admin';
        const full_name = names.join(' ').trim() || admin.name;

        // Call the edge function
        const { data, error } = await supabase.functions.invoke('tutor-bulk-register', {
            body: {
                tutorId,
                students: [{
                    email: admin.email,
                    surname: surname, // Used as password
                    full_name: full_name,
                    role: 'tutor' // They are a tutor/admin user
                }]
            },
        });

        if (error) {
            console.error('Invite sub-admin failed:', error);
            throw error;
        }

        return data;
    },

    // Get Sub-Admins
    async getSubAdmins(tutorId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('tutor_id', tutorId)
            .eq('role', 'tutor');

        if (error) {
            console.error('Failed to get sub-admins:', error);
            return [];
        }

        return data.map((p: any) => ({
            id: p.id,
            name: p.full_name,
            email: p.email,
            role: 'ADMIN', // Defaulting to ADMIN for now
            status: 'ACTIVE',
            lastActive: new Date(p.created_at).toLocaleDateString()
        }));
    }
};
