import { validateCommitMessage, checkCommitMessageLength } from '../lib/validation.js';
import { ValidationError } from '../lib/errors.js';
import { VALIDATION } from '../lib/constants.js';

describe('Validation functions', () => {
	describe('checkCommitMessageLength', () => {
		test('returns isValid true for message under limit', (): void => {
			const message = 'Short commit message';
			const result = checkCommitMessageLength(message);
			
			expect(result.isValid).toBe(true);
			expect(result.message).toBe(message);
			expect(result.firstLine).toBe(message);
		});

		test('returns isValid false for message over limit', (): void => {
			const longMessage = 'This is a very long commit message that exceeds the seventy-two character limit we have set';
			const result = checkCommitMessageLength(longMessage);
			
			expect(result.isValid).toBe(false);
			expect(result.message).toBe(longMessage);
			expect(result.firstLine).toBe(longMessage);
			expect(result.firstLine.length).toBeGreaterThan(VALIDATION.COMMIT_MESSAGE_MAX_LENGTH);
		});

		test('returns isValid true for message exactly at limit', (): void => {
			const message = 'A'.repeat(VALIDATION.COMMIT_MESSAGE_MAX_LENGTH);
			const result = checkCommitMessageLength(message);
			
			expect(result.isValid).toBe(true);
			expect(result.firstLine.length).toBe(VALIDATION.COMMIT_MESSAGE_MAX_LENGTH);
		});

		test('trims whitespace from message', (): void => {
			const message = '  commit message  ';
			const result = checkCommitMessageLength(message);
			
			expect(result.message).toBe('commit message');
		});

		test('handles multi-line messages correctly', (): void => {
			const shortFirstLine = 'Short summary';
			const longDescription = 'A'.repeat(100);
			const multiLineMessage = `${shortFirstLine}\n\n${longDescription}`;
			const result = checkCommitMessageLength(multiLineMessage);
			
			expect(result.isValid).toBe(true);
			expect(result.firstLine).toBe(shortFirstLine);
		});
	});

	describe('validateCommitMessage', () => {
		test('validates and returns trimmed message for valid input', (): void => {
			const message = 'Valid commit message';
			const result = validateCommitMessage(message);
			
			expect(result).toBe(message);
		});

		test('throws ValidationError for empty message', (): void => {
			expect(() => validateCommitMessage('')).toThrow(ValidationError);
			expect(() => validateCommitMessage('   ')).toThrow(ValidationError);
		});

		test('throws ValidationError for non-string input', (): void => {
			expect(() => validateCommitMessage(null as any)).toThrow(ValidationError);
			expect(() => validateCommitMessage(undefined as any)).toThrow(ValidationError);
		});

		test('throws ValidationError for message exceeding limit', (): void => {
			const longMessage = 'A'.repeat(VALIDATION.COMMIT_MESSAGE_MAX_LENGTH + 1);
			
			expect(() => validateCommitMessage(longMessage)).toThrow(ValidationError);
		});

		test('allows message exactly at limit', (): void => {
			const message = 'A'.repeat(VALIDATION.COMMIT_MESSAGE_MAX_LENGTH);
			
			expect(() => validateCommitMessage(message)).not.toThrow();
			expect(validateCommitMessage(message)).toBe(message);
		});
	});
});
