import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
    let pipe: TruncatePipe;

    beforeEach(() => {
        pipe = new TruncatePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return empty string for null/undefined', () => {
        expect(pipe.transform(null)).toBe('');
        expect(pipe.transform(undefined)).toBe('');
    });

    it('should return original string if length is within limit', () => {
        expect(pipe.transform('Hello', 10)).toBe('Hello');
    });

    it('should truncate string if length exceeds limit', () => {
        expect(pipe.transform('Hello World', 5)).toBe('Hello...');
    });

    it('should use custom suffix', () => {
        expect(pipe.transform('Hello World', 5, '!')).toBe('Hello!');
    });

    it('should use default limit of 20', () => {
        const longString = 'This is a very long string that should be truncated';
        expect(pipe.transform(longString)).toBe('This is a very long ...');
    });
});
