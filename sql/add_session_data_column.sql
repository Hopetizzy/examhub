-- Add session_data column to exam_results table to store full exam session (questions + answers)
-- This allows users to review their past exams later.

ALTER TABLE public.exam_results 
ADD COLUMN IF NOT EXISTS session_data JSONB;

-- Comment on column
COMMENT ON COLUMN public.exam_results.session_data IS 'Stores the full ExamSession object (questions, answers, config) for review purposes.';
