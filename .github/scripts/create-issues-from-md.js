#!/usr/bin/env node

/**
 * Script to batch create GitHub issues from docs/issues-list.md
 * This script is designed to be run in GitHub Actions with GITHUB_TOKEN available
 */

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

// Get repository info from environment or defaults
const OWNER = process.env.GITHUB_REPOSITORY_OWNER || '494311870';
const REPO = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'Block9x9';
const ISSUES_FILE = path.join(process.cwd(), 'docs/issues-list.md');
const DRY_RUN = process.env.DRY_RUN === 'true';

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

/**
 * Parse issues from markdown file
 */
function parseIssuesFromMarkdown(content) {
  const issues = [];
  const lines = content.split('\n');
  
  let currentIssue = null;
  let currentSection = null;
  let collectingContent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match issue title: ## N. type(scope): title OR ## N. type: title
    const titleMatch = line.match(/^##\s+(\d+)\.\s+(feat|fix|test|chore|docs)(?:\(([^)]+)\))?:\s+(.+)$/);
    
    if (titleMatch) {
      // Save previous issue if exists
      if (currentIssue) {
        issues.push(currentIssue);
      }
      
      // Start new issue
      const [, number, type, scope, title] = titleMatch;
      const issueScope = scope || type; // Use type as scope if no scope provided
      currentIssue = {
        number: parseInt(number),
        type,
        scope: issueScope,
        title: scope ? `${type}(${scope}): ${title}` : `${type}: ${title}`,
        rawTitle: title,
        description: '',
        acceptanceCriteria: [],
        dependencies: '',
        estimation: ''
      };
      collectingContent = false;
      currentSection = null;
    }
    // Match sections
    else if (line.startsWith('描述：') || line.startsWith('描述:')) {
      currentSection = 'description';
      const desc = line.substring(3).trim();
      if (desc) {
        currentIssue.description = desc;
      }
      collectingContent = true;
    }
    else if (line.startsWith('验收准则：') || line.startsWith('验收准则:')) {
      currentSection = 'acceptanceCriteria';
      collectingContent = true;
    }
    else if (line.startsWith('依赖：') || line.startsWith('依赖:')) {
      currentSection = 'dependencies';
      currentIssue.dependencies = line.substring(3).trim();
      collectingContent = false;
    }
    else if (line.startsWith('估时：') || line.startsWith('估时:')) {
      currentSection = 'estimation';
      currentIssue.estimation = line.substring(3).trim();
      collectingContent = false;
    }
    else if (line.trim() === '---') {
      collectingContent = false;
      currentSection = null;
    }
    // Collect content for current section
    else if (collectingContent && line.trim()) {
      if (currentSection === 'description') {
        if (currentIssue.description) {
          currentIssue.description += '\n' + line.trim();
        } else {
          currentIssue.description = line.trim();
        }
      } else if (currentSection === 'acceptanceCriteria') {
        if (line.trim().startsWith('-')) {
          currentIssue.acceptanceCriteria.push(line.trim());
        }
      }
    }
  }
  
  // Save last issue
  if (currentIssue) {
    issues.push(currentIssue);
  }
  
  return issues;
}

/**
 * Format issue body for GitHub
 */
function formatIssueBody(issue) {
  let body = `## 概要\n\n${issue.description}\n\n`;
  
  if (issue.acceptanceCriteria.length > 0) {
    body += `## 验收准则\n\n`;
    issue.acceptanceCriteria.forEach(criterion => {
      // Convert markdown list to checkbox
      const text = criterion.replace(/^-\s*/, '');
      body += `- [ ] ${text}\n`;
    });
    body += '\n';
  }
  
  if (issue.estimation) {
    body += `## 估时\n\n${issue.estimation}\n\n`;
  }
  
  if (issue.dependencies && issue.dependencies !== '无') {
    body += `## 依赖\n\n`;
    if (issue.dependencies.includes(',')) {
      const deps = issue.dependencies.split(',').map(d => d.trim());
      body += `依赖 issue #${deps.join(', #')}\n\n`;
    } else {
      body += `依赖 issue #${issue.dependencies}\n\n`;
    }
  }
  
  body += `---\n\n*此 issue 由 [create-issues.yml](../.github/workflows/create-issues.yml) 从 [issues-list.md](../docs/issues-list.md) 自动创建*`;
  
  return body.trim();
}

/**
 * Determine labels based on issue type
 */
function getLabels(issue) {
  const labels = [];
  
  switch (issue.type) {
    case 'feat':
      labels.push('enhancement');
      break;
    case 'fix':
      labels.push('bug');
      break;
    case 'test':
      labels.push('test');
      break;
    case 'chore':
      labels.push('chore');
      break;
    case 'docs':
      labels.push('documentation');
      break;
  }
  
  return labels;
}

/**
 * Create a single GitHub issue
 */
async function createIssue(issue) {
  const body = formatIssueBody(issue);
  const labels = getLabels(issue);
  
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Creating issue: ${issue.title}`);
  
  if (DRY_RUN) {
    console.log('  Labels:', labels.join(', '));
    console.log('  Body preview:', body.substring(0, 100) + '...');
    return { number: issue.number, title: issue.title };
  }
  
  try {
    const response = await octokit.issues.create({
      owner: OWNER,
      repo: REPO,
      title: issue.title,
      body: body,
      labels: labels
    });
    
    console.log(`✓ Created issue #${response.data.number}: ${issue.title}`);
    return response.data;
  } catch (error) {
    console.error(`✗ Failed to create issue: ${issue.title}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  // Check for GitHub token
  if (!process.env.GITHUB_TOKEN) {
    console.error('Error: GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }
  
  // Read and parse issues file
  console.log(`Reading issues from: ${ISSUES_FILE}`);
  if (!fs.existsSync(ISSUES_FILE)) {
    console.error(`Error: File not found: ${ISSUES_FILE}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(ISSUES_FILE, 'utf-8');
  const issues = parseIssuesFromMarkdown(content);
  
  console.log(`\nFound ${issues.length} issues to create:\n`);
  issues.forEach(issue => {
    console.log(`  ${issue.number}. ${issue.title}`);
  });
  
  console.log(`\nRepository: ${OWNER}/${REPO}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no issues will be created)' : 'LIVE'}`);
  console.log('\nCreating issues...\n');
  
  // Create issues sequentially to maintain order
  const createdIssues = [];
  for (const issue of issues) {
    try {
      const created = await createIssue(issue);
      createdIssues.push(created);
      // Small delay to avoid rate limiting
      if (!DRY_RUN) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Failed to create issue ${issue.number}, stopping.`);
      process.exit(1);
    }
  }
  
  console.log(`\n✓ Successfully ${DRY_RUN ? 'validated' : 'created'} ${createdIssues.length} issues!`);
  if (!DRY_RUN) {
    console.log(`\nView them at: https://github.com/${OWNER}/${REPO}/issues`);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { parseIssuesFromMarkdown, formatIssueBody, getLabels };
