#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REHEARSAL_DIR = path.join(__dirname, '../music/music man jr rehearsal music');
const ACCOMPANIMENT_DIR = path.join(__dirname, '../music/music man jr accompaniment music');
const OUTPUT_FILE = path.join(__dirname, 'player-manifest.json');

function extractTrackNumber(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? match[1] : null;
}

function getTrackTitle(filename) {
  if (!filename) return '';
  // Remove track number and file extension
  const withoutNumber = filename.replace(/^\d+\s*/, '');
  const withoutExt = withoutNumber.replace(/\.[^/.]+$/, '');
  // Normalize separators and clean up common patterns
  return withoutExt
    .replace(/_/g, ' ')
    .replace(/\s*W(?:_?Vocals?|_?Voca|_?V)?\b.*$/i, '')
    .replace(/\s*\(A cappella.*$/i, '')
    .replace(/\s*W\.$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateManifest() {
  const trackMap = new Map();

  // Read rehearsal files
  try {
    const rehearsalFiles = fs.readdirSync(REHEARSAL_DIR).filter(f => f.endsWith('.mp3'));
    rehearsalFiles.forEach(file => {
      const number = extractTrackNumber(file);
      if (number) {
        if (!trackMap.has(number)) {
          trackMap.set(number, {});
        }
        trackMap.get(number).number = number;
        trackMap.get(number).rehearsalSrc = `music/music man jr rehearsal music/${file}`;
      }
    });
  } catch (error) {
    console.error(`Error reading rehearsal directory: ${error.message}`);
    process.exit(1);
  }

  // Read accompaniment files
  try {
    const accompanimentFiles = fs.readdirSync(ACCOMPANIMENT_DIR).filter(f => f.endsWith('.mp3'));
    accompanimentFiles.forEach(file => {
      const number = extractTrackNumber(file);
      if (number) {
        if (!trackMap.has(number)) {
          trackMap.set(number, {});
        }
        trackMap.get(number).accompanimentSrc = `music/music man jr accompaniment music/${file}`;
      }
    });
  } catch (error) {
    console.error(`Error reading accompaniment directory: ${error.message}`);
    process.exit(1);
  }

  // Sort by track number and build manifest
  const sortedNumbers = Array.from(trackMap.keys())
    .sort((a, b) => parseInt(a) - parseInt(b));

  const manifest = sortedNumbers.map(number => {
    const track = trackMap.get(number);
    const rehearsalFile = track.rehearsalSrc ? path.basename(track.rehearsalSrc) : '';
    const accompanimentFile = track.accompanimentSrc ? path.basename(track.accompanimentSrc) : '';
    const title = getTrackTitle(rehearsalFile) || getTrackTitle(accompanimentFile) || `Track ${number}`;

    return {
      number,
      title,
      rehearsalSrc: track.rehearsalSrc || '',
      accompanimentSrc: track.accompanimentSrc || '',
    };
  });

  // Write to file
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
    console.log(`✓ Generated ${OUTPUT_FILE}`);
    console.log(`✓ Found ${manifest.length} tracks`);
  } catch (error) {
    console.error(`Error writing manifest file: ${error.message}`);
    process.exit(1);
  }
}

generateManifest();
