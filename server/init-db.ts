import { db } from "./db";
import { badges } from "@shared/schema";

export async function initializeDatabase() {
  try {
    // Try to seed default badges if they don't exist
    try {
      const existingBadges = await db.select().from(badges);
      
      if (existingBadges.length === 0) {
        const defaultBadges = [
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

        await db.insert(badges).values(defaultBadges);
        console.log("✓ Default badges created");
      }
    } catch (badgeError: any) {
      // Silently ignore if badges table doesn't exist yet - user needs to run SQL
      if (badgeError.message?.includes("does not exist")) {
        console.log("⚠ Database tables not yet created. Run the SQL in Supabase first.");
      }
    }
  } catch (error) {
    // Don't crash the app - just log the error
    console.log("⚠ Database initialization skipped (tables may not exist yet)");
  }
}
