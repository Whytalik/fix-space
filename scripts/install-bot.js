const fs = require('fs');
const path = require('path');
const os = require('os');

const source = path.resolve(__dirname, '../mql5/Experts/FixSpaceSync.mq5');

const home = os.homedir();
const possiblePaths = [
  path.join(home, 'Library/Application Support/net.metaquotes.wine.metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts'),
  path.join(home, 'Library/Application Support/com.metatrader.metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts')
];

let target = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    target = p;
    break;
  }
}

if (!target) {
  console.error('MetaTrader 5 Experts directory not found. Please copy the file manually.');
  process.exit(1);
}

const dest = path.join(target, 'FixSpaceSync.mq5');
try {
  fs.copyFileSync(source, dest);
  console.log(`Successfully copied FixSpaceSync.mq5 to ${dest}`);
} catch (error) {
  console.error('Failed to copy file:', error);
  process.exit(1);
}
