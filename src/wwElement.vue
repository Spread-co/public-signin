<template>
  <div v-if="!content.portalTarget || content.portalTarget === 'public'" class="si-auth" :class="{ 'si-auth--loading': authLoading }">

    <!-- Mode tabs -->
    <div class="si-auth__tabs" role="tablist" aria-label="Authentication mode">
      <button
        class="si-auth__tab"
        :class="{ 'si-auth__tab--active': authMode === 'signup' }"
        @click="switchMode('signup')"
        role="tab"
        :aria-selected="authMode === 'signup'"
      >Create account</button>
      <button
        class="si-auth__tab"
        :class="{ 'si-auth__tab--active': authMode === 'signin' }"
        @click="switchMode('signin')"
        role="tab"
        :aria-selected="authMode === 'signin'"
      >Sign in</button>
    </div>

    <!-- Heading -->
    <div class="si-auth__header">
      <h2 class="si-auth__heading">
        {{ forgotMode
          ? 'Reset your password'
          : authMode === 'signin'
            ? (content.headlineSignIn || 'Welcome back')
            : (content.headlineSignUp || 'Join Spread.co') }}
      </h2>
      <p class="si-auth__sub" v-if="!forgotMode">
        {{ authMode === 'signin'
          ? 'Sign in to your Spread.co account.'
          : 'Get farm-fresh produce delivered to your door.' }}
      </p>
      <p class="si-auth__sub" v-else>Enter your email and we'll send you a reset link.</p>
    </div>

    <!-- Email / magic link confirmation banner -->
    <div v-if="confirmationSent" class="si-auth__confirm">
      <div class="si-auth__confirm-icon">✉</div>
      <h3 class="si-auth__confirm-title">Check your inbox</h3>
      <p class="si-auth__confirm-text">
        We sent a {{ forgotMode ? 'password reset' : 'confirmation' }} link to
        <strong>{{ form.email }}</strong>.
      </p>
      <button type="button" class="si-auth__link" @click="resetState">Back to sign in</button>
    </div>

    <!-- Magic link sent -->
    <div v-else-if="magicLinkSent" class="si-auth__confirm">
      <div class="si-auth__confirm-icon">✨</div>
      <h3 class="si-auth__confirm-title">Magic link sent!</h3>
      <p class="si-auth__confirm-text">Check your inbox at <strong>{{ form.email }}</strong>.</p>
      <button type="button" class="si-auth__link" @click="magicLinkSent = false">Back</button>
    </div>

    <!-- Auth form -->
    <form v-else class="si-auth__form" @submit.prevent="handleSubmit" novalidate>

      <!-- Name fields (sign-up only) -->
      <div v-if="authMode === 'signup'" class="si-auth__field-row">
        <label class="si-auth__field">
          <span class="si-auth__label">First name</span>
          <input class="si-auth__input" type="text" v-model="form.firstName"
            autocomplete="given-name" placeholder="First name" required />
        </label>
        <label class="si-auth__field">
          <span class="si-auth__label">Last name</span>
          <input class="si-auth__input" type="text" v-model="form.lastName"
            autocomplete="family-name" placeholder="Last name" required />
        </label>
      </div>

      <!-- Email -->
      <label class="si-auth__field">
        <span class="si-auth__label">Email address</span>
        <input
          class="si-auth__input"
          :class="{ 'si-auth__input--error': fieldErrors.email }"
          type="email"
          v-model="form.email"
          autocomplete="email"
          placeholder="you@example.com"
          required
        />
        <span v-if="fieldErrors.email" class="si-auth__field-error">{{ fieldErrors.email }}</span>
      </label>

      <!-- Password (hidden in magic-link and forgot modes) -->
      <label v-if="!useMagicLink && !forgotMode" class="si-auth__field">
        <span class="si-auth__label">Password</span>
        <div class="si-auth__input-wrap">
          <input
            class="si-auth__input"
            :class="{ 'si-auth__input--error': fieldErrors.password }"
            :type="showPassword ? 'text' : 'password'"
            v-model="form.password"
            :autocomplete="authMode === 'signup' ? 'new-password' : 'current-password'"
            placeholder="••••••••"
            required
          />
          <button type="button" class="si-auth__pw-toggle"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'">
            <svg v-if="showPassword" viewBox="0 0 24 24" width="16" height="16" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <span v-if="fieldErrors.password" class="si-auth__field-error">{{ fieldErrors.password }}</span>
      </label>

      <!-- Forgot password link -->
      <div v-if="authMode === 'signin' && !forgotMode && !useMagicLink" class="si-auth__row-end">
        <button type="button" class="si-auth__link" @click="forgotMode = true">Forgot password?</button>
      </div>

      <!-- Back from forgot mode -->
      <div v-if="forgotMode" class="si-auth__row-end">
        <button type="button" class="si-auth__link" @click="forgotMode = false">← Back to sign in</button>
      </div>

      <!-- Magic link toggle -->
      <div v-if="content.showMagicLinkOption !== false && !forgotMode" class="si-auth__row-centre">
        <button type="button" class="si-auth__link si-auth__link--sm" @click="useMagicLink = !useMagicLink">
          {{ useMagicLink ? 'Use password instead' : '✨ Send a magic link' }}
        </button>
      </div>

      <!-- General error -->
      <div v-if="generalError" class="si-auth__alert" role="alert">
        <span class="si-auth__alert-icon">!</span>
        <span>{{ generalError }}</span>
      </div>

      <!-- Membership check -->
      <div v-if="checkingMembership" class="si-auth__checking">
        <span class="si-auth__spinner si-auth__spinner--blue" aria-hidden="true"></span>
        <span>Checking your account…</span>
      </div>

      <!-- Submit -->
      <button class="si-auth__submit" type="submit" :disabled="authLoading || checkingMembership">
        <span v-if="authLoading" class="si-auth__spinner" aria-hidden="true"></span>
        <span v-else>{{ submitLabel }}</span>
      </button>

      <!-- Google OAuth -->
      <template v-if="content.showGoogleOAuth !== false && !forgotMode">
        <div class="si-auth__divider"><span>or</span></div>
        <button
          type="button"
          class="si-auth__google-btn"
          @click="signInWithGoogle"
          :disabled="authLoading"
        >
          <svg class="si-auth__google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </template>

    </form>
  </div>
