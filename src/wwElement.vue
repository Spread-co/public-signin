<template>
  <div class="si-wizard" :data-step="currentStep">

    <!-- ── PROGRESS BAR ────────────────────────────────────────────────── -->
    <div class="si-wizard__progress" role="navigation" aria-label="Sign up progress">
      <div
        v-for="(s, i) in STEPS"
        :key="s.key"
        class="si-wizard__progress-step"
        :class="{
          'si-wizard__progress-step--current':  currentStep === s.key,
          'si-wizard__progress-step--done':     stepIndex(s.key) < stepIndex(currentStep),
        }"
        :aria-current="currentStep === s.key ? 'step' : undefined"
      >
        <div class="si-wizard__step-dot">
          <svg v-if="stepIndex(s.key) < stepIndex(currentStep)" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 8 6.5 11.5 13 5"/></svg>
          <span v-else aria-hidden="true">{{ i + 1 }}</span>
        </div>
        <span class="si-wizard__step-label">{{ s.label }}</span>
        <div class="si-wizard__step-track" v-if="i < STEPS.length - 1" aria-hidden="true">
          <div class="si-wizard__step-fill" :class="{ 'si-wizard__step-fill--done': stepIndex(s.key) < stepIndex(currentStep) }"></div>
        </div>
      </div>
    </div>

    <!-- ── CARD WRAPPER ────────────────────────────────────────────────── -->
    <div class="si-wizard__card">

      <!-- ── STEP 1: AUTH ──────────────────────────────────────────────── -->
      <div v-if="currentStep === 'auth'" class="si-wizard__step si-step-auth">
        <h1 class="si-wizard__heading">{{ authMode === 'signin' ? content.headlineSignIn || 'Welcome back' : content.headlineSignUp || 'Create your account' }}</h1>
        <p class="si-wizard__sub">{{ authMode === 'signin' ? 'Sign in to your Spread.co account.' : 'Join thousands of households getting farm-fresh produce delivered.' }}</p>

        <!-- Mode tabs -->
        <div class="si-auth__tabs" role="tablist">
          <button class="si-auth__tab" :class="{ 'si-auth__tab--active': authMode === 'signup' }" @click="authMode = 'signup'" role="tab" :aria-selected="authMode === 'signup'">Create account</button>
          <button class="si-auth__tab" :class="{ 'si-auth__tab--active': authMode === 'signin' }" @click="authMode = 'signin'" role="tab" :aria-selected="authMode === 'signin'">Sign in</button>
        </div>

        <form class="si-wizard__form" @submit.prevent="submitAuth" novalidate>
          <!-- Name fields (sign-up only) -->
          <div v-if="authMode === 'signup'" class="si-wizard__field-row">
            <label class="si-wizard__field">
              <span class="si-wizard__label">First name</span>
              <input class="si-wizard__input" type="text" v-model="authForm.firstName" autocomplete="given-name" placeholder="First name" required />
            </label>
            <label class="si-wizard__field">
              <span class="si-wizard__label">Last name</span>
              <input class="si-wizard__input" type="text" v-model="authForm.lastName" autocomplete="family-name" placeholder="Last name" required />
            </label>
          </div>

          <label class="si-wizard__field">
            <span class="si-wizard__label">Email address</span>
            <input class="si-wizard__input" type="email" v-model="authForm.email" autocomplete="email" placeholder="you@example.com" required />
          </label>

          <label class="si-wizard__field" v-if="!useMagicLink">
            <span class="si-wizard__label">Password</span>
            <div class="si-wizard__input-wrap">
              <input
                class="si-wizard__input"
                :type="showPassword ? 'text' : 'password'"
                v-model="authForm.password"
                autocomplete="current-password"
                placeholder="Enter password"
                required
              />
              <button type="button" class="si-wizard__pw-toggle" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
                <svg v-if="showPassword" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <a v-if="authMode === 'signin'" class="si-wizard__forgot" href="#" @click.prevent="forgotPassword">Forgot password?</a>
          </label>

          <!-- Magic link toggle -->
          <div v-if="content.showMagicLinkOption !== false" class="si-auth__magic-wrap">
            <button type="button" class="si-auth__magic-toggle" @click="useMagicLink = !useMagicLink">
              {{ useMagicLink ? 'Use password instead' : 'Send a magic link instead' }}
            </button>
          </div>

          <p v-if="authError" class="si-wizard__error" role="alert">{{ authError }}</p>
          <p v-if="magicLinkSent" class="si-wizard__success" role="status">Check your inbox — magic link sent!</p>

          <button class="si-wizard__submit" type="submit" :disabled="authLoading">
            <span v-if="authLoading" class="si-wizard__spinner" aria-hidden="true"></span>
            <span v-else>{{ useMagicLink ? 'Send magic link' : authMode === 'signin' ? 'Sign in' : 'Create account' }}</span>
          </button>
        </form>
      </div>

      <!-- ── STEP 2: ADDRESS ───────────────────────────────────────────── -->
      <div v-else-if="currentStep === 'address'" class="si-wizard__step si-step-address">
        <h1 class="si-wizard__heading">{{ content.headlineAddress || 'Your delivery address' }}</h1>
        <p class="si-wizard__sub">Enter your address so we can confirm delivery availability.</p>

        <form class="si-wizard__form" @submit.prevent="submitAddress" novalidate>
          <label class="si-wizard__field">
            <span class="si-wizard__label">Street address</span>
            <input class="si-wizard__input" type="text" v-model="addressForm.street" autocomplete="street-address" placeholder="e.g. 12 Main Street" required />
          </label>

          <div class="si-wizard__field-row">
            <label class="si-wizard__field">
              <span class="si-wizard__label">Suburb</span>
              <input class="si-wizard__input" type="text" v-model="addressForm.suburb" autocomplete="address-level2" placeholder="Suburb" required />
            </label>
            <label class="si-wizard__field">
              <span class="si-wizard__label">State</span>
              <select class="si-wizard__input si-wizard__select" v-model="addressForm.state" autocomplete="address-level1" required>
                <option value="">Select state</option>
                <option v-for="st in AUS_STATES" :key="st" :value="st">{{ st }}</option>
              </select>
            </label>
          </div>

          <label class="si-wizard__field">
            <span class="si-wizard__label">Postcode</span>
            <input
              class="si-wizard__input si-wizard__input--postcode"
              type="text"
              inputmode="numeric"
              maxlength="4"
              v-model="addressForm.postcode"
              autocomplete="postal-code"
              placeholder="e.g. 3000"
              @blur="preCheckCapacity"
              required
            />
            <span v-if="postcodeChecking" class="si-wizard__field-hint">Checking your area…</span>
          </label>

          <p v-if="addressError" class="si-wizard__error" role="alert">{{ addressError }}</p>

          <button class="si-wizard__submit" type="submit" :disabled="addressLoading">
            <span v-if="addressLoading" class="si-wizard__spinner" aria-hidden="true"></span>
            <span v-else>Check availability</span>
          </button>
        </form>
      </div>

      <!-- ── STEP 3: CAPACITY ──────────────────────────────────────────── -->
      <div v-else-if="currentStep === 'capacity'" class="si-wizard__step si-step-capacity">
        <h1 class="si-wizard__heading">{{ content.headlineCapacity || 'Checking your area' }}</h1>

        <!-- Available -->
        <template v-if="capacityResult === 'available'">
          <div class="si-capacity__badge si-capacity__badge--available">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Spots available in your area
          </div>
          <p class="si-wizard__sub">We deliver to <strong>{{ addressForm.suburb }}</strong>. Continue to choose your membership plan.</p>
          <button class="si-wizard__submit" @click="goTo('plan')">Continue to plans</button>
        </template>

        <!-- Limited -->
        <template v-else-if="capacityResult === 'limited'">
          <div class="si-capacity__badge si-capacity__badge--limited">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Limited spots — act fast
          </div>
          <p class="si-wizard__sub">A few spots remain in your area. Continue before they fill up.</p>
          <button class="si-wizard__submit" @click="goTo('plan')">Continue to plans</button>
        </template>

        <!-- Waitlist -->
        <template v-else-if="capacityResult === 'waitlist'">
          <div class="si-capacity__badge si-capacity__badge--waitlist">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            No spots available yet
          </div>
          <p class="si-wizard__sub">Your area is at capacity right now. Join the waitlist and we'll notify you when a spot opens.</p>
          <button class="si-wizard__submit si-wizard__submit--outline" @click="joinWaitlist" :disabled="waitlistLoading">
            <span v-if="waitlistLoading" class="si-wizard__spinner" aria-hidden="true"></span>
            <span v-else>Join the waitlist</span>
          </button>
          <p v-if="waitlistSuccess" class="si-wizard__success" role="status">You're on the waitlist! We'll email you at {{ authForm.email }}.</p>
        </template>

        <!-- Loading -->
        <template v-else>
          <div class="si-capacity__loading">
            <span class="si-wizard__spinner si-wizard__spinner--lg" aria-hidden="true"></span>
            <p>Checking delivery availability…</p>
          </div>
        </template>

        <p v-if="capacityError" class="si-wizard__error" role="alert">{{ capacityError }}</p>
        <button class="si-wizard__back-link" type="button" @click="goTo('address')">← Change address</button>
      </div>

      <!-- ── STEP 4: PLAN SELECTION ─────────────────────────────────────── -->
      <div v-else-if="currentStep === 'plan'" class="si-wizard__step si-step-plan">
        <h1 class="si-wizard__heading">{{ content.headlinePlan || 'Choose your membership' }}</h1>
        <p class="si-wizard__sub">All plans include free delivery on your regular box.</p>

        <div v-if="plansLoading" class="si-capacity__loading">
          <span class="si-wizard__spinner si-wizard__spinner--lg" aria-hidden="true"></span>
          <p>Loading plans…</p>
        </div>

        <p v-else-if="plansError" class="si-wizard__error" role="alert">{{ plansError }}</p>

        <div v-else class="si-plans__grid" role="radiogroup" aria-label="Membership plans">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="si-plan-card"
            :class="{
              'si-plan-card--selected': selectedPlanId === plan.id,
              'si-plan-card--popular':  plan.is_featured,
            }"
            @click="selectedPlanId = plan.id"
            role="radio"
            :aria-checked="selectedPlanId === plan.id"
            tabindex="0"
            @keydown.enter.space.prevent="selectedPlanId = plan.id"
          >
            <div class="si-plan-card__badge" v-if="plan.is_featured">Most popular</div>
            <div class="si-plan-card__header">
              <h3 class="si-plan-card__name">{{ plan.name }}</h3>
              <div class="si-plan-card__price">
                <span class="si-plan-card__amount">${{ formatCents(plan.amount_cents) }}</span>
                <span class="si-plan-card__period">/{{ plan.interval || 'month' }}</span>
              </div>
            </div>
            <p class="si-plan-card__desc" v-if="plan.description">{{ plan.description }}</p>
            <ul class="si-plan-card__features" v-if="plan.features && plan.features.length">
              <li v-for="(f, i) in plan.features" :key="i">
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="#2E321E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 8 6.5 11.5 13 5"/></svg>
                {{ f }}
              </li>
            </ul>
            <div class="si-plan-card__check" aria-hidden="true">
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 10 8 14 16 6"/></svg>
            </div>
          </div>
        </div>

        <button
          class="si-wizard__submit"
          :disabled="!selectedPlanId || plansLoading"
          @click="proceedToCheckout"
        >
          <span v-if="checkoutLoading" class="si-wizard__spinner" aria-hidden="true"></span>
          <span v-else>Continue to checkout</span>
        </button>

        <button class="si-wizard__back-link" type="button" @click="goTo('capacity')">← Back</button>
      </div>

      <!-- ── STEP 5: CHECKOUT ──────────────────────────────────────────── -->
      <div v-else-if="currentStep === 'checkout'" class="si-wizard__step si-step-checkout">
        <h1 class="si-wizard__heading">{{ content.headlineCheckout || "You're almost in!" }}</h1>
        <p class="si-wizard__sub">We're preparing your checkout securely with Stripe.</p>

        <div class="si-checkout__summary" v-if="selectedPlan">
          <div class="si-checkout__row">
            <span>Plan</span>
            <strong>{{ selectedPlan.name }}</strong>
          </div>
          <div class="si-checkout__row">
            <span>Price</span>
            <strong>${{ formatCents(selectedPlan.amount_cents) }}/{{ selectedPlan.interval || 'month' }}</strong>
          </div>
          <div class="si-checkout__row" v-if="addressForm.suburb">
            <span>Delivery area</span>
            <strong>{{ addressForm.suburb }}, {{ addressForm.state }} {{ addressForm.postcode }}</strong>
          </div>
        </div>

        <div v-if="checkoutLoading" class="si-capacity__loading">
          <span class="si-wizard__spinner si-wizard__spinner--lg" aria-hidden="true"></span>
          <p>Redirecting to Stripe…</p>
        </div>

        <p v-if="checkoutError" class="si-wizard__error" role="alert">{{ checkoutError }}</p>

        <button class="si-wizard__submit" @click="proceedToCheckout" :disabled="checkoutLoading">
          <span v-if="checkoutLoading" class="si-wizard__spinner" aria-hidden="true"></span>
          <span v-else>Pay with Stripe</span>
        </button>

        <button class="si-wizard__back-link" type="button" @click="goTo('plan')">← Choose a different plan</button>
      </div>

    </div><!-- /card -->
  </div><!-- /wizard -->
