# Image Migration Guide

## Phase 1: High-impact Images
Replace these first:
- Homepage hero images (`app/page.js`)
## Phase 2: Secondary Images
Convert these next:
- Content planning visuals (`app/planner/page.js`, `app/agency-content-planner/page.js`)
- Report visualizations (`app/reports/page.js`)

## Phase 3: Low-Priority Images
These can be converted last:
- Background decorative images
- Illustrations in less-visited pages
- Icon images that could be replaced with SVGs or icon components

## For each component with images:

1. Import the Next.js Image component:
```jsx
import Image from 'next/image';
```

2. Replace <img> tags with <Image />:
```jsx
// Before
<img src="/path/to/image.jpg" alt="Description" width="500" height="300" />

// After
<Image 
  src="/path/to/image.jpg"
  alt="Description" 
  width={500} 
  height={300}
  priority={isHighPriority} // Add for above-the-fold images
/>
```

3. For images where dimensions are unknown, use:
```jsx
<Image
  src="/path/to/image.jpg"
  alt="Description"
  fill={true}
  style={{ objectFit: "cover" }} // or "contain" depending on needs
/>
```
Note: The parent element must have `position: relative` or `position: absolute`.

## Temporary Solution for Low-Priority Images
For components that need to be fixed later, add this at the top of the file:
```jsx
/* eslint-disable @next/next/no-img-element */
```

## Testing Image Changes
After converting images in a component:
1. Check loading performance
2. Verify responsive behavior on different screen sizes
3. Test lazy loading behavior for below-the-fold images
4. Verify priority images load immediately

## Image Optimization Tips
- Use `.webp` format when possible for better performance
- Set appropriate `quality` (default is 75)
- Use `sizes` attribute for responsive images
- Consider using `placeholder="blur"` for important images
