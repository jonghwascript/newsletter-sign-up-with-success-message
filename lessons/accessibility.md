# A `<label>` next to an `<input>` isn't automatically associated with it

```html
<label>Email address</label>
<input type="email" name="email" placeholder="email@company.com" required />
```

- **Cause**: `<label>` and `<input>` sit next to each other in the markup,
  so they *look* like a label visually, but a screen reader only connects
  the two through `for`/`id` matching (or by wrapping the `<input>` inside
  the `<label>`) — not through DOM/CSS adjacency. Without that connection,
  focusing the input never announces "Email address" at all. This is
  exactly what axe-core's `label` rule catches.
- **Fix**: share an `id` between them, e.g. `<label for="email">` and
  `<input id="email">`.

```html
<label for="email">Email address</label>
<input type="email" name="email" id="email" placeholder="email@company.com" required />
```

# An undefined CSS custom property silently invalidates the whole declaration

```scss
button {
  outline: none;
}

button:focus-visible {
  outline: 2px solid var(--Grey-500); // never defined anywhere in the project
  outline-offset: 2px;
}
```

- **Cause**: referencing an unregistered custom property like
  `var(--Grey-500)` doesn't throw an error — the browser just treats the
  value as "invalid at computed-value time". That makes the whole
  `outline` declaration get ignored, and since the reset above already
  removed the default focus ring with `outline: none`, **keyboard users
  see no visual indicator at all when focusing a button.** There's no
  console warning either, which makes this very hard to notice without
  active debugging (a WCAG 2.4.7 Focus Visible violation).
- **Fix**: reference a token that actually exists. If you do want to use a
  custom property, make sure its value is declared somewhere (`:root` or
  the element itself).

```scss
button:focus-visible {
  outline: 2px solid $bg-gray; // an SCSS variable that actually exists in the project
  outline-offset: 2px;
}
```

- **Lesson**: whenever you remove the default focus style with
  `outline: none`, always visually confirm that whatever replaces it
  actually renders. Stylelint's `custom-property-pattern` rule only checks
  the *naming convention* (kebab-case) — not whether the property is
  defined — so passing the linter alone won't catch this kind of bug.

# Running lint tools that aren't project dependencies, without installing them

`html-validate`, `stylelint`, and `eslint` aren't in this project's
`package.json`, but when you just want to run them once for a review, you
can install them into a throwaway directory so nothing is left behind in
the project itself.

```bash
# 1) html-validate has no heavy dependencies, so npx works directly
npx --yes html-validate index.html success.html

# 2) stylelint needs a config file and a config package, so install into a scratch folder
cd /tmp/lint-sandbox
npm init -y
npm install --no-audit --no-fund stylelint stylelint-config-standard-scss postcss-scss
# .stylelintrc.json: { "extends": ["stylelint-config-standard-scss"] }
node /tmp/lint-sandbox/node_modules/stylelint/bin/stylelint.mjs \
  --config /tmp/lint-sandbox/.stylelintrc.json \
  "src/scss/**/*.scss"

# 3) eslint also needs a flat config (eslint.config.js) in the scratch folder
npm install --no-audit --no-fund eslint @eslint/js globals
node /tmp/lint-sandbox/node_modules/eslint/bin/eslint.js \
  --config /tmp/lint-sandbox/eslint.config.js js/main.js
```

- `npx --yes -p <pkg> stylelint ...` (stacking packages with `-p`) looks
  simple, but when `--config` points at a relative config file, module
  resolution gets confused and throws
  `Could not find "stylelint-config-standard-scss"`. It was far more
  reliable to actually `npm install` into a scratch folder and invoke the
  binary from that folder's `node_modules` directly with `node`.
- Stylelint's shell shim (`node_modules/.bin/stylelint`) is POSIX shell
  syntax, so running it directly with `node` on Windows throws a syntax
  error. Instead, call the actual entry point file directly with `node`
  (`node_modules/stylelint/bin/stylelint.mjs`,
  `node_modules/eslint/bin/eslint.js`).

# Mutually-exclusive responsive layouts need breakpoints on both sides

To show a full-screen success page on mobile and a popup modal on
tablet/desktop, only the modal side was given a breakpoint rule:

```scss
.success {
  // stays at the default display (block) — no rule ever hides it!
}

.modal {
  display: none;

  @include m.mq('tablet') {
    display: block;
  }
}
```

- **Cause**: `.modal` was correctly set up to appear from tablet width up,
  but `.success` had no matching "hide at tablet and up" rule, so at
  tablet width and above **the full-screen section and the modal rendered
  on top of each other at the same time.** When two elements are meant to
  be mutually exclusive "mobile version / desktop version" of the same
  content, you can't put the visibility condition on only one side — you
  need **symmetric breakpoint rules on both.**
- **Fix**: add the opposite hide rule to `.success` at the same breakpoint.

```scss
.success {
  @include m.mq('tablet') {
    display: none;
  }
}
```
