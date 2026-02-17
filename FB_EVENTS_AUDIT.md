### Implemented Events

ViewContent - General Event
InitiateCheckout
Contact
Lead
StartTrial
Purchase

### trackEvent (s) - FE FB Pixel

src/app/page.tsx - StartTrial when the user clicks on the product card for TRIAL
src/app/\_components/ConfirmationCodeForm.tsx - Contact - after someone correct input their OTP code
src/app/\_components/PricingSection.tsx - InitiateCheckout - from pricing page if product is NOT TRIAL
src/app/\_components/SuccessPageTrack - Purchase - when the user gets directed to the Purchase success page
src/app/email-confirmation - Lead - when someone confirmed their email address

### sendCapiEvent - BE FB Conversions API

src/app/api/checkout-sessions/route.ts - InitiateCheckout - when someone initated the checkout api
src/app/api/confirm/email/route.ts - Lead - when someone initiates confirmation email
src/app/api/confirm/otp/route.ts - Contact - when someone initiates getting OTP code
src/app/api/payments/utils/handleSessionCompleted.ts - handle sessionCompleted
src/app/api/users/route.ts - when saving a trial user to the DB
