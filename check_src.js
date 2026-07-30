const fs = require('fs');
try {
  console.log(fs.readdirSync('src'));
} catch (e) {
  console.log(e);
}
