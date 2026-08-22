export const COUNTRY_CODES = [
  { code: '+91', name: 'India', flag: '🇮🇳', minDigits: 10, maxDigits: 10, format: 'XXXXX XXXXX' },
  { code: '+1', name: 'United States / Canada', flag: '🇺🇸', minDigits: 10, maxDigits: 10, format: '(XXX) XXX-XXXX' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', minDigits: 10, maxDigits: 10, format: 'XXXX XXXXXX' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', minDigits: 9, maxDigits: 10, format: 'XXX XXX XXX' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', minDigits: 10, maxDigits: 11, format: 'XXXX XXXXXXX' },
  { code: '+33', name: 'France', flag: '🇫🇷', minDigits: 9, maxDigits: 9, format: 'X XX XX XX XX' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', minDigits: 10, maxDigits: 10, format: 'XX-XXXX-XXXX' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', minDigits: 8, maxDigits: 8, format: 'XXXX XXXX' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪', minDigits: 9, maxDigits: 9, format: 'XX XXX XXXX' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', minDigits: 9, maxDigits: 9, format: 'XX XXX XXXX' },
  { code: '+86', name: 'China', flag: '🇨🇳', minDigits: 11, maxDigits: 11, format: 'XXX XXXX XXXX' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', minDigits: 10, maxDigits: 11, format: '(XX) XXXXX-XXXX' },
  { code: '+7', name: 'Russia / Kazakhstan', flag: '🇷🇺', minDigits: 10, maxDigits: 10, format: 'XXX XXX-XX-XX' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', minDigits: 10, maxDigits: 10, format: 'XXXX-XXXXXX' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', minDigits: 10, maxDigits: 10, format: 'XXX XXXXXXX' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', minDigits: 9, maxDigits: 9, format: 'XX XXX XXXX' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵', minDigits: 10, maxDigits: 10, format: 'XX-XXXXXXX' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', minDigits: 9, maxDigits: 9, format: 'XX XXX XXXX' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱', minDigits: 9, maxDigits: 9, format: 'X XX XX XX XX' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭', minDigits: 9, maxDigits: 9, format: 'XX XXX XX XX' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪', minDigits: 9, maxDigits: 9, format: 'XX-XXX XX XX' },
  { code: '+47', name: 'Norway', flag: '🇳🇴', minDigits: 8, maxDigits: 8, format: 'XXX XX XXX' },
  { code: '+34', name: 'Spain', flag: '🇪🇸', minDigits: 9, maxDigits: 9, format: 'XXX XX XX XX' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', minDigits: 9, maxDigits: 10, format: 'XXX XXX XXXX' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', minDigits: 9, maxDigits: 10, format: 'XX-XXX XXXX' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩', minDigits: 10, maxDigits: 12, format: 'XXX-XXXX-XXXX' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿', minDigits: 8, maxDigits: 10, format: 'XX XXX XXXX' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷', minDigits: 9, maxDigits: 10, format: 'XX-XXXX-XXXX' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽', minDigits: 10, maxDigits: 10, format: 'XX XXXX XXXX' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬', minDigits: 10, maxDigits: 10, format: 'XX XXXX XXXX' }
];

export function validatePhoneNumber(rawNumber, countryCodeStr = '+91') {
  if (!rawNumber) return { isValid: false, message: 'Phone number is required' };
  
  // Strip non-digit characters
  const digitsOnly = String(rawNumber).replace(/\D/g, '');
  
  const country = COUNTRY_CODES.find(c => c.code === countryCodeStr) || {
    code: countryCodeStr,
    minDigits: 7,
    maxDigits: 15
  };

  if (digitsOnly.length === 0) {
    return { isValid: false, message: 'Please enter mobile number' };
  }

  if (digitsOnly.length < country.minDigits) {
    return { 
      isValid: false, 
      digitsCount: digitsOnly.length,
      expected: country.minDigits,
      message: `Too short (${digitsOnly.length}/${country.minDigits} digits for ${country.name || countryCodeStr})` 
    };
  }

  if (digitsOnly.length > country.maxDigits) {
    return { 
      isValid: false, 
      digitsCount: digitsOnly.length,
      expected: country.maxDigits,
      message: `Too long (${digitsOnly.length}/${country.maxDigits} digits for ${country.name || countryCodeStr})` 
    };
  }

  return {
    isValid: true,
    digitsCount: digitsOnly.length,
    formatted: `${country.code} ${digitsOnly}`,
    fullE164: `${country.code}${digitsOnly}`,
    message: `✓ Valid number for ${country.name || countryCodeStr}`
  };
}
