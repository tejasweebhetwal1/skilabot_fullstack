import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataFile = path.resolve(root, process.env.DATA_FILE || "./data/db.json");

const seed = {
  users: [],
  conversations: [],
  leads: [],
  settings: {
    businessName: "SkilaBot Demo",
    escalationEmail: "admin@yourcompany.com",
    botTone: "Friendly and concise",
    retentionDays: 90
  }
};

export async function readDb() {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw);
  } catch {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(seed, null, 2));
    return structuredClone(seed);
  }
}

export async function writeDb(db) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2));
  return db;
}

export async function updateDb(mutator) {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}
