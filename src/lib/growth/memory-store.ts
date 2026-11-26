import { REFERRAL, STREAK_MILESTONES, normalizeReferralCode } from './config';
import type {
  ClaimResult, ConsumeResult, GrowthStats, GrowthStore, Kind, PaymentClaim, PaymentClaimInput, PaymentEntitlement, PaymentStatus, Profile, QuotaSource, Subscriber, TouchResult,
} from './types';

interface Row {
  uid: string;
  referralCode: string;
  credits: number;
  streak: number;
  longestStreak: number;
  lastActive: string | null;
  referredBy: string | null;
  referralStatus: 'pending' | 'completed' | null;
  referralCompletedAt: number | null;
}
interface Sub { email: string; source: string | null; token: string; createdAt: string; unsubscribedAt: string | null }
interface Pay { paymentId: string; orderId: string; uid: string; plan: 'pro' | 'premium'; period: 'month' | 'year'; amount: number; currency: string; periodStart: number; periodEnd: number; status: PaymentStatus; applied: boolean }
interface Snapshot { rows: Row[]; usage: Array<[string, number]>; subs: Sub[]; payments?: Pay[] }
const rank = (plan: string) => (plan === 'premium' ? 2 : plan === 'pro' ? 1 : 0);

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * In-memory twin of the SQL functions (same rules, same results). Used for local development and tests,
 * and as the reference the SQL is checked against. Optionally mirrored to a JSON file in development.
 */
