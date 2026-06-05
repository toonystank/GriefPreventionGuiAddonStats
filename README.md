# bStats Dynamic Banner Generator

This is a Next.js application that dynamically generates a modern, transparent background bStats chart as an image (`PNG`), specifically designed for the **Grief Prevention GUI Addon**.

## Features
- **Transparent Base**: The banner is contained within a rounded rectangle, but the outer background is completely transparent, meaning it looks great on both **Light Mode** and **Dark Mode** forums (like BuiltByBit).
- **Dynamic Data**: Fetches data live from the bStats REST API (`/api/v1/plugins/21552`).
- **Edge Caching**: Configured to cache for 1 hour to ensure the image loads instantly and doesn't hit bStats rate limits.
- **Modern Satori Rendering**: Uses Vercel's Edge network and `next/og` to render HTML/CSS directly into a beautifully styled image.

## How to Deploy to Vercel

1. Go to [Vercel](https://vercel.com/new) and import this repository.
2. Vercel will automatically detect that it's a Next.js app.
3. Click **Deploy**.

## How to use the banner

Once deployed, your Vercel app will give you a domain (e.g. `https://grief-prevention-gui-addon-stats.vercel.app`).
To display the image on your GitHub README, SpigotMC, or BuiltByBit, simply use the URL to the `/api/banner` endpoint:

**Markdown / BuiltByBit Format:**
```markdown
![bStats](https://your-vercel-domain.vercel.app/api/banner)
```

**BBCode:**
```bbcode
[img]https://your-vercel-domain.vercel.app/api/banner[/img]
```

## Local Development
To test this locally:
1. Open this folder in your terminal: `cd GriefPreventionGuiAddonStats`
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:3000/api/banner` in your browser.
