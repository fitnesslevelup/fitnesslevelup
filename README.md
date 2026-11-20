# ARISE — Solo Leveling Fitness System

Level up from E-Rank to S-Rank with 4 daily calisthenics quests, Boss Pose level walls, a rival ladder and a 21-pose trophy gallery. Progress is saved on the device, and players who sign in (email + password) get it saved online and synced across all their devices.

## Deploy on Vercel (no code changes needed)

1. Get this code into a GitHub repository (Lovable → Project settings → Git → Connect GitHub creates it and keeps it in sync).
2. On vercel.com: **Add New → Project → Import** this repository.
3. Leave every setting as Vercel suggests. No environment variables are needed (the backend address is in the `.env` file in the repository).
4. Click **Deploy**. Every new commit to the repository redeploys automatically.

The build detects Vercel by itself and produces Vercel's output format, so the live site matches the Lovable preview.

## Run locally

```sh
npm i
npm run dev
```

Built with TanStack Start, React, TypeScript and Tailwind CSS.
