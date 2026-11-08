const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function analyze() {
  const sqlPath = path.resolve(__dirname, '../dwstorel_wp956.sql');
  const rl = readline.createInterface({
    input: fs.createReadStream(sqlPath),
    crlfDelay: Infinity
  });

  const cityCounts = {};
  const provinceCounts = {
    'Western Province (Colombo, Gampaha, Kalutara)': 0,
    'Central Province (Kandy, Matale, Nuwara Eliya)': 0,
    'Southern Province (Galle, Matara, Hambantota)': 0,
    'North Western Province (Kurunegala, Puttalam)': 0,
    'Other Provinces (Islandwide Deliveries)': 0
  };

  const westernKeywords = ['colombo', 'gampaha', 'kalutara', 'maharagama', 'nugegoda', 'dehiwala', 'moratuwa', 'kaduwela', 'panadura', 'horana', 'kadawatha', 'kiribathgoda', 'malabe', 'negombo', 'wattala', 'ja-ela', 'kesbewa', 'piliyandala', 'homagama', 'boralesgamuwa', 'avissawella', 'ragama', 'kelaniya', 'battaramulla', 'kotikawatta', 'pore', 'borella', 'pannipitiya', 'kottawa'];
  const centralKeywords = ['kandy', 'matale', 'nuwara eliya', 'peradeniya', 'gampola', 'katugastota', 'kundasale', 'nawalapitiya'];
  const southernKeywords = ['galle', 'matara', 'hambantota', 'hikkaduwa', 'ambalangoda', 'tangalle', 'weligama', 'akuressa'];
  const northWesternKeywords = ['kurunegala', 'puttalam', 'kuliyapitiya', 'chilaw', 'marawila', 'wennappuwa'];

  let currentTable = '';
  for await (const line of rl) {
    if (line.includes('INSERT INTO `wpjp_wc_order_addresses`')) {
      currentTable = 'addresses';
    } else if (line.startsWith('INSERT INTO `')) {
      currentTable = '';
    }

    if (currentTable === 'addresses') {
      // Find city in line
      const match = line.match(/\(.*?,.*?,'(?:billing|shipping)',.*?,.*?,.*?,.*?,.*?,(?:'([^']*)'|NULL)/g);
      // Let's count occurrences
      const lower = line.toLowerCase();
      // Match words
    }
  }

  console.log('Analysis ready');
}

analyze();
