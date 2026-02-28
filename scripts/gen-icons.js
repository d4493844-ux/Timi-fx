const sharp = require('sharp');
const path = require('path');
const input = path.join(__dirname, '../timi/frontend/public/timi-logo.jpg');
const outDir = path.join(__dirname, '../timi/frontend/public');

const sizes = [
  { name: 'favicon.ico', size: 64 },
  { name: 'logo192.png', size: 192 },
  { name: 'logo512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

sizes.forEach(({ name, size }) => {
  sharp(input).resize(size, size, { fit: 'cover' }).toFile(path.join(outDir, name))
    .then(() => console.log('Generated:', name))
    .catch(console.error);
});