</template>

<script>
// ─────────────────────────────────────────────────────────────────────────────
// public-signin
// Auth-only component. Steps 2–5 have moved to the member-onboarding overlay.
//
// Sign-in path:
//   authenticate → check user_memberships for active status
//   → has active/trialing → emit auth:redirect {destination}
//   → no membership       → emit signup:start-onboarding
//
// Sign-up path:
//   authenticate → emit signup:start-onboarding
// ─────────────────────────────────────────────────────────────────────────────

export default {
  props: {
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
    content:        { type: Object, required: true },
    wwFrontState:   { type: Object, required: true },
    wwElementState: { type: Object, required: true },
  },

  emits: ['trigger-event'],

  data() {
    return {
      authMode:           'signup',
      forgotMode:         false,
      useMagicLink:       false,
      showPassword:       false,
      authLoading:        false,
      checkingMembership: false,
      confirmationSent:   false,
      magicLinkSent:      false,
      generalError:       '',
      fieldErrors:        { email: '', password: '' },
      form: {
        firstName: '',
        lastName:  '',
        email:     '',
        password:  '',
      },
    };
  },

  computed: {
    submitLabel() {
      if (this.forgotMode)   return 'Send reset link';
      if (this.useMagicLink) return 'Send magic link';
      return this.authMode === 'signin' ? 'Sign in' : 'Create account';
    },
  },

  methods: {
    switchMode(mode) {
      this.authMode     = mode;
      this.forgotMode   = false;
      this.generalError = '';
      this.fieldErrors  = { email: '', password: '' };
    },

    resetState() {
      this.confirmationSent = false;
      this.magicLinkSent    = false;
      this.forgotMode       = false;
      this.generalError     = '';
      this.fieldErrors      = { email: '', password: '' };
    },

    validate() {
      this.fieldErrors = { email: '', password: '' };
      let ok = true;
      if (!this.form.email || !this.form.email.includes('@')) {
        this.fieldErrors.email = 'Please enter a valid email address.';
        ok = false;
      }
      if (!this.forgotMode && !this.useMagicLink) {
        if (this.authMode === 'signup' && (this.form.password || '').length < 8) {
          this.fieldErrors.password = 'Password must be at least 8 characters.';
          ok = false;
        } else if (this.authMode === 'signin' && !this.form.password) {
          this.fieldErrors.password = 'Password is required.';
          ok = false;
        }
      }
      return ok;
    },

    async handleSubmit() {
      if (!this.validate()) return;
      this.generalError = '';
      this.authLoading  = true;

      const url = this.content.supabaseUrl;
      const key = this.content.supabaseAnonKey;

      try {
        // ── Forgot password ──────────────────────────────────────────────────
        if (this.forgotMode) {
          await fetch(`${url}/auth/v1/recover`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', apikey: key },
            body:    JSON.stringify({ email: this.form.email }),
          });
          this.confirmationSent = true;
          this.$emit('trigger-event', {
            name:  'auth:forgot-password-sent',
            event: { email: this.form.email },
          });
          return;
        }

        // ── Magic link ───────────────────────────────────────────────────────
        if (this.useMagicLink) {
          const res = await fetch(`${url}/auth/v1/otp`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', apikey: key },
            body:    JSON.stringify({ email: this.form.email }),
          });
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error_description || d.msg || 'Failed to send magic link.');
          }
          this.magicLinkSent = true;
          return;
        }

        // ── Sign in ──────────────────────────────────────────────────────────
        if (this.authMode === 'signin') {
          const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', apikey: key },
            body:    JSON.stringify({ email: this.form.email, password: this.form.password }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error_description || data.msg || data.message || 'Sign in failed.');
          }

          const accessToken = data.access_token;
          const userId      = data.user?.id || '';

          this.$emit('trigger-event', {
            name:  'auth:signin-success',
            event: { userId, email: this.form.email, isNewUser: false },
          });

          // Determine portal + membership status
          this.authLoading        = false;
          this.checkingMembership = true;

          let hasMembership = false;
          let portal        = 'member';

          try {
            const [mRes, rRes] = await Promise.all([
              fetch(
                `${url}/rest/v1/user_memberships?user_id=eq.${userId}&status=in.(active,trialing,past_due)&limit=1&select=id`,
                { headers: { apikey: key, Authorization: `Bearer ${accessToken}` } }
              ),
              fetch(
                `${url}/rest/v1/user_roles?user_id=eq.${userId}&select=roles(key,is_internal)`,
                { headers: { apikey: key, Authorization: `Bearer ${accessToken}` } }
              ),
            ]);
            const mData = await mRes.json();
            const rData = await rRes.json();
            hasMembership = Array.isArray(mData) && mData.length > 0;
            const roles   = (rData || []).map(r => r.roles).filter(Boolean);
            if (roles.some(r => r.is_internal)) portal = 'admin';
          } catch (_) { /* non-fatal */ }

          this.checkingMembership = false;

          if (hasMembership || portal === 'admin') {
            this.$emit('trigger-event', {
              name:  'auth:redirect',
              event: { destination: portal, userId, email: this.form.email },
            });
          } else {
            this.$emit('trigger-event', {
              name:  'signup:start-onboarding',
              event: { userId, email: this.form.email, accessToken, isNewUser: false },
            });
          }
          return;
        }

        // ── Sign up ──────────────────────────────────────────────────────────
        const res = await fetch(`${url}/auth/v1/signup`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', apikey: key },
          body:    JSON.stringify({
            email:    this.form.email,
            password: this.form.password,
            data: {
              first_name: this.form.firstName,
              last_name:  this.form.lastName,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error_description || data.msg || data.message || 'Account creation failed.');
        }

        // Email confirmation required
        if (!data.access_token) {
          this.confirmationSent = true;
          this.$emit('trigger-event', {
            name:  'session:signup-confirm',
            event: { email: this.form.email },
          });
          return;
        }

        // Auto-confirmed (local dev / email-confirm disabled)
        this.$emit('trigger-event', {
          name:  'auth:signin-success',
          event: { userId: data.user?.id || '', email: this.form.email, isNewUser: true },
        });
        this.$emit('trigger-event', {
          name:  'signup:start-onboarding',
          event: {
            userId:      data.user?.id || '',
            email:       this.form.email,
            accessToken: data.access_token,
            isNewUser:   true,
          },
        });

      } catch (e) {
        this.generalError = e.message || 'Something went wrong. Please try again.';
        this.$emit('trigger-event', {
          name:  'auth:error',
          event: { step: this.authMode, message: this.generalError },
        });
      } finally {
        this.authLoading        = false;
        this.checkingMembership = false;
      }
    },

    // ── Google OAuth redirect ────────────────────────────────────────────────
    signInWithGoogle() {
      var url = this.content.supabaseUrl;
      if (!url) return;
      var redirectTo = this.content.oauthRedirectUrl || '';
      var authUrl = url + '/auth/v1/authorize?provider=google' +
        (redirectTo ? '&redirect_to=' + encodeURIComponent(redirectTo) : '');
      this.$emit('trigger-event', { name: 'auth:oauth-redirect', event: { provider: 'google' } });
      try {
        wwLib.getFrontWindow().location.href = authUrl;
      } catch (_) {
        window.location.href = authUrl;
      }
    },
  },
};
</script>

