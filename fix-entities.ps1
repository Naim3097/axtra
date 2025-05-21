# Run ESLint to fix unescaped entities
npx eslint --fix --rule 'react/no-unescaped-entities: ["error", { "forbid": ["''", """"] }]' "app/**/*.{js,jsx,ts,tsx}" "components/**/*.{js,jsx,ts,tsx}"

Write-Host "Fixed unescaped entities in JSX files" -ForegroundColor Green
