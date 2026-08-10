---
title: "Performance Optimizations Using Top-Level Await: Latest JavaScript Code in 2022"
meta_title: "Optimize Your JavaScript: Performance Enhancements with Top-Level Await"
description: "Explore the latest performance optimizations in JavaScript, focusing on the use of top-level await. This comprehensive guide covers best practices, advanced techniques, and real-world examples to help you enhance your web applications."
date: 2024-07-05T20:58:50Z
lastmod: 2026-08-10
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


ECMAScript 2022 added top-level await: the `await` keyword now works directly at the top of a JavaScript module, with no `async` wrapper function required. That single change removes a specific piece of boilerplate developers have carried since async/await first shipped, and it changes how module initialization can be written.

This post covers what top-level await actually does, where it helps most (module initialization that depends on an async result), and the tradeoffs that come with it. Code examples throughout are real, runnable snippets, not abstractions.

## Overview of Top-Level Await

Introduced in ECMAScript 2022, top-level await allows the await keyword to be used at the top level of a JavaScript module. Previously, await could only be used within async functions, requiring developers to wrap asynchronous code within those functions. With top-level await, this wrapping is no longer necessary, simplifying the structure and improving the readability of asynchronous code.

### Historical Context and the Benefit of the Async/Await Pattern

Before the 2022 version of ECMAScript, all of the asynchronous operations in JavaScript necessitated the use of first callbacks, then Promises, and finally the async/await pattern within functions themselves. While each solution greatly improved the readability and maintainability of asynchronous JavaScript code, it still required the use of a defined async function in order to use `await`.

### Use Cases of Top-Level Await

The most significant, novel use case of top-level await is the ability to perform asynchronous operations during initialization. Some use cases of async operations during initialization include:

* Fetching configuration settings from a remote server when the application first starts.

* Loading essential data from the database before the application is started.

* Based on runtime conditions, the ability to dynamically import other modules or dependencies.

Essentially, by using top-level await, the main benefit to developers is that they can improve the initialization process of their JavaScript applications.

### Syntax and Basic Usage

The syntax of top-level await is very straightforward. Here's a code example:

```javascript
const response = await fetch(`https://api.example.com/data`);
const data = await response.json();
```

In this example, the top-level `await` keyword is used without needing to wrap the code inside an async function. Just declaring `await` is enough for those two variables to be asynchronous.

## Benefits of Top-Level Await

### Simplifies Module Setup

Using top-level await allows you to perform asynchronous operations directly at the top level of a module, eliminating the need to wrap each operation in an async function. This is particularly useful for initializing modules that rely on external data, such as fetching configuration settings or establishing database connections. This approach reduces the amount of boilerplate code required, making the code cleaner and more intuitive.

As an example, let's take a look at some simple code meant to represent getting configuration details of an app during initalization: 

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