<style scoped>
/* ── Design tokens ─────────────────────────────────────────────────────────── */
.si-auth {
  --si-primary:  #4B162D;
  --si-accent:   #CE6632;
  --si-accent-h: #B85A2B;
  --si-beige:    #E6D8CA;
  --si-text:     #1A1A1A;
  --si-text-2:   #4B5563;
  --si-surface:  #FFFFFF;
  --si-border:   #EDE4D8;
  --si-error:    #D14343;
  --si-r-sm:     6px;
  --si-r-md:     12px;
  --si-r-lg:     20px;
  --si-font:     'Work Sans', ui-sans-serif, system-ui, sans-serif;

  font-family: var(--si-font);
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  background: var(--si-surface);
  border: 1px solid var(--si-border);
  border-radius: var(--si-r-lg);
  padding: 32px 28px 36px;
  color: var(--si-text);
  box-shadow: 0 4px 24px rgba(75, 22, 45, 0.06);
}

.si-auth *, .si-auth *::before, .si-auth *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Tabs ──────────────────────────────────────────────────────────────────── */
.si-auth__tabs {
  display: flex;
  gap: 4px;
  background: var(--si-beige);
  border-radius: var(--si-r-md);
  padding: 4px;
  margin-bottom: 24px;
}

.si-auth__tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: calc(var(--si-r-md) - 2px);
  font-family: var(--si-font);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--si-text-2);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.si-auth__tab--active {
  background: var(--si-surface);
  color: var(--si-primary);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.10);
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.si-auth__header {
  margin-bottom: 24px;
}

