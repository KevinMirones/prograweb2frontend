export const isValidEmail = (email: string): boolean => {
  // RFC 5322 official standard regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Allows optional +, spaces, dashes. Must contain at least 7 digits.
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  // Simple check: remove non-digits, check length
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

export const isValidName = (name: string): boolean => {
  // Allows letters, spaces, accents. No numbers or special symbols.
  // Min length 2.
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

export const sanitizeInput = (input: string): string => {
  // Basic XSS prevention (though React does this mostly by default)
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
};
