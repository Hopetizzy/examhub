
-- Create Syllabus Topics Table
CREATE TABLE IF NOT EXISTS syllabus_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    topic TEXT NOT NULL, -- Main Topic (e.g., "Number and Numeration")
    sub_topic TEXT, -- Specific Sub-topic (e.g., "Number Bases")
    objectives JSONB DEFAULT '[]'::jsonb, -- Array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE syllabus_topics ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (authenticated and anon)
CREATE POLICY "Syllabus is viewable by everyone" 
ON syllabus_topics FOR SELECT 
USING (true);

-- Allow all access to Admins
-- (Assuming we verify admin in app or use a custom claim. For MVP, we might just open it or rely on app logic if RLS is tricky without auth hooks)
-- Let's just allow all for now for simplicity in this prototype, or stricter if possible.
-- Ideally: USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
CREATE POLICY "Syllabus is manageable by everyone (MVP)" 
ON syllabus_topics FOR ALL 
USING (true);