</template>

<script>
const AUS_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];

const STEPS = [
  { key: 'auth',     label: 'Account'  },
  { key: 'address',  label: 'Address'  },
  { key: 'capacity', label: 'Coverage' },
  { key: 'plan',     label: 'Plan'     },
  { key: 'checkout', label: 'Checkout' },
];

export default {
  props: {
    /* wwEditor:start */
    wwEditorState:  { type: Object, required: true },
    /* wwEditor:end */
    content:        { type: Object, required: true },
    wwFrontState:   { type: Object, required: true },
    wwElementState: { type: Object, required: true },
  },

  emits: ['trigger-event'],

  data() {
    return {
      AUS_STATES,
      STEPS,

      currentStep: 'auth',

      /* Auth step */
      authMode:     'signup',
      useMagicLink: false,
      showPassword: false,
      magicLinkSent: false,
      authLoading:  false,
      authError:    '',
      authForm: {
        firstName: '',
        lastName:  '',
        email:     '',
        password:  '',
      },
      authToken: '',
      userId:    '',

      /* Address step */
      addressLoading:   false,
      addressError:     '',
      postcodeChecking: false,
      addressForm: {
        street:   '',
        suburb:   '',
        state:    '',
        postcode: '',
      },

      /* Capacity step */
      capacityResult: null,  // 'available' | 'limited' | 'waitlist' | null
      capacityError:  '',
      capacityRegionId: '',
      waitlistLoading: false,
      waitlistSuccess: false,

      /* Plan step */
      plans:          [],
      plansLoading:   false,
      plansError:     '',
      selectedPlanId: '',

      /* Checkout step */
      checkoutLoading: false,
      checkoutError:   '',
    };
  },

  computed: {
    selectedPlan() {
      return this.plans.find(p => p.id === this.selectedPlanId) || null;
    },
  },

  methods: {
    /* ── Navigation ───────────────────────────────────────────────────── */
    goTo(step) {
      this.currentStep = step;
      this.$emit('trigger-event', { name: 'signin:step-changed', event: { step } }); // utility event
    },

    stepIndex(key) {
      return STEPS.findIndex(s => s.key === key);
    },

    /* ── Step 1: Auth ─────────────────────────────────────────────────── */
    async submitAuth() {
      this.authError = '';
      this.magicLinkSent = false;

      if (!this.authForm.email) { this.authError = 'Email is required.'; return; }
      if (this.authMode === 'signup' && !this.useMagicLink) {
        if (!this.authForm.firstName) { this.authError = 'First name is required.'; return; }
        if ((this.authForm.password || '').length < 8) { this.authError = 'Password must be at least 8 characters.'; return; }
      }
      if (!this.useMagicLink && !this.authForm.password) { this.authError = 'Password is required.'; return; }

      this.authLoading = true;
      try {
        const url = this.content.supabaseUrl;
        const key = this.content.supabaseAnonKey;
        if (!url || !key) throw new Error('Supabase credentials not configured.');

        if (this.useMagicLink) {
          const res = await fetch(`${url}/auth/v1/otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: key },
            body: JSON.stringify({ email: this.authForm.email }),
          });
          if (!res.ok) { const d = await res.json(); throw new Error(d.error_description || d.msg || 'Failed to send magic link.'); }
          this.magicLinkSent = true;
          return;
        }

        let endpoint, body;
        if (this.authMode === 'signup') {
          endpoint = `${url}/auth/v1/signup`;
          body = {
            email:    this.authForm.email,
            password: this.authForm.password,
            data: {
              first_name: this.authForm.firstName,
              last_name:  this.authForm.lastName,
            },
          };
        } else {
          endpoint = `${url}/auth/v1/token?grant_type=password`;
          body = { email: this.authForm.email, password: this.authForm.password };
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: key },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error_description || data.msg || data.message || 'Authentication failed.');

        this.authToken = data.access_token || '';
        this.userId    = data.user?.id || '';
        const isNew    = this.authMode === 'signup';

        this.$emit('trigger-event', {
          name:  'auth:signin-success',
          event: { userId: this.userId, email: this.authForm.email, isNewUser: isNew },
        });

        if (this.content.requireAddressBeforePlan !== false) {
          this.goTo('address');
        } else {
          this._loadPlans();
          this.goTo('plan');
        }
      } catch (e) {
        this.authError = e.message || 'Something went wrong.';
        this.$emit('trigger-event', { name: 'auth:error', event: { step: 'auth', message: this.authError } });
      } finally {
        this.authLoading = false;
      }
    },

    async forgotPassword() {
      if (!this.authForm.email) { this.authError = 'Enter your email first.'; return; }
      try {
        const url = this.content.supabaseUrl;
        const key = this.content.supabaseAnonKey;
        await fetch(`${url}/auth/v1/recover`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: key },
          body: JSON.stringify({ email: this.authForm.email }),
        });
        this.authError = '';
        this.magicLinkSent = true;
        this.$emit('trigger-event', { name: 'auth:forgot-password-sent', event: { email: this.authForm.email } });
      } catch (_) {}
    },

    /* ── Step 2: Address ─────────────────────────────────────────────── */
    async preCheckCapacity() {
      const pc = (this.addressForm.postcode || '').trim();
      if (pc.length !== 4) return;
      this.postcodeChecking = true;
      await this._doCapacityCheck();
      this.postcodeChecking = false;
    },

    async submitAddress() {
      this.addressError = '';
      if (!this.addressForm.street)   { this.addressError = 'Street address is required.'; return; }
      if (!this.addressForm.suburb)   { this.addressError = 'Suburb is required.'; return; }
      if (!this.addressForm.state)    { this.addressError = 'State is required.'; return; }
      if (!this.addressForm.postcode) { this.addressError = 'Postcode is required.'; return; }
      if ((this.addressForm.postcode).length !== 4) { this.addressError = 'Enter a valid 4-digit postcode.'; return; }

      this.addressLoading = true;
      await this._doCapacityCheck();
      this.addressLoading = false;
      this.goTo('capacity');
    },

    async _doCapacityCheck() {
      this.capacityResult  = null;
      this.capacityError   = '';
      this.capacityRegionId = '';
      try {
        const url = this.content.supabaseUrl;
        const key = this.content.supabaseAnonKey;
        if (!url || !key) return;
        const res = await fetch(`${url}/rest/v1/rpc/check_capacity`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey:         key,
            Authorization:  this.authToken ? `Bearer ${this.authToken}` : `Bearer ${key}`,
          },
          body: JSON.stringify({ p_postcode: this.addressForm.postcode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Could not check capacity.');
        // Expected: { status: 'available'|'limited'|'waitlist', region_id: '...' }
        this.capacityResult   = data.status   || 'waitlist';
        this.capacityRegionId = data.region_id || '';
      } catch (e) {
        this.capacityError  = e.message || 'Unable to check your area.';
        this.capacityResult = 'waitlist';
      }
    },

    /* ── Step 3: Capacity actions ────────────────────────────────────── */
    async joinWaitlist() {
      this.waitlistLoading = true;
      this.waitlistSuccess = false;
      try {
        const url = this.content.supabaseUrl;
        const key = this.content.supabaseAnonKey;
        const res = await fetch(`${url}/rest/v1/waitlist_entries`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey:         key,
            Authorization:  this.authToken ? `Bearer ${this.authToken}` : `Bearer ${key}`,
            Prefer:         'return=minimal',
          },
          body: JSON.stringify({
            email:     this.authForm.email,
            postcode:  this.addressForm.postcode,
            region_id: this.capacityRegionId || null,
            user_id:   this.userId || null,
          }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Waitlist join failed.'); }
        this.waitlistSuccess = true;
        this.$emit('trigger-event', {
          name:  'signup:capacity-blocked',
          event: { email: this.authForm.email, postcode: this.addressForm.postcode, regionId: this.capacityRegionId },
        });
        try {
          const win = typeof wwLib !== 'undefined' ? wwLib.getFrontWindow() : window;
          const redir = this.content.waitlistRedirectUrl;
          if (redir) win.location.href = redir;
        } catch (_) {}
      } catch (e) {
        this.capacityError = e.message;
      } finally {
        this.waitlistLoading = false;
      }
    },

    /* ── Step 4: Plans ───────────────────────────────────────────────── */
    async _loadPlans() {
      this.plansLoading = true;
      this.plansError   = '';
      try {
        const url = this.content.supabaseUrl;
        const key = this.content.supabaseAnonKey;
        if (!url || !key) throw new Error('Supabase credentials not configured.');
        const res = await fetch(
          `${url}/rest/v1/membership_plans?select=id,name,description,amount_cents,interval,stripe_price_id,is_featured,features&is_active=eq.true&order=sort_order.asc`,
          { headers: { apikey: key, Authorization: `Bearer ${key}` } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Could not load plans.');
        this.plans = (data || []).map(p => ({
          ...p,
          features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || []),
        }));
        // Auto-select featured plan
        const featured = this.plans.find(p => p.is_featured);
        if (featured && !this.selectedPlanId) this.selectedPlanId = featured.id;
      } catch (e) {
        this.plansError = e.message || 'Error loading plans.';
      } finally {
        this.plansLoading = false;
      }
    },

    /* ── Step 5: Checkout ────────────────────────────────────────────── */
    async proceedToCheckout() {
      if (!this.selectedPlanId) return;
      if (this.currentStep !== 'checkout') { this.goTo('checkout'); }

      this.checkoutLoading = true;
      this.checkoutError   = '';
      try {
        const plan = this.selectedPlan;
        if (!plan) throw new Error('No plan selected.');
        const efUrl = this.content.checkoutEdgeFunctionUrl;
        if (!efUrl) throw new Error('Checkout function URL not configured.');

        this.$emit('trigger-event', {
          name:  'signup:plan-selected',
          event: { planId: plan.id, planName: plan.name, priceId: plan.stripe_price_id, amount: plan.amount_cents },
        });

        const res = await fetch(efUrl, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${this.authToken}`,
          },
          body: JSON.stringify({
            price_id:    plan.stripe_price_id,
            user_id:     this.userId,
            email:       this.authForm.email,
            address: {
              street:   this.addressForm.street,
              suburb:   this.addressForm.suburb,
              state:    this.addressForm.state,
              postcode: this.addressForm.postcode,
            },
            success_url: (this.content.successRedirectUrl || '/dashboard') + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url:  (typeof window !== 'undefined' ? window.location.href : '/'),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || 'Checkout creation failed.');

        const sessionUrl = data.url || data.checkout_url;
        if (!sessionUrl) throw new Error('No checkout URL returned.');

        this.$emit('trigger-event', {
          name:  'checkout:redirecting',
          event: { sessionUrl, planId: plan.id },
        });

        try {
          const win = typeof wwLib !== 'undefined' ? wwLib.getFrontWindow() : window;
          win.location.href = sessionUrl;
        } catch (_) {}
      } catch (e) {
        this.checkoutError = e.message || 'Checkout setup failed.';
        this.$emit('trigger-event', { name: 'auth:error', event: { step: 'checkout', message: this.checkoutError } });
      } finally {
        this.checkoutLoading = false;
      }
    },

    /* ── Helpers ─────────────────────────────────────────────────────── */
    formatCents(cents) {
      if (cents == null) return '—';
      const n = cents / 100;
      return n % 1 === 0 ? n.toString() : n.toFixed(2);
    },
  },

  watch: {
    currentStep(step) {
      if (step === 'plan' && !this.plans.length) this._loadPlans();
    },
  },
};
</script>

<style scoped>
/* ── Design tokens ───────────────────────────────────────────────────────── */
.si-wizard {
  --si-primary:  #4B162D;
  --si-accent:   #CE6632;
  --si-accent-h: #B85A2B;
  --si-gold:     #BEAD38;
  --si-green:    #2E321E;
  --si-beige:    #E6D8CA;
  --si-text:     #1A1A1A;
  --si-text-2:   #4B5563;
  --si-surface:  #FFFFFF;
  --si-bg:       #FBFAF8;
  --si-border:   #EDE4D8;
  --si-r-sm:     6px;
  --si-r-md:     12px;
  --si-r-lg:     20px;
  --si-r-pill:   9999px;
  --si-font:     'Work Sans', ui-sans-serif, system-ui, sans-serif;

  font-family: var(--si-font);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px 64px;
  background: var(--si-bg);
  color: var(--si-text);
}

.si-wizard *, .si-wizard *::before, .si-wizard *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Progress ────────────────────────────────────────────────────────────── */
.si-wizard__progress {
  display: flex;
  align-items: flex-start;
  width: 100%;
  max-width: 640px;
  margin-bottom: 32px;
}

.si-wizard__progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.si-wizard__step-dot {
  width: 32px;
  height: 32px;
  border-radius: var(--si-r-pill);
  border: 2px solid var(--si-border);
  background: var(--si-surface);
  color: var(--si-text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  position: relative;
  z-index: 1;
}

.si-wizard__progress-step--current .si-wizard__step-dot {
  background: var(--si-primary);
  border-color: var(--si-primary);
  color: #FFFFFF;
}

.si-wizard__progress-step--done .si-wizard__step-dot {
  background: var(--si-green);
  border-color: var(--si-green);
  color: #FFFFFF;
}

.si-wizard__step-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--si-text-2);
  margin-top: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.si-wizard__progress-step--current .si-wizard__step-label,
.si-wizard__progress-step--done .si-wizard__step-label {
  color: var(--si-primary);
}

/* Track line between dots */
.si-wizard__step-track {
  position: absolute;
  top: 16px;
  left: calc(50% + 16px);
  right: calc(-50% + 16px);
  height: 2px;
  background: var(--si-border);
  z-index: 0;
}

.si-wizard__step-fill {
  height: 100%;
  width: 0;
  background: var(--si-green);
  transition: width 0.3s;
}

.si-wizard__step-fill--done { width: 100%; }

/* ── Card ────────────────────────────────────────────────────────────────── */
.si-wizard__card {
  width: 100%;
  max-width: 640px;
  background: var(--si-surface);
  border-radius: var(--si-r-lg);
  border: 1px solid var(--si-border);
  padding: 36px 28px;
  box-shadow: 0 4px 24px rgba(75,22,45,0.06);
}

/* ── Headings ────────────────────────────────────────────────────────────── */
.si-wizard__heading {
  font-size: 1.625rem;
  font-weight: 800;
  color: var(--si-primary);
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.si-wizard__sub {
  font-size: 0.9375rem;
  color: var(--si-text-2);
  line-height: 1.6;
  margin-bottom: 28px;
}

/* ── Form ────────────────────────────────────────────────────────────────── */
.si-wizard__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.si-wizard__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.si-wizard__field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.si-wizard__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--si-text);
}

.si-wizard__input {
  padding: 11px 13px;
  border: 1.5px solid var(--si-border);
  border-radius: var(--si-r-sm);
  font-family: var(--si-font);
  font-size: 0.9375rem;
  color: var(--si-text);
  background: var(--si-surface);
  transition: border-color 0.15s;
  width: 100%;
}

.si-wizard__input:focus {
  outline: none;
  border-color: var(--si-primary);
  box-shadow: 0 0 0 3px rgba(75,22,45,0.1);
}

.si-wizard__select { cursor: pointer; }

.si-wizard__input--postcode { width: 120px; }

.si-wizard__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.si-wizard__input-wrap .si-wizard__input { padding-right: 40px; }

.si-wizard__pw-toggle {
  position: absolute;
  right: 11px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--si-text-2);
  padding: 0;
  display: flex;
}

