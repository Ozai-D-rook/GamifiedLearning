-- Users table
CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'student',
  avatar_url text,
  total_score integer NOT NULL DEFAULT 0,
  games_played integer NOT NULL DEFAULT 0,
  games_won integer NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id varchar NOT NULL REFERENCES users(id),
  title text NOT NULL,
  content text NOT NULL,
  subject text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id varchar REFERENCES lessons(id),
  teacher_id varchar NOT NULL REFERENCES users(id),
  title text NOT NULL,
  description text,
  time_per_question integer NOT NULL DEFAULT 30,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id varchar NOT NULL REFERENCES quizzes(id),
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  points integer NOT NULL DEFAULT 1000,
  order_index integer NOT NULL DEFAULT 0
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id varchar NOT NULL REFERENCES quizzes(id),
  host_id varchar NOT NULL REFERENCES users(id),
  game_code varchar(6) NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'waiting',
  current_question_index integer NOT NULL DEFAULT 0,
  started_at timestamp,
  ended_at timestamp,
  created_at timestamp DEFAULT now()
);

-- Game players table
CREATE TABLE IF NOT EXISTS game_players (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id varchar NOT NULL REFERENCES game_sessions(id),
  user_id varchar REFERENCES users(id),
  nickname text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  joined_at timestamp DEFAULT now()
);

-- Player answers table
CREATE TABLE IF NOT EXISTS player_answers (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id varchar NOT NULL REFERENCES game_players(id),
  question_id varchar NOT NULL REFERENCES questions(id),
  selected_answer integer NOT NULL,
  is_correct boolean NOT NULL,
  time_taken integer NOT NULL,
  points_earned integer NOT NULL DEFAULT 0,
  answered_at timestamp DEFAULT now()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  requirement text NOT NULL,
  category text NOT NULL
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL REFERENCES users(id),
  badge_id varchar NOT NULL REFERENCES badges(id),
  earned_at timestamp DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher_id ON quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_host_id ON game_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_quiz_id ON game_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_game_players_session_id ON game_players(session_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON game_players(user_id);
CREATE INDEX IF NOT EXISTS idx_player_answers_player_id ON player_answers(player_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
