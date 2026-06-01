// Script to generate Android launcher icons from logo.svg using sharp
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const svgBuffer = readFileSync(join(import.meta.dirname, 'public', 'logo.svg'));
const resDir = join(import.meta.dirname, 'android', 'app', 'src', 'main', 'res');

// Android icon sizes for mipmap directories
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Foreground sizes for adaptive icons (108dp with safe zone)
const foregroundSizes = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

async function generateIcons() {
  for (const [dir, size] of Object.entries(iconSizes)) {
    const outDir = join(resDir, dir);
    
    // Generate ic_launcher.png - logo on black background circle
    await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .flatten({ background: { r: 10, g: 10, b: 14 } }) // #0A0A0E dark background
      .png()
      .toFile(join(outDir, 'ic_launcher.png'));

    // Generate ic_launcher_round.png - same but we'll handle roundness in Android
    await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .flatten({ background: { r: 10, g: 10, b: 14 } })
      .png()
      .toFile(join(outDir, 'ic_launcher_round.png'));

    console.log(`✓ ${dir}: ${size}x${size}`);
  }

  // Generate foreground icons for adaptive icon
  for (const [dir, size] of Object.entries(foregroundSizes)) {
    const outDir = join(resDir, dir);
    
    // Foreground: logo centered with padding on transparent background
    const logoSize = Math.round(size * 0.6); // 60% of the total for safe zone
    const logo = await sharp(svgBuffer)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      }
    })
      .composite([{
        input: logo,
        gravity: 'centre',
      }])
      .png()
      .toFile(join(outDir, 'ic_launcher_foreground.png'));

    console.log(`✓ ${dir} foreground: ${size}x${size}`);
  }

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
