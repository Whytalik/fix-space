import { existsSync, copyFileSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';

const source = resolve(__dirname, '../mql5/Experts/FixSpaceSync.mq5');

const home = homedir();
const possiblePaths = [
  join(home, 'Library/Application Support/net.metaquotes.wine.metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts'),
  join(home, 'Library/Application Support/com.metatrader.metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts')
];

let target = null;
for (const p of possiblePaths) {
  if (existsSync(p)) {
    target = p;
    break;
  }
}

if (!target) {
  console.error('MetaTrader 5 Experts directory not found. Please copy the file manually.');
  process.exit(1);
}

const dest = join(target, 'FixSpaceSync.mq5');
try {
  copyFileSync(source, dest);
  console.log(`Successfully copied FixSpaceSync.mq5 to ${dest}`);
} catch (error) {
  console.error('Failed to copy file:', error);
  process.exit(1);
}
