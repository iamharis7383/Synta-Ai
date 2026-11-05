import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
const dir = path.resolve('server/data'); fs.mkdirSync(dir,{recursive:true});
export const db = new Database(path.join(dir,'synta.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, provider TEXT DEFAULT 'gemini', api_key TEXT DEFAULT '', system_prompt TEXT DEFAULT '', theme TEXT DEFAULT 'light', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS chats(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL DEFAULT 'New chat', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY, chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE, role TEXT NOT NULL CHECK(role IN ('user','assistant')), content TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS chats_user_updated ON chats(user_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS messages_chat ON messages(chat_id,id);
`);
