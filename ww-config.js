export default {
  editor: {
    label: 'Sign In / Sign Up',
    icon:  'user',
  },

  properties: {
    /* ── Connection ─────────────────────────────────────────────────── */
    supabaseUrl: {
      label:        'Supabase URL',
      type:         'Text',
      bindable:     true,
      defaultValue: '',
      section:      'settings',
    },
    supabaseAnonKey: {
      label:        'Supabase Anon Key',
      type:         'Text',
      bindable:     true,
      defaultValue: '',
      section:      'settings',
    },

    /* ── Copy ────────────────────────────────────────────────────────── */
    headlineSignIn: {
      label:        'Sign-in Headline',
      type:         'Text',
      bindable:     true,
      defaultValue: 'Welcome back',
      section:      'labels',
    },
    headlineSignUp: {
      label:        'Sign-up Headline',
      type:         'Text',
      bindable:     true,
      defaultValue: 'Join Spread.co',
      section:      'labels',
    },

    /* ── Behaviour ───────────────────────────────────────────────────── */
    showMagicLinkOption: {
      label:        'Show magic link option',
      type:         'OnOff',
      bindable:     true,
      defaultValue: true,
      section:      'settings',
    },
  },

  triggerEvents: [
    {
      name:  'auth:signin-success',
      label: 'User authenticated',
      event: { userId: '', email: '', isNewUser: false },
    },
    {
      name:  'auth:redirect',
      label: 'Redirect signed-in user to portal',
      event: { destination: 'member', userId: '', email: '' },
    },
    {
      name:  'signup:start-onboarding',
      label: 'Open onboarding modal (new / no membership)',
      event: { userId: '', email: '', accessToken: '', isNewUser: true },
    },
    {
      name:  'auth:forgot-password-sent',
      label: 'Forgot password email sent',
      event: { email: '' },
    },
    {
      name:  'session:signup-confirm',
      label: 'Email confirmation sent (sign-up)',
      event: { email: '' },
    },
    {
      name:  'auth:error',
      label: 'Auth error',
      event: { step: '', message: '' },
    },
  ],
};
