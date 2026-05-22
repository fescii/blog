---
title: "Building for the Web, No Framework Required"
date: 2026-05-22T06:16:00+03:00
draft: false
tags: ["architecture", "web-standards", "javascript", "engineering"]
---

I've been mapping out a purely native-first web architecture. No React, no Vue, no massive runtime abstractions. 

The premise is straightforward. We treat the browser like a dumb rendering target, but it's actually a complete, highly-optimized application runtime. We spent the last decade building heavy frameworks to patch over missing browser capabilities and inconsistent APIs. But if you look at the WHATWG and W3C specs that have hit baseline support recently, the platform has caught up.

Shipping megabytes of JavaScript to do things the browser's C++ engine already does natively is starting to feel like a bad habit rather than an engineering necessity.

Here is what the stack looks like when you bet on the platform:

**Routing**
I'm dropping client-side router libraries entirely. The old History API was a nightmare to manage (especially programmatic push vs. user back-button), but the new Navigation API fixes it. Pair that with `URLPattern`—which is now native and works in service workers too—and you have a complete routing layer built into the browser. 

**State and Reactivity**
You don't need a Virtual DOM. VDOM diffing is a bottleneck we invented to solve a problem we don't have anymore. If you wrap a plain object in a `Proxy`, you can intercept reads and writes to track dependencies. Hook that up to standard `EventTarget` instances for pub/sub, and you have fine-grained reactivity. When state changes, you update the exact DOM node. No diffing required.

**Components**
Shadow DOM and Custom Elements provide actual, browser-enforced encapsulation. I don't miss CSS-in-JS or fighting with BEM naming conventions. You expose a visual API via CSS custom properties, and the internal styling is completely locked down. 

**Scheduling**
Seeing `setTimeout(fn, 0)` to defer work still drives me crazy. It has no concept of priority. The Scheduler API (`scheduler.postTask`) fixes this by giving us actual queues. You can explicitly tag tasks as user-blocking, user-visible, or background. 

Going this route isn't free. You lose the guardrails. If you don't aggressively tie your event listeners and fetch requests to `AbortController` signals during your component teardowns, you will bleed memory. You have to enforce your own discipline.

But the tradeoff is zero dependency debt. The code you write against standard browser APIs today won't break in two years just because a framework maintainer decided to rewrite their rendering engine again. 

## References

*   [**WHATWG HTML Living Standard**](https://html.spec.whatwg.org)
*   [**WICG Navigation API Spec**](https://github.com/WICG/navigation-api)
*   [**WICG URL Pattern API Spec**](https://github.com/WICG/urlpattern)
*   [**WICG Prioritized Task Scheduling**](https://wicg.github.io/scheduling-apis)
*   [**MDN Web Components**](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)