/* Four In A Row — game logic
 * Controls (T9 numeric d-pad, per CloudPhone spec):
 *   2 / ArrowUp    -> reserved (no game action)
 *   8 / ArrowDown  -> drop piece in selected column
 *   4 / ArrowLeft  -> move column selector left
 *   6 / ArrowRight -> move column selector right
 *   5 / Enter      -> drop piece / confirm / fire
 *   0              -> pause / resume
 *   Escape (LSK)   -> open / close menu
 */

(function () {
  const ROWS = 6;
  const COLS = 7;
  const PLAYER = 1; // red, human
  const AI = 2; // yellow, computer

  const boardEl = document.getElementById('board');
  const cursorRowEl = document.getElementById('cursor-row');
  const statusEl = document.getElementById('game-status');
  const menuEl = document.getElementById('options-menu');
  const confirmModal = document.getElementById('confirm-modal');
  const gameoverModal = document.getElementById('gameover-modal');
  const gameoverTitle = document.getElementById('gameover-title');
  const pauseModal = document.getElementById('pause-modal');

  const menuItems = Array.prototype.slice.call(menuEl.querySelectorAll('.item'));
  const menuActions = menuItems.map((el) => el.getAttribute('data-action'));

  let board = [];
  let turn = PLAYER;
  let cursor = 3;
  let menuIndex = 0;
  /** @type {'game'|'menu'|'confirm'|'gameover'|'paused'} */
  let mode = 'game';

  function getDifficulty() {
    return localStorage.getItem('fourinarow_difficulty') || 'hard';
  }

  function newBoard() {
    const b = [];
    for (let r = 0; r < ROWS; r++) b.push(new Array(COLS).fill(0));
    return b;
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        const disc = document.createElement('div');
        let cls = 'disc';
        if (board[r][c] === PLAYER) cls += ' red';
        else if (board[r][c] === AI) cls += ' yellow';
        disc.className = cls;
        slot.appendChild(disc);
        boardEl.appendChild(slot);
      }
    }
  }

  function renderCursor() {
    cursorRowEl.innerHTML = '';
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cursor-cell';
      cell.textContent = c === cursor && mode === 'game' ? '\u25BC' : '';
      cursorRowEl.appendChild(cell);
    }
  }

  function dropDisc(col, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) {
        board[r][col] = player;
        return r;
      }
    }
    return -1;
  }

  function undoDrop(row, col) {
    if (row >= 0) board[row][col] = 0;
  }

  function countDir(row, col, dr, dc, player) {
    let r = row + dr;
    let c = col + dc;
    let n = 0;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      n++;
      r += dr;
      c += dc;
    }
    return n;
  }

  function checkWin(row, col, player) {
    const dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (const [dr, dc] of dirs) {
      const count = 1 + countDir(row, col, dr, dc, player) + countDir(row, col, -dr, -dc, player);
      if (count >= 4) return true;
    }
    return false;
  }

  function isBoardFull() {
    for (let c = 0; c < COLS; c++) if (board[0][c] === 0) return false;
    return true;
  }

  function validColumns() {
    const cols = [];
    for (let c = 0; c < COLS; c++) if (board[0][c] === 0) cols.push(c);
    return cols;
  }

  function pickAIColumn() {
    const valid = validColumns();
    if (!valid.length) return -1;
    const difficulty = getDifficulty();

    // 1. Take a winning move if one exists.
    for (const c of valid) {
      const r = dropDisc(c, AI);
      const win = r >= 0 && checkWin(r, c, AI);
      undoDrop(r, c);
      if (win) return c;
    }

    // 2. Block the player's winning move (hard always checks, easy sometimes misses it).
    if (difficulty === 'hard' || Math.random() < 0.6) {
      for (const c of valid) {
        const r = dropDisc(c, PLAYER);
        const win = r >= 0 && checkWin(r, c, PLAYER);
        undoDrop(r, c);
        if (win) return c;
      }
    }

    // 3. Otherwise prefer center columns, with a little randomness.
    const preferenceOrder = [3, 2, 4, 1, 5, 0, 6].filter((c) => valid.indexOf(c) !== -1);
    const top = preferenceOrder.slice(0, Math.min(3, preferenceOrder.length));
    return top[Math.floor(Math.random() * top.length)];
  }

  function startNewGame() {
    board = newBoard();
    turn = PLAYER;
    cursor = 3;
    mode = 'game';
    renderBoard();
    renderCursor();
    setStatus('Your turn');
  }

  function endGame(result) {
    mode = 'gameover';
    renderCursor();
    if (result === 'win') {
      gameoverTitle.textContent = 'You Win!';
      setStatus('You win!');
    } else if (result === 'lose') {
      gameoverTitle.textContent = 'CPU Wins';
      setStatus('CPU wins');
    } else {
      gameoverTitle.textContent = 'Draw!';
      setStatus('Draw');
    }
    showEl(gameoverModal);
  }

  function playerDrop() {
    const r = dropDisc(cursor, PLAYER);
    if (r < 0) {
      setStatus('Column full \u2014 choose another');
      return;
    }
    renderBoard();
    if (checkWin(r, cursor, PLAYER)) return endGame('win');
    if (isBoardFull()) return endGame('draw');
    turn = AI;
    setStatus('CPU thinking\u2026');
    setTimeout(aiTurn, 550);
  }

  function aiTurn() {
    const c = pickAIColumn();
    if (c < 0) return endGame('draw');
    const r = dropDisc(c, AI);
    renderBoard();
    if (checkWin(r, c, AI)) return endGame('lose');
    if (isBoardFull()) return endGame('draw');
    turn = PLAYER;
    setStatus('Your turn');
  }

  function handleFireAction() {
    if (mode === 'game' && turn === PLAYER) playerDrop();
  }

  // ---------------- Menu ----------------

  function renderMenuFocus() {
    menuItems.forEach((el, i) => {
      el.classList.toggle('focused', i === menuIndex);
    });
    menuItems[menuIndex].focus();
  }

  function openMenu() {
    mode = 'menu';
    menuIndex = 0;
    showEl(menuEl);
    renderMenuFocus();
  }

  function closeMenu() {
    hideEl(menuEl);
    mode = 'game';
    renderCursor();
  }

  function moveMenu(delta) {
    menuIndex = (menuIndex + delta + menuItems.length) % menuItems.length;
    renderMenuFocus();
  }

  function activateMenuItem() {
    const action = menuActions[menuIndex];
    if (action === 'resume') {
      closeMenu();
    } else if (action === 'new') {
      hideEl(menuEl);
      mode = 'confirm';
      showEl(confirmModal);
    } else if (action === 'settings') {
      window.location.href = 'settings.html';
    } else if (action === 'help') {
      window.location.href = 'help.html';
    } else if (action === 'about') {
      window.location.href = 'about.html';
    }
  }

  menuItems.forEach((el, i) => {
    el.addEventListener('click', () => {
      menuIndex = i;
      activateMenuItem();
    });
  });

  // ---------------- Confirm modal ----------------

  function confirmYes() {
    hideEl(confirmModal);
    startNewGame();
  }

  function confirmCancel() {
    hideEl(confirmModal);
    mode = 'game';
  }

  confirmModal.addEventListener('click', confirmYes);

  // ---------------- Game over modal ----------------

  gameoverModal.addEventListener('click', () => {
    hideEl(gameoverModal);
    startNewGame();
  });

  // ---------------- Pause ----------------

  function togglePause() {
    if (mode === 'game') {
      mode = 'paused';
      showEl(pauseModal);
      setStatus('Paused');
    } else if (mode === 'paused') {
      mode = 'game';
      hideEl(pauseModal);
      setStatus(turn === PLAYER ? 'Your turn' : 'CPU thinking\u2026');
    }
  }

  pauseModal.addEventListener('click', togglePause);

  // ---------------- Input wiring ----------------

  bindLeftSoftKey(() => {
    if (mode === 'menu') return closeMenu();
    if (mode === 'confirm') return confirmCancel();
    if (mode === 'gameover') return; // use Fire to play again
    if (mode === 'game') return openMenu();
    // paused: ignore, only "0" resumes
  });

  // Reproduce native RSK "back" behavior for desktop/browser testing only.
  // The physical RSK on-device is left untouched, per CloudPhone guidelines.
  document.getElementById('softkey-right').addEventListener('click', () => history.back());

  bindKey(['4', 'ArrowLeft'], null, () => {
    if (mode !== 'game') return;
    cursor = (cursor + COLS - 1) % COLS;
    renderCursor();
  });

  bindKey(['6', 'ArrowRight'], null, () => {
    if (mode !== 'game') return;
    cursor = (cursor + 1) % COLS;
    renderCursor();
  });

  bindKey(['8', 'ArrowDown'], null, () => {
    if (mode === 'menu') return moveMenu(1);
    if (mode === 'game') handleFireAction();
  });

  bindKey(['2', 'ArrowUp'], null, () => {
    if (mode === 'menu') return moveMenu(-1);
    // reserved in game mode
  });

  bindKey(['5', 'Enter'], 'softkey-center', () => {
    if (mode === 'menu') return activateMenuItem();
    if (mode === 'confirm') return confirmYes();
    if (mode === 'gameover') {
      hideEl(gameoverModal);
      return startNewGame();
    }
    if (mode === 'game') return handleFireAction();
    // paused: Fire does nothing, only "0" resumes
  });

  bindKey(['0'], null, () => {
    if (mode === 'game' || mode === 'paused') togglePause();
  });

  // ---------------- Boot ----------------
  startNewGame();
})();
