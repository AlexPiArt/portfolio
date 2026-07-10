# Alex Pi Portfolio

Website and portfolio for Alex Pi, Creative Director, Art Director and Concept Artist.

## How to check indexing status

This repository includes an automated SEO Index Monitor that checks if the portfolio pages are indexed by search engines.

### Running it locally (Technical Checks)
1. Run `npm install`
2. Run `npm run seo:index-check`
3. The script will check the site's HTTP 200 status, `sitemap.xml`, `<meta name="robots">`, and `canonical` tags.

### Enabling Google Search Console API
To allow the script to actually query Google's index, you need to configure a Service Account:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2. Go to **APIs & Services > Library**, search for **Google Search Console API** and click **Enable**.
3. Go to **IAM & Admin > Service Accounts**, and create a new Service Account.
4. Once created, click on the Service Account, go to **Keys**, and **Create new key (JSON)**. This will download a JSON file.
5. Open your [Google Search Console](https://search.google.com/search-console).
6. Go to **Settings > Users and permissions** and add the **email address** of the Service Account (from the JSON file) as a **Delegated Owner** or **Full User**.
7. In GitHub, go to **Settings > Secrets and variables > Actions**.
8. Create a new repository secret named `GSC_CREDENTIALS_JSON`.
9. Paste the *entire contents* of the JSON file you downloaded into the secret value.

Now, whenever you run the GitHub Action (or if you put the JSON content in a local `.env` file), the script will query Google and give you the real indexing verdict.

### Running via GitHub Actions
Go to the **Actions** tab in this GitHub repository.
Click on **SEO Index Monitor** in the left sidebar.
Click **Run workflow**.

The action will execute the checks and automatically commit the results to the `reports/` folder.
