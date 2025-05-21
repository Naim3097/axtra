# Deployment Checklist

## 1. Fix Escaped Entities
- [ ] Run the `fix-entities.sh` script
- [ ] Test the site after these changes
- [ ] Commit these changes with message "Fix: resolve escaped entities in JSX"

## 2. Image Component Migration
- [ ] Fix high-priority images first (homepage, landing pages)
- [ ] Add `/* eslint-disable @next/next/no-img-element */` to files that will be fixed later
- [ ] Test the site after these changes
- [ ] Commit these changes with message "Fix: migrate critical images to Next.js Image component"

## 3. Hook Refactoring
- [ ] Identify components with hook-related errors
- [ ] Move all hooks to the top level of components
- [ ] Move conditionals inside the hooks, not around them
- [ ] Check dependency arrays in useEffect hooks
- [ ] Test the site after these changes
- [ ] Commit these changes with message "Fix: refactor hooks to follow React rules"

## 4. Final Verification
- [ ] Run a full build (`npm run build` or `yarn build`)
- [ ] Verify no build errors remain
- [ ] Deploy and test in staging environment
