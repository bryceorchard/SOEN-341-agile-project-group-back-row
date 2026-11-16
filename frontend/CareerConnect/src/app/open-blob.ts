import { Observable } from 'rxjs';

// How long to keep a download's blob URL alive. The browser only needs it while it starts the
// download; after that we free the memory.
const REVOKE_DOWNLOAD_AFTER_MS = 60_000;

// Opens a file (e.g. a resume) under its original filename.
//
// Browsers only allow window.open() during the click itself. If we wait for the download to
// finish first, the click is "over" and the pop-up blocker stops it. So we open an empty tab
// right away (synchronously, during the click), then fill it once the file arrives.
//
// A blob URL has a random name (blob:…/3f2a…), so pointing the tab straight at it would lose
// the original filename. Instead:
// - PDFs: the tab gets a small page titled with the filename, showing the PDF and a Download
//   link that saves it under the original name.
// - Other types (e.g. Word): browsers can't display them, so we download them directly under
//   the original name and close the empty tab.
export function openBlobInNewTab(
  blob$: Observable<Blob>,
  filename: string,
  onError: (message: string) => void,
): void {
  const tab = window.open('', '_blank');
  if (!tab) {
    onError('Your browser blocked the new tab. Allow pop-ups for this site and try again.');
    return;
  }

  blob$.subscribe({
    next: (blob) => {
      const url = URL.createObjectURL(blob);
      if (blob.type === 'application/pdf') {
        showPdfInTab(tab, url, filename);
        // The tab uses the URL for as long as it is open, so free it when the tab closes.
        tab.addEventListener('pagehide', () => URL.revokeObjectURL(url));
      } else {
        downloadAs(url, filename);
        tab.close();
        setTimeout(() => URL.revokeObjectURL(url), REVOKE_DOWNLOAD_AFTER_MS);
      }
    },
    error: () => {
      tab.close();
      onError('Could not open the resume.');
    },
  });
}

// Builds the page with DOM methods (not HTML strings), so a filename like
// "<script>.pdf" is shown as plain text and can never run as code.
function showPdfInTab(tab: Window, url: string, filename: string): void {
  const doc = tab.document;
  doc.title = filename;
  doc.body.style.margin = '0';
  doc.body.style.fontFamily = 'sans-serif';

  const bar = doc.createElement('div');
  bar.style.padding = '8px 12px';
  const link = doc.createElement('a');
  link.href = url;
  link.download = filename;
  link.textContent = `Download ${filename}`;
  bar.appendChild(link);

  const viewer = doc.createElement('iframe');
  viewer.src = url;
  viewer.title = filename;
  viewer.style.border = '0';
  viewer.style.width = '100%';
  viewer.style.height = 'calc(100vh - 40px)';

  doc.body.append(bar, viewer);
}

function downloadAs(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}
