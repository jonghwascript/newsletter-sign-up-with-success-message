# Installing and running Gulp

## 1. Install the required packages

```bash
npm install --save-dev gulp gulp-sass sass gulp-sourcemaps gulp-clean-css
```

- `gulp`: the task runner itself
- `gulp-sass` + `sass`: SCSS → CSS compilation (using Dart Sass)
- `gulp-sourcemaps`: sourcemap generation
- `gulp-clean-css`: CSS minification

> Any package `require`d in `gulpfile.js` must also be registered under
> `devDependencies` in `package.json`. If it's only used in code but never
> installed, running the task fails with `Cannot find module '<package>'`.

## 2. Writing gulpfile.js

```js
const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const cleanCSS = require("gulp-clean-css");

// SCSS → CSS
function scssTask() {
  return gulp
    .src("src/scss/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("css"));
}

// Watch SCSS changes
function watchTask() {
  gulp.watch("src/scss/**/*.scss", scssTask);
}

exports.default = gulp.series(scssTask, watchTask);
```

## 3. Running it

```bash
npx gulp
```

- `scssTask` runs once, then `watchTask` starts watching `src/scss/**/*.scss` for changes.
- Stop it with `Ctrl + C` in the terminal.
- On success, `css/style.css` and `css/style.css.map` are generated/updated.

## 4. An error I ran into & why

```
Error: Cannot find module 'gulp-clean-css'
```

- **Cause**: `gulpfile.js` uses `gulp-clean-css`, but it wasn't registered
  as a devDependency in `package.json`, so it was never installed into
  `node_modules`.
- **Fix**: run `npm install --save-dev gulp-clean-css`, then retry — works fine.

## 5. Checklist (for next time I hit a similar error)

1. Read the package name out of the `Cannot find module '...'` error message.
2. Check whether it's listed in `package.json`'s `devDependencies`.
3. If not, install it with `npm install --save-dev <package-name>`.
4. Re-run `npx gulp` and confirm it works (console log + output in `css/`).

## 6. Wiring up Gulp + Prettier

```bash
npm install --save-dev gulp-prettier prettier
```

> `gulp-prettier` (v6+) is an ESM-only package, so `require("gulp-prettier")`
> inside a CommonJS `gulpfile.js` throws. The task function needs to be
> `async` and load it with a dynamic `import()` instead.

```js
const PRETTIER_GLOBS = ["src/scss/**/*.scss", "*.html", "gulpfile.js"];

async function prettierTask() {
  const { default: prettier } = await import("gulp-prettier");
  return gulp
    .src(PRETTIER_GLOBS, { base: "." })
    .pipe(prettier())
    .on("error", function (err) {
      console.error("[prettier]", err.message);
      this.emit("end"); // keep watch alive even if a format error occurs
    })
    .pipe(gulp.dest(".")); // overwrite files in place
}

exports.prettier = prettierTask;
exports.default = gulp.series(prettierTask, scssTask, watchTask);
```

- Keep a `.prettierrc.json` at the project root to pin the formatting rules
  (e.g. `{ "singleQuote": true }`).
- Add a `"format": "gulp prettier"` script to `package.json` so it can be
  run via `npm run format`.
- Since `gulp.dest(".")` overwrites the original files in place, always
  commit your changes before running it and review the result with `diff`.

### An error I ran into: a crash caused by invalid HTML

```
PluginError [SyntaxError]: Unexpected closing tag "p"...
```

- **Cause**: `index.html` had an unmatched `</p>` closing tag (a markup
  error). Prettier's HTML parser is strict, and when it hits broken markup
  it throws — without an `.on("error", ...)` handler, that exception took
  down `scssTask` and `watchTask` too, since they're chained together in
  `gulp.series`.
- **Fix**: 1) fix the markup error in `index.html`, 2) add an
  `.on("error", ...)` handler to `prettierTask` so that any future broken
  file doesn't kill the whole watch process.
