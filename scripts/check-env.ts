#!/usr/bin/env node
/**
 * Environment Configuration Checker
 * Validates that all required environment variables are set
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local or .env file if it exists
function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    try {
      const filePath = join(process.cwd(), file);
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (key && !process.env[key]) {
            process.env[key] = value;
          }
        }
      }
      return file;
    } catch (error) {
      // File doesn't exist, continue to next
    }
  }
  return null;
}

// Try to load env file
loadEnvFile();

const requiredEnvVars = {
  database: ['DATABASE_URL'],
  nextauth: ['NEXTAUTH_URL', 'NEXTAUTH_SECRET'],
  tmdb: ['TMDB_API_KEY'],
};

function checkEnvVars() {
  const missing: Record<string, string[]> = {};
  const present: Record<string, string[]> = {};
  
  for (const [category, vars] of Object.entries(requiredEnvVars)) {
    missing[category] = [];
    present[category] = [];
    
    for (const varName of vars) {
      if (process.env[varName]) {
        present[category].push(varName);
      } else {
        missing[category].push(varName);
      }
    }
  }
  
  const loadedFile = loadEnvFile();
  console.log('\n🔍 Environment Configuration Check\n');
  if (loadedFile) {
    console.log(`📄 Loaded from: ${loadedFile}\n`);
  }
  console.log('═'.repeat(50));
  
  let allGood = true;
  
  for (const [category, vars] of Object.entries(requiredEnvVars)) {
    const categoryMissing = missing[category];
    const categoryPresent = present[category];
    
    if (categoryMissing.length === 0) {
      console.log(`\n✅ ${category.toUpperCase()}: All set`);
      categoryPresent.forEach(v => {
        const value = process.env[v];
        const display = v.includes('PASSWORD') || v.includes('SECRET')
          ? '•'.repeat(20)
          : value?.substring(0, 30) || '';
        console.log(`   ${v.padEnd(30)} = ${display}`);
      });
    } else {
      allGood = false;
      console.log(`\n❌ ${category.toUpperCase()}: Missing variables`);
      categoryMissing.forEach(v => {
        console.log(`   ⚠️  ${v}`);
      });
      if (categoryPresent.length > 0) {
        console.log(`   ✅ Present:`);
        categoryPresent.forEach(v => {
          const value = process.env[v];
          const display = v.includes('PASSWORD') || v.includes('SECRET')
            ? '•'.repeat(20)
            : value?.substring(0, 30) || '';
          console.log(`      ${v.padEnd(28)} = ${display}`);
        });
      }
    }
  }
  
  console.log('\n' + '═'.repeat(50));
  
  if (allGood) {
    console.log('\n✨ All environment variables are configured!');
    return 0;
  } else {
    console.log('\n⚠️  Some environment variables are missing.');
    console.log('\n📝 Next steps:');
    console.log('   1. Fill in the missing variables in your .env.local file');
    console.log('   2. For NEXTAUTH_SECRET, generate one with:');
    console.log('      openssl rand -base64 32');
    console.log('   3. For TMDB_API_KEY, get one from:');
    console.log('      https://www.themoviedb.org/settings/api');
    console.log('   4. Restart your development server');
    return 1;
  }
}

// Run the check
const exitCode = checkEnvVars();
process.exit(exitCode);
