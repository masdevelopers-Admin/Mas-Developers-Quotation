# Deployment Guide for MAS Quotation System

To make your application live on the web, we recommend using **Vercel**, which is optimized for Next.js applications.

## Prerequisites
1.  **GitHub Repository**: Your code is already pushed to `https://github.com/masdevelopers-Admin/Mas-Developers-Quotation`.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Database**: Since this is a dynamic application (Quotations, Users), **SQLite (current)** is NOT recommended for production on Vercel because data will be lost when the server restarts. You need a **PostgreSQL** database.

## Step 1: Set up a Database (Recommended: Vercel Postgres or Neon)
1.  Go to the Vercel Dashboard.
2.  Navigate to the **Storage** tab.
3.  Create a new **Postgres** database.
4.  Copy the connection strings (specifically `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`).

## Step 2: Prepare Your Code
*The code has been updated to use PostgreSQL.*

**Action Required: Deployment**
We will deploy the code to Vercel, which involves connecting it to the database you created in Step 1.

**(Optional) Local Development:**
If you want to run the app locally, you must now:
1.  Install PostgreSQL locally.
2.  Update your local `.env` file with `DATABASE_URL="postgresql://..."`.
3.  Run `npx prisma db push`.

## Step 3: Deploy to Vercel
1.  Log in to your Vercel Dashboard.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the `Mas-Developers-Quotation` repository.
4.  **Environment Variables**:
    *   Expand the "Environment Variables" section.
    *   Add `DATABASE_URL`: Paste your Postgres Connection String from Step 1.
    *   Add `NEXTAUTH_SECRET`: Generate a random string (e.g., using `openssl rand -base64 32`) and paste it here.
    *   Add `NEXTAUTH_URL`: e.g., `https://your-project-name.vercel.app` (You can update this after the first deploy gives you a URL).
5.  Click **"Deploy"**.

## Step 4: Finalize Database Schema
Once deployed, the build might fail or the app might error because the database is empty. You need to push your schema to the new production database.

**From your local terminal:**
1.  Create a `.env.production.local` file (or just set the var temporarily) with your PRODUCTION connection string.
2.  Run:
    ```bash
    npx prisma db push
    ```
    *Note: This pushes the schema to the remote DB.*

## Step 5: Create Admin User
You will need to manually create your first admin user in the database or use the registration page if enabled.