.si-wizard__forgot {
  font-size: 0.8125rem;
  color: var(--si-accent);
  text-decoration: none;
  align-self: flex-end;
  margin-top: 2px;
}

.si-wizard__forgot:hover { text-decoration: underline; }

.si-wizard__field-hint {
  font-size: 0.8125rem;
  color: var(--si-text-2);
}

/* ── Auth mode tabs ──────────────────────────────────────────────────────── */
.si-auth__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #F3EDE7;
  border-radius: var(--si-r-sm);
  padding: 4px;
  margin-bottom: 24px;
}

.si-auth__tab {
  background: none;
  border: none;
  font-family: var(--si-font);
  font-size: 0.9375rem;
  font-weight: 600;
  padding: 9px 0;
  border-radius: calc(var(--si-r-sm) - 2px);
  cursor: pointer;
  color: var(--si-text-2);
  transition: background 0.15s, color 0.15s;
}

.si-auth__tab--active {
  background: var(--si-surface);
  color: var(--si-primary);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

/* ── Magic link ──────────────────────────────────────────────────────────── */
.si-auth__magic-wrap { display: flex; justify-content: center; }

.si-auth__magic-toggle {
  background: none;
  border: none;
  font-family: var(--si-font);
  font-size: 0.875rem;
  color: var(--si-accent);
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

/* ── Submit button ───────────────────────────────────────────────────────── */
.si-wizard__submit {
  width: 100%;
  padding: 14px;
  background: var(--si-accent);
  color: #FFFFFF;
  border: none;
  border-radius: var(--si-r-pill);
  font-family: var(--si-font);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s, transform 0.1s;
  margin-top: 8px;
}

.si-wizard__submit:hover:not(:disabled) {
  background: var(--si-accent-h);
  transform: translateY(-1px);
}

.si-wizard__submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.si-wizard__submit--outline {
  background: transparent;
  border: 2px solid var(--si-primary);
  color: var(--si-primary);
}

.si-wizard__submit--outline:hover:not(:disabled) {
  background: rgba(75,22,45,0.05);
  transform: translateY(-1px);
}

/* ── Feedback ────────────────────────────────────────────────────────────── */
.si-wizard__error {
  font-size: 0.875rem;
  color: #DC2626;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  padding: 10px 14px;
  border-radius: var(--si-r-sm);
}

.si-wizard__success {
  font-size: 0.875rem;
  color: #166534;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  padding: 10px 14px;
  border-radius: var(--si-r-sm);
}

/* ── Capacity ────────────────────────────────────────────────────────────── */
.si-capacity__badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  padding: 12px 16px;
  border-radius: var(--si-r-sm);
  margin-bottom: 16px;
}

.si-capacity__badge--available { background: #ECFDF5; color: #166534; border: 1px solid #BBF7D0; }
.si-capacity__badge--limited   { background: #FFFBEB; color: #854D0E; border: 1px solid #FDE68A; }
.si-capacity__badge--waitlist  { background: #F9FAFB; color: #374151; border: 1px solid #E5E7EB; }

.si-capacity__loading {
  text-align: center;
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--si-text-2);
}

/* ── Plans ───────────────────────────────────────────────────────────────── */
.si-plans__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-bottom: 20px;
}

@media (min-width: 480px) {
  .si-plans__grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
}

.si-plan-card {
  border: 1.5px solid var(--si-border);
  border-radius: var(--si-r-md);
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  position: relative;
  user-select: none;
}

.si-plan-card:hover { border-color: var(--si-accent); }

.si-plan-card--selected {
  border-color: var(--si-primary);
  box-shadow: 0 0 0 3px rgba(75,22,45,0.12);
}

.si-plan-card--popular { border-color: var(--si-accent); }

.si-plan-card__badge {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--si-accent);
  color: #FFFFFF;
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: var(--si-r-pill);
  white-space: nowrap;
}

.si-plan-card__header { margin-bottom: 10px; }

.si-plan-card__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--si-primary);
  margin-bottom: 4px;
}

