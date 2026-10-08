# Contact Form Setup Guide

The contact form submits to the Vercel serverless function in `api/contact.js`, which sends the message through Resend. API keys and the recipient address stay in environment variables and are never exposed to visitors.

## Step 1: Set Up Resend

1. Create a free account at [Resend](https://resend.com).
2. Add and verify the domain you will send from: `thechildrensmindsfoundation.org`.
3. Create an API key at [Resend API Keys](https://resend.com/api-keys).
4. For a one-off test, Resend may provide `onboarding@resend.dev` and a test recipient. For the live form, use an address on your verified domain.

## Step 2: Configure Vercel

In Vercel, open **Project > Settings > Environment Variables** and add:

- `RESEND_API_KEY`: your Resend API key
- `RESEND_FROM_EMAIL`: a separate sender address on your verified Resend domain, such as `noreply@thechildrensmindsfoundation.org`
- `CONTACT_EMAIL`: the inbox that should receive contact form submissions, such as `hello@thechildrensmindsfoundation.org`

The visitor's email address is used as `replyTo`, so selecting **Reply** in your inbox replies to the visitor. Do not use the visitor's address as `from`; Resend requires the sender to use your verified domain.

Redeploy after changing environment variables.

Using the CLI:

```bash
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add CONTACT_EMAIL
```

## Step 3: Include the Form Handler

Ensure `index.html` includes this before the closing `</body>` tag:

```html
<script src="/contact-form-handler.js"></script>
```

## Step 4: Test

1. Open the deployed website.
2. Submit the contact form with a real reply-to email address.
3. Confirm the success message appears.
4. Check the configured `CONTACT_EMAIL` inbox.

## Test Locally

Install Node.js 18 or newer, then run these commands from the project folder:

```bash
npm install
npx vercel dev
```

When Vercel prompts for project settings, link the existing Vercel project. Add the three environment variables in the Vercel dashboard, or create a local `.env.local` file with the same names. Keep that file private and do not commit it.

If `vercel dev` asks whether to pull Development Environment Variables into `.env.local`, answer **No** when you want to use the values already in your local file. Answering **Yes** overwrites `.env.local` with values from the linked Vercel project.

Then open the local URL shown by Vercel, usually `http://localhost:3000`, and submit the form. The API will be available at `http://localhost:3000/api/contact`.

For local testing, `.env.local` is the local source of environment variables. Stop and restart `vercel dev` after changing it. If the shell has previously exported old values, clear them before restarting:

```bash
unset RESEND_API_KEY RESEND_FROM_EMAIL CONTACT_EMAIL
npx --no-install vercel dev --listen 3000
```

`vercel dev` can also load Development Environment Variables from the linked Vercel project. These are separate from the Production and Preview values used by deployments. If the local function reports `API key is invalid` while a direct Resend request using `.env.local` succeeds, compare the local file with the linked project and avoid pulling the Development values. Check the linked project with:

```bash
npx --no-install vercel env ls
```

If your Vercel project does not allow a sensitive key in the Development environment, use `.env.local` for local testing and do not commit it.

If you only open `index.html` as a file, the page can render but the contact submission will fail because no local `/api/contact` function is running.

For a direct Resend smoke test, use their sample code in a local script, but read the key from an environment variable rather than placing it in the file:

```js
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const { data, error } = await resend.emails.send({
  from: "onboarding@resend.dev",
  to: "the-test-recipient-resend-provided",
  subject: "Hello World",
  html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
});

if (error) console.error(error);
else console.log(data);
```

Do not commit the API key or a `.env.local` file.

## Connect Cloudflare to Vercel

The production website remains on Cloudflare, while the contact API runs on a Vercel subdomain. Cloudflare does not automatically forward `/api/contact` to Vercel, and it cannot read Vercel environment variables.

1. In Vercel, open **Project > Settings > Domains** and add:
  - `api.thechildrensmindsfoundation.org`
2. In Cloudflare DNS, add the `api` record using the target Vercel displays. The usual record is:

```text
CNAME  api    cname.vercel-dns.com
```

3. Set the `api` record to **DNS only** while verifying the domain. Enable the Cloudflare proxy after the Vercel domain is working.
4. Set Cloudflare SSL/TLS mode to **Full (strict)**.
5. Ensure Deployment Protection does not require Vercel authentication for the public API deployment. Otherwise, requests can receive `401 Protected deployment`.
6. Leave the existing root website DNS records unchanged and confirm that the API subdomain is listed in Vercel before testing.

Test the production route with:

```bash
curl -i -X POST https://api.thechildrensmindsfoundation.org/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Production","email":"delivered@resend.dev","message":"Production routing test"}'
```

A working route should return HTTP `200` with `"success": true`. A Cloudflare `404` means the `api` DNS record is missing, points to another origin, or the API subdomain is not attached to Vercel. A Vercel `401` means Deployment Protection is still enabled for that deployment.

## Troubleshooting

- `401` or authentication errors: create a new Resend API key and update Vercel.
- Sender errors: verify the sending domain and ensure `RESEND_FROM_EMAIL` uses that domain.
- Configuration errors: confirm all three environment variables are present for the deployed environment, then redeploy.
- Browser errors: inspect the `/api/contact` request in the browser Network panel and check Vercel function logs.
