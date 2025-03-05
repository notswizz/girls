/**
 * Generates a unique username in the format of 3 letters followed by 3 numbers
 * e.g., ABC123, XYZ789
 */
export function generateModelUsername() {
  // Generate 3 random uppercase letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let letterPart = '';
  for (let i = 0; i < 3; i++) {
    letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Generate 3 random numbers
  const numberPart = Math.floor(Math.random() * 900 + 100); // 100-999
  
  return `${letterPart}${numberPart}`;
}

/**
 * Validates if a string matches the 3-letter-3-number format
 * @param {string} username - The username to validate
 * @returns {boolean} Whether the username is valid
 */
export function isValidModelUsername(username) {
  if (!username) return false;
  
  // Must be exactly 6 characters
  if (username.length !== 6) return false;
  
  // First 3 characters must be letters
  const letters = username.substring(0, 3);
  if (!/^[A-Za-z]{3}$/.test(letters)) return false;
  
  // Last 3 characters must be numbers
  const numbers = username.substring(3);
  if (!/^[0-9]{3}$/.test(numbers)) return false;
  
  return true;
}

/**
 * Formats a username to the 3-letter-3-number format
 * If not in the correct format, generates a new username
 * @param {string} username - The username to format
 * @returns {string} A properly formatted username
 */
export function formatModelUsername(username) {
  if (isValidModelUsername(username)) {
    // Convert first 3 characters to uppercase if they're valid letters
    return username.substring(0, 3).toUpperCase() + username.substring(3);
  }
  
  // If invalid, generate a new username
  return generateModelUsername();
} 