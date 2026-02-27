import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FILE = path.join(__dirname, "inscriptions.csv");

// Initialiser le CSV s'il n'existe pas
if (!fs.existsSync(CSV_FILE)) {
    const headers = [["Prénom", "Nom", "Email", "NbPersonnes", "Créneau", "DateInscription"]];
    fs.writeFileSync(CSV_FILE, stringify(headers));
}

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json());

    // API: Récupérer toutes les inscriptions
    app.get("/api/inscriptions", (req, res) => {
        try {
            const fileContent = fs.readFileSync(CSV_FILE, "utf-8");
            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
            });
            res.json(records);
        } catch (error) {
            console.error("Erreur lecture CSV:", error);
            res.status(500).json({ error: "Erreur lors de la lecture des données" });
        }
    });

    // API: Ajouter une inscription
    app.post("/api/inscriptions", (req, res) => {
        try {
            const { firstName, lastName, email, peopleCount, slot } = req.body;

            if (!firstName || !lastName || !email || !peopleCount || !slot) {
                return res.status(400).json({ error: "Tous les champs sont obligatoires" });
            }

            // Vérifier la capacité (optionnel car déjà fait côté client, mais plus sûr ici)
            const fileContent = fs.readFileSync(CSV_FILE, "utf-8");
            const records = parse(fileContent, { columns: true });
            const currentTotal: number = records
                .filter((r: any) => r.Créneau === slot)
                .reduce((sum: number, r: any) => sum + (parseInt(r.NbPersonnes) || 0), 0) as number;

            if (currentTotal + parseInt(peopleCount) > 15) {
                return res.status(400).json({ error: "Désolé, ce créneau est désormais complet." });
            }

            const newRecord = [
                firstName,
                lastName,
                email,
                peopleCount,
                slot,
                new Date().toLocaleString("fr-FR")
            ];

            fs.appendFileSync(CSV_FILE, stringify([newRecord]));
            res.json({ success: true });
        } catch (error) {
            console.error("Erreur écriture CSV:", error);
            res.status(500).json({ error: "Erreur lors de l'enregistrement" });
        }
    });

    // API: Télécharger le CSV
    app.get("/api/download-csv", (req, res) => {
        res.download(CSV_FILE, "inscriptions.csv");
    });

    // Vite middleware pour le développement
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        app.use(express.static(path.join(__dirname, "dist")));
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
}

startServer();
