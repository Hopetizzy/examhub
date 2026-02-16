-- Seed data for Questions
-- Run this in Supabase SQL Editor to populate initial questions

insert into public.questions (exam_type, subject, topic, sub_topic, difficulty, content)
values
  (
    'JAMB',
    'Mathematics',
    'Algebra',
    'Simultaneous Equations',
    'MEDIUM',
    '{"text": "If 2x + 3y = 12 and 3x - y = 7, find the value of x + y.", "options": [{"id": "a", "text": "5"}, {"id": "b", "text": "3"}, {"id": "c", "text": "7"}, {"id": "d", "text": "1"}], "correctOptionId": "a", "explanation": "First, solve the simultaneous equations. From (ii), y = 3x - 7. Substitute into (i): 2x + 3(3x - 7) = 12. 2x + 9x - 21 = 12. 11x = 33, so x = 3. Then y = 3(3) - 7 = 2. Finally, x + y = 3 + 2 = 5."}'::jsonb
  ),
  (
    'JAMB',
    'Mathematics',
    'Geometry',
    'Mensuration',
    'EASY',
    '{"text": "Calculate the total surface area of a solid cylinder of radius 7cm and height 10cm. (Take π = 22/7)", "options": [{"id": "a", "text": "748 cm²"}, {"id": "b", "text": "648 cm²"}, {"id": "c", "text": "548 cm²"}, {"id": "d", "text": "440 cm²"}], "correctOptionId": "a", "explanation": "Total Surface Area = 2πr(r + h). Substituting values: 2 * (22/7) * 7 * (7 + 10) = 44 * 17 = 748 cm²."}'::jsonb
  ),
  (
    'JAMB',
    'Mathematics',
    'Calculus',
    'Differentiation',
    'HARD',
    '{"text": "Find the derivative of y = (2x + 1)³ with respect to x.", "options": [{"id": "a", "text": "3(2x + 1)²"}, {"id": "b", "text": "6(2x + 1)²"}, {"id": "c", "text": "6(2x + 1)"}, {"id": "d", "text": "3(2x + 1)"}], "correctOptionId": "b", "explanation": "Using the Chain Rule: dy/dx = n(u)^(n-1) * du/dx. Let u = 2x + 1, then du/dx = 2. y = u³, so dy/du = 3u². dy/dx = 3(2x + 1)² * 2 = 6(2x + 1)²."}'::jsonb
  ),
  (
    'JAMB',
    'English',
    'Lexis and Structure',
    'Concord',
    'MEDIUM',
    '{"text": "Choose the option that best completes the gap: The manager, as well as his assistants, ______ late for the meeting yesterday.", "options": [{"id": "a", "text": "were"}, {"id": "b", "text": "was"}, {"id": "c", "text": "are"}, {"id": "d", "text": "have been"}], "correctOptionId": "b", "explanation": "The subject ''The manager'' is singular. The phrase ''as well as his assistants'' is parenthetical and does not change the number of the subject. Therefore, the singular verb ''was'' is correct."}'::jsonb
  ),
  (
    'JAMB',
    'English',
    'Oral Forms',
    'Vowels',
    'MEDIUM',
    '{"text": "Choose the word that has the same vowel sound as the one represented by the underlined letter(s): S_ea_t", "options": [{"id": "a", "text": "Heat"}, {"id": "b", "text": "Bread"}, {"id": "c", "text": "Seat"}, {"id": "d", "text": "Bead"}], "correctOptionId": "b", "explanation": "The vowel sound in ''Sweat'' is /e/ (short vowel). ''Bread'' /bred/ also has the /e/ sound. ''Heat'', ''Seat'', and ''Bead'' all have the long /i:/ sound."}'::jsonb
  ),
  (
    'JAMB',
    'Physics',
    'Mechanics',
    'Motion',
    'MEDIUM',
    '{"text": "A stone is thrown vertically upwards with a velocity of 20 m/s. Calculate the maximum height reached. (g = 10 m/s²)", "options": [{"id": "a", "text": "10 m"}, {"id": "b", "text": "20 m"}, {"id": "c", "text": "40 m"}, {"id": "d", "text": "15 m"}], "correctOptionId": "b", "explanation": "At maximum height, final velocity v = 0. Using v² = u² - 2gh (minus because against gravity): 0 = 20² - 2(10)h. 400 = 20h. h = 20m."}'::jsonb
  );
