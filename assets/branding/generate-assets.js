#!/usr/bin/env node

/**
 * Asset Generation Script for Shalom DHIS2 Branding
 * 
 * This script generates all required PNG assets from the SVG master files
 * in various sizes for different use cases (app icons, favicons, etc.)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = __dirname;
const logosDir = path.join(assetsDir, 'logos');
const iconsDir = path.join(assetsDir, 'icons');
const splashDir = path.join(assetsDir, 'splash');

// Ensure directories exist
[logosDir, iconsDir, splashDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Convert SVG to PNG at specified size
 */
async function svgToPng(svgPath, pngPath, width, height = null) {
  try {
    const actualHeight = height || width;
    await sharp(svgPath)
      .resize(width, actualHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(pngPath);
    console.log(`✓ Generated: ${path.basename(pngPath)} (${width}x${actualHeight})`);
  } catch (error) {
    console.error(`✗ Failed to generate ${pngPath}:`, error.message);
  }
}

/**
 * Generate all asset variations
 */
async function generateAssets() {
  console.log('🎨 Starting asset generation...\n');

  // Logo assets
  console.log('📱 Generating logo assets...');
  const logoSvg = path.join(logosDir, 'shalom-logo.svg');
  await svgToPng(logoSvg, path.join(logosDir, 'shalom-logo-512.png'), 512);
  await svgToPng(logoSvg, path.join(logosDir, 'shalom-logo-1024.png'), 1024);
  await svgToPng(logoSvg, path.join(logosDir, 'shalom-logo-256.png'), 256);
  await svgToPng(logoSvg, path.join(logosDir, 'shalom-logo-128.png'), 128);

  // Mark/Icon assets
  console.log('\n🔖 Generating mark/icon assets...');
  const markSvg = path.join(logosDir, 'shalom-mark.svg');
  await svgToPng(markSvg, path.join(logosDir, 'shalom-mark-512.png'), 512);
  await svgToPng(markSvg, path.join(logosDir, 'shalom-mark-256.png'), 256);
  await svgToPng(markSvg, path.join(logosDir, 'shalom-mark-128.png'), 128);
  await svgToPng(markSvg, path.join(logosDir, 'shalom-mark-72.png'), 72);
  await svgToPng(markSvg, path.join(logosDir, 'shalom-mark-48.png'), 48);

  // Monochrome logo
  console.log('\n⚫ Generating monochrome logo...');
  const monoSvg = path.join(logosDir, 'shalom-logo-mono.svg');
  await svgToPng(monoSvg, path.join(logosDir, 'shalom-logo-mono-512.png'), 512);
  await svgToPng(monoSvg, path.join(logosDir, 'shalom-logo-mono-256.png'), 256);

  // Favicon assets
  console.log('\n🌐 Generating favicon assets...');
  const faviconSvg = path.join(iconsDir, 'favicon.svg');
  await svgToPng(faviconSvg, path.join(iconsDir, 'favicon-48.png'), 48);
  await svgToPng(faviconSvg, path.join(iconsDir, 'favicon-32.png'), 32);
  await svgToPng(faviconSvg, path.join(iconsDir, 'favicon-16.png'), 16);

  // App icons (for mobile)
  console.log('\n📲 Generating app icon assets...');
  await svgToPng(markSvg, path.join(iconsDir, 'app-icon-1024.png'), 1024);
  await svgToPng(markSvg, path.join(iconsDir, 'app-icon-512.png'), 512);
  await svgToPng(markSvg, path.join(iconsDir, 'app-icon-192.png'), 192);
  await svgToPng(markSvg, path.join(iconsDir, 'app-icon-144.png'), 144);
  await svgToPng(markSvg, path.join(iconsDir, 'app-icon-96.png'), 96);

  // Splash screen
  console.log('\n🎬 Generating splash screen assets...');
  const splashSvg = path.join(splashDir, 'shalom-splash.svg');
  await svgToPng(splashSvg, path.join(splashDir, 'shalom-splash-1080x1920.png'), 1080, 1920);
  await svgToPng(splashSvg, path.join(splashDir, 'shalom-splash-750x1334.png'), 750, 1334);
  await svgToPng(splashSvg, path.join(splashDir, 'shalom-splash-640x960.png'), 640, 960);

  console.log('\n✅ Asset generation complete!\n');
  console.log('📁 Assets generated in:');
  console.log(`   - ${logosDir}`);
  console.log(`   - ${iconsDir}`);
  console.log(`   - ${splashDir}`);
}

// Run the generator
generateAssets().catch(error => {
  console.error('❌ Asset generation failed:', error);
  process.exit(1);
});
