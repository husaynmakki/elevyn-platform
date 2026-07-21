# Getting Elevyn Live on a Real, Permanent Link

This gets you one URL that works from any device, doesn't depend on your local
files, and updates itself every time you push new changes.

Two accounts needed, both free: **GitHub** (stores the files) and **Netlify**
(serves them live). Total setup time: about 10 minutes.

---

## Step 1 — Create a GitHub account
Go to **github.com** and sign up if you don't already have an account.

## Step 2 — Create a new repository
1. Click the **+** in the top right → **New repository**
2. Name it something like `elevyn-platform`
3. Leave it **Public** (Netlify's free tier needs this) or **Private** if you
   have a paid Netlify plan
4. Click **Create repository** — don't add a README, just create it empty

## Step 3 — Upload the files
On the new repo's page:
1. Click **uploading an existing file** (or **Add file → Upload files**)
2. Unzip `elevyn-platform.zip` on your computer first
3. Drag the *contents* of that unzipped folder in — `index.html`,
   `elevyn-command-center.html`, the `elevyn-wellness` folder, the
   `elevyn-studios` folder, everything — straight into the upload box
4. Scroll down, click **Commit changes**

Your repo should now show `index.html`, `elevyn-command-center.html`,
`elevyn-wellness/`, and `elevyn-studios/` sitting side by side at the top level.

## Step 4 — Connect it to Netlify
1. Go to **netlify.com** and sign up (the "Sign up with GitHub" option is
   fastest — it links the two accounts automatically)
2. Click **Add new site → Import an existing project**
3. Choose **GitHub**, authorize it, and pick your `elevyn-platform` repo
4. Leave the build settings blank (there's nothing to build — it's static
   HTML) and click **Deploy site**

Netlify gives you a live URL in about 10 seconds, something like
`https://random-name-123.netlify.app`.

## Step 5 — Land on the three-way landing page
That URL now opens the landing page with three cards: **Command Center**,
**Elevyn Wellness Elevated**, and **Elevyn Studios**. The "View Live Sites"
button inside the Command Center will also work correctly now, since
everything's in the same place on the same domain.

## Step 6 — Optional: a cleaner URL
In Netlify: **Site settings → Domain management → Options → Edit site name**
lets you rename the random subdomain to something like
`elevyn-platform.netlify.app`. A fully custom domain
(`elevynwellness.com`) is also possible from that same screen if you own one.

---

## How future updates work from here on

Once this is set up, getting a new version of any file live is:

1. I hand you the updated file(s), same as always
2. You go to the file in your GitHub repo and click the pencil (edit) icon,
   or drag-and-drop the replacement file in
3. Commit the change

Netlify detects the commit and redeploys automatically — usually live within
30–60 seconds, at the **same URL** every time. That's the actual
"click the link, always current" behavior you were after — it just needed a
real host underneath it, which no chat tool (mine included) can substitute for.
