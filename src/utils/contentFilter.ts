// Content filtering utility - More reasonable filtering for educational platform
const abusiveWords = [
  'fuck', 'fucking', 'fucked', 'fucker',
  'shit', 'shitting', 'shitty',
  'asshole', 'bastard', 'dickhead', 'bitch',
  'retard', 'retarded',
  'kill yourself', 'kys', 'neck yourself',
  'fag', 'faggot', 'dyke',
  'nigger', 'nigga', 'spic', 'chink', 'gook', 'kike', 'wetback',
  'terrorist', 'bomb threat', 'massacre', 'school shooting'
];

const sexualContent = [
  'porn', 'pornography', 'nude', 'naked', 'nudes',
  'penis', 'vagina', 'cock', 'pussy', 'dick',
  'masturbate', 'masturbation', 'orgasm',
  'blow job', 'blowjob', 'handjob', 'cumshot',
  'jerk off', 'jack off',
  'rape', 'sexual assault', 'molest',
  'threesome', 'foursome', 'orgy',
  'dildo', 'vibrator', 'sex toy',
  'prostitute', 'whore', 'slut',
  'sexting', 'send nudes',
  'porn hub', 'pornhub', 'xvideos', 'redtube', 'youporn', 'xxx videos',
  'onlyfans', 'cam girl', 'escort',
  'netflix and chill', 'dtf', 'friends with benefits'
];

// Function to normalize text for better matching
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

// Enhanced word detection with better precision to avoid false positives
const containsInappropriateWord = (text: string, wordList: string[]): boolean => {
  const normalizedText = normalizeText(text);
  
  for (const word of wordList) {
    // Only check for exact word matches with word boundaries
    // This prevents false positives like "assessment" triggering on "ass"
    const exactWordRegex = new RegExp(`\\b${word}\\b`, 'gi');
    if (exactWordRegex.test(normalizedText)) {
      return true;
    }
    
    // Check for obvious obfuscation with special characters between letters
    // Only for words longer than 3 characters to avoid false positives
    if (word.length > 3) {
      const obfuscatedPattern = word
        .split('')
        .join('[\\s\\-_\\.\\*\\+\\#\\@\\$\\%\\^\\&]*');
      const obfuscatedRegex = new RegExp(`\\b${obfuscatedPattern}\\b`, 'gi');
      if (obfuscatedRegex.test(text)) {
        return true;
      }
    }
    
    // Check for leetspeak substitutions for explicit words only
    if (word.length > 4 && (word.includes('fuck') || word.includes('shit') || word === 'porn')) {
      const substitutedText = text
        .replace(/[0@]/g, 'o')
        .replace(/[1!|]/g, 'i')
        .replace(/[3]/g, 'e')
        .replace(/[4@]/g, 'a')
        .replace(/[5$]/g, 's')
        .replace(/[7]/g, 't')
        .toLowerCase();
      
      const substitutedRegex = new RegExp(`\\b${word}\\b`, 'gi');
      if (substitutedRegex.test(substitutedText)) {
        return true;
      }
    }
  }
  
  return false;
};

// XSS prevention - detect script tags and javascript protocols
const xssPatterns = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe[^>]*>/gi,
  /<object[^>]*>/gi,
  /<embed[^>]*>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi,
  /eval\s*\(/gi,
  /setTimeout\s*\(/gi,
  /setInterval\s*\(/gi,
  /Function\s*\(/gi,
  /window\./gi,
  /document\./gi
];

export interface ContentValidationResult {
  isValid: boolean;
  message: string;
  type?: 'abusive' | 'sexual' | 'xss';
}

export const validateContent = (content: string): ContentValidationResult => {
  const cleanContent = content.toLowerCase().trim();
  
  // Check for XSS attempts
  for (const pattern of xssPatterns) {
    if (pattern.test(content)) {
      return {
        isValid: false,
        message: '🚫 Your post contains unsafe code. Please remove any script tags or JavaScript code.',
        type: 'xss'
      };
    }
  }
  
  // Check for abusive language using enhanced detection
  if (containsInappropriateWord(content, abusiveWords)) {
    return {
      isValid: false,
      message: '😔 Please use kind and respectful language. Let\'s keep our community friendly!',
      type: 'abusive'
    };
  }
  
  // Check for sexual content using enhanced detection
  if (containsInappropriateWord(content, sexualContent)) {
    return {
      isValid: false,
      message: '📚 This content is not appropriate for students. Please share educational or fun content instead!',
      type: 'sexual'
    };
  }
  
  return {
    isValid: true,
    message: 'Content is appropriate!'
  };
};

// Sanitize content to prevent XSS
export const sanitizeContent = (content: string): string => {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Test function to demonstrate filtering (for development only)
export const testContentFilter = () => {
  if (process.env.NODE_ENV === 'development') {
    const testCases = [
      'just finish my color work now moving to math homework',
      'I need to assess my work',
      'This class sucks', // Should be allowed as it's mild
      'fuck this homework', // Should be blocked
      'I love this assignment',
      'send nudes', // Should be blocked
      'normal educational content',
      'working on my assessment',
      'I feel good about this project', // Should be allowed
      'porn websites', // Should be blocked
      'intimate conversation' // Should be allowed as it can be educational
    ];
    
    console.log('Content Filter Test Results:');
    testCases.forEach(testCase => {
      const result = validateContent(testCase);
      console.log(`"${testCase}": ${result.isValid ? 'ALLOWED' : 'BLOCKED'} - ${result.message}`);
    });
  }
};