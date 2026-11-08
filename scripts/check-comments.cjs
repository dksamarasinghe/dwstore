const fs = require('fs');
const readline = require('readline');
const path = require('path');

const sqlPath = path.resolve(__dirname, '../dwstorel_wp956.sql');

async function checkComments() {
  const rl = readline.createInterface({
    input: fs.createReadStream(sqlPath),
    crlfDelay: Infinity
  });

  let currentTable = '';
  let noteCount = 0;
  const trackingNotes = [];

  for await (const line of rl) {
    if (line.includes('INSERT INTO `')) {
      const parts = line.split('INSERT INTO `');
      if (parts[1]) {
        currentTable = parts[1].split('`')[0];
      }
    }

    if (currentTable === 'wpjp_comments') {
      noteCount++;
      if (line.toLowerCase().includes('koombiyo') || line.toLowerCase().includes('waybill') || line.toLowerCase().includes('tracking')) {
        trackingNotes.push(line.slice(0, 200));
      }
    }
  }

  console.log('Total wpjp_comments lines:', noteCount);
  console.log('Tracking notes found in wpjp_comments:', trackingNotes.length);
  if (trackingNotes.length > 0) {
    console.log('Sample tracking notes:', trackingNotes.slice(0, 10));
  }
}

checkComments().catch(console.error);
