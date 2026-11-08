const fs = require('fs');
const readline = require('readline');
const path = require('path');

const sqlPath = path.resolve(__dirname, '../dwstorel_wp956.sql');

async function main() {
  const rl = readline.createInterface({
    input: fs.createReadStream(sqlPath),
    crlfDelay: Infinity
  });

  let currentTable = 'UNKNOWN';
  for await (const line of rl) {
    if (line.includes('INSERT INTO `')) {
      currentTable = line.split('INSERT INTO `')[1].split('`')[0];
    }
    if (line.includes('_wc_shipment_tracking_items')) {
      console.log('Current table:', currentTable);
      console.log('Line starts with:', line.slice(0, 100));
      console.log('Line total length:', line.length);
      break;
    }
  }
}

main().catch(console.error);
