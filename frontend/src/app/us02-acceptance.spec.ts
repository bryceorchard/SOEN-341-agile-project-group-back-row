import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Profile } from './profile.component';
import { API_BASE } from './auth.service';

// Acceptance tests for US-02 (#89): managing resumes on the Profile page.

const OLD = { id: 5, originalFilename: 'old-cv.pdf', fileType: 'application/pdf', uploadedAt: '2026-10-01T10:00:00Z' };
const NEW = { ...OLD, originalFilename: 'new-cv.pdf', uploadedAt: '2026-11-12T10:00:00Z' };
const EMPTY_PROFILE = { fullName: null, headline: null, location: null, phone: null, bio: null };

describe('US-02 acceptance', () => {
  let fixture: ComponentFixture<Profile>;
  let http: HttpTestingController;

  async function openProfile(resumes = [OLD]) {
    fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    http.expectOne(`${API_BASE}/resumes`).flush({ resumes });
    http.expectOne(`${API_BASE}/profile`).flush({ profile: EMPTY_PROFILE });
    await render();
  }

  async function render() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const listedNames = () => Array.from(el().querySelectorAll('.resume-name')).map((n) => n.textContent!.trim());
  const errors = () => Array.from(el().querySelectorAll('.alert-error')).map((n) => n.textContent!.trim());
  const button = (text: string) =>
    Array.from(el().querySelectorAll('button')).find((b) => b.textContent!.trim() === text) as HTMLButtonElement;

  // Simulates the user picking a file in a file input.
  function chooseFile(input: HTMLInputElement, file: File) {
    Object.defineProperty(input, 'files', { value: [file] });
    input.dispatchEvent(new Event('change'));
  }
  const replaceInput = () => el().querySelector('.resume-actions input[type="file"]') as HTMLInputElement;
  const uploadInput = () => el().querySelector('.upload-row input[type="file"]') as HTMLInputElement;

  const pdf = (name: string, bytes = 8) => new File([new Uint8Array(bytes)], name, { type: 'application/pdf' });

  // A stand-in for the new browser tab, with its own blank page we can inspect.
  function fakeTab() {
    const tab = { document: document.implementation.createHTMLDocument(''), close: vi.fn(), addEventListener: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
    URL.createObjectURL = vi.fn(() => 'blob:resume-5');
    URL.revokeObjectURL = vi.fn();
    return tab;
  }

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('cc_token', 'test-token');
    localStorage.setItem('cc_user', JSON.stringify({ id: 1, email: 'ada@test.com', role: 'job_seeker', createdAt: '' }));
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('US-02 AT-3: replacing a resume keeps the same entry and shows the new filename', async () => {
    await openProfile();

    button('Replace').click();
    await render();
    chooseFile(replaceInput(), pdf('new-cv.pdf'));

    const put = http.expectOne(`${API_BASE}/resumes/${OLD.id}`);
    expect(put.request.method).toBe('PUT');
    put.flush({ resume: NEW });
    http.expectOne(`${API_BASE}/resumes`).flush({ resumes: [NEW] });
    await render();

    expect(listedNames()).toEqual(['new-cv.pdf']);
  });

  it('US-02 AT-4: clicking View opens a PDF in a new tab under its original filename', async () => {
    await openProfile();
    const tab = fakeTab();

    button('View').click();
    expect(window.open).toHaveBeenCalled(); // opened during the click, so pop-up blockers allow it
    http.expectOne(`${API_BASE}/resumes/${OLD.id}/file`).flush(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));

    expect(tab.document.title).toBe('old-cv.pdf');
    expect(tab.document.querySelector('iframe')?.getAttribute('src')).toBe('blob:resume-5');
    const download = tab.document.querySelector('a[download]') as HTMLAnchorElement;
    expect(download.getAttribute('download')).toBe('old-cv.pdf');
    expect(download.textContent).toBe('Download old-cv.pdf');
  });

  it('US-02 AT-4: clicking View on a Word document downloads it under its original filename', async () => {
    const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    await openProfile([{ ...OLD, originalFilename: 'cv.docx', fileType: DOCX }]);
    const tab = fakeTab();
    const clicked: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this);
    });

    button('View').click();
    http.expectOne(`${API_BASE}/resumes/${OLD.id}/file`).flush(new Blob(['DOCX'], { type: DOCX }));

    expect(clicked).toHaveLength(1);
    expect(clicked[0].download).toBe('cv.docx');
    expect(tab.close).toHaveBeenCalled(); // the empty tab isn't left behind
  });

  it('US-02 AT-5: choosing a .png to upload shows a clear error, sends nothing, and leaves the list unchanged', async () => {
    await openProfile();

    chooseFile(uploadInput(), new File(['PNG'], 'photo.png', { type: 'image/png' }));
    button('Upload').click();
    await render();

    expect(errors()).toContain('Resume must be a PDF, DOC or DOCX file.');
    expect(listedNames()).toEqual(['old-cv.pdf']); // http.verify() also checks nothing was sent
  });

  it('US-02 AT-5: replacing with a file over 5 MB shows a clear error, sends nothing, and leaves the list unchanged', async () => {
    await openProfile();

    button('Replace').click();
    await render();
    chooseFile(replaceInput(), pdf('huge.pdf', 5 * 1024 * 1024 + 1));
    await render();

    expect(errors()).toContain('Resume must be 5 MB or smaller.');
    expect(listedNames()).toEqual(['old-cv.pdf']);
  });

  it('US-02 AT-6: deleting a resume asks for confirmation, then removes it from the list', async () => {
    await openProfile();
    const confirm = vi.fn(() => true);
    vi.stubGlobal('confirm', confirm);

    button('Delete').click();
    expect(confirm).toHaveBeenCalled();

    const del = http.expectOne(`${API_BASE}/resumes/${OLD.id}`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null, { status: 204, statusText: 'No Content' });
    http.expectOne(`${API_BASE}/resumes`).flush({ resumes: [] });
    await render();

    expect(listedNames()).toEqual([]);
    expect(el().textContent).toContain('No resumes uploaded yet.');
  });

  it('US-02 AT-6: cancelling the delete confirmation keeps the resume', async () => {
    await openProfile();
    vi.stubGlobal('confirm', vi.fn(() => false));

    button('Delete').click();
    await render();

    // No DELETE request is sent (http.verify() in afterEach checks this).
    expect(listedNames()).toEqual(['old-cv.pdf']);
  });
});
