This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Gift request email setup

The workshop sends completed Christmas wishes to one private inbox through
[Resend](https://resend.com). Create a Resend account, verify a sending domain,
create an API key, then copy `.env.example` to `.env.local` and set:

- `RESEND_API_KEY`
- `GIFT_REQUEST_FROM_EMAIL` using the verified sending domain
- `GIFT_REQUEST_TO_EMAIL` for the private workshop inbox

Production also fails closed unless durable rate limiting is configured. Create
an Upstash Redis database and set `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`, and a long random
`GIFT_REQUEST_RATE_LIMIT_SECRET`. Development and tests use a clearly scoped
per-process fallback; that fallback is not considered reliable on serverless
production deployments.

To test safely, use Resend's testing addresses or a private inbox you control,
submit a completed workshop design, and verify both HTML and plain-text content.
Provider acceptance means the notification was queued for processing; it is not
proof of final email delivery or a promise that slippers will be made. Automated
tests inject a fake sender and never contact Resend.

### Contact data and privacy

The form collects the requester's name and email, plus an optional international
WhatsApp number and Christmas message. A separate unticked checkbox records
consent to manual contact about that specific wish. Contact details are included
only in the private notification email; the application does not put them in
public pages, URLs or analytics and does not implement automated WhatsApp
messaging. Resend and the configured inbox provider process the notification,
so production operators remain responsible for appropriate retention, access
controls, deletion handling and an accurate public privacy notice.

## Personalised Christmas invitations

Invitation records live privately in the existing Upstash Redis database under
the separate `christmas-slippers:invitation:v1:*` namespace. Redis stores only
a SHA-256 lookup hash of each 256-bit random bearer token; names and invitation
metadata are never committed to the repository or exposed through a public
creation API. Set the existing `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` values plus `INVITATION_PUBLIC_BASE_URL` in the
ignored `.env.local` file. The public base URL must be the real deployed origin;
the scripts do not guess one.

Run the local administrator commands with the Node version pinned in `.nvmrc`:

```bash
npm run invite:create -- --name "Mariana"
npm run invite:create -- --name "Mariana" --expires "2026-12-31T23:59:59Z"
npm run invite:create-generic
npm run invite:create-generic -- --expires "2026-12-31T23:59:59Z"
npm run invite:list
npm run invite:revoke -- --token "paste-the-private-token-here"
```

Creation prints Portuguese and English dedicated invitation links. Generic
invitations use the same private token storage but do not attach a recipient
name. Listing displays private metadata but never prints bearer tokens.
Revocation requires the original token from the private link. Never paste real
invitation links into source files,
issues, analytics, screenshots, or public chat logs.

Invitation links use `/invite/<token>` for Portuguese and
`/en/invite/<token>` for English. Existing
`/invitation-preview?invite=<token>` and
`/en/invitation-preview?invite=<token>` links remain supported. Missing,
malformed, expired, revoked, or unavailable records return visitors safely to
the locale's ordinary homepage. The generic invitation is shown only for a
valid generic token and never appears automatically on the homepage. Invitation
links are bearer links rather than authentication: anyone possessing a valid
link can view its invitation content. Invitation responses disable public
caching and send a `no-referrer` policy, but recipients should still treat the
link as private.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
