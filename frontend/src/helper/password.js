export const passwordHelp =
  'Use 12–128 characters with uppercase and lowercase letters, a number, and a symbol.';

export const isStrongPassword = (password) =>
  [...password].length >= 12 &&
  [...password].length <= 128 &&
  /\p{Lu}/u.test(password) &&
  /\p{Ll}/u.test(password) &&
  /\p{N}/u.test(password) &&
  /[^\p{L}\p{N}\s]/u.test(password);
