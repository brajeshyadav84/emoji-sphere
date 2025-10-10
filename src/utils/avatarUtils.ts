/**
 * Utility functions for avatar handling
 */

/**
 * Get avatar emoji based on gender
 * @param gender - User's gender ('Male', 'Female', or undefined)
 * @returns Appropriate avatar emoji
 */
export const getAvatarByGender = (gender?: string): string => {
  if (!gender) {
    return '👤'; // Default neutral avatar
  }
  
  const normalizedGender = gender.toLowerCase().trim();
  
  switch (normalizedGender) {
    case 'male':
    case 'm':
      return '👨'; // Man emoji
    case 'female':
    case 'f':
      return '👩'; // Woman emoji
    default:
      return '👤'; // Default neutral avatar
  }
};

/**
 * Get avatar with colorful styling
 * @param gender - User's gender
 * @returns Object with avatar emoji and styling classes
 */
export const getColorfulAvatar = (gender?: string) => {
  return {
    emoji: getAvatarByGender(gender),
    className: 'text-2xl bg-gradient-to-br from-blue-100 to-purple-100 p-2 rounded-full shadow-sm border border-gray-200'
  };
};