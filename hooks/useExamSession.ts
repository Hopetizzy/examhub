import { useState } from 'react';
import { toast } from 'sonner';
import { ExamService } from '../services/ExamService';
import { assignmentService } from '../services/AssignmentService';
import { ExamConfig, ExamSession, ExamResult } from '../types';

interface UseExamSessionProps {
    userId: string;
    onAssignmentComplete?: () => void;
    onExamComplete?: (result: ExamResult) => void;
}

export const useExamSession = ({ userId, onAssignmentComplete, onExamComplete }: UseExamSessionProps) => {
    const [isExamActive, setIsExamActive] = useState(false);
    const [currentSession, setCurrentSession] = useState<ExamSession | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showResultModal, setShowResultModal] = useState(false);
    const [lastResult, setLastResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(false);

    const startExam = async (config: ExamConfig) => {
        setLoading(true);
        try {
            const session = await ExamService.startExam(config);
            if (session.questions.length === 0) {
                toast.error("No questions available for selected subjects.");
                return false;
            }
            setCurrentSession(session);
            setIsExamActive(true);
            setTimeLeft(session.durationMinutes * 60);
            setCurrentQuestionIndex(0);
            return true;
        } catch (error) {
            console.error("Start exam error:", error);
            toast.error("Failed to start exam. Please try again.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const submitExam = async (answers?: Record<string, string>) => {
        if (!currentSession) return;
        setLoading(true);
        try {
            // Update session with final answers if provided
            const sessionToSubmit = {
                ...currentSession,
                answers: answers || currentSession.answers
            };

            // Save result (which runs calculation)
            const result = await ExamService.saveExamResult(sessionToSubmit);

            // If it was an assignment, update assignment status
            if (sessionToSubmit.config?.assignmentId) {
                await assignmentService.completeAssignment(sessionToSubmit.config.assignmentId, result);
                if (onAssignmentComplete) {
                    onAssignmentComplete();
                }
                toast.success("Assignment Completed!");
            }

            setLastResult(result);
            setShowResultModal(true);
            setIsExamActive(false);
            setCurrentSession(null);

            if (onExamComplete) {
                onExamComplete(result);
            }

        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to submit exam.");
        } finally {
            setLoading(false);
        }
    };

    return {
        isExamActive,
        currentSession,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        timeLeft,
        setTimeLeft,
        showResultModal,
        setShowResultModal,
        lastResult,
        loading,
        startExam,
        submitExam
    };
};
