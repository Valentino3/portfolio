/**
 * Eight or more digits in a row, allowing the separators a phone number is written with (spaces,
 * dots, dashes, parentheses) and a leading "+". A run that continues a word, a path or a number
 * label ("rota-005011209" in a profile URL, "#14975") is not a phone number and is skipped.
 */
export const PHONE_LIKE = /(?<![\p{L}\p{N}/#.-])\+?\(?\d(?:[\s().-]*\d){7,}/u;
