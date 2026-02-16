import { supabase } from './supabase';
import { Assignment, ExamConfig } from '../types';
import { notificationService } from './NotificationService';

export const assignmentService = {
    // Create an assignment for a student
    async createAssignment(tutorId: string, studentId: string, config: ExamConfig, options?: { deadline?: string, durationMinutes?: number }): Promise<Assignment> {
        const { data, error } = await supabase
            .from('assignments')
            .insert({
                tutor_id: tutorId,
                student_id: studentId,
                config: config,
                status: 'PENDING',
                deadline: options?.deadline,
                duration_minutes: options?.durationMinutes
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating assignment:', error);
            throw error;
        }

        // Notify Student
        await notificationService.createNotification(
            studentId,
            'New Assignment Received',
            `Your tutor has assigned you a new ${config.examType} ${config.mode} task.`,
            'INFO'
        );

        return {
            id: data.id,
            studentId: data.student_id,
            tutorId: data.tutor_id,
            config: data.config,
            assignedDate: data.assigned_date,
            status: data.status,
            score: data.score,
            deadline: data.deadline,
            durationMinutes: data.duration_minutes,
            resultSnapshot: data.result_snapshot
        };
    },

    // Get pending assignments for a student
    async getStudentAssignments(studentId: string): Promise<Assignment[]> {
        const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('student_id', studentId)
            .eq('status', 'PENDING')
            .order('assigned_date', { ascending: false });

        if (error) {
            console.error('Error fetching student assignments:', error);
            throw error;
        }

        return data.map((a: any) => ({
            id: a.id,
            studentId: a.student_id,
            tutorId: a.tutor_id,
            config: a.config,
            assignedDate: a.assigned_date,
            status: a.status,
            score: a.score,
            deadline: a.deadline,
            durationMinutes: a.duration_minutes,
            resultSnapshot: a.result_snapshot
        }));
    },

    // Get all assignments for a student (History)
    async getAssignmentsForStudent(studentId: string): Promise<Assignment[]> {
        const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('student_id', studentId)
            .order('assigned_date', { ascending: false });

        if (error) {
            console.error('Error fetching student assignment history:', error);
            throw error;
        }

        return data.map((a: any) => ({
            id: a.id,
            studentId: a.student_id,
            tutorId: a.tutor_id,
            config: a.config,
            assignedDate: a.assigned_date,
            status: a.status,
            score: a.score,
            deadline: a.deadline,
            durationMinutes: a.duration_minutes,
            resultSnapshot: a.result_snapshot
        }));
    },

    // Get all assignments created by a tutor
    async getTutorAssignments(tutorId: string): Promise<(Assignment & { studentName?: string })[]> {
        // Join with profiles to get student names
        const { data, error } = await supabase
            .from('assignments')
            .select('*, profiles:student_id(full_name)')
            .eq('tutor_id', tutorId)
            .order('assigned_date', { ascending: false });

        if (error) {
            console.error('Error fetching tutor assignments:', error);
            throw error;
        }

        return data.map((a: any) => ({
            id: a.id,
            studentId: a.student_id,
            tutorId: a.tutor_id,
            studentName: a.profiles?.full_name || 'Unknown Student',
            config: a.config,
            assignedDate: a.assigned_date,
            status: a.status,
            score: a.score,
            deadline: a.deadline,
            durationMinutes: a.duration_minutes,
            resultSnapshot: a.result_snapshot
        }));
    },

    // Mark an assignment as completed
    async completeAssignment(assignmentId: string, result: import('../types').ExamResult): Promise<void> {
        // First get the assignment to find the tutor ID
        const { data: assignmentData, error: fetchError } = await supabase
            .from('assignments')
            .select('tutor_id, student_id') // We might want to include student name here via join if we don't have it
            .eq('id', assignmentId)
            .single();

        if (fetchError) {
            console.error('Error fetching assignment for completion:', fetchError);
            return;
        }

        const { error } = await supabase
            .from('assignments')
            .update({
                status: 'COMPLETED',
                score: result.score,
                completed_date: new Date().toISOString(),
                result_snapshot: result // Save the full result!
            })
            .eq('id', assignmentId);

        if (error) {
            console.error('Error completing assignment:', error);
            throw error;
        }

        // Notify Tutor
        if (assignmentData?.tutor_id) {
            await notificationService.createNotification(
                assignmentData.tutor_id,
                'Assignment Completed',
                `A student has completed an assignment with a score of ${result.score}%.`,
                'SUCCESS'
            );
        }
    }
};