.si-auth__heading {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--si-primary);
  margin-bottom: 4px;
  line-height: 1.25;
}

.si-auth__sub {
  font-size: 0.875rem;
  color: var(--si-text-2);
  line-height: 1.5;
}

/* ── Form ──────────────────────────────────────────────────────────────────── */
.si-auth__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.si-auth__field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.si-auth__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.si-auth__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--si-text);
}

.si-auth__input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--si-border);
  border-radius: var(--si-r-sm);
  font-family: var(--si-font);
  font-size: 0.9375rem;
  color: var(--si-text);
  background: var(--si-surface);
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.si-auth__input:focus {
  border-color: var(--si-accent);
  box-shadow: 0 0 0 3px rgba(206, 102, 50, 0.12);
}

.si-auth__input--error { border-color: var(--si-error); }

.si-auth__field-error {
  font-size: 0.75rem;
  color: var(--si-error);
}

.si-auth__input-wrap { position: relative; }
.si-auth__input-wrap .si-auth__input { padding-right: 40px; }

.si-auth__pw-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--si-text-2);
  display: flex;
  align-items: center;
}

/* ── Row layouts ───────────────────────────────────────────────────────────── */
.si-auth__row-end {
  display: flex;
  justify-content: flex-end;
  margin-top: -4px;
}

