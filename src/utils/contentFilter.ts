// Content filtering utility
const abusiveWords = [
  'fuck',
  'ass', 'hell', 'crap', 'suck', 'loser', 'dumb', 'moron', 'retard',
  'shut up', 'go away', 'ugly', 'fat', 'weird', 'freak', 'nerd', 'jerk',
  'asshole', 'bastard', 'dickhead',
  'screw you', 'wtf', 
  'noob', 'trash', 'garbage', 'worthless', 'pathetic', 'lame', 'gay',
  'retarded', 'autistic', 'cancer', 'aids', 'disease', 'plague',
  'kill yourself', 'kys', 'neck yourself', 'rope', 'an hero',
  'fag', 'faggot', 'dyke', 'homo',
  'nigger', 'nigga', 'spic', 'chink', 'gook', 'kike', 'wetback',
  'terrorist', 'jihad', 'allahu akbar', 'bomb', 'explosion', 'massacre',
];

const sexualContent = [
  'sex', 'sexy', 'nude', 'naked', 'porn', 'breast', 'penis', 'vagina',
  'orgasm', 'masturbate', 'horny', 'aroused', 'erotic', 'intimate',
  'boobs', 'tits', 'dick', 'cock', 'pussy', 'ass', 'butt', 'booty',
  'anal', 'oral', 'blow job', 'blowjob', 'handjob', 'cumshot', 'cum',
  'jerk off', 'jack off', 'finger', 'fondle', 'grope', 'molest',
  'rape', 'sexual', 'intercourse', 'threesome', 'foursome', 'orgy',
  'dildo', 'vibrator', 'condom', 'lubricant', 'fetish', 'kinky',
  'stripper', 'prostitute', 'whore', 'slut', 'bitch', 'milf',
  'sexting', 'nudes', 'panties', 'bra', 'underwear', 'lingerie',
  'makeout', 'hook up', 'one night stand', 'friends with benefits',
  'boner', 'hard on', 'wet', 'moist', 'climax', 'squirt', 'spread',
  'thrust', 'pound', 'bang', 'screw', 'ride', 'mount', 'hump',
  'suck', 'lick', 'kiss', 'touch', 'feel', 'caress', 'stroke',
  '69', 'missionary', 'doggy', 'cowgirl', 'spooning', 'bdsm',
  'bondage', 'dominance', 'submission', 'sadism', 'masochism',
  'porn hub', 'xvideos', 'redtube', 'youporn', 'adult', 'xxx',
  'onlyfans', 'cam girl', 'escort', 'sugar daddy', 'sugar baby',
  'netflix and chill', 'dtf', 'fwb', 'nsa', 'ons', 'sti', 'std'
];

// Function to normalize text and detect obfuscated words
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[0-9]/g, '') // Remove numbers used as obfuscation
    .replace(/(.)\1+/g, '$1') // Replace repeated characters (e.g., "seeeex" -> "sex")
    .trim();
};

// Function to detect obfuscated words (like s.e.x, f-u-c-k, s3x, etc.)
const detectObfuscatedWord = (text: string, word: string): boolean => {
  const normalizedText = normalizeText(text);
  const normalizedWord = normalizeText(word);
  
  // Direct match after normalization
  if (normalizedText.includes(normalizedWord)) {
    return true;
  }
  
  // Create pattern for obfuscated detection
  const obfuscatedPattern = word
    .split('')
    .join('[^a-z]*') // Allow any non-letter characters between letters
    .replace(/[aeiou]/g, '[aeiou0-9@#$%^&*]*'); // Vowels can be replaced with numbers or symbols
  
  const regex = new RegExp(obfuscatedPattern, 'gi');
  return regex.test(text);
};

// Enhanced word detection that checks for various obfuscation techniques
const containsInappropriateWord = (text: string, wordList: string[]): boolean => {
  const normalizedText = normalizeText(text);
  
  for (const word of wordList) {
    // Check direct match
    if (normalizedText.includes(word)) {
      return true;
    }
    
    // Check obfuscated versions
    if (detectObfuscatedWord(text, word)) {
      return true;
    }
    
    // Check common substitutions and leetspeak
    const substitutedText = text
      .replace(/[0@]/g, 'o')
      .replace(/[1!|]/g, 'i')
      .replace(/[3]/g, 'e')
      .replace(/[4@]/g, 'a')
      .replace(/[5$]/g, 's')
      .replace(/[7]/g, 't')
      .replace(/[8]/g, 'b')
      .replace(/[+]/g, 't')
      .replace(/[*]/g, 'a')
      .replace(/[6]/g, 'g')
      .replace(/[9]/g, 'g')
      .replace(/[2]/g, 'z')
      .replace(/[#]/g, 'h')
      .replace(/[&]/g, 'and')
      .toLowerCase();
    
    if (substitutedText.includes(word)) {
      return true;
    }
    
    // Check for words split by spaces, dots, dashes, underscores, etc.
    const spacedPattern = word.split('').join('[\\s\\-_\\.\\*\\+\\#\\@\\$\\%\\^\\&\\(\\)]*');
    const spacedRegex = new RegExp(spacedPattern, 'gi');
    if (spacedRegex.test(text)) {
      return true;
    }
    
    // Check for backwards writing
    const reversedWord = word.split('').reverse().join('');
    if (normalizedText.includes(reversedWord)) {
      return true;
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

// Test function to demonstrate enhanced filtering (for development only)
export const testContentFilter = () => {
  if (process.env.NODE_ENV === 'development') {
    const testCases = [
      's.e.x',
      'f-u-c-k',
      's3x',
      'seeeex',
      'f_u_c_k',
      'f*u*c*k',
      'sex spelled backwards: xes',
      'F.U.C.K',
      'S E X',
      'normal content',
      'educational content about biology'
    ];
    
    console.log('Content Filter Test Results:');
    testCases.forEach(testCase => {
      const result = validateContent(testCase);
      console.log(`"${testCase}": ${result.isValid ? 'ALLOWED' : 'BLOCKED'} - ${result.message}`);
    });
  }
};