#!/usr/bin/env node

// Enhanced AI Code Review Bot for Emoji Sphere Project
// Supports both frontend (React) and backend (Node.js/Express) repositories

import { OpenAI } from 'openai';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';

class EmojiSphereAIReviewer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.github = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Project-specific rules for Emoji Sphere
    this.projectRules = {
      frontend: {
        patterns: {
          react: [
            /useEffect\s*\(/,
            /useState\s*\(/,
            /useCallback\s*\(/,
            /useMemo\s*\(/
          ],
          performance: [
            /\.map\(.*\.map\(/,  // Nested maps
            /for.*in.*length/,   // Inefficient loops
            /document\.querySelector/  // DOM queries in React
          ],
          security: [
            /dangerouslySetInnerHTML/,
            /eval\s*\(/,
            /innerHTML\s*=/
          ],
          accessibility: [
            /alt\s*=/,
            /aria-/,
            /role\s*=/,
            /tabIndex/
          ]
        }
      },
      backend: {
        patterns: {
          api: [
            /app\.(get|post|put|delete|patch)/,
            /router\.(get|post|put|delete|patch)/,
            /req\.(body|params|query)/,
            /res\.(json|send|status)/
          ],
          security: [
            /password/i,
            /jwt/i,
            /auth/i,
            /cors/i,
            /helmet/i
          ],
          database: [
            /\.find\(/,
            /\.findOne\(/,
            /\.create\(/,
            /\.update\(/,
            /\.delete\(/,
            /SELECT.*FROM/i,
            /INSERT.*INTO/i
          ],
          performance: [
            /\.sync\(/,
            /blocking.*operation/i,
            /for.*await/
          ]
        }
      }
    };
  }

  async reviewPullRequest(owner, repo, pullNumber, projectType = 'auto') {
    try {
      console.log(`🤖 Starting AI review for ${owner}/${repo} PR #${pullNumber}`);
      
      // Auto-detect project type if not specified
      if (projectType === 'auto') {
        projectType = this.detectProjectType(repo);
      }
      
      console.log(`📁 Detected project type: ${projectType}`);

      // Get PR information
      const prData = await this.github.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
      });

      // Get PR files and diff
      const prFiles = await this.github.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
      });

      console.log(`📂 Found ${prFiles.data.length} changed files`);

      const reviews = [];
      
      for (const file of prFiles.data) {
        if (this.shouldReviewFile(file.filename, projectType)) {
          console.log(`🔍 Analyzing: ${file.filename}`);
          const review = await this.analyzeFile(file, projectType);
          if (review.issues.length > 0) {
            reviews.push(review);
          }
        }
      }

      // Generate and post comprehensive review
      if (reviews.length > 0) {
        await this.postComprehensiveReview(owner, repo, pullNumber, reviews, prData, projectType);
      } else {
        await this.postPositiveReview(owner, repo, pullNumber, prData, projectType);
      }

      console.log(`✅ AI review completed for PR #${pullNumber}`);
      return reviews;

    } catch (error) {
      console.error('❌ AI Review failed:', error);
      await this.postErrorComment(owner, repo, pullNumber, error);
      throw error;
    }
  }

  detectProjectType(repoName) {
    if (repoName.toLowerCase().includes('backend') || repoName.toLowerCase().includes('api')) {
      return 'backend';
    } else if (repoName.toLowerCase().includes('frontend') || repoName.toLowerCase().includes('web')) {
      return 'frontend';
    } else {
      // Default based on your repos
      return repoName.includes('emoji-sphere-backend') ? 'backend' : 'frontend';
    }
  }

  shouldReviewFile(filename, projectType) {
    const reviewableExtensions = {
      frontend: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html', '.css', '.scss'],
      backend: ['.js', '.ts', '.py', '.java', '.go', '.rs', '.php', '.rb', '.cs'],
      common: ['.json', '.yaml', '.yml', '.md', '.sql']
    };

    const extensions = [
      ...reviewableExtensions[projectType] || [],
      ...reviewableExtensions.common
    ];

    const shouldReview = extensions.some(ext => filename.endsWith(ext));
    
    // Skip certain files
    const skipPatterns = [
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /coverage/,
      /\.min\./,
      /package-lock\.json/,
      /yarn\.lock/
    ];

    const shouldSkip = skipPatterns.some(pattern => pattern.test(filename));
    
    return shouldReview && !shouldSkip;
  }

  async analyzeFile(file, projectType) {
    const { filename, patch, additions, deletions } = file;
    
    console.log(`🔬 Deep analyzing ${filename}...`);
    
    // Build context-aware prompt
    const prompt = this.buildAnalysisPrompt(filename, patch, projectType);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(projectType)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const aiAnalysis = response.choices[0].message.content;
      const structuredReview = this.parseAIResponse(aiAnalysis, file);
      
      // Add project-specific pattern checks
      const patternIssues = this.runProjectPatternChecks(patch, filename, projectType);
      
      return {
        filename,
        projectType,
        aiAnalysis: structuredReview,
        patternIssues,
        issues: [...structuredReview.issues || [], ...patternIssues],
        metrics: {
          additions,
          deletions,
          complexity: this.calculateComplexity(patch),
          riskScore: this.calculateRiskScore(patch, filename, projectType)
        }
      };

    } catch (error) {
      console.error(`❌ Failed to analyze ${filename}:`, error.message);
      return {
        filename,
        projectType,
        aiAnalysis: {
          summary: 'AI analysis failed',
          overallRisk: 'MEDIUM',
          issues: [],
          positives: [],
          emojiSpecificNotes: [],
          nextSteps: ['Manual review recommended']
        },
        patternIssues: [],
        issues: [{
          severity: 'LOW',
          type: 'analysis',
          description: `AI analysis failed: ${error.message}`,
          recommendation: 'Manual review recommended'
        }],
        metrics: { additions, deletions, complexity: 1, riskScore: 0 }
      };
    }
  }

  getSystemPrompt(projectType) {
    const basePrompt = `You are an expert software engineer specializing in modern web development and the Emoji Sphere project.`;
    
    const projectSpecificPrompts = {
      frontend: `${basePrompt}
      
      **FRONTEND EXPERTISE:**
      - React.js best practices and performance optimization
      - JavaScript/TypeScript modern patterns
      - UI/UX accessibility standards
      - Frontend security (XSS, CSRF prevention)
      - Modern CSS and responsive design
      - Bundle optimization and lazy loading
      
      **EMOJI SPHERE CONTEXT:**
      This is a React-based emoji application. Focus on:
      - Component reusability and performance
      - Emoji rendering and display optimization
      - User interaction responsiveness
      - Accessibility for emoji content
      - Cross-browser compatibility`,
      
      backend: `${basePrompt}
      
      **BACKEND EXPERTISE:**
      - Node.js/Express.js best practices
      - RESTful API design and security
      - Database optimization and security
      - Authentication and authorization
      - Error handling and logging
      - Performance and scalability
      
      **EMOJI SPHERE CONTEXT:**
      This is the backend API for an emoji application. Focus on:
      - Efficient emoji data management
      - API rate limiting and caching
      - User data protection
      - Scalable architecture for emoji operations
      - Database performance for emoji queries`
    };

    return projectSpecificPrompts[projectType] || projectSpecificPrompts.frontend;
  }

  buildAnalysisPrompt(filename, patch, projectType) {
    const projectContext = {
      frontend: 'React-based emoji sphere frontend application',
      backend: 'Node.js/Express emoji sphere backend API'
    };

    return `
**EMOJI SPHERE PROJECT CODE REVIEW**

📁 **File**: ${filename}
🎯 **Project**: ${projectContext[projectType]}
🔧 **Type**: ${projectType}

**CODE CHANGES:**
\`\`\`diff
${patch}
\`\`\`

**ANALYSIS PRIORITIES:**

${projectType === 'frontend' ? `
1. **REACT/FRONTEND SPECIFIC:**
   - Component structure and reusability
   - React hooks usage and best practices
   - State management efficiency
   - Performance optimizations (memoization, lazy loading)
   - Accessibility (ARIA labels, keyboard navigation)
   - Responsive design considerations

2. **EMOJI FUNCTIONALITY:**
   - Emoji rendering performance
   - Unicode handling correctness
   - Cross-platform emoji compatibility
   - Search and filter optimization
   - User interaction responsiveness
` : `
1. **API/BACKEND SPECIFIC:**
   - RESTful API design consistency
   - Input validation and sanitization
   - Authentication and authorization
   - Error handling and HTTP status codes
   - Database query optimization
   - API rate limiting and caching

2. **EMOJI DATA MANAGEMENT:**
   - Efficient emoji data storage/retrieval
   - Search algorithm optimization
   - Category and tagging logic
   - Unicode handling and validation
   - Caching strategy for emoji metadata
`}

3. **SECURITY CONCERNS:**
   - Input validation vulnerabilities
   - Authentication/authorization bypasses
   - Data exposure risks
   - XSS/injection attack vectors
   ${projectType === 'backend' ? '- SQL injection possibilities' : '- DOM manipulation risks'}

4. **PERFORMANCE ISSUES:**
   - Algorithm complexity problems
   ${projectType === 'frontend' ? '- Bundle size optimizations' : '- Database query efficiency'}
   - Memory usage patterns
   ${projectType === 'frontend' ? '- Render performance' : '- Response time optimization'}

5. **CODE QUALITY:**
   - Maintainability and readability
   - Error handling robustness
   - Testing considerations
   - Documentation completeness

**RESPONSE FORMAT:**
Provide analysis as JSON:
\`\`\`json
{
  "summary": "Brief assessment of the changes",
  "overallRisk": "LOW|MEDIUM|HIGH|CRITICAL",
  "issues": [
    {
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "type": "security|performance|functionality|quality",
      "line": line_number_or_null,
      "title": "Brief issue title", 
      "description": "Detailed description",
      "recommendation": "Specific fix suggestion",
      "emojiContext": "How this affects emoji functionality"
    }
  ],
  "positives": ["Good practices found"],
  "emojiSpecificNotes": ["Notes about emoji-related functionality"],
  "nextSteps": ["Recommended actions"]
}
\`\`\`
`;
  }

  runProjectPatternChecks(patch, filename, projectType) {
    const issues = [];
    const patterns = this.projectRules[projectType]?.patterns || {};

    // Frontend-specific checks
    if (projectType === 'frontend') {
      // Check for React anti-patterns
      if (patterns.performance.some(pattern => pattern.test(patch))) {
        issues.push({
          severity: 'MEDIUM',
          type: 'performance',
          title: 'Potential performance issue in React component',
          description: 'Found patterns that could impact React performance',
          recommendation: 'Consider using useCallback, useMemo, or optimizing render logic',
          emojiContext: 'Poor performance can affect emoji loading and display speed'
        });
      }

      // Check for accessibility issues
      if (patch.includes('<img') && !patterns.accessibility.some(p => p.test(patch))) {
        issues.push({
          severity: 'HIGH',
          type: 'accessibility',
          title: 'Missing accessibility attributes',
          description: 'Image elements should have alt text for screen readers',
          recommendation: 'Add appropriate alt attributes to img elements',
          emojiContext: 'Emoji images need descriptive alt text for accessibility'
        });
      }

      // Check for unsafe DOM manipulation
      if (patterns.security.some(pattern => pattern.test(patch))) {
        issues.push({
          severity: 'HIGH',
          type: 'security',
          title: 'Potentially unsafe DOM manipulation',
          description: 'Found patterns that could lead to XSS vulnerabilities',
          recommendation: 'Use safe React patterns instead of direct DOM manipulation',
          emojiContext: 'Ensure emoji content is safely rendered to prevent XSS'
        });
      }
    }

    // Backend-specific checks
    if (projectType === 'backend') {
      // Check for missing input validation
      if (patterns.api.some(pattern => pattern.test(patch)) && 
          !patch.includes('validation') && !patch.includes('validate')) {
        issues.push({
          severity: 'HIGH',
          type: 'security',
          title: 'Potential missing input validation',
          description: 'API endpoints should validate all inputs',
          recommendation: 'Add proper input validation middleware or checks',
          emojiContext: 'Validate emoji-related inputs to prevent malformed data'
        });
      }

      // Check for synchronous operations
      if (patterns.performance.some(pattern => pattern.test(patch))) {
        issues.push({
          severity: 'MEDIUM',
          type: 'performance',
          title: 'Potential blocking operation',
          description: 'Found patterns that might block the event loop',
          recommendation: 'Use asynchronous alternatives for I/O operations',
          emojiContext: 'Ensure emoji data operations don\'t block other requests'
        });
      }

      // Check for database security
      if (patterns.database.some(pattern => pattern.test(patch)) && 
          !patch.includes('prepared') && !patch.includes('parameterized')) {
        issues.push({
          severity: 'CRITICAL',
          type: 'security',
          title: 'Potential SQL injection vulnerability',
          description: 'Database queries should use parameterized statements',
          recommendation: 'Use prepared statements or ORM methods to prevent SQL injection',
          emojiContext: 'Protect emoji data from malicious database queries'
        });
      }
    }

    return issues;
  }

  calculateComplexity(patch) {
    const complexityPatterns = [
      /if\s*\(/g,
      /else\s*if/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /catch\s*\(/g,
      /function\s*\(/g,
      /=>\s*\{/g
    ];
    
    let complexity = 1;
    for (const pattern of complexityPatterns) {
      const matches = patch.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return Math.min(complexity, 10); // Cap at 10
  }

  calculateRiskScore(patch, filename, projectType) {
    let risk = 0;
    
    // High-risk file patterns
    const highRiskFiles = [
      /auth/i, /login/i, /password/i, /security/i,
      /admin/i, /config/i, /env/i
    ];
    
    if (highRiskFiles.some(pattern => pattern.test(filename))) {
      risk += 3;
    }

    // High-risk code patterns
    const highRiskPatterns = [
      /eval\s*\(/, /Function\s*\(/, /setTimeout.*string/,
      /\.innerHTML\s*=/, /document\.write/,
      /password.*=/, /secret.*=/, /key.*=/
    ];
    
    const riskMatches = highRiskPatterns.filter(pattern => pattern.test(patch)).length;
    risk += riskMatches * 2;

    // Large changes increase risk
    const lines = patch.split('\n').length;
    if (lines > 100) risk += 2;
    if (lines > 200) risk += 3;

    return Math.min(risk, 10); // Cap at 10
  }

  parseAIResponse(aiResponse, file) {
    try {
      // Clean up the response - sometimes AI includes markdown code blocks
      let cleanResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanResponse);
      return parsed;
    } catch (error) {
      console.warn(`⚠️ AI response parsing failed for ${file.filename}, using fallback parser`);
      return this.parseTextResponse(aiResponse);
    }
  }

  parseTextResponse(textResponse) {
    // Fallback text parser
    const issues = [];
    const lines = textResponse.split('\n');
    
    let currentIssue = null;
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('CRITICAL') || trimmedLine.includes('HIGH') || 
          trimmedLine.includes('MEDIUM') || trimmedLine.includes('LOW')) {
        
        if (currentIssue) {
          issues.push(currentIssue);
        }
        
        const severity = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].find(s => 
          trimmedLine.toUpperCase().includes(s)) || 'MEDIUM';
        
        currentIssue = {
          severity,
          type: 'general',
          title: trimmedLine,
          description: trimmedLine,
          recommendation: 'See analysis above',
          emojiContext: 'Review impact on emoji functionality'
        };
      } else if (currentIssue && trimmedLine) {
        currentIssue.description += ' ' + trimmedLine;
      }
    }
    
    if (currentIssue) {
      issues.push(currentIssue);
    }

    return {
      summary: 'AI analysis completed with text parsing fallback',
      overallRisk: issues.some(i => i.severity === 'CRITICAL') ? 'HIGH' : 'MEDIUM',
      issues,
      positives: ['Code structure appears organized'],
      emojiSpecificNotes: ['Manual review recommended for emoji-specific functionality'],
      nextSteps: ['Address identified issues', 'Test emoji functionality']
    };
  }

  async postComprehensiveReview(owner, repo, pullNumber, reviews, prData, projectType) {
    const totalIssues = reviews.reduce((sum, r) => sum + r.issues.length, 0);
    const criticalIssues = reviews.reduce((sum, r) => 
      sum + r.issues.filter(i => i.severity === 'CRITICAL').length, 0);
    const highIssues = reviews.reduce((sum, r) => 
      sum + r.issues.filter(i => i.severity === 'HIGH').length, 0);

    const overallRisk = criticalIssues > 0 ? 'CRITICAL' : 
                       highIssues > 2 ? 'HIGH' : 
                       totalIssues > 5 ? 'MEDIUM' : 'LOW';

    const riskEmoji = {
      CRITICAL: '🚨',
      HIGH: '⚠️',
      MEDIUM: '🟡', 
      LOW: '✅'
    };

    const reviewBody = `
## ${riskEmoji[overallRisk]} AI Code Review Summary - Emoji Sphere ${projectType.toUpperCase()}

**Pull Request**: [${prData.data.title}](${prData.data.html_url})
**Overall Risk Level**: ${riskEmoji[overallRisk]} ${overallRisk}

### 📊 Analysis Results
- **Total Issues**: ${totalIssues}
- **Critical Issues**: ${criticalIssues} 🚨
- **High Priority**: ${highIssues} ⚠️
- **Files Analyzed**: ${reviews.length}
- **Project Type**: ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}

### 📁 File Analysis

${reviews.map(review => `
#### 📄 \`${review.filename}\`
- **Risk Score**: ${review.metrics.riskScore}/10
- **Complexity**: ${review.metrics.complexity}/10  
- **Issues Found**: ${review.issues.length}
- **Changes**: +${review.metrics.additions} -${review.metrics.deletions}

${review.issues.length > 0 ? review.issues.map(issue => `
**${issue.severity} - ${issue.type}**: ${issue.title}
${issue.emojiContext ? `🎭 *Emoji Impact*: ${issue.emojiContext}` : ''}
*Recommendation*: ${issue.recommendation}
`).join('\n') : '✅ No issues found in this file'}
`).join('\n')}

### 🎯 Emoji Sphere Specific Notes

${projectType === 'frontend' ? `
**Frontend Considerations:**
- Ensure emoji rendering performance is optimized
- Verify accessibility for emoji content
- Check responsive design for emoji display
- Validate cross-browser emoji compatibility
` : `
**Backend Considerations:**
- Verify emoji data integrity and validation
- Check API performance for emoji operations
- Ensure proper emoji Unicode handling
- Validate emoji search and filtering logic
`}

### 🏆 Positive Findings
${reviews.flatMap(r => r.aiAnalysis?.positives || []).length > 0 ? 
  reviews.flatMap(r => r.aiAnalysis?.positives || []).map(p => `- ${p}`).join('\n') :
  '- Code follows good structural patterns\n- Changes appear well-focused'}

### 🎯 Next Steps
${criticalIssues > 0 ? '🚨 **CRITICAL**: Address critical security/functionality issues before merging' : ''}
${highIssues > 2 ? '⚠️ **HIGH PRIORITY**: Fix high-priority issues for better stability' : ''}
${totalIssues === 0 ? '✅ **APPROVED**: No significant issues detected, ready for review!' : ''}

---
*🤖 This review was generated by AI specifically for the Emoji Sphere project. It focuses on ${projectType} best practices, emoji functionality, and security considerations.*
`;

    const event = criticalIssues > 0 ? 'REQUEST_CHANGES' : 
                  totalIssues > 5 ? 'REQUEST_CHANGES' : 'COMMENT';

    await this.github.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      body: reviewBody,
      event
    });

    // Post individual line comments for critical issues
    for (const review of reviews) {
      const criticalFileIssues = review.issues.filter(i => i.severity === 'CRITICAL' && i.line);
      
      for (const issue of criticalFileIssues) {
        try {
          await this.github.pulls.createReviewComment({
            owner,
            repo,
            pull_number: pullNumber,
            body: `🚨 **CRITICAL ${issue.type.toUpperCase()}**: ${issue.description}\n\n**Fix**: ${issue.recommendation}\n\n${issue.emojiContext ? `**Emoji Impact**: ${issue.emojiContext}` : ''}`,
            commit_id: await this.getLatestCommitSha(owner, repo, pullNumber),
            path: review.filename,
            line: issue.line
          });
        } catch (commentError) {
          console.warn(`⚠️ Could not post line comment for ${review.filename}:${issue.line}`);
        }
      }
    }
  }

  async postPositiveReview(owner, repo, pullNumber, prData, projectType) {
    const reviewBody = `
## ✅ AI Code Review - Emoji Sphere ${projectType.toUpperCase()}

**Great job!** 🎉 No significant issues detected in this pull request.

### 📊 Analysis Summary
- **Risk Level**: ✅ LOW
- **Project Type**: ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}
- **Overall Assessment**: Changes look good for emoji functionality

### 🎭 Emoji Sphere Notes
${projectType === 'frontend' ? 
  '- Frontend changes appear to maintain emoji display quality\n- No accessibility or performance concerns detected' :
  '- Backend changes look safe for emoji data operations\n- API structure appears well-maintained'}

### 🏆 Positive Aspects
- Code structure is clean and well-organized
- Changes appear focused and purposeful
- No security vulnerabilities detected
- Performance patterns look efficient

---
*🤖 AI Review completed successfully for Emoji Sphere ${projectType}*
`;

    await this.github.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      body: reviewBody,
      event: 'APPROVE'
    });
  }

  async postErrorComment(owner, repo, pullNumber, error) {
    const errorBody = `
## ❌ AI Review Error

Sorry, the AI code review encountered an error:

\`\`\`
${error.message}
\`\`\`

Please proceed with manual code review. The development team has been notified.

---
*🤖 AI Review Bot for Emoji Sphere*
`;

    try {
      await this.github.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body: errorBody
      });
    } catch (commentError) {
      console.error('Failed to post error comment:', commentError);
    }
  }

  async getLatestCommitSha(owner, repo, pullNumber) {
    try {
      const pr = await this.github.pulls.get({
        owner,
        repo,
        pull_number: pullNumber
      });
      return pr.data.head.sha;
    } catch (error) {
      console.warn('Could not get latest commit SHA:', error.message);
      return null;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const index = args.findIndex(arg => arg.startsWith(`--${name}=`));
    if (index !== -1) {
      return args[index].split('=')[1];
    }
    const flagIndex = args.findIndex(arg => arg === `--${name}`);
    if (flagIndex !== -1 && args[flagIndex + 1]) {
      return args[flagIndex + 1];
    }
    return null;
  };

  const owner = getArg('owner') || process.env.GITHUB_REPOSITORY_OWNER;
  const repo = getArg('repo') || process.env.GITHUB_REPOSITORY_NAME;
  const pullNumber = getArg('pull-number') || process.env.GITHUB_PR_NUMBER;
  const projectType = getArg('type') || 'auto';

  if (!owner || !repo || !pullNumber) {
    console.error('❌ Missing required parameters');
    console.log('Usage: node ai-review-bot.js --owner=<owner> --repo=<repo> --pull-number=<number> [--type=frontend|backend]');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  if (!process.env.GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }

  try {
    const reviewer = new EmojiSphereAIReviewer();
    const results = await reviewer.reviewPullRequest(owner, repo, parseInt(pullNumber), projectType);
    
    console.log(`✅ AI review completed successfully!`);
    console.log(`📊 Analyzed ${results.length} files with issues`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ AI review failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export default EmojiSphereAIReviewer;

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}
