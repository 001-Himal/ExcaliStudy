const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./eslint-output.json', 'utf8'));
data.forEach(file => {
  if (file.errorCount > 0 || file.warningCount > 0) {
    console.log('\n--- ' + file.filePath + ' ---');
    file.messages.forEach(m => console.log(`[${m.severity === 2 ? 'Error' : 'Warn'}] Line ${m.line}: ${m.message} (${m.ruleId})`));
  }
});
