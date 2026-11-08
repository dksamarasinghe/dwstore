const fs = require('fs');
const content = fs.readFileSync('apps/admin/src/data/realOrdersData.ts', 'utf8');
const dates = [];
const regex = /"createdAt":\s*"([^"]+)"/g;
let m;
while ((m = regex.exec(content)) !== null) {
  dates.push(m[1]);
}
console.log('Total order dates:', dates.length);
console.log('Newest dates:', dates.slice(0, 5));
console.log('Oldest dates:', dates.slice(-5));
