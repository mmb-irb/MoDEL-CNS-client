# Reduced motion

source of truth about user-set motion settings

see [this article](https://developers.google.com/web/updates/2019/03/prefers-reduced-motion) about the concepts and how to handle things.

Main take-aways:

1.  Use this as single source of truth
2.  If motion reduced, tune down (or turn off) all motion animations (CSS transform)
3.  Transitions in opacity should be fine

Also, use `@media (prefers-reduced-motion: reduce) {...}` in CSS.

On the `reducedMotion()` function, a `force()` method is available, but keep in
mind it will only affect the output of this function, so any effect happening in
CSS or for which you are not using this function won't magically be affected.
