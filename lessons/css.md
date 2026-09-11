# Is fixing a bullet icon's size at 21px via background image okay for a responsive layout?

```
 li {
      .benefits {
        margin-block-start: 24px;
        @include font-style(16px, 400, 1.5);

        li {
          display: flex;
          align-items: flex-start;

          &::before {
            content: '';
            min-width: 0;
            width: 21px;
            height: 21px;
            background-image: url('../../images/icon-list.svg');
            background-repeat: no-repeat;
            background-position: center center;
          }

          span {
            margin-inline-start: 16px;
            flex: 1 1 0;
          }

          &:not(:first-child) {
            margin-block-start: 8px;
          }
        }
      }
  }
```

Giving a UI element like a list "bullet" icon a fixed size (21px) is not a
bad approach at all — it's actually close to industry standard. However,
the code above hides a "fatal trap": on narrower responsive viewports, the
icon gets squished.

Because `li` is `display: flex`, the `::before` icon and the `span` text
both become flex items. Flex items shrink themselves by default when space
runs out (`flex-shrink: 1`). On top of that, `min-width: 0` is set, so on
mobile — where the `span` text wraps and takes up more room — the icon
(`::before`) can't hold its 21px and gets squeezed into a thin oval.

```
    &::before {
      content: '';
      flex-shrink: 0;
      width: 1.3125rem;
      height: 1.3125rem;
      background-image: url('../../images/icon-list.svg');
      background-repeat: no-repeat;
      background-position: center center;
    }
```

# The `<source>` order problem inside `<picture>`

```html
<picture>
  <source
    srcset="./images/illustration-sign-up-tablet.svg"
    media="(min-width: 768px)"
  />
  <source
    srcset="./images/illustration-sign-up-desktop.svg"
    media="(min-width: 1200px)"
  />
  <img
    src="./images/illustration-sign-up-mobile.svg"
    alt="Stay updated!"
    class="illustration"
  />
</picture>
```

- **Cause**: The browser evaluates `<source>` elements inside `<picture>`
  **in document order** and picks the **first one whose condition is
  true** — it doesn't automatically pick the "more specific" one.
  In the code above, the tablet source (`min-width: 768px`) comes before
  the desktop source (`min-width: 1200px`). At a viewport of 1200px or
  wider, both conditions are true, but the tablet source — being listed
  first — wins, so **the desktop image is never selected.**
- **Fix**: when using `min-width`-based media queries, list the **larger
  breakpoint (desktop) first, and the smaller breakpoint (tablet) after
  it**, with `<img>` as the mobile (default) fallback at the end.

```html
<picture>
  <source
    srcset="./images/illustration-sign-up-desktop.svg"
    media="(min-width: 1200px)"
  />
  <source
    srcset="./images/illustration-sign-up-tablet.svg"
    media="(min-width: 768px)"
  />
  <img
    src="./images/illustration-sign-up-mobile.svg"
    alt="Stay updated!"
    class="illustration"
  />
</picture>
```

# `max-inline-size: 100%` alone doesn't make an image fill its container

```scss
.illustration {
  max-inline-size: 100%;
  block-size: auto;
  object-fit: cover;
}
```

- **Cause**: `max-inline-size: 100%` (`max-width: 100%`) is only an **upper
  bound that stops the image from growing past its container** — it
  doesn't force it to fill the container either. `img` is a replaced
  element, so without an explicit `width` (inline-size) it renders at its
  own intrinsic size (for an SVG, that's the SVG's original dimensions).
  If that intrinsic size is smaller than the tablet container width
  (608px), leftover space appears and the image doesn't actually fill it.
- **Fix**: add `inline-size: 100%` to force it to fill the container width,
  keep `max-inline-size: 100%` so it never overflows, and use
  `block-size: auto` to preserve the aspect ratio.

```scss
.illustration {
  inline-size: 100%;
  max-inline-size: 100%;
  block-size: auto;
  object-fit: cover;
}
```

# Exposing the current breakpoint to JS via a CSS custom property

When you want JS to reuse the same breakpoints defined by the SCSS `mq()`
mixin — without redefining them — you can store the current state as a
string in a CSS custom property and read it from JS.

```scss
main {
  --device-state: mobile;

  @include m.mq('tablet') {
    --device-state: tablet;
  }

  @include m.mq('desktop') {
    --device-state: desktop;
  }
}
```

### Pitfall: custom properties only inherit downward

I originally declared `--device-state` on `body` and overrode it on
`main`. Reading it from `document.body` in JS always returned `mobile`,
no matter the viewport size.

- **Cause**: CSS custom properties only inherit in the **ancestor →
  descendant** direction. Overriding the value inside a `main` selector
  only applies to `main` and its descendants — it never changes the value
  on the ancestor (`body`) itself. So reading the value from `body` always
  returns the original declared value (`mobile`), regardless of the
  breakpoint.
- **Fix**: declare and override the value on the **same element** (`main`),
  and read it from that same element in JS.

(See [js.md](./js.md) for the JS-side implementation.)
