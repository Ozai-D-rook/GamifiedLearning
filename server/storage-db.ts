import { db } from "./db";
import {
  users,
  lessons,
  quizzes,
  questions,
  gameSessions,
  gamePlayers,
  playerAnswers,
  badges,
  userBadges,
} from "@shared/schema";
import {
  type User,
  type InsertUser,
  type Lesson,
  type InsertLesson,
  type Quiz,
  type InsertQuiz,
  type Question,
  type InsertQuestion,
  type GameSession,
  type InsertGameSession,
  type GamePlayer,
  type InsertGamePlayer,
  type PlayerAnswer,
  type InsertPlayerAnswer,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0]!;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getAllStudents(): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.role, "student"))
      .orderBy(desc(users.createdAt));
    return result;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getTopUsersByScore(limit: number): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.role, "student"))
      .orderBy(desc(users.totalScore))
      .limit(limit);
    return result;
  }

  async getTopUsersByGames(limit: number): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.role, "student"))
      .orderBy(desc(users.gamesPlayed))
      .limit(limit);
    return result;
  }

  async getTopUsersByWins(limit: number): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.role, "student"))
      .orderBy(desc(users.gamesWon))
      .limit(limit);
    return result;
  }

  // Lessons
  async getLesson(id: string): Promise<Lesson | undefined> {
    const result = await db.select().from(lessons).where(eq(lessons.id, id));
    return result[0];
  }

  async getLessonsByTeacher(teacherId: string): Promise<Lesson[]> {
    const result = await db
      .select()
      .from(lessons)
      .where(eq(lessons.teacherId, teacherId))
      .orderBy(desc(lessons.createdAt));
    return result;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const result = await db.insert(lessons).values(lesson).returning();
    return result[0]!;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  // Quizzes
  async getQuiz(id: string): Promise<Quiz | undefined> {
    const result = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return result[0];
  }

  async getQuizzesByTeacher(teacherId: string): Promise<Quiz[]> {
    const result = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.teacherId, teacherId))
      .orderBy(desc(quizzes.createdAt));
    return result;
  }

  async getQuizzesByLesson(lessonId: string): Promise<Quiz[]> {
    const result = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.lessonId, lessonId))
      .orderBy(desc(quizzes.createdAt));
    return result;
  }

  async getAllPublishedQuizzes(): Promise<Quiz[]> {
    const result = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.isPublished, true))
      .orderBy(desc(quizzes.createdAt));
    return result;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const result = await db.insert(quizzes).values(quiz).returning();
    return result[0]!;
  }

  async deleteQuiz(id: string): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  // Questions
  async getQuestion(id: string): Promise<Question | undefined> {
    const result = await db.select().from(questions).where(eq(questions.id, id));
    return result[0];
  }

  async getQuestionsByQuiz(quizId: string): Promise<Question[]> {
    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId))
      .orderBy(questions.orderIndex);
    return result;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await db.insert(questions).values(question).returning();
    return result[0]!;
  }

  async deleteQuestionsByQuiz(quizId: string): Promise<void> {
    await db.delete(questions).where(eq(questions.quizId, quizId));
  }

  // Game Sessions
  async getSession(id: string): Promise<GameSession | undefined> {
    const result = await db.select().from(gameSessions).where(eq(gameSessions.id, id));
    return result[0];
  }

  async getSessionByCode(code: string): Promise<GameSession | undefined> {
    const result = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.gameCode, code));
    return result[0];
  }

  async getRecentSessionsByHost(hostId: string): Promise<GameSession[]> {
    const result = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.hostId, hostId))
      .orderBy(desc(gameSessions.createdAt))
      .limit(10);
    return result;
  }

  async createSession(session: InsertGameSession): Promise<GameSession> {
    const result = await db.insert(gameSessions).values(session).returning();
    return result[0]!;
  }

  async updateSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined> {
    const result = await db
      .update(gameSessions)
      .set(updates)
      .where(eq(gameSessions.id, id))
      .returning();
    return result[0];
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(gameSessions).where(eq(gameSessions.id, id));
  }

  // Game Players
  async getPlayer(id: string): Promise<GamePlayer | undefined> {
    const result = await db.select().from(gamePlayers).where(eq(gamePlayers.id, id));
    return result[0];
  }

  async getPlayersBySession(sessionId: string): Promise<GamePlayer[]> {
    const result = await db
      .select()
      .from(gamePlayers)
      .where(eq(gamePlayers.sessionId, sessionId))
      .orderBy(desc(gamePlayers.score));
    return result;
  }

  async createPlayer(player: InsertGamePlayer): Promise<GamePlayer> {
    const result = await db.insert(gamePlayers).values(player).returning();
    return result[0]!;
  }

  async updatePlayer(id: string, updates: Partial<GamePlayer>): Promise<GamePlayer | undefined> {
    const result = await db
      .update(gamePlayers)
      .set(updates)
      .where(eq(gamePlayers.id, id))
      .returning();
    return result[0];
  }

  // Player Answers
  async getPlayerAnswers(playerId: string): Promise<PlayerAnswer[]> {
    const result = await db
      .select()
      .from(playerAnswers)
      .where(eq(playerAnswers.playerId, playerId));
    return result;
  }

  async createPlayerAnswer(answer: InsertPlayerAnswer): Promise<PlayerAnswer> {
    const result = await db.insert(playerAnswers).values(answer).returning();
    return result[0]!;
  }

  async getAnswersByQuestion(sessionId: string, questionId: string): Promise<PlayerAnswer[]> {
    const sessionPlayers = await this.getPlayersBySession(sessionId);
    const playerIds = sessionPlayers.map((p) => p.id);
    if (playerIds.length === 0) return [];

    const result = await db
      .select()
      .from(playerAnswers)
      .where(
        and(
          eq(playerAnswers.questionId, questionId),
          playerIds.length > 0 ? (playerAnswers.playerId as any).in(playerIds) : undefined
        )
      );
    return result;
  }

  // Badges
  async getAllBadges(): Promise<Badge[]> {
    const result = await db.select().from(badges);
    return result;
  }

  async getBadge(id: string): Promise<Badge | undefined> {
    const result = await db.select().from(badges).where(eq(badges.id, id));
    return result[0];
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const result = await db.insert(badges).values(badge).returning();
    return result[0]!;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const result = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
    return result;
  }

  async awardBadge(userBadge: InsertUserBadge): Promise<UserBadge> {
    const result = await db.insert(userBadges).values(userBadge).returning();
    return result[0]!;
  }
}

export const storage = new DatabaseStorage();
