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
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllStudents(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  getTopUsersByScore(limit: number): Promise<User[]>;
  getTopUsersByGames(limit: number): Promise<User[]>;
  getTopUsersByWins(limit: number): Promise<User[]>;

  // Lessons
  getLesson(id: string): Promise<Lesson | undefined>;
  getLessonsByTeacher(teacherId: string): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;

  // Quizzes
  getQuiz(id: string): Promise<Quiz | undefined>;
  getQuizzesByTeacher(teacherId: string): Promise<Quiz[]>;
  getQuizzesByLesson(lessonId: string): Promise<Quiz[]>;
  getAllPublishedQuizzes(): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  deleteQuiz(id: string): Promise<void>;

  // Questions
  getQuestion(id: string): Promise<Question | undefined>;
  getQuestionsByQuiz(quizId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  deleteQuestionsByQuiz(quizId: string): Promise<void>;

  // Game Sessions
  getSession(id: string): Promise<GameSession | undefined>;
  getSessionByCode(code: string): Promise<GameSession | undefined>;
  getRecentSessionsByHost(hostId: string): Promise<GameSession[]>;
  createSession(session: InsertGameSession): Promise<GameSession>;
  updateSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;
  deleteSession(id: string): Promise<void>;

  // Game Players
  getPlayer(id: string): Promise<GamePlayer | undefined>;
  getPlayersBySession(sessionId: string): Promise<GamePlayer[]>;
  createPlayer(player: InsertGamePlayer): Promise<GamePlayer>;
  updatePlayer(id: string, updates: Partial<GamePlayer>): Promise<GamePlayer | undefined>;

  // Player Answers
  getPlayerAnswers(playerId: string): Promise<PlayerAnswer[]>;
  createPlayerAnswer(answer: InsertPlayerAnswer): Promise<PlayerAnswer>;
  getAnswersByQuestion(sessionId: string, questionId: string): Promise<PlayerAnswer[]>;

  // Badges
  getAllBadges(): Promise<Badge[]>;
  getBadge(id: string): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private lessons: Map<string, Lesson>;
  private quizzes: Map<string, Quiz>;
  private questions: Map<string, Question>;
  private sessions: Map<string, GameSession>;
  private players: Map<string, GamePlayer>;
  private playerAnswers: Map<string, PlayerAnswer>;
  private badges: Map<string, Badge>;
  private userBadges: Map<string, UserBadge>;

  constructor() {
    this.users = new Map();
    this.lessons = new Map();
    this.quizzes = new Map();
    this.questions = new Map();
    this.sessions = new Map();
    this.players = new Map();
    this.playerAnswers = new Map();
    this.badges = new Map();
    this.userBadges = new Map();

    // Seed default badges
    this.seedBadges();
  }

  private seedBadges() {
    const defaultBadges: InsertBadge[] = [
      { name: "First Steps", description: "Play your first game", icon: "rocket", requirement: "games:1", category: "games" },
      { name: "Regular Player", description: "Play 10 games", icon: "target", requirement: "games:10", category: "games" },
      { name: "Veteran", description: "Play 50 games", icon: "medal", requirement: "games:50", category: "games" },
      { name: "Quick Learner", description: "Score 1,000 points", icon: "zap", requirement: "score:1000", category: "score" },
      { name: "Rising Star", description: "Score 10,000 points", icon: "star", requirement: "score:10000", category: "score" },
      { name: "Champion", description: "Score 100,000 points", icon: "trophy", requirement: "score:100000", category: "score" },
      { name: "First Win", description: "Win your first game", icon: "crown", requirement: "wins:1", category: "games" },
      { name: "Winner", description: "Win 10 games", icon: "award", requirement: "wins:10", category: "games" },
      { name: "On Fire", description: "Get a 5 answer streak", icon: "flame", requirement: "streak:5", category: "streak" },
      { name: "Unstoppable", description: "Get a 10 answer streak", icon: "flame", requirement: "streak:10", category: "streak" },
      { name: "Sharp Shooter", description: "80% accuracy in a game", icon: "target", requirement: "accuracy:80", category: "accuracy" },
      { name: "Perfect Game", description: "100% accuracy in a game", icon: "shield", requirement: "accuracy:100", category: "accuracy" },
    ];

    defaultBadges.forEach((badge) => {
      const id = randomUUID();
      this.badges.set(id, { ...badge, id });
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      avatarUrl: null,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async getAllStudents(): Promise<User[]> {
    return Array.from(this.users.values())
      .filter((u) => u.role === "student")
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  async getTopUsersByScore(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .filter((u) => u.role === "student")
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, limit);
  }

  async getTopUsersByGames(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .filter((u) => u.role === "student")
      .sort((a, b) => (b.gamesPlayed || 0) - (a.gamesPlayed || 0))
      .slice(0, limit);
  }

  async getTopUsersByWins(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .filter((u) => u.role === "student")
      .sort((a, b) => (b.gamesWon || 0) - (a.gamesWon || 0))
      .slice(0, limit);
  }

  // Lessons
  async getLesson(id: string): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async getLessonsByTeacher(teacherId: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter((lesson) => lesson.teacherId === teacherId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = randomUUID();
    const lesson: Lesson = {
      ...insertLesson,
      id,
      subject: insertLesson.subject || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async deleteLesson(id: string): Promise<void> {
    this.lessons.delete(id);
  }

  // Quizzes
  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getQuizzesByTeacher(teacherId: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values())
      .filter((quiz) => quiz.teacherId === teacherId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getQuizzesByLesson(lessonId: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values())
      .filter((quiz) => quiz.lessonId === lessonId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getAllPublishedQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values())
      .filter((quiz) => quiz.isPublished)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = randomUUID();
    const quiz: Quiz = {
      ...insertQuiz,
      id,
      lessonId: insertQuiz.lessonId || null,
      description: insertQuiz.description || null,
      timePerQuestion: insertQuiz.timePerQuestion || 30,
      isPublished: insertQuiz.isPublished || false,
      createdAt: new Date(),
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async deleteQuiz(id: string): Promise<void> {
    this.quizzes.delete(id);
    // Also delete associated questions
    for (const [qId, q] of this.questions) {
      if (q.quizId === id) {
        this.questions.delete(qId);
      }
    }
  }

  // Questions
  async getQuestion(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getQuestionsByQuiz(quizId: string): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter((q) => q.quizId === quizId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const question: Question = {
      ...insertQuestion,
      id,
      points: insertQuestion.points || 1000,
      orderIndex: insertQuestion.orderIndex || 0,
    };
    this.questions.set(id, question);
    return question;
  }

  async deleteQuestionsByQuiz(quizId: string): Promise<void> {
    for (const [id, q] of this.questions) {
      if (q.quizId === quizId) {
        this.questions.delete(id);
      }
    }
  }

  // Game Sessions
  async getSession(id: string): Promise<GameSession | undefined> {
    return this.sessions.get(id);
  }

  async getSessionByCode(code: string): Promise<GameSession | undefined> {
    return Array.from(this.sessions.values()).find((s) => s.gameCode === code);
  }

  async getRecentSessionsByHost(hostId: string): Promise<GameSession[]> {
    return Array.from(this.sessions.values())
      .filter((s) => s.hostId === hostId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10);
  }

  async createSession(insertSession: InsertGameSession): Promise<GameSession> {
    const id = randomUUID();
    const session: GameSession = {
      ...insertSession,
      id,
      status: insertSession.status || "waiting",
      currentQuestionIndex: 0,
      startedAt: null,
      endedAt: null,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    const updated = { ...session, ...updates };
    this.sessions.set(id, updated);
    return updated;
  }

  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
    // Clean up players
    for (const [pId, p] of this.players) {
      if (p.sessionId === id) {
        this.players.delete(pId);
      }
    }
  }

  // Game Players
  async getPlayer(id: string): Promise<GamePlayer | undefined> {
    return this.players.get(id);
  }

  async getPlayersBySession(sessionId: string): Promise<GamePlayer[]> {
    return Array.from(this.players.values())
      .filter((p) => p.sessionId === sessionId)
      .sort((a, b) => b.score - a.score);
  }

  async createPlayer(insertPlayer: InsertGamePlayer): Promise<GamePlayer> {
    const id = randomUUID();
    const player: GamePlayer = {
      ...insertPlayer,
      id,
      userId: insertPlayer.userId || null,
      score: 0,
      correctAnswers: 0,
      streak: 0,
      joinedAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: string, updates: Partial<GamePlayer>): Promise<GamePlayer | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    const updated = { ...player, ...updates };
    this.players.set(id, updated);
    return updated;
  }

  // Player Answers
  async getPlayerAnswers(playerId: string): Promise<PlayerAnswer[]> {
    return Array.from(this.playerAnswers.values()).filter((a) => a.playerId === playerId);
  }

  async createPlayerAnswer(insertAnswer: InsertPlayerAnswer): Promise<PlayerAnswer> {
    const id = randomUUID();
    const answer: PlayerAnswer = {
      ...insertAnswer,
      id,
      answeredAt: new Date(),
    };
    this.playerAnswers.set(id, answer);
    return answer;
  }

  async getAnswersByQuestion(sessionId: string, questionId: string): Promise<PlayerAnswer[]> {
    const sessionPlayers = await this.getPlayersBySession(sessionId);
    const playerIds = new Set(sessionPlayers.map((p) => p.id));
    return Array.from(this.playerAnswers.values()).filter(
      (a) => a.questionId === questionId && playerIds.has(a.playerId)
    );
  }

  // Badges
  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getBadge(id: string): Promise<Badge | undefined> {
    return this.badges.get(id);
  }

  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = randomUUID();
    const badge: Badge = { ...insertBadge, id };
    this.badges.set(id, badge);
    return badge;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter((ub) => ub.userId === userId);
  }

  async awardBadge(insertUserBadge: InsertUserBadge): Promise<UserBadge> {
    const id = randomUUID();
    const userBadge: UserBadge = {
      ...insertUserBadge,
      id,
      earnedAt: new Date(),
    };
    this.userBadges.set(id, userBadge);
    return userBadge;
  }
}

export const storage = new MemStorage();
