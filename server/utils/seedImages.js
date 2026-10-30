/**
 * Seed Images
 *
 * Copies the photo for each seed item from the images/ folder in the project
 * root into server/uploads. A photo's file name must match its item's title.
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', '..', 'images');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Copies the photo for one seed item.
 *
 * @param {{title: string}} item - Seed item
 * @returns {string} - Image path to store on the item, like '/uploads/seed-baby-cot.jpeg'
 */
const createSeedImage = ({ title }) => {
  const photo = fs
    .readdirSync(IMAGES_DIR)
    .find((file) => path.parse(file).name.toLowerCase() === title.toLowerCase());

  if (!photo) {
    throw new Error(`No photo for "${title}" in the images folder`);
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const fileName = `seed-${slug}${path.extname(photo).toLowerCase()}`;

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.copyFileSync(path.join(IMAGES_DIR, photo), path.join(UPLOAD_DIR, fileName));
  return `/uploads/${fileName}`;
};

module.exports = { createSeedImage };
