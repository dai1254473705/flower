import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateDuorouJson() {
  const categoryDir = path.join(__dirname, '..', 'public', 'data', 'category');
  const outputFile = path.join(__dirname, '..', 'public', 'data', 'duorou.json');

  const entries = await fs.readdir(categoryDir, { withFileTypes: true });

  const allItems = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;

    const filePath = path.join(categoryDir, entry.name);
    const content = await fs.readFile(filePath, 'utf-8');

    if (!content.trim()) continue;

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        allItems.push(...parsed);
      } else {
        allItems.push(parsed);
      }
    } catch (err) {
      console.error(`Failed to parse JSON file: ${filePath}`, err);
    }
  }

  // Minified output
  const json = JSON.stringify(allItems);
  await fs.writeFile(outputFile, json, 'utf-8');

  console.log(`Generated duorou.json with ${allItems.length} items at ${outputFile}`);
}

generateDuorouJson().catch((err) => {
  console.error('Error generating duorou.json', err);
  process.exit(1);
});


