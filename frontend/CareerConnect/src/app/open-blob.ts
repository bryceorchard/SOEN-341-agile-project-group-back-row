import { Observable } from 'rxjs';

// How long to keep the blob URL alive after pointing the new tab at it. The tab needs the
// URL while it loads the file; after that it holds its own copy, so we can free the memory.
const REVOKE_AFTER_MS = 60_000;

// Opens a file (e.g. a resume PDF) in a new tab.
//
// Browsers only allow window.open() during the click itself. If we wait for the download to
// finish first, the click is "over" and the pop-up blocker stops it. So we open an empty tab
// right away (synchronously, during the click), then point it at the file once it arrives.
export function openBlobInNewTab(blob$: Observable<Blob>, onError: (message: string) => void): void {
  const tab = window.open('', '_blank');
  if (!tab) {
    onError('Your browser blocked the new tab. Allow pop-ups for this site and try again.');
    return;
  }

  blob$.subscribe({
    next: (blob) => {
      const url = URL.createObjectURL(blob);
      tab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MS);
    },
    error: () => {
      tab.close();
      onError('Could not open the resume.');
    },
  });
}
