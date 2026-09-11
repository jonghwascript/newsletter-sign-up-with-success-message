# Reading the breakpoint state (CSS custom property) from JS

To let JS reuse the breakpoints defined by the `mq()` mixin in
`_variables.scss` without redefining them, the current state is stored as
a string in a CSS custom property (`--device-state`) and read from JS.
(See [css.md](./css.md) for the CSS-side declaration and the inheritance-
direction pitfall.)

### Vanilla JS: read once, re-check on every resize

```js
const mainElement = document.querySelector('main');

function logDeviceState() {
  const currentState = window
    .getComputedStyle(mainElement)
    .getPropertyValue('--device-state');

  console.log(currentState);
}

logDeviceState();
window.addEventListener('resize', logDeviceState);
```

- `getComputedStyle()` computes the value at the moment it's called — read
  it once and **it won't update on later resizes.** So the reading logic
  needs to live in a function that's called again on every `resize` event.

### jQuery version

```js
const $mainElement = $('main');

function logDeviceState() {
  const currentState = $mainElement.css('--device-state');

  console.log(currentState);
}

logDeviceState();
$(window).on('resize', logDeviceState);
```

- Since jQuery 3.4+, `.css()`'s getter/setter recognizes custom properties
  starting with `--` as-is (no camelCase conversion), behaving the same
  way as `getComputedStyle`.

# Only run logic once form validation passes

To run specific JS logic (e.g. sending data to a server) only after a
form's validation fully passes, the web-standard and safest approach is to
listen for the form's own `submit` event — not the button's `click` event.

```html
<form id="signup-form">
  <div class="input-container">
    <input type="email" required placeholder="Enter your email" />
  </div>
  <!-- a <button> inside a <form> defaults to type="submit" -->
  <button type="submit">Sign up</button>
</form>
```

```js
const form = document.getElementById('signup-form');

// Listen for the form's 'submit' event, not the button's 'click'.
form.addEventListener('submit', (event) => {
  // 1. Prevent the browser's default behavior (page reload).
  event.preventDefault();

  // 2. This line only runs once HTML validation has "fully passed".
  // If there's an error, the browser blocks submission before this point.
  console.log('All validation passed! Sending data to the server.');

  // e.g. an API call via fetch()
});
```
