# Implementation Rules for Safe Code Integration

## 1. State Management Rules

- **Audit Existing State First**: Before adding new state variables, check if similar ones exist in different names
- **Centralize Related States**: Group related states (e.g., `feedbacks`, `files`, `revisionLog`) in the same section
- **Consistent Naming****: Use the same naming convention throughout (e.g., `contentSubmissions` not `submissions` elsewhere)
- **Verify Dependencies**: When adding new useEffect hooks, ensure all dependencies are correctly listed
- **Prevent Duplicate States**: Never create two different states to track the same data

## 2. Firebase Integration Rules

- **Consistent Document IDs**: Always format IDs as `${clientEmail.toLowerCase()}_${contentId}`
- **Data Format Integrity**: Match existing timestamp formats (Firestore `Timestamp` objects)
- **Collection Consistency**: Use the established collections (`contentDirections`, `contentSubmissions`, `revisions`)
- **Error Handling**: Wrap all Firebase operations in try/catch blocks
- **Transaction Safety**: Use transactions for operations requiring atomic updates across documents

## 3. Function Implementation Rules

- **Sequential Implementation**: Add feedback and approval functions one at a time, testing each before proceeding
- **Function Isolation**: Ensure new functions don't modify any existing behavior
- **Consistent Patterns**: Follow the existing pattern for defining and calling functions
- **Data Validation**: Always validate inputs at the start of each function
- **Loading States**: Set/clear loading indicators consistently (`submitting`, `loading`) in try-finally blocks

## 4. UI Component Integration Rules

- **Incremental Addition**: Add UI components one at a time (first feedback, then approval)
- **Preserve Styling**: Maintain the existing style patterns for consistency
- **Test Modal Interactions**: Ensure modals open/close correctly and don't conflict
- **Button Logic Safety**: Verify that all button onClick handlers reference the correct functions
- **Conditional Rendering**: Double-check all conditional logic for UI elements

## 5. Data Flow Rules

- **One-Way Data Flow**: Maintain the unidirectional flow from state to UI
- **Verify Data Mapping**: When iterating over arrays, ensure correct object properties are accessed
- **State Updates**: Use functional form for state updates (`setPrev => ({...prev, [key]: value})`)
- **Event Propagation**: Use `e.stopPropagation()` where needed to prevent unintended actions
- **Loading/Error States**: Display appropriate feedback during async operations

## 6. Testing Checklist

- **Incremental Testing**: Test each new feature immediately after implementation
- **Cross-Browser Verification**: Confirm functionality works across browsers
- **Device Testing**: Test both desktop and mobile views
- **Flow Testing**: Verify the entire user journey works end-to-end
- **Error Handling**: Deliberately trigger errors to ensure graceful handling

## 7. Content Feed Page Enhancement Rules

- **Single Source of Truth**: Maintain content-feed as the primary client interaction platform
- **Feature Integration Order**: Implement feedback system first, then approval system
- **Draft Management Flow**: Follow the established draft progression (Draft 1 → Draft 4)
- **Revision Tracking**: Store all client interactions in the revisions collection
- **Modal Enhancement**: Add functionality without disrupting existing modal behavior