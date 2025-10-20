#!/usr/bin/env node

/**
 * Script to ensure required labels exist in the repository
 * This can be run manually or added to the workflow
 */

const { Octokit } = require('@octokit/rest');

const OWNER = process.env.GITHUB_REPOSITORY_OWNER || '494311870';
const REPO = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'Block9x9';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Required labels for the issues
const REQUIRED_LABELS = [
  { name: 'enhancement', color: 'a2eeef', description: 'New feature or request' },
  { name: 'bug', color: 'd73a4a', description: 'Something isn\'t working' },
  { name: 'test', color: '0e8a16', description: 'Testing related' },
  { name: 'chore', color: 'fbca04', description: 'Maintenance tasks' },
  { name: 'documentation', color: '0075ca', description: 'Improvements or additions to documentation' }
];

async function ensureLabels() {
  console.log('Checking labels...\n');
  
  try {
    // Get existing labels
    const { data: existingLabels } = await octokit.issues.listLabelsForRepo({
      owner: OWNER,
      repo: REPO
    });
    
    const existingLabelNames = new Set(existingLabels.map(l => l.name));
    
    for (const label of REQUIRED_LABELS) {
      if (existingLabelNames.has(label.name)) {
        console.log(`✓ Label "${label.name}" already exists`);
      } else {
        console.log(`Creating label "${label.name}"...`);
        try {
          await octokit.issues.createLabel({
            owner: OWNER,
            repo: REPO,
            name: label.name,
            color: label.color,
            description: label.description
          });
          console.log(`✓ Created label "${label.name}"`);
        } catch (error) {
          console.error(`✗ Failed to create label "${label.name}":`, error.message);
        }
      }
    }
    
    console.log('\n✓ All required labels are ready!');
  } catch (error) {
    console.error('Error checking labels:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  if (!process.env.GITHUB_TOKEN) {
    console.error('Error: GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }
  
  ensureLabels().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { ensureLabels, REQUIRED_LABELS };
