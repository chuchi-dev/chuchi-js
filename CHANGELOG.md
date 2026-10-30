# Changelog

## chuchi 0.1.7

### Breaking

-   Cookies set with `set` without a `path` now default to `Path=/` (like
    crelte). Before, the browser used the directory of the current page, so a
    cookie set on `/account/settings` was only sent for `/account/*`. Pass
    `path` explicitly to keep the old behaviour.
-   `remove(name, opts)` takes the `path` and `domain` the cookie was set with.
    A cookie that was set on another path than `/` must be removed with that
    path.

### Fixes

-   `ServerCookies.get` returns the value set during the request, also without
    `maxAge`, and `null` after `remove`.
-   `SsrCache` stores its entries in a `Map`, keys like `constructor` work.
-   The router keeps saving scroll positions after a quick navigation.
-   Links to the current page with a hash scroll to the target instead of
    loading the page again.
-   Same host links with a path starting with `//` no longer throw.
-   Clicks on links with `download` or non http links are not intercepted.
-   JSR exports `./api` and `./cookies`.

## chuchi-utils 0.1.7

-   `range` returns the right values (`range(0, 10, 2)` was broken and
    `range(-5, 5, 2)` threw). A step of 0 or below returns `[]`.
-   `searchScore` measures the right distance correctly, exact matches rank
    better.
-   Removing a `SlotArray` slot twice no longer hands out the slot twice.

## chuchi-core 0.1.6

-   `GraphQl.request` throws `NotOk` with the status for responses that are not
    json and no longer modifies the passed headers.
-   `ApiError.fromJson` no longer crashes on `null`, numbers or `{}`.
-   First release on JSR (`@chuchi/core`).

## chuchi-legacy 1.1.1

-   `inViewY` is true for elements taller than the viewport.
-   First release on JSR (`@chuchi/legacy`), including `./dom/Context2d` and
    `./dom/utils`.
