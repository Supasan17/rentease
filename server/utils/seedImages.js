/**
 * Seed Image Generator
 *
 * Writes a simple illustrated SVG for each seed item into server/uploads, so
 * sample listings have a picture without any stock photos in the repository.
 */

const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Background gradient for each item category
const CATEGORY_COLORS = {
  furniture: ['#fde68a', '#f59e0b'],
  electronics: ['#c7d2fe', '#6366f1'],
  kitchen: ['#fecaca', '#ef4444'],
  tools: ['#bae6fd', '#0284c7'],
  appliances: ['#a5f3fc', '#0891b2'],
  sports: ['#bbf7d0', '#16a34a'],
  party: ['#f5d0fe', '#c026d3'],
  other: ['#e5e7eb', '#6b7280']
};

// Icon for each seed item, matched by the start of its title
const ITEM_ICONS = [
  ['Cordless', '🔧'],
  ['Pressure', '💦'],
  ['Projector', '📽️'],
  ['Folding', '🎉'],
  ['Camping', '⛺'],
  ['Wet', '🧹'],
  ['Stand', '🥣'],
  ['Large Rice', '🍚'],
  ['Bluetooth', '🔊'],
  ['Baby', '🛏️'],
  ['Mountain', '🚲'],
  ['Portable', '❄️']
];

const escapeXml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Writes the SVG image for one seed item.
 *
 * @param {{title: string, category: string}} item - Seed item
 * @returns {string} - Image path to store on the item, like '/uploads/seed-baby-cot.svg'
 */
const createSeedImage = ({ title, category }) => {
  const [light, dark] = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  const icon = (ITEM_ICONS.find(([start]) => title.startsWith(start)) || [null, '📦'])[1];
  const fileName = `seed-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.svg`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${light}"/>
      <stop offset="1" stop-color="${dark}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <text x="400" y="330" font-size="190" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  <text x="400" y="520" font-size="38" font-family="Segoe UI, Arial, sans-serif" font-weight="600" fill="#ffffff" text-anchor="middle">${escapeXml(title)}</text>
</svg>
`;

  fs.writeFileSync(path.join(UPLOAD_DIR, fileName), svg);
  return `/uploads/${fileName}`;
};

module.exports = { createSeedImage };
