import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - supports both teachers and students
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("student"), // "teacher" or "student"
  avatarUrl: text("avatar_url"),
  totalScore: integer("total_score").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Lessons table - created by teachers
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLessonSchema = createInsertSchema(lessons).pick({
  teacherId: true,
  title: true,
  content: true,
  subject: true,
});

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

// Quizzes table - generated from lessons
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id").references(() => lessons.id),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  timePerQuestion: integer("time_per_question").notNull().default(30),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  lessonId: true,
  teacherId: true,
  title: true,
  description: true,
  timePerQuestion: true,
  isPublished: true,
});

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

// Questions table - belongs to quizzes
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull().$type<string[]>(),
  correctAnswer: integer("correct_answer").notNull(), // index of correct option
  points: integer("points").notNull().default(1000),
  orderIndex: integer("order_index").notNull().default(0),
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  quizId: true,
  questionText: true,
  options: true,
  correctAnswer: true,
  points: true,
  orderIndex: true,
});

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

// Game Sessions table - active quiz games
export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id),
  hostId: varchar("host_id").notNull().references(() => users.id),
  gameCode: varchar("game_code", { length: 6 }).notNull().unique(),
  status: text("status").notNull().default("waiting"), // "waiting", "playing", "finished"
  currentQuestionIndex: integer("current_question_index").notNull().default(0),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).pick({
  quizId: true,
  hostId: true,
  gameCode: true,
  status: true,
});

export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;

// Game Players table - players in a game session
export const gamePlayers = pgTable("game_players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => gameSessions.id),
  userId: varchar("user_id").references(() => users.id),
  nickname: text("nickname").notNull(),
  score: integer("score").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertGamePlayerSchema = createInsertSchema(gamePlayers).pick({
  sessionId: true,
  userId: true,
  nickname: true,
});

export type InsertGamePlayer = z.infer<typeof insertGamePlayerSchema>;
export type GamePlayer = typeof gamePlayers.$inferSelect;

// Player Answers table - track individual answers
export const playerAnswers = pgTable("player_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().references(() => gamePlayers.id),
  questionId: varchar("question_id").notNull().references(() => questions.id),
  selectedAnswer: integer("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeTaken: integer("time_taken").notNull(), // milliseconds
  pointsEarned: integer("points_earned").notNull().default(0),
  answeredAt: timestamp("answered_at").defaultNow(),
});

export const insertPlayerAnswerSchema = createInsertSchema(playerAnswers).pick({
  playerId: true,
  questionId: true,
  selectedAnswer: true,
  isCorrect: true,
  timeTaken: true,
  pointsEarned: true,
});

export type InsertPlayerAnswer = z.infer<typeof insertPlayerAnswerSchema>;
export type PlayerAnswer = typeof playerAnswers.$inferSelect;

// Badges table - achievements
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requirement: text("requirement").notNull(), // JSON string describing unlock condition
  category: text("category").notNull(), // "streak", "score", "games", "accuracy"
});

export const insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  description: true,
  icon: true,
  requirement: true,
  category: true,
});

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

// User Badges table - earned badges
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeId: true,
});

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// Auth schemas for login/register
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["teacher", "student"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Quiz generation schema
export const generateQuizSchema = z.object({
  lessonId: z.string().optional(),
  lessonText: z.string().min(50, "Lesson content must be at least 50 characters"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  numberOfQuestions: z.number().min(5).max(20).default(10),
});

export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;

// Join game schema
export const joinGameSchema = z.object({
  gameCode: z.string().length(6, "Game code must be 6 characters"),
  nickname: z.string().min(2, "Nickname must be at least 2 characters").max(20),
});

export type JoinGameInput = z.infer<typeof joinGameSchema>;

// Answer submission schema
export const submitAnswerSchema = z.object({
  playerId: z.string(),
  questionId: z.string(),
  selectedAnswer: z.number().min(0).max(3),
  timeTaken: z.number(),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
