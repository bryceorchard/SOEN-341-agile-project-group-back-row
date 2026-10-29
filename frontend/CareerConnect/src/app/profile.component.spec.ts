import { validateResumeFile, fileTypeLabel } from './profile.component';

function makeFile(type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], 'resume', { type });
}

describe('validateResumeFile', () => {
  it('rejects a file type other than PDF/DOC/DOCX', () => {
    const file = makeFile('image/png', 1024);
    expect(validateResumeFile(file)).toBe('Resume must be a PDF, DOC or DOCX file.');
  });

  it('rejects a file over 5 MB', () => {
    const file = makeFile('application/pdf', 5 * 1024 * 1024 + 1);
    expect(validateResumeFile(file)).toBe('Resume must be 5 MB or smaller.');
  });

  it('accepts a PDF at or under 5 MB', () => {
    const file = makeFile('application/pdf', 5 * 1024 * 1024);
    expect(validateResumeFile(file)).toBeNull();
  });

  it('accepts DOC and DOCX mime types', () => {
    expect(validateResumeFile(makeFile('application/msword', 1024))).toBeNull();
    expect(
      validateResumeFile(
        makeFile('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1024),
      ),
    ).toBeNull();
  });
});

describe('fileTypeLabel', () => {
  it('maps known mime types to a friendly label', () => {
    expect(fileTypeLabel('application/pdf')).toBe('PDF');
  });

  it('falls back to the raw mime type when unknown', () => {
    expect(fileTypeLabel('application/weird')).toBe('application/weird');
  });
});
