/* Four In A Row — Settings page
 * This is a SECONDARY page (reached via a full navigation from index.html),
 * so the Right Soft Key IS intercepted here and sent back to index.html.
 * The Left Soft Key has no function on this page, so it is left unbound.
 */

(function () {
  const STORAGE_KEY = 'fourinarow_difficulty';
  const items = Array.prototype.slice.call(document.querySelectorAll('.item'));
  const currentLine = document.getElementById('current-line');
  let focusIndex = 0;

  function getDifficulty() {
    return localStorage.getItem(STORAGE_KEY) || 'hard';
  }

  function setDifficulty(value) {
    localStorage.setItem(STORAGE_KEY, value);
    currentLine.textContent = 'Current: ' + (value === 'easy' ? 'Easy' : 'Hard');
  }

  function renderFocus() {
    items.forEach((el, i) => el.classList.toggle('focused', i === focusIndex));
    items[focusIndex].focus();
  }

  function moveFocus(delta) {
    focusIndex = (focusIndex + delta + items.length) % items.length;
    renderFocus();
  }

  function selectFocused() {
    setDifficulty(items[focusIndex].getAttribute('data-value'));
  }

  items.forEach((el, i) => {
    el.addEventListener('click', () => {
      focusIndex = i;
      selectFocused();
      renderFocus();
    });
  });

  // Initial state
  currentLine.textContent = 'Current: ' + (getDifficulty() === 'easy' ? 'Easy' : 'Hard');
  focusIndex = getDifficulty() === 'easy' ? 0 : 1;
  renderFocus();

  bindRightSoftKeySecondary('index.html');

  bindKey(['2', 'ArrowUp'], null, () => moveFocus(-1));
  bindKey(['8', 'ArrowDown'], null, () => moveFocus(1));
  bindKey(['5', 'Enter'], 'softkey-center', selectFocused);
})();