export class MemoryStore implements GrowthStore {
  readonly kind = 'memory';
  private rows = new Map<string, Row>();
  private usage = new Map<string, number>();
  private subs: Sub[] = [];
  private payments: Pay[] = [];
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly persist?: { load: () => string | null; save: (json: string) => void }) {
    const raw = persist?.load();
    if (raw) {
      try {
        const snap = JSON.parse(raw) as Snapshot;
        snap.rows.forEach((r) => this.rows.set(r.uid, r));
        this.usage = new Map(snap.usage);
        this.subs = snap.subs;
        this.payments = snap.payments ?? [];
      } catch { /* start empty */ }
    }
  }

  private changed() {
    if (!this.persist || this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      const snap: Snapshot = { rows: [...this.rows.values()], usage: [...this.usage], subs: this.subs, payments: this.payments };
      try { this.persist!.save(JSON.stringify(snap)); } catch { /* best effort */ }
    }, 250);
  }

  private newCode(): string {
    for (;;) {
      let code = '';
      for (let i = 0; i < 8; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      if (![...this.rows.values()].some((r) => r.referralCode === code)) return code;
    }
  }

  private ensure(uid: string): Row {
    let row = this.rows.get(uid);
    if (!row) {
      row = { uid, referralCode: this.newCode(), credits: 0, streak: 0, longestStreak: 0, lastActive: null, referredBy: null, referralStatus: null, referralCompletedAt: null };
      this.rows.set(uid, row);
      this.changed();
    }
    return row;
  }

  private key(uid: string, kind: Kind, day: string) { return `${uid}|${kind}|${day}`; }

  async profile(uid: string): Promise<Profile> {
    const r = this.ensure(uid);
    const mine = [...this.rows.values()].filter((x) => x.referredBy === uid);
    return {
      uid: r.uid, referralCode: r.referralCode, credits: r.credits, streak: r.streak, longestStreak: r.longestStreak,
      lastActive: r.lastActive, referredBy: r.referredBy, referralStatus: r.referralStatus,
      referralsCompleted: mine.filter((x) => x.referralStatus === 'completed').length,
      referralsPending: mine.filter((x) => x.referralStatus === 'pending').length,
    };
  }

  async consume(uid: string, kind: Kind, limit: number, day: string): Promise<ConsumeResult> {
    const me = this.ensure(uid);
    const k = this.key(uid, kind, day);
    let source: QuotaSource | null = null;
    const current = this.usage.get(k) ?? 0;
    if (limit > 0 && current < limit) { this.usage.set(k, current + 1); source = 'daily'; }
    else if (me.credits > 0) { me.credits -= 1; source = 'credit'; }
    const used = this.usage.get(k) ?? 0;
    this.changed();
    if (!source) return { ok: false, used, limit, credits: me.credits };

    let referralCompleted = false;
    if (me.referralStatus === 'pending') {
      me.referralStatus = 'completed';
      me.referralCompletedAt = Date.now();
      referralCompleted = true;
      me.credits += REFERRAL.refereeBonus;
      const referrer = me.referredBy ? this.rows.get(me.referredBy) : undefined;
      if (referrer) {
        const monthStart = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1);
        const paid = [...this.rows.values()].filter((x) => x.referredBy === referrer.uid && x.referralStatus === 'completed' && x.uid !== uid && (x.referralCompletedAt ?? 0) >= monthStart).length;
        if (paid < REFERRAL.referrerMonthlyCap) referrer.credits += REFERRAL.referrerBonus;
      }
    }
    return { ok: true, source, used, limit, credits: me.credits, referralCompleted, referralBonus: referralCompleted ? REFERRAL.refereeBonus : 0 };
  }

  async refund(uid: string, kind: Kind, day: string, source: QuotaSource): Promise<void> {
    if (source === 'daily') {
      const k = this.key(uid, kind, day);
      if (this.usage.has(k)) this.usage.set(k, Math.max((this.usage.get(k) ?? 0) - 1, 0));
    } else if (source === 'credit') {
      this.ensure(uid).credits += 1;
    }
    this.changed();
  }

  async usageToday(uid: string, day: string): Promise<Record<Kind, number>> {
    return { chat: this.usage.get(this.key(uid, 'chat', day)) ?? 0, tool: this.usage.get(this.key(uid, 'tool', day)) ?? 0 };
  }

  private dayBefore(day: string): string { return new Date(Date.parse(`${day}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10); }

  async touch(uid: string, day: string): Promise<TouchResult> {
    const me = this.ensure(uid);
    if (me.lastActive && me.lastActive >= day) return { firstToday: false, streak: me.streak, longestStreak: me.longestStreak, awarded: 0 };
    const next = me.lastActive === this.dayBefore(day) ? me.streak + 1 : 1;
    me.lastActive = day;
    me.streak = next;
    me.longestStreak = Math.max(me.longestStreak, next);
    const awarded = STREAK_MILESTONES[next] ?? 0;
    me.credits += awarded;
    this.changed();
    return { firstToday: true, streak: next, longestStreak: me.longestStreak, awarded };
  }

  async claimReferral(uid: string, rawCode: string): Promise<ClaimResult> {
    const me = this.ensure(uid);
    if (me.referredBy) return { ok: false, reason: 'already_referred' };
    const code = normalizeReferralCode(rawCode);
    const referrer = code ? [...this.rows.values()].find((r) => r.referralCode === code) : undefined;
    if (!referrer) return { ok: false, reason: 'invalid_code' };
    if (referrer.uid === uid) return { ok: false, reason: 'self' };
    if ([...this.usage.keys()].some((k) => k.startsWith(`${uid}|`))) return { ok: false, reason: 'not_new' };
    me.referredBy = referrer.uid;
    me.referralStatus = 'pending';
    this.changed();
    return { ok: true };
  }

  async subscribe(email: string, source: string | null) {
    const clean = email.trim().toLowerCase();
    const existing = this.subs.find((s) => s.email.toLowerCase() === clean);
    if (existing) {
      if (existing.unsubscribedAt) { existing.unsubscribedAt = null; this.changed(); return { ok: true, already: false }; }
      return { ok: true, already: true };
    }
    this.subs.push({ email: clean, source: source ? source.slice(0, 60) : null, token: Math.random().toString(36).slice(2) + Date.now().toString(36), createdAt: new Date().toISOString(), unsubscribedAt: null });
    this.changed();
    return { ok: true, already: false };
  }

  async unsubscribe(token: string) {
    const sub = this.subs.find((s) => s.token === token && !s.unsubscribedAt);
    if (!sub) return false;
    sub.unsubscribedAt = new Date().toISOString();
    this.changed();
    return true;
  }

  async subscribers(): Promise<Subscriber[]> {
    return this.subs.filter((s) => !s.unsubscribedAt).map((s) => ({ email: s.email, source: s.source, createdAt: s.createdAt }));
  }

  async stats(day: string): Promise<GrowthStats> {
    const rows = [...this.rows.values()];
    const sum = (kind: Kind) => [...this.usage].filter(([k]) => k.endsWith(`|${kind}|${day}`)).reduce((a, [, n]) => a + n, 0);
    return {
      profiles: rows.length,
      referralsCompleted: rows.filter((r) => r.referralStatus === 'completed').length,
      referralsPending: rows.filter((r) => r.referralStatus === 'pending').length,
      subscribers: this.subs.filter((s) => !s.unsubscribedAt).length,
      activeToday: rows.filter((r) => r.lastActive === day).length,
      chatToday: sum('chat'),
      toolToday: sum('tool'),
      creditsOutstanding: rows.reduce((a, r) => a + r.credits, 0),
      payments: this.payments.filter((p) => p.status !== 'refunded').length,
      revenue: this.payments.filter((p) => p.status !== 'refunded').reduce<Record<string, number>>((acc, p) => { acc[p.currency] = (acc[p.currency] ?? 0) + p.amount; return acc; }, {}),
    };
  }

  // ── Payments (same rules as the SQL functions) ─────────────────────────

  private claimView(p: Pay, created: boolean): PaymentClaim {
    return { ok: true, created, applied: p.applied, status: p.status, uid: p.uid, plan: p.plan, period: p.period, periodStart: p.periodStart, periodEnd: p.periodEnd, reason: p.status === 'superseded' ? 'lower_plan_active' : null };
  }

  async claimPayment(i: PaymentClaimInput): Promise<PaymentClaim> {
    const existing = this.payments.find((p) => p.paymentId === i.paymentId);
    if (existing) return existing.uid === i.uid ? this.claimView(existing, false) : { ok: false, reason: 'uid_mismatch' };
    if (this.payments.some((p) => p.orderId === i.orderId)) return { ok: false, reason: 'order_already_paid' };

    const active = this.payments
      .filter((p) => p.uid === i.uid && p.status === 'paid' && p.periodStart <= i.now && p.periodEnd > i.now)
      .sort((a, b) => rank(b.plan) - rank(a.plan) || b.periodEnd - a.periodEnd)[0];

    let status: PaymentStatus = 'paid';
    let start = i.now;
    if (active && rank(active.plan) > rank(i.plan)) {
      status = 'superseded';
    } else if (active && active.plan === i.plan) {
      const chainEnd = Math.max(...this.payments.filter((p) => p.uid === i.uid && p.status === 'paid' && p.plan === i.plan && p.periodEnd > i.now).map((p) => p.periodEnd));
      start = Math.max(i.now, chainEnd);
    } else {
      for (const p of this.payments) if (p.uid === i.uid && p.status === 'paid' && p.periodEnd > i.now) p.status = 'superseded';
    }
    const row: Pay = { paymentId: i.paymentId, orderId: i.orderId, uid: i.uid, plan: i.plan, period: i.period, amount: i.amount, currency: i.currency, periodStart: start, periodEnd: start + i.duration, status, applied: false };
    this.payments.push(row);
    this.changed();
    return this.claimView(row, true);
  }

  async paymentEntitlement(uid: string, now: number): Promise<PaymentEntitlement | null> {
    const row = this.payments
      .filter((p) => p.uid === uid && p.status === 'paid' && p.periodStart <= now && p.periodEnd > now)
      .sort((a, b) => rank(b.plan) - rank(a.plan) || b.periodEnd - a.periodEnd)[0];
    if (!row) return null;
    const periodEnd = Math.max(...this.payments.filter((p) => p.uid === uid && p.status === 'paid' && p.plan === row.plan && p.periodEnd > now).map((p) => p.periodEnd));
    return { plan: row.plan, period: row.period, periodEnd, paymentId: row.paymentId };
  }

  async markPaymentApplied(paymentId: string): Promise<void> {
    const p = this.payments.find((x) => x.paymentId === paymentId);
    if (p) { p.applied = true; this.changed(); }
  }

  async refundPayment(paymentId: string) {
    const p = this.payments.find((x) => x.paymentId === paymentId);
    if (!p) return { ok: false, reason: 'unknown_payment' };
    const changed = p.status !== 'refunded';
    p.status = 'refunded';
    this.changed();
    return { ok: true, uid: p.uid, changed };
  }
}