.si-auth__row-centre {
  text-align: center;
}

/* ── Links ─────────────────────────────────────────────────────────────────── */
.si-auth__link {
  background: none;
  border: none;
  padding: 0;
  font-family: var(--si-font);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--si-accent);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.si-auth__link:hover { color: var(--si-accent-h); }
.si-auth__link--sm   { font-size: 0.75rem; }

/* ── Alert ─────────────────────────────────────────────────────────────────── */
.si-auth__alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: var(--si-r-sm);
  font-size: 0.875rem;
  color: #991B1B;
}

.si-auth__alert-icon { font-weight: 700; flex-shrink: 0; }

/* ── Checking membership ───────────────────────────────────────────────────── */
.si-auth__checking {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  border-radius: var(--si-r-sm);
  font-size: 0.875rem;
  color: #0369A1;
}

/* ── Submit ────────────────────────────────────────────────────────────────── */
.si-auth__submit {
  width: 100%;
  padding: 12px 20px;
  background: var(--si-primary);
  color: #FFFFFF;
  border: none;
  border-radius: var(--si-r-md);
  font-family: var(--si-font);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
}

.si-auth__submit:hover:not(:disabled) { background: #3A1022; }
.si-auth__submit:disabled { opacity: 0.55; cursor: not-allowed; }

/* ── Confirmation ──────────────────────────────────────────────────────────── */
.si-auth__confirm {
  text-align: center;
  padding: 8px 0;
}

.si-auth__confirm-icon  { font-size: 2.5rem; margin-bottom: 12px; }
.si-auth__confirm-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--si-primary);
  margin-bottom: 8px;
}
.si-auth__confirm-text {
  font-size: 0.875rem;
  color: var(--si-text-2);
  line-height: 1.5;
  margin-bottom: 16px;
}

/* ── Spinner ───────────────────────────────────────────────────────────────── */
.si-auth__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: si-spin 0.7s linear infinite;
  flex-shrink: 0;
}

.si-auth__spinner--blue {
  border-color: rgba(3, 105, 161, 0.3);
  border-top-color: #0369A1;
}

@keyframes si-spin { to { transform: rotate(360deg); } }

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .si-auth {
    padding: 24px 16px 28px;
    border-radius: var(--si-r-md);
  }
  .si-auth__field-row { grid-template-columns: 1fr; }
}

/* ── Google OAuth ──────────────────────────────────────────────────────────── */
.si-auth__divider {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.75rem;
  color: var(--si-text-2);
  margin: 4px 0;
}
.si-auth__divider::before,
.si-auth__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--si-border);
}

.si-auth__google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 11px 20px;
  background: #FFFFFF;
  color: var(--si-text);
  border: 1.5px solid var(--si-border);
  border-radius: var(--si-r-md);
  font-family: var(--si-font);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  min-height: 48px;
}
.si-auth__google-btn:hover:not(:disabled) {
  background: #F8F8F8;
  border-color: #C0B8B0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.si-auth__google-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.si-auth__google-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>
