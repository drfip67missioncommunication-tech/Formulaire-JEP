import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("registrations.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL,
    peopleCount INTEGER NOT NULL,
    slot TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/slots", (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT slot, SUM(peopleCount) as totalParticipants
        FROM registrations
        GROUP BY slot
      `).all() as { slot: string; totalParticipants: number }[];
      
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch slots" });
    }
  });

  app.post("/api/register", (req, res) => {
    const { firstName, lastName, email, peopleCount, slot } = req.body;

    if (!firstName || !lastName || !email || !peopleCount || !slot) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    try {
      // Check capacity
      const current = db.prepare(`
        SELECT SUM(peopleCount) as total FROM registrations WHERE slot = ?
      `).get(slot) as { total: number | null };
      
      const currentTotal = current?.total || 0;
      if (currentTotal + parseInt(peopleCount) > 15) {
        return res.status(400).json({ error: "Ce créneau est complet ou n'a plus assez de places" });
      }

      const stmt = db.prepare(`
        INSERT INTO registrations (firstName, lastName, email, peopleCount, slot)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(firstName, lastName, email, peopleCount, slot);
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de l'enregistrement" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
