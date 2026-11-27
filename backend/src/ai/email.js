// Email detection in linear time. Equivalent to /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, which
// backtracks on long runs of word characters (SonarQube javascript:S8786): each start
// position re-scanned the rest of the run. A local part can only end right before '@',
// which is not in its class, so every start inside a run gives the same end. Scanning
// each maximal run once (from the current position) finds the same matches.
const LOCAL = /[\w.+-]+/g;
const DOMAIN = /@[\w-]+(?:\.[\w-]+)+/y;

function scanEmails(text, onMatch) {
  LOCAL.lastIndex = 0;
  let run;
  while ((run = LOCAL.exec(text))) {
    DOMAIN.lastIndex = LOCAL.lastIndex;
    if (DOMAIN.exec(text)) {
      if (onMatch(run.index, DOMAIN.lastIndex) === false) return;
      LOCAL.lastIndex = DOMAIN.lastIndex;
    }
  }
}

export function hasEmail(text) {
  let found = false;
  scanEmails(String(text), () => {
    found = true;
    return false;
  });
  return found;
}

export function replaceEmails(text, replacement) {
  const s = String(text);
  let out = '';
  let pos = 0;
  scanEmails(s, (start, end) => {
    out += s.slice(pos, start) + replacement;
    pos = end;
  });
  return out + s.slice(pos);
}
