# Vibebox

The a smart jukebox that measures your feelings through your latest Spotify songs. Instead of just playing music, it listens to what you like and talks back, sharing its thoughts on your choices.

![vibebox](https://github.com/RoelLeijser/vibebox-public/assets/35380022/475eb48b-03b0-4d20-86e5-1a0eec8adbcc)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [Spotify Developer Account](https://developer.spotify.com/dashboard/login)
- [ElevenLabs API Key](https://eleven-labs.com/)

### Installing

1. Clone the repo
   ```sh
   git clone
   ```
2. Install NPM packages

   ```js
   pnpm install
   // or
   npm install
   // or
   yarn install
   ```

3. Create a `.env` file in the root directory and add the environment variables

4. Run the app

   ```sh
   pnpm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment

1. Link your GitHub account to [Vercel](https://vercel.com/)

2. Create a new project

3. Import the repo

4. Add the environment variables

5. Deploy

## Roadmap

- [ ] Make led lights responsive to the emotions (https://github.com/beyondscreen/node-rpi-ws281x-native)
- [ ] Add more remarks
- [ ] Find a better voice with ElevenLabs
- [ ] Create a workaround for the Spotify Developer Account User Limit (currently using puppeteer, but that's not working with serverless on Vercel)
