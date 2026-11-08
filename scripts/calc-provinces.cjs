const fs = require('fs');

const raw = fs.readFileSync('apps/admin/src/data/realOrdersData.ts', 'utf8');
const cityRegex = /"city":\s*"([^"]+)"/g;
let m;
const cities = [];
while ((m = cityRegex.exec(raw)) !== null) {
  cities.push(m[1].toLowerCase());
}

console.log('Total cities parsed:', cities.length);

const westernKeywords = ['colombo', 'gampaha', 'kalutara', 'maharagama', 'nugegoda', 'dehiwala', 'moratuwa', 'kaduwela', 'panadura', 'horana', 'kadawatha', 'kiribathgoda', 'malabe', 'negombo', 'wattala', 'ja-ela', 'kesbewa', 'piliyandala', 'homagama', 'boralesgamuwa', 'avissawella', 'ragama', 'kelaniya', 'battaramulla', 'kotikawatta', 'pore', 'borella', 'pannipitiya', 'kottawa', 'padukka', 'hanwella', 'ratmalana', 'angoda', 'godagama', 'meegoda', 'biyagama', 'peliyagoda', 'minuwangoda', 'mirigama', 'divulapitiya', 'matugama', 'aluthgama', 'beruwala', 'bandaragama', 'ingiriya'];
const centralKeywords = ['kandy', 'matale', 'nuwara eliya', 'peradeniya', 'gampola', 'katugastota', 'kundasale', 'nawalapitiya', 'hatton', 'dambulla', 'galewela'];
const southernKeywords = ['galle', 'matara', 'hambantota', 'hikkaduwa', 'ambalangoda', 'tangalle', 'weligama', 'akuressa', 'dickwella', 'beliatta', 'amabalangoda', 'elapatha', 'karapitiya', 'baddegama'];
const northWesternKeywords = ['kurunegala', 'puttalam', 'kuliyapitiya', 'chilaw', 'marawila', 'wennappuwa', 'pannala', 'narammala', 'wariyapola', 'maho'];

let western = 0;
let central = 0;
let southern = 0;
let northWestern = 0;
let other = 0;

cities.forEach(c => {
  if (westernKeywords.some(k => c.includes(k))) western++;
  else if (centralKeywords.some(k => c.includes(k))) central++;
  else if (southernKeywords.some(k => c.includes(k))) southern++;
  else if (northWesternKeywords.some(k => c.includes(k))) northWestern++;
  else other++;
});

const total = cities.length;
console.log('Western Province:', western, ((western / total) * 100).toFixed(1) + '%');
console.log('Central Province:', central, ((central / total) * 100).toFixed(1) + '%');
console.log('Southern Province:', southern, ((southern / total) * 100).toFixed(1) + '%');
console.log('North Western Province:', northWestern, ((northWestern / total) * 100).toFixed(1) + '%');
console.log('Other Provinces:', other, ((other / total) * 100).toFixed(1) + '%');
