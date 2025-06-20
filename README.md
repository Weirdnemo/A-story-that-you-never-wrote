# The story you never wrote

This is an AI-powered collaborative storytelling application built with Next.js and Genkit.

"The story you never wrote" helps you overcome writer's block by co-creating a narrative with an AI partner. Provide a word and a mood, and the AI will craft the next sentence, allowing you to build a unique story, one sentence at a time.

## Tech Stack

*   Next.js
*   React
*   TypeScript
*   Tailwind CSS
*   ShadCN UI
*   Genkit (for AI integration)

## Getting Started

### 1. Set up the Environment

Create a `.env` file in the root of the project and add your Google AI API key:

```bash
GOOGLE_API_KEY=your_google_ai_api_key
```

### 2. Install Dependencies and Run

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:9002`.

## Deploy to Vercel

You can deploy this application to Vercel with a single click.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWeirdnemo%2FA-story-that-you-never-wrote&env=GOOGLE_API_KEY&project-name=the-story-you-never-wrote&repository-name=the-story-you-never-wrote)

**Manual Deployment:**

1.  Push your project to your GitHub repository.
2.  Go to the [Vercel dashboard](https://vercel.com/new) and import your repository.
3.  Vercel will automatically detect that you are using Next.js and will configure the build settings for you.
4.  Add your `GOOGLE_API_KEY` as an environment variable in the Vercel project settings.
5.  Deploy!
