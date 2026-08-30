const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const KNOWLEDGE_FILE = path.join(DATA_DIR, 'ai-doctor-knowledge.json');
const MAX_ENTRIES = 40;

const ensureStore = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(KNOWLEDGE_FILE)) {
    fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify({ entries: [] }, null, 2));
  }
};

const load = () => {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, 'utf8'));
  } catch {
    return { entries: [] };
  }
};

const save = (data) => {
  ensureStore();
  fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(data, null, 2));
};

const DOCTOR_TEACH_PATTERN = /je\s+suis\s+docteur[\s,;:.-]*(?:alors\s+)?(?:voici\s+)?(?:ce\s+que\s+tu\s+dois\s+)?(?:int[ée]grer\s+dans\s+ton\s+apprentissage|ajouter\s+[àa]\s+tes\s+connaissances)\s*[:\-]?\s*(.+)/is;

const extractDoctorTeaching = (message) => {
  const match = message.match(DOCTOR_TEACH_PATTERN);
  if (!match) return null;
  const content = match[1].trim();
  return content.length >= 10 ? content : null;
};

const addDoctorKnowledge = ({ content, medecinId, medecinName, specialite }) => {
  const store = load();
  const entry = {
    id: Date.now(),
    content: content.slice(0, 2000),
    medecinId,
    medecinName,
    specialite,
    createdAt: new Date().toISOString(),
  };
  store.entries = [entry, ...store.entries].slice(0, MAX_ENTRIES);
  save(store);
  return entry;
};

const getKnowledgeBlock = () => {
  const { entries } = load();
  if (!entries.length) return '';
  const lines = entries.slice(0, 15).map((e) => (
    `- [Dr ${e.medecinName || 'Anonyme'}${e.specialite ? `, ${e.specialite}` : ''}] ${e.content}`
  ));
  return `\n\nCONNAISSANCES VALIDÉES PAR DES MÉDECINS DE LA PLATEFORME (à intégrer dans tes conseils) :\n${lines.join('\n')}`;
};

module.exports = {
  extractDoctorTeaching,
  addDoctorKnowledge,
  getKnowledgeBlock,
};
