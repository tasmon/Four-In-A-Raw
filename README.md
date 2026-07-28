## Four In A Row for CloudPhone

A classic four-in-a-row disc-drop game for CloudPhone feature phones. Beat the CPU by connecting four discs in a row — horizontally, vertically, or diagonally — using nothing but the numeric keypad.

## Add to CloudPhone
1. Go to [CloudPhone Developer Page](https://www.cloudfone.com/my).
2. Select **Add Widget**.
3. Paste this Start URL:
   `https://tasmon.github.io/four-in-a-row/`
4. Upload icons if required.
5. Save and refresh - **Four In A Row** will appear on your CloudPhone.

## Controls

| Key            | Action                    |
| -------------- | ------------------------- |
| `4`            | Move column selector left |
| `6`            | Move column selector right|
| `5` / `8`      | Drop disc (fire)          |
| `0`            | Pause / resume            |
| Left soft key  | Open menu (Escape)        |
| Right soft key | Back / close (native)     |

## Pages

- `index.html` — the game board (home screen)
- `settings.html` — difficulty selection (Easy / Hard)
- `about.html` — app name, version, developer
- `help.html` — objective and controls

## Files

```
index.html
game.js
settings.html
settings.js
about.html
help.html
common.js
style.css
icon.png
README.md
```

All files are flat (no subfolders) so this repository can be published directly with GitHub Pages.

## License

Apache-2.0
