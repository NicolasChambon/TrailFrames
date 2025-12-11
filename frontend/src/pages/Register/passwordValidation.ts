export interface PasswordCriteria {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_CRITERIA: PasswordCriteria[] = [
  {
    key: "minLength",
    label: "8 caractères minimum",
    test: (password) => password.length >= 8,
  },
  {
    key: "lowercase",
    label: "Une lettre minuscule",
    test: (password) => /[a-z]/.test(password),
  },
  {
    key: "uppercase",
    label: "Une lettre majuscule",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    key: "digit",
    label: "Un chiffre",
    test: (password) => /\d/.test(password),
  },
  {
    key: "specialChar",
    label: "Un caractère spécial (@$!%*?&)",
    test: (password) => /[@$!%*?&]/.test(password),
  },
];

export function isPasswordStrong(password: string): boolean {
  return PASSWORD_CRITERIA.every((criteria) => criteria.test(password));
}

export function getPasswordValidation(password: string) {
  return PASSWORD_CRITERIA.map((criteria) => ({
    ...criteria,
    isValid: criteria.test(password),
  }));
}
