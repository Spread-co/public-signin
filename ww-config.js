export default {
  editor: {
    label: 'Sign In / Sign Up Wizard',
    icon:  'user',
  },

  properties: {
    /* ── Connection ─────────────────────────────────────────────────── */
    supabaseUrl: {
      label:    'Supabase URL',
      type:     'Text',
      bindable: true,
      defaultValue: '',
      section: 'settings',
    },
    supabaseAnonKey: {
      label:    'Supabase Anon Key',
      type:     'Text',
      bindable: true,
      defaultValue: '',
      section: 'settings',
    },
    stripePublishableKey: {
      label:    'Stripe Publishable Key',
      type:     'Text',
      bindable: true,
      defaultValue: '',
      section: 'settings',
    },
    checkoutEdgeFunctionUrl: {
      label:    'Checkout Edge Function URL',
      type:     'Text',
      bindable: true,
      defaultValue: '',
      section: 'settings',
    },

    /* ── Redirect ────────────────────────────────────────────────────── */
    successRedirectUrl: {
      label:       'Success Redirect URL',
      type:        'Text',
      bindable:    true,
      defaultValue: '/dashboard',
      section:     'settings',
    },
    waitlistRedirectUrl: {
      label:       'Waitlist Redirect URL',
      type:        'Text',
      bindable:    true,
      defaultValue: '/waitlist',
      section:     'settings',
    },

    /* ── Labels / copy ───────────────────────────────────────────────── */
    headlineSignIn: {
      label:       'Sign-in Headline',
      type:        'Text',
      bindable:    true,
      defaultValue: 'Welcome back',
      section:     'labels',
    },
    headlineSignUp: {
      label:       'Sign-up Headline',
      type:        'Text',
      bindable:    true,
      defaultValue: 'Create your account',
      section:     'labels',
    },
    headlineAddress: {
      label:       'Address Step Headline',
      type:        'Text',
      bindable:    true,
      defaultValue: 'Your delivery address',
      section:     'labels',
    },
    headlineCapacity: {
      label:       'Capacity Step Headline',
      type:        'Text',
      bindable:    true,
      defaultValue: 'Checking your area',
      section:     'labels',
    },
    headlinePlan: {
      label:       'Plan Step Headline',
      type:        'Text',
      bindable:    true,
      defaultValue: 'Choose your membership',
      section:     'labels',
    },
    headlineCheckout: {
      label:       'Checkout Step Headline',
      type:        'Text',
      bindable:    true,
      defaultValue: "You're almost in!",
      section:     'labels',
    },

    /* ── Behaviour ───────────────────────────────────────────────────── */
    requireAddressBeforePlan: {
      label:       'Address required before plan?',
      type:        'OnOff',
      bindable:    true,
      defaultValue: true,
      section:     'settings',
    },
    showMagicLinkOption: {
      label:       'Show magic link option',
      type:        'OnOff',
      bindable:    true,
      defaultValue: true,
      section:     'settings',
    },
  },

  triggerEvents: [
    {
      name:    'auth:signin-success',
      label:   'User authenticated',
      event:   { userId: '', email: '', isNewUser: false },
    },
    {
      name:    'auth:forgot-password-sent',
      label:   'Forgot password email sent',
      event:   { email: '' },
    },
    {
      name:    'auth:error',
      label:   'Auth / checkout error',
      event:   { step: '', message: '' },
    },
    {
      name:    'signup:capacity-blocked',
      label:   'User sent to waitlist (capacity full)',
      event:   { email: '', postcode: '', regionId: '' },
    },
    {
      name:    'signup:postcode-unmapped',
      label:   'Postcode not in any region',
      event:   { postcode: '' },
    },
    {
      name:    'signup:plan-selected',
      label:   'Membership plan selected',
      event:   { planId: '', planName: '', priceId: '', amount: 0 },
    },
    {
      name:    'checkout:redirecting',
      label:   'Redirecting to Stripe Checkout',
      event:   { sessionUrl: '', planId: '' },
    },
    {
      name:    'signin:step-changed',
      label:   'Wizard step changed (utility)',
      event:   { step: '' },
    },
  ],
};
