import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

export async function readJson(name) {
  const full = path.join(dataDir, name);
  const raw  = await readFile(full, 'utf8');
  return JSON.parse(raw);
}

export async function writeJson(name, data) {
  const full = path.join(dataDir, name);
  const json = JSON.stringify(data, null, 2);
  await writeFile(full, json, 'utf8');
}