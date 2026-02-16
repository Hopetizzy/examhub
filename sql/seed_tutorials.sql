
-- 1. Create Tutorials Table (if not exists)
CREATE TABLE IF NOT EXISTS tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    description TEXT,
    target_role TEXT DEFAULT 'ALL', -- 'ALL', 'STUDENT', 'TUTOR'
    is_active BOOLEAN DEFAULT TRUE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Just in case)
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tutorials viewable by everyone" ON tutorials;
CREATE POLICY "Tutorials viewable by everyone" ON tutorials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Tutorials manageable by admin" ON tutorials;
CREATE POLICY "Tutorials manageable by admin" ON tutorials FOR ALL USING (true); -- Relaxed for prototype

-- 2. Seed Data
INSERT INTO tutorials (title, video_url, description, target_role, "order") VALUES
('Getting Started with Exam Hub', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'A quick overview of how to maximize your score.', 'STUDENT', 1),
('Mastering JAMB Mathematics', 'https://www.youtube.com/watch?v=some_math_video', 'Tips and tricks for solving complex math problems quickly.', 'STUDENT', 2),
('Tutor Guide: Managing Students', 'https://www.youtube.com/watch?v=some_tutor_video', 'How to track student progress and assign homework.', 'TUTOR', 1);
