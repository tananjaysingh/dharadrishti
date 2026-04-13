# Green Policy Agent

A production-ready full-stack web application designed for comprehensive Indian land ownership insights, environmental risk analysis, and GIS mapping using open-source technologies.

## 🌟 Features
- Interactive 2D/3D Map Viewer with district-level procedural zoning limits.
- AI-driven land parcel summaries for conflict detection (e.g., protected forests, active disputes, mining overlap).
- High visual fidelity layout with modern Tailwind UI components, accessible shadcn/ui layers, and glass-morphism panels.
- Intelligent state management for mock backend handling of thousands of land parcels dynamically spanning clusters like Amer, Chomu, and Bassi.
- Responsive, futuristic Dark-mode default appearance.

## 🛠 Tech Stack
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Mapping**: [React Leaflet](https://react-leaflet.js.org/) & Leaflet
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Database ORM**: [Prisma](https://www.prisma.io/) (Configured for Supabase/PostgreSQL)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Installation Steps

1. **Clone the project**
   ```bash
   git clone <your-github-repo-url>
   cd green-policy-agent
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Rename `.env.example` to `.env` and fill in your keys. Check "Environment Variables" below.

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` with your browser to see the result.

## 🔐 Environment Variables

You need to provide the following keys in your `.env` for production usage:

```env
DATABASE_URL="Your Prisma/Supabase Connection String"
NEXT_PUBLIC_MAPBOX_TOKEN="Your Mapbox Access Token"
OPENAI_API_KEY="Your OpenAI Key for intelligent summaries"
NEXTAUTH_SECRET="A secure secret for session encoding"
NEXTAUTH_URL="https://your-domain.com"
```

## 📦 Deploying to GitHub

1. **Create Repo**: Create a new repository on GitHub.
2. **Push Code**:
   ```bash
   git init # (if not already done)
   git add .
   git commit -m "Initial launch"
   git branch -M main
   git remote add origin https://github.com/[YOUR_USERNAME]/[REPO_NAME].git
   git push -u origin main
   ```
   *(Ensure no `.env` files are pushed. The `.gitignore` is correctly configured to prevent secrets from leaking into your git history).*

## ⚡ Vercel Deployment Steps

1. **Link to GitHub**: Log into [Vercel](https://vercel.com/), click **Add New > Project**, and select your GitHub repository from the list.
2. **Configure Build Settings**: Vercel will automatically detect the Next.js framework. The build commands (handled by `vercel.json` and `package.json`) are already configured to properly run Prisma generators (`npx prisma generate && next build`).
3. **Add Environment Variables**: Under the *Environment Variables* tab during setup, paste all the keys from your `.env` file (e.g., `DATABASE_URL`, `NEXTAUTH_SECRET`). 
4. **Deploy**: Hit "Deploy". 
5. **Automatic Redeploy**: Once deployed, any future `git push origin main` command will automatically trigger Vercel to rebuild and redeploy your live application flawlessly in minutes!
