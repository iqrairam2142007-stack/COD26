-- Seed quiz bank. Units 1-2 are hand-written; the rest get a generic pair so
-- every unit is playable. Replace these with real questions as they are written.

DELETE FROM public.quiz_questions;

INSERT INTO public.quiz_questions (unit_id, question, options, correct_answer, explanation) VALUES
(1, 'What is Python primarily known for?',
   '["Speed and low-level control","Simplicity and readability","Manual memory management","Mobile-only development"]',
   'Simplicity and readability',
   'Python''s clean, English-like syntax is its defining strength.'),
(1, 'What is the correct print statement in Python 3?',
   '["print ''Hi''","print(\"Hi\")","Print(\"Hi\")","echo \"Hi\""]',
   'print("Hi")',
   'Python 3 uses print() as a function with parentheses.'),
(1, 'Is Python compiled or interpreted?',
   '["Purely compiled","Interpreted (bytecode + VM)","Assembly","None"]',
   'Interpreted (bytecode + VM)',
   'Python compiles to bytecode which the PVM interprets.'),
(2, 'What is the result of 10 / 3 in Python 3?',
   '["3","3.333...","3.0","Error"]',
   '3.333...',
   'The / operator always returns a float.'),
(2, 'Which data type is mutable?',
   '["str","tuple","list","int"]',
   'list',
   'Lists can be modified in place.'),
(2, 'Which value is falsy?',
   '["''0''","[]","[0]","1"]',
   '[]',
   'An empty list is falsy.');

-- Generic fallback questions for units 3-17.
INSERT INTO public.quiz_questions (unit_id, question, options, correct_answer, explanation)
SELECT
  u,
  'Which best describes the focus of this unit?',
  '["An unrelated topic","The core concept named in the unit title","Only syntax errors","Nothing in particular"]',
  'The core concept named in the unit title',
  'Each unit centres on its named topic.'
FROM generate_series(3, 17) AS u;

INSERT INTO public.quiz_questions (unit_id, question, options, correct_answer, explanation)
SELECT
  u,
  'What is a good practice when learning a new unit?',
  '["Skip the examples","Write and run the code yourself","Memorise without practice","Avoid the quiz"]',
  'Write and run the code yourself',
  'Hands-on practice cements understanding.'
FROM generate_series(3, 17) AS u;
