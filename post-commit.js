const fs = require('fs');
const axios = require('axios');
const readline = require('readline');
const { execSync } = require('child_process');
const { basename } = require('path');

// API URL
const apiUrl = 'https://renamer-app.vercel.app/api/runBinary';

// Get staged files
const files = execSync('git diff --cached --name-only').toString().trim().split('\n');

async function askQuestion(query, timeoutDuration = 10000) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(query, (answer) => {
      setTimeout(() => {
        rl.close();
        resolve(answer);
      }, timeoutDuration);  // Adding timeout after receiving the input
    });
  });
}

async function processFile(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const baseFileName = basename(file);

  // Prepare payload
  const payload = {
    fileName: baseFileName,
    fileContent: content,
    debug: 'true',
    namingConvention: 'camelCase',
  };

  try {
    // Send request to API
    const response = await axios.post(apiUrl, payload);
    console.log('Response:', response.data);

    const suggestedName = response.data.renamedFiles[baseFileName].suggested_name;

    // Ask user for confirmation using readline with a timeout
    const confirm = await askQuestion(`Rename ${file} to ${suggestedName}? (y/n): `);

    if (confirm.toLowerCase() === 'y') {
      fs.renameSync(file, suggestedName);
      console.log(`Renamed ${file} to ${suggestedName}`);
    } else {
      console.log(`Skipped renaming ${file}`);
    }

  } catch (error) {
    console.error('Error renaming file:', error.message);
  }
}

async function processFiles() {
  // Process each file sequentially
  for (const file of files) {
    if (file) {
      await processFile(file);
    }
  }
}

processFiles();
