
-- 1. Create Syllabus Topics Table
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

-- Allow read access to everyone
DROP POLICY IF EXISTS "Syllabus is viewable by everyone" ON syllabus_topics;
CREATE POLICY "Syllabus is viewable by everyone" ON syllabus_topics FOR SELECT USING (true);

-- Allow all access to Admins (and Tutors for MVP)
DROP POLICY IF EXISTS "Syllabus is manageable by everyone (MVP)" ON syllabus_topics;
CREATE POLICY "Syllabus is manageable by everyone (MVP)" ON syllabus_topics FOR ALL USING (true);

-- 2. Seed Syllabus Data
-- Mathematics
INSERT INTO syllabus_topics (subject, topic, sub_topic, objectives) VALUES
('Mathematics', 'Number and Numeration', 'Number Bases', '["Convert numbers between bases", "Perform operations in various bases"]'),
('Mathematics', 'Number and Numeration', 'Fractions, Decimals, Approximations and Percentages', '[]'),
('Mathematics', 'Number and Numeration', 'Indices, Logarithms and Surds', '[]'),
('Mathematics', 'Number and Numeration', 'Sets', '[]'),
('Mathematics', 'Algebra', 'Polynomials', '[]'),
('Mathematics', 'Algebra', 'Variation', '[]'),
('Mathematics', 'Algebra', 'Inequalities', '[]'),
('Mathematics', 'Algebra', 'Progression (AP & GP)', '[]'),
('Mathematics', 'Algebra', 'Binary Operations', '[]'),
('Mathematics', 'Algebra', 'Matrices and Determinants', '[]'),
('Mathematics', 'Geometry & Trigonometry', 'Euclidean Geometry', '[]'),
('Mathematics', 'Geometry & Trigonometry', 'Mensuration', '[]'),
('Mathematics', 'Geometry & Trigonometry', 'Locus', '[]'),
('Mathematics', 'Geometry & Trigonometry', 'Coordinate Geometry', '[]'),
('Mathematics', 'Geometry & Trigonometry', 'Trigonometric Ratios & Identities', '[]'),
('Mathematics', 'Calculus', 'Differentiation', '[]'),
('Mathematics', 'Calculus', 'Integration', '[]'),
('Mathematics', 'Statistics', 'Measures of Location', '[]'),
('Mathematics', 'Statistics', 'Probability', '[]');

-- English
INSERT INTO syllabus_topics (subject, topic, sub_topic, objectives) VALUES
('English', 'Lexis and Structure', 'Synonyms', '[]'),
('English', 'Lexis and Structure', 'Antonyms', '[]'),
('English', 'Lexis and Structure', 'Homonyms', '[]'),
('English', 'Lexis and Structure', 'Clause Patterns', '[]'),
('English', 'Oral English', 'Vowels', '[]'),
('English', 'Oral English', 'Consonants', '[]'),
('English', 'Comprehension', 'Reading for Main Idea', '[]');

-- Physics
INSERT INTO syllabus_topics (subject, topic, sub_topic, objectives) VALUES
('Physics', 'Measurements and Units', 'Fundamental Quantities', '[]'),
('Physics', 'Motion and Force', 'Projectiles', '[]'),
('Physics', 'Motion and Force', 'Newtons Laws', '[]'),
('Physics', 'Energy', 'Work, Energy and Power', '[]'),
('Physics', 'Waves', 'Light Waves', '[]'),
('Physics', 'Electricity and Magnetism', 'Current Electricity', '[]');

-- Chemistry
INSERT INTO syllabus_topics (subject, topic, sub_topic, objectives) VALUES
('Chemistry', 'Separation of Mixtures', 'Filtration', '[]'),
('Chemistry', 'Chemical Combination', 'Stoichiometry', '[]'),
('Chemistry', 'States of Matter', 'Gas Laws', '[]'),
('Chemistry', 'Organic Chemistry', 'Hydrocarbons', '[]');

-- Biology
INSERT INTO syllabus_topics (subject, topic, sub_topic, objectives) VALUES
('Biology', 'Variety of Organisms', 'Classification', '[]'),
('Biology', 'Form and Function', 'Nutrition', '[]'),
('Biology', 'Ecology', 'Ecosystems', '[]'),
('Biology', 'Heredity and Evolution', 'Genetics', '[]');

-- Economics
INSERT INTO syllabus_topics (subject, topic, sub_topic, objectives) VALUES
('Economics', 'Basic Economic Concepts', 'Scarcity and Choice', '[]'),
('Economics', 'Economic Systems', 'Capitalism and Socialism', '[]'),
('Economics', 'Production', 'Factors of Production', '[]'),
('Economics', 'Market Structures', 'Monopoly and Oligopoly', '[]');

-- Government
INSERT INTO syllabus_topics (subject, topic, sub_topic, objectives) VALUES
('Government', 'Basic Concepts', 'Power and Authority', '[]'),
('Government', 'Political Representation', 'Elections', '[]'),
('Government', 'Public Administration', 'Civil Service', '[]');

-- Civic Education
INSERT INTO syllabus_topics (subject, topic, sub_topic, objectives) VALUES
('Civic Education', 'Citizenship', 'Rights and Duties', '[]'),
('Civic Education', 'The Constitution', 'Rule of Law', '[]');
