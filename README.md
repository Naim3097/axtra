# Axtra Workspace

This is a NextJS application for Axtra's content review and collaboration system.

## Features

- **Client Workspace Interface**: Modern UI for client content review and feedback
- **Firebase Integration**: Real-time data synchronization and secure file storage
- **Multi-stage Feedback System**: Structured workflow from drafts to final approval
- **Rich Media Support**: Support for images, videos, and document attachments

## Getting Started

First, install dependencies and run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Firebase Setup

The application requires proper Firebase configuration for permissions. To deploy the Firebase rules:

1. Run the deployment script:
```bash
cd scripts
./deploy-firebase-rules.ps1
```

2. Deploy the rules using Firebase CLI:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Available Pages

- **`/dashboard-client`**: Legacy client dashboard (now superseded by axtra-workspace)
- **`/axtra-workspace`**: Modern client workspace with improved UI and error handling
- **`/planner`**: Content planning interface for internal teams
- **`/agency-content-planner`**: Agency-focused content planning tools

## Important Notes

- The timestamp field naming convention is standardized to use both `createdAt` and `submittedAt` 
- Client feedback permissions now properly configured in Firebase rules
- All file uploads use client-specific paths for better organization
