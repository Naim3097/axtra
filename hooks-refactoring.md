# Hooks Refactoring Guide

## Rules to Follow:

1. All hooks must be at the top level of your component
2. Hooks cannot be inside conditionals, loops, or nested functions
3. All dependencies must be properly declared in dependency arrays

## Pattern for Conditional Effects:
```jsx
// CORRECT: 
useEffect(() => {
  if (condition) {
    // Do something when condition is true
  }
}, [condition]);

// INCORRECT:
if (condition) {
  useEffect(() => {
    // This will cause an error
  }, []);
}
```

## Pattern for Conditional State:
```jsx
// CORRECT:
const [state, setState] = useState(initialValue);
// Use state conditionally later in your code

// INCORRECT:
if (condition) {
  const [state, setState] = useState(initialValue); // This will cause an error
}
```

## Example Refactoring:
```jsx
// Before (problematic):
function MyComponent({ data }) {
  if (data) {
    const [value, setValue] = useState(data.initial);
    useEffect(() => {
      // Process data
    }, [data]);
  }
  // Rest of component
}

// After (fixed):
function MyComponent({ data }) {
  const [value, setValue] = useState(data ? data.initial : null);
  
  useEffect(() => {
    if (data) {
      // Process data
    }
  }, [data]);
  
  // Rest of component
}
```
