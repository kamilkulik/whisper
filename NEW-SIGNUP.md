# THE NEW SIGNUP FLOW (ONE OPTION)

## REMOVE FREE TRIAL
First of all - the 7 day free trail. I'm not sure this is the right approach. I the customer is "sliding" through the funnel at breakneck speed, they might not even know what they are buying - other than a service that promises them to feel loved at the end of the day.

## PRICING SECTION
The pricing section - also according to the report - introduces substantial friction to the user, who after having acquiated themselves with some of the landing page, get a smack in the face to enrol in trial or buy the product outright.

## NEW FLOW

### Instead of the PRICING SECTION

1. Instead of the 3 pricing cards (trial, 30 days of messages, monthly sub), present a single, pulsating button centered on the entire screen saying "let the ritual start" or "see how it feels". 

2. Upon clicking it, show the user the usual OTP form but this time tell them "your whisper is ready for you. Your phone number is how it finds you now".

3. Instead of getting the OTP code, they will receive their first whisper. I'll make sure it's a good one (tactful, elegant, warm, inspiring trust and confidence)

4. The website will animate information about every stage up to delivering the whisper to the user

5. Beautiful animation

6. "Your whisper was just delivered. While you read it, would you like to keep this feeling every evening for the next 7 days for just $1?" 

7. There's two buttons 
    - YES - they get taken to the usual signup form which they got AFTER entering the OTP originally. The user and their phone number need to be known to the backend, which will create the checkout session for them.
    - NO - they get shown a single feeback form question "what made you quit?". This way I'll be getting additional feedback (hopefully). 
    
8. This time, the trial is going to be opt-out, transitioning into 11.99 USD service. 

9. On day 6 & 7, the user will be notified the trial is about to end, and that they will be charged. The message will include a link to cancel.


# FACEBOOK PIXEL

`PageView` - NO CHANGE

`Contact` - The button that sends the user their first whisper

```diff
- StartTrial
```
`InitiateCheckout` - The button they press to get taken to the STRIPE checkout

`Purchase` - The success page after having subscribed to TRIAL - NO CHANGE

# FACEBOOK CAPI

`PageView` - NO CHANGE

`Contact` - backend receives the request to send whisper

```diff
- StartTrial
```
`InitiateCheckout` - **navigateToCheckout** receives the request to initiate

`Purchase` - Stripe webhook gets received for completed checkout


# MECHANICS

```
IMPORTANT!!

Recommendation: Do NOT add motion/framer-motion. All animations described are achievable with CSS @keyframes + Tailwind utilities + light JS event handlers (onTouchStart, setTimeout). This guarantees universal mobile compatibility and zero bundle bloat.
```


- `<div id="pricing-section">` gets replaced with `<div id="signup-section">` & `#pricing-section` gets renamed to `#signup-section`
- `PricingSection.tsx` gets replaced by `SignUpSection.tsx` component
- `SignUpSection.tsx` is a whole viewport component
- `SignUpSection.tsx` is a parent + coordinator component. It conditionally renders subsequent elements. It holds all state required to complete the signup
- `SeeHowItFeels.tsx` is a big pulsating button - pulsating like a heart - uses the `heartbeat` animation as defined in `tailwind.config.js`. 
- `SeeHowItFeels.tsx` has a text "see how it feels" that fades out as the user holds the button. When the user taps the button, they get shown the `PhoneForm.tsx` component with new title ""your whisper is ready for you. Your phone number is how it finds you now"". They enter their phone number.
- `PhoneForm.tsx` has a button "Let the whisper find me"
It needs to be "Hold to Confirm". Once the user holds the button for 2 seconds, it becomes a solid circle with the text "sending your whisper..." - it ripples like a heartbeat.
- `SeeHowItFeels.tsx` button keeps polling the backend api to check whether the message was delivered by the webhook handler. 
- **NOTE ON SERVERLESS ARCHITECTURE** - Webhook listener will be on a separate instance to the `SeeHowItFeels` button. They need to use objective USER ID to communicate. They will use the `sessionId`, because no DB USER ID will have been available at that point. The frontend will have to poll the backend on separate API. That's why the listener needs to persist the delivery status in the database. Use `sessionIdCache` to handle failures & retries.

Suggested logic:
1. When the user holds the button to submit, the frontend generates a temporary, cryptographically secure UUID (e.g., crypto.randomUUID()).
2. The frontend sends POST /api/whisper/deliver with the payload: { phoneNumber: "+447...", deliverySessionId: "uuid-1234..." }.
3. Your serverless function triggers Twilio, creates a temporary record in your Postgres DB (or Redis) linked to that deliverySessionId, and returns a 200 OK.
4. Your webhook listener receives the Twilio delivery receipt and updates the DB record matching the phone number to "Delivered."
5. Your frontend polls GET /api/whisper/status?sessionId=uuid-1234....

- `SeeHowItFeels.tsx` will timeout after 60 seconds and show an error message "We're having trouble delivering your whisper. We politely ask to retry in a moment."
- `handleNavigateToPricing` gets renamed to `handleNavigateToSignUp`
- Once the delivery gets confirmed, the button will fade out and be replaced by the Form asking the user to start the paid 1 USD trial.
- The `InitiateCheckout.tsx` component is a form. I has copy: "Your whisper was just delivered. While you read it, would you like to keep this feeling every evening for the next 7 days for just $1?"
- `InitiateCheckout.tsx` component has two buttons:
    - YES - they get taken to the usual signup form which they got AFTER entering the OTP originally. The user and their phone number need to be known to the backend, which will create the checkout session for them.
    - NO - they get shown a single feeback form question "what made you quit?". (e.g., "Too expensive", "Didn't like the poem", "Just browsing"). This way I'll be getting additional feedback (hopefully). 

# TWILIO ADDITIONAL ERROR HANDLING

- potentially use the `https://lookups.twilio.com/v2/PhoneNumbers/<phone_number>`

- 21211: Invalid 'To' Phone Number
- 21704: The Messaging Service contains no phone numbers
- 30034: US A2P 10DLC - Message from an Unregistered Number
- 30005: Unknown destination handset
- 35118: MessagingServiceSid is required to schedule a message

# STRIPE CHANGES

- This time, the trial is going to be opt-out, transitioning into 11.99 USD service.
- On day 6 & 7, the user will be notified the trial is about to end, and that they will be charged. The message will include a link to cancel.