# Code Quality Guidelines

## 1. Fixing Unescaped Entities in JSX

To automatically convert common unescaped entities in JSX ('→&apos; and "→&quot;):

```powershell
npx eslint --fix --rule 'react/no-unescaped-entities: ["error", { "forbid": ["''", """"] }]' "app/**/*.{js,jsx,ts,tsx}" "components/**/*.{js,jsx,ts,tsx}"
```

For specific instances that should remain unescaped, use an inline comment:

```jsx
{/* eslint-disable-next-line react/no-unescaped-entities */}
<p>Here's a tricky piece of text that we'll leave "raw."</p>
```

**Important:** Commit each batch of fixes separately and perform smoke-testing after deployment.

## 2. Migrating `<img>` Tags to Next.js `<Image />`

Follow this gradual approach:

1. **Step A:** Convert high-impact images first (e.g., homepage hero images)
   
2. **Step B:** For low-priority images, temporarily suppress warnings:
   ```js
   /* eslint-disable @next/next/no-img-element */
   ```

3. **Step C:** Progressively replace `<img>` with `<Image />` as you revisit components:
   ```jsx
   import Image from 'next/image';
   
   // Before
   <img src="/path/to/image.jpg" alt="Description" />
   
   // After
   <Image 
     src="/path/to/image.jpg"
     alt="Description"
     width={500}
     height={300}
     priority={isHighPriority} // Add for important above-the-fold images
   />
   ```

## 3. Refactoring Hooks Defensively

Take a component-by-component approach:

1. **Before refactoring:** Write tests or snapshots to verify current behavior

2. **Hook organization:** Place all `useState`/`useEffect` calls at the top of your component

3. **Conditional logic:** Use if-checks inside hooks, not around them:

   ```jsx
   // Good practice
   const [foo, setFoo] = useState(null);
   
   useEffect(() => {
     if (someCondition) {
       // do thing
     }
   }, [someCondition]);
   
   // Avoid this
   if (someCondition) {
     useEffect(() => {
       // do thing
     }, []);
   }
   ```

4. **Manual verification:** Test the component in isolation and within the context of your app before moving to the next one

## Implementation Order

1. Fix escaped entities
2. Deploy and smoke-test
3. Migrate `<img>` tags
4. Refactor hooks