.si-plan-card__price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.si-plan-card__amount {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--si-text);
}

.si-plan-card__period {
  font-size: 0.875rem;
  color: var(--si-text-2);
}

.si-plan-card__desc {
  font-size: 0.875rem;
  color: var(--si-text-2);
  margin-bottom: 10px;
  line-height: 1.5;
}

.si-plan-card__features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.si-plan-card__features li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--si-text-2);
}

.si-plan-card__check {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 22px;
  height: 22px;
  border-radius: var(--si-r-pill);
  border: 1.5px solid var(--si-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.si-plan-card--selected .si-plan-card__check {
  background: var(--si-primary);
  border-color: var(--si-primary);
  color: #FFFFFF;
}

/* ── Checkout summary ────────────────────────────────────────────────────── */
.si-checkout__summary {
  background: var(--si-bg);
  border: 1px solid var(--si-border);
  border-radius: var(--si-r-md);
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.si-checkout__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
  color: var(--si-text-2);
}

.si-checkout__row strong { color: var(--si-text); }

/* ── Back link ───────────────────────────────────────────────────────────── */
.si-wizard__back-link {
  background: none;
  border: none;
  font-family: var(--si-font);
  font-size: 0.875rem;
  color: var(--si-text-2);
  cursor: pointer;
  padding: 8px 0 0;
  display: block;
  width: 100%;
  text-align: center;
  transition: color 0.15s;
}

.si-wizard__back-link:hover { color: var(--si-primary); }

/* ── Spinner ─────────────────────────────────────────────────────────────── */
@keyframes si-spin { to { transform: rotate(360deg); } }

.si-wizard__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: si-spin 0.6s linear infinite;
}

.si-wizard__spinner--lg {
  width: 32px;
  height: 32px;
  border-width: 3px;
  border-color: rgba(75,22,45,0.15);
  border-top-color: var(--si-primary);
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 479px) {
  .si-wizard__card { padding: 24px 18px; }
  .si-wizard__field-row { grid-template-columns: 1fr; }
  .si-wizard__heading { font-size: 1.375rem; }
  .si-wizard__step-label { display: none; }
}
</style>
