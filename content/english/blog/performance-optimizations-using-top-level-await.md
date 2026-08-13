---
title: "Performance Optimizations Using Top-Level Await: Latest JavaScript Code in 2022"
meta_title: "Optimize Your JavaScript: Performance Enhancements with Top-Level Await"
description: "Top-level await removes the async wrapper function JavaScript modules used to need, simplifying async module initialization code."
date: 2024-07-05T20:58:50Z
lastmod: 2026-08-11T20:34:13Z
image: "/images/jsOptimization.png"
categories: [
  "JavaScript",
  "Web Development",
  "Programming",
  "Software Engineering",
  "Tech Guides",
  "Performance Optimization",
  "Front-End Development",
  "Coding Best Practices",
  "Web Performance",
  "Tech Trends 2022"
]
authors: ["preston-bernstein"]
tags: [
  "JavaScript",
  "Top-Level Await",
  "ECMAScript 2022",
  "Web Performance",
  "Code Optimization",
  "Async Programming",
  "Lazy Loading",
  "Code Splitting",
  "WebAssembly",
  "Tech Guide",
  "Best Practices"
]
draft: true
---


ECMAScript 2022 added top-level await, and the fix is smaller than it sounds: `await` now works directly at the top of a JavaScript module, no `async` wrapper function required. That kills one specific piece of boilerplate developers have hauled around since async/await first shipped: the self-invoking async function you wrote just so the parser would let you say the word `await`. It also changes how module initialization gets written.

Here's what top-level await actually does, where it earns its keep (module initialization that depends on an async result), and where it costs you. Every code example below is real and runnable, not a paraphrase.

## Top-Level Await Runs `await` Outside an Async Function

Top-level await removes the rule that `await` only works inside an async function. Before ECMAScript 2022, every asynchronous operation at a module's top level had to get wrapped in one just to be legal syntax. Now the module itself can await, and the result reads cleaner for it.

### Async/Await Still Needed a Wrapper Function

Async/await was the best of JavaScript's three asynchronous patterns, and it still needed a wrapper function. Callbacks came first, then Promises, then async/await itself, each one bolted onto functions rather than modules, each one reading better than the last. But even async/await, the best of the three, still needed a defined async function wrapped around any code that wanted to say `await`.

### Top-Level Await Shines During Module Initialization

Top-level await's most useful trick is running async work during initialization, before the rest of the app is even up. That covers a specific, recurring list of jobs:

* Fetching configuration settings from a remote server the moment the app starts.

* Loading essential data from the database before the app is up and running.

* Dynamically importing other modules or dependencies based on runtime conditions.

The real payoff: top-level await makes a JavaScript app's startup sequence shorter to write and easier to follow.

### The Syntax Skips the Async Wrapper Entirely

The syntax itself is nothing new: it's just `await`, sitting at the top of the module with no ceremony around it. Here's what that looks like:

```javascript
const response = await fetch(`https://api.example.com/data`);
const data = await response.json();
```

That's it. No async wrapper needed. Declaring `await` alone is enough to make those two lines wait their turn.

## Top-Level Await Cuts Boilerplate From Module Setup

### Simplifies Module Setup

Top-level await runs asynchronous operations directly at a module's top level, no per-operation async wrapper required. That matters most when a module's whole job depends on external data: pulling configuration settings, opening a database connection, the kind of setup that used to justify wrapping everything in a self-invoking async function just to get started. Less boilerplate — compare the two blocks below and count how many closing parens you get to delete.

A small app fetching its own configuration before it initializes looks like this:

```javascript
// Old way with async function
(async function initialize() {
  try {
    const response = await fetch('https://api.example.com/config');
    
    const config = await response.json();
    
    initializeApp(config);
  } catch (error) {
    console.error('Error fetching configuration:', error);
  }
})();


// Top-level await
try {
  const response = await fetch('https://api.example.com/config');
  
  const config = await response.json();
  
  initializeApp(config);
} catch (error) {
  console.error('Error fetching configuration:', error);
}

```