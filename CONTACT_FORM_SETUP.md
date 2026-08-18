# Contact Form Setup Guide

The contact form submits to the Vercel serverless function in `api/contact.js`, which sends the message through Resend. API keys and the recipient address stay in environment variables and are never exposed to visitors.

## Step 1: Set Up Resend

1. Create a free account at [Resend](https://resend.com).
2. Add and verify the domain you will send from, such as `childrensmindfoundation.org`.
3. Create an API key at [Resend API Keys](https://resend.com/api-keys).
4. For a one-off test, Resend may provide `onboarding@resend.dev` and a test recipient. For the live form, use an address on your verified domain.

## Step 2: Configure Vercel

In Vercel, open **Project > Settings > Environment Variables** and add:

- `RESEND_API_KEY`: your Resend API key
- `RESEND_FROM_EMAIL`: a sender address on your verified Resend domain
- `CONTACT_EMAIL`: the inbox that should receive contact form submissions

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

## Troubleshooting

- `401` or authentication errors: create a new Resend API key and update Vercel.
- Sender errors: verify the sending domain and ensure `RESEND_FROM_EMAIL` uses that domain.
- Configuration errors: confirm all three environment variables are present for the deployed environment, then redeploy.
- Browser errors: inspect the `/api/contact` request in the browser Network panel and check Vercel function logs.
