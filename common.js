/* Four In A Row — CloudPhone shared helpers
 * Implements the LSK/RSK conventions from the CloudPhone dev guidelines:
 *  - LSK is bound to the "Escape" key and used for menu/options/select.
 *  - RSK is NEVER intercepted on the main/home screen (native back/close
 *    behavior applies automatically there).
 *  - RSK IS intercepted on secondary pages reached via a full navigation
 *    (window.location.href = "other.html"), using the exact multi-alias
 *    check below, since a full page load breaks the built-in history model.
 */

// Keep the widget receiving key events even after overlays/pickers steal focus.
window.addEventListener('load', () => window.focus());
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', () => window.focus());
});

/**
 * Bind the Left Soft Key (LSK). Only call this on pages where LSK actually
 * performs an action. Leave it unbound (blank "softkey-left" label) on
 * pages where it has no function.
 */
function bindLeftSoftKey(handler) {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handler(e);
    }
  });

  const el = document.getElementById('softkey-left');
  if (el) {
    el.addEventListener('click', (e) => handler(e));
  }
}

/**
 * Bind the Right Soft Key (RSK) for SECONDARY pages only (pages reached via
 * a full window.location.href navigation, e.g. settings/about/help).
 * Do NOT call this on the main/home screen (index.html).
 */
function bindRightSoftKeySecondary(targetUrl) {
  targetUrl = targetUrl || 'index.html';

  window.addEventListener('keydown', (e) => {
    if (
      e.key === 'SoftRight' ||
      e.key === 'F2' ||
      e.key === 'Backspace' ||
      e.key === 'Escape'
    ) {
      e.preventDefault();
      window.location.href = targetUrl;
    }
  });

  const el = document.getElementById('softkey-right');
  if (el) {
    el.addEventListener('click', () => {
      window.location.href = targetUrl;
    });
  }
}

/** Bind one or more key values (with aliases) plus an optional click target. */
function bindKey(keys, elementId, handler) {
  const list = Array.isArray(keys) ? keys : [keys];
  window.addEventListener('keydown', (e) => {
    if (list.indexOf(e.key) !== -1) {
      e.preventDefault();
      handler(e);
    }
  });
  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) el.addEventListener('click', handler);
  }
}

function showEl(el) {
  if (el) el.hidden = false;
}

function hideEl(el) {
  if (el) el.hidden = true;
}

function findFirstFocusable(container) {
  if (!container) return null;
  return container.querySelector(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), *[tabindex]'
  );
}

function autoFocusFirstFocusable(container) {
  const el = findFirstFocusable(container);
  if (el) el.focus();
}
