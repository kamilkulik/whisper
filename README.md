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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## PRICING STRATEGY

I think that geolocation should drive the pricing. Especially if someone is trying to switch to a different domain to get cheapr pricing.
Domain hopping should also be enabld and driven by geolocation.
There are two mechanisms that can be used:

- vercel geolocation data from headers https://vercel.com/docs/headers/request-headers, specifically:
  - x-vercel-ip-country
- browser's geolocation API
  - https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API#examples
- country code of user's phone number

location data will be read:

- default pricing SHOWN comes from referrer domain
- ask the user for access to geolocation browser api
- if user confirms - read their location in the phone number form
- disallow phone numbers outside of the region indicated by visited domain (until .com is secured)
- when making api calls to create checkout session, attempt to get user location again, but also in route handler read location headers
- you want to make sure: referrer domain & location match, phone number country code and location match
- until .com, I don't support phone numbers with country code other than +48 & +44
