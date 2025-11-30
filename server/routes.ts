import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage-db";
import { generateQuizQuestions } from "./gemini";
import { initializeDatabase } from "./init-db";
import {
  loginSchema,
  registerSchema,
  generateQuizSchema,
  joinGameSchema,
  submitAnswerSchema,
} from "@shared/schema";
import { z } from "zod";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import MemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);

// Password hashing
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString("hex")}`;
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(Buffer.from(key, "hex"), buf);
}

// Generate game code
function generateGameCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Session type augmentation
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize database and seed badges
  await initializeDatabase();

  // Session setup with in-memory store
  const MemStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "quizblitz-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new MemStore({
        checkPeriod: 86400000,
      }),
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // ==================== AUTH ROUTES ====================

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);

      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      });

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const valid = await comparePassword(data.password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // ==================== ADMIN/TEACHER ROUTES ====================

  app.get("/api/students", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (user?.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can view students" });
    }
    const students = await storage.getAllStudents();
    res.json(students.map((s) => ({ ...s, password: undefined })));
  });

  app.delete("/api/students/:id", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (user?.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can manage students" });
    }
    const studentToDelete = await storage.getUser(req.params.id);
    if (!studentToDelete || studentToDelete.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }
    await storage.deleteUser(req.params.id);
    res.json({ success: true });
  });

  // ==================== LESSONS ROUTES ====================

  app.get("/api/lessons", requireAuth, async (req, res) => {
    const lessons = await storage.getLessonsByTeacher(req.session.userId!);
    res.json(lessons);
  });

  app.get("/api/lessons/:id", requireAuth, async (req, res) => {
    const lesson = await storage.getLesson(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    if (lesson.teacherId !== req.session.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(lesson);
  });

  app.post("/api/lessons", requireAuth, async (req, res) => {
    try {
      const lesson = await storage.createLesson({
        teacherId: req.session.userId!,
        title: req.body.title,
        content: req.body.content,
        subject: req.body.subject,
      });
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Failed to create lesson" });
    }
  });

  app.delete("/api/lessons/:id", requireAuth, async (req, res) => {
    const lesson = await storage.getLesson(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    if (lesson.teacherId !== req.session.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await storage.deleteLesson(req.params.id);
    res.json({ success: true });
  });

  // ==================== QUIZZES ROUTES ====================

  app.get("/api/quizzes/available", async (req, res) => {
    // Get all published quizzes for students to browse
    const allQuizzes = await storage.getAllPublishedQuizzes();
    res.json(allQuizzes);
  });

  app.get("/api/quizzes", requireAuth, async (req, res) => {
    const lessonId = req.query.lessonId as string | undefined;
    if (lessonId) {
      const quizzes = await storage.getQuizzesByLesson(lessonId);
      return res.json(quizzes);
    }
    const quizzes = await storage.getQuizzesByTeacher(req.session.userId!);
    res.json(quizzes);
  });

  app.get("/api/quizzes/:id", requireAuth, async (req, res) => {
    const quiz = await storage.getQuiz(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.json(quiz);
  });

  app.get("/api/quizzes/:id/questions", requireAuth, async (req, res) => {
    const questions = await storage.getQuestionsByQuiz(req.params.id);
    res.json(questions);
  });

  app.post("/api/quizzes/generate", requireAuth, async (req, res) => {
    try {
      const data = generateQuizSchema.parse(req.body);

      // Generate questions using Gemini
      const generatedQuestions = await generateQuizQuestions(
        data.lessonText,
        data.numberOfQuestions
      );

      // Create the quiz
      const quiz = await storage.createQuiz({
        teacherId: req.session.userId!,
        lessonId: data.lessonId,
        title: data.title,
        description: `AI-generated quiz with ${generatedQuestions.length} questions`,
        timePerQuestion: 30,
        isPublished: true,
      });

      // Create questions
      for (let i = 0; i < generatedQuestions.length; i++) {
        const q = generatedQuestions[i];
        await storage.createQuestion({
          quizId: quiz.id,
          questionText: q.question,
          options: q.options,
          correctAnswer: q.answer,
          points: 1000,
          orderIndex: i,
        });
      }

      res.json(quiz);
    } catch (error: any) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate quiz" });
    }
  });

  app.delete("/api/quizzes/:id", requireAuth, async (req, res) => {
    const quiz = await storage.getQuiz(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (quiz.teacherId !== req.session.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await storage.deleteQuiz(req.params.id);
    res.json({ success: true });
  });

  // ==================== GAME SESSIONS ROUTES ====================

  app.get("/api/sessions/recent", requireAuth, async (req, res) => {
    const sessions = await storage.getRecentSessionsByHost(req.session.userId!);
    res.json(sessions);
  });

  app.get("/api/sessions/:id", async (req, res) => {
    const session = await storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    // Include quiz time per question
    const quiz = await storage.getQuiz(session.quizId);
    res.json({ ...session, timePerQuestion: quiz?.timePerQuestion || 30 });
  });

  app.get("/api/sessions/:id/players", async (req, res) => {
    const players = await storage.getPlayersBySession(req.params.id);
    res.json(players);
  });

  app.get("/api/sessions/:id/questions", async (req, res) => {
    const session = await storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    const questions = await storage.getQuestionsByQuiz(session.quizId);
    res.json(questions);
  });

  app.post("/api/sessions", requireAuth, async (req, res) => {
    try {
      const { quizId } = req.body;
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      // Generate unique game code
      let gameCode = generateGameCode();
      let existing = await storage.getSessionByCode(gameCode);
      while (existing) {
        gameCode = generateGameCode();
        existing = await storage.getSessionByCode(gameCode);
      }

      const session = await storage.createSession({
        quizId,
        hostId: req.session.userId!,
        gameCode,
        status: "waiting",
      });

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.post("/api/sessions/join", async (req, res) => {
    try {
      const data = joinGameSchema.parse(req.body);

      const session = await storage.getSessionByCode(data.gameCode);
      if (!session) {
        return res.status(404).json({ error: "Game not found" });
      }
      if (session.status !== "waiting") {
        return res.status(400).json({ error: "Game already started" });
      }

      const player = await storage.createPlayer({
        sessionId: session.id,
        userId: req.session.userId || undefined,
        nickname: data.nickname,
      });

      res.json({ sessionId: session.id, playerId: player.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to join game" });
    }
  });

  app.post("/api/sessions/:id/start", requireAuth, async (req, res) => {
    const session = await storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    if (session.hostId !== req.session.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (session.status !== "waiting") {
      return res.status(400).json({ error: "Game already started" });
    }

    const updated = await storage.updateSession(req.params.id, {
      status: "playing",
      startedAt: new Date(),
    });

    res.json(updated);
  });

  app.post("/api/sessions/:id/answer", async (req, res) => {
    try {
      const data = submitAnswerSchema.parse(req.body);
      const { playerId, questionId, selectedAnswer, timeTaken } = data;

      const session = await storage.getSession(req.params.id);
      if (!session || session.status !== "playing") {
        return res.status(400).json({ error: "Invalid session" });
      }

      const player = await storage.getPlayer(playerId);
      if (!player || player.sessionId !== req.params.id) {
        return res.status(400).json({ error: "Invalid player" });
      }

      const question = await storage.getQuestion(questionId);
      if (!question) {
        return res.status(400).json({ error: "Invalid question" });
      }

      const isCorrect = selectedAnswer === question.correctAnswer;

      // Calculate points based on time (faster = more points)
      const quiz = await storage.getQuiz(session.quizId);
      const maxTime = (quiz?.timePerQuestion || 30) * 1000;
      const timeBonus = Math.max(0, (maxTime - timeTaken) / maxTime);
      const pointsEarned = isCorrect ? Math.round(question.points * (0.5 + 0.5 * timeBonus)) : 0;

      // Update streak
      const newStreak = isCorrect ? player.streak + 1 : 0;

      // Save answer
      await storage.createPlayerAnswer({
        playerId,
        questionId,
        selectedAnswer,
        isCorrect,
        timeTaken,
        pointsEarned,
      });

      // Update player stats
      await storage.updatePlayer(playerId, {
        score: player.score + pointsEarned,
        correctAnswers: player.correctAnswers + (isCorrect ? 1 : 0),
        streak: newStreak,
      });

      res.json({
        correct: isCorrect,
        pointsEarned,
        streak: newStreak,
        totalScore: player.score + pointsEarned,
      });
    } catch (error) {
      console.error("Answer error:", error);
      res.status(500).json({ error: "Failed to submit answer" });
    }
  });

  app.post("/api/sessions/:id/reveal", requireAuth, async (req, res) => {
    const session = await storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const questions = await storage.getQuestionsByQuiz(session.quizId);
    const currentQuestion = questions[session.currentQuestionIndex];

    if (!currentQuestion) {
      return res.json({ answerCounts: [0, 0, 0, 0] });
    }

    // Get answer counts
    const answers = await storage.getAnswersByQuestion(req.params.id, currentQuestion.id);
    const answerCounts = [0, 0, 0, 0];
    answers.forEach((a) => {
      if (a.selectedAnswer >= 0 && a.selectedAnswer <= 3) {
        answerCounts[a.selectedAnswer]++;
      }
    });

    res.json({ answerCounts });
  });

  app.post("/api/sessions/:id/next", requireAuth, async (req, res) => {
    const session = await storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const questions = await storage.getQuestionsByQuiz(session.quizId);
    const nextIndex = session.currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      // Game finished
      await storage.updateSession(req.params.id, {
        status: "finished",
        endedAt: new Date(),
      });

      // Update player stats
      const players = await storage.getPlayersBySession(req.params.id);
      for (const player of players) {
        if (player.userId) {
          const user = await storage.getUser(player.userId);
          if (user) {
            const isWinner = players.indexOf(player) === 0;
            await storage.updateUser(player.userId, {
              totalScore: (user.totalScore || 0) + player.score,
              gamesPlayed: (user.gamesPlayed || 0) + 1,
              gamesWon: (user.gamesWon || 0) + (isWinner ? 1 : 0),
            });
          }
        }
      }

      return res.json({ finished: true });
    }

    const updated = await storage.updateSession(req.params.id, {
      currentQuestionIndex: nextIndex,
    });

    res.json({ finished: false, currentQuestionIndex: nextIndex });
  });

  app.delete("/api/sessions/:id", requireAuth, async (req, res) => {
    const session = await storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    if (session.hostId !== req.session.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await storage.deleteSession(req.params.id);
    res.json({ success: true });
  });

  // ==================== PLAYERS ROUTES ====================

  app.get("/api/players/:id", async (req, res) => {
    const player = await storage.getPlayer(req.params.id);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.json(player);
  });

  // ==================== LEADERBOARD ROUTES ====================

  app.get("/api/leaderboard/score", async (req, res) => {
    const users = await storage.getTopUsersByScore(20);
    res.json(users.map((u) => ({ ...u, password: undefined })));
  });

  app.get("/api/leaderboard/games", async (req, res) => {
    const users = await storage.getTopUsersByGames(20);
    res.json(users.map((u) => ({ ...u, password: undefined })));
  });

  app.get("/api/leaderboard/wins", async (req, res) => {
    const users = await storage.getTopUsersByWins(20);
    res.json(users.map((u) => ({ ...u, password: undefined })));
  });

  // ==================== BADGES ROUTES ====================

  app.get("/api/badges", async (req, res) => {
    const badges = await storage.getAllBadges();
    res.json(badges);
  });

  app.get("/api/badges/user", requireAuth, async (req, res) => {
    const userBadges = await storage.getUserBadges(req.session.userId!);
    res.json(userBadges);
  });

  return httpServer;
}
