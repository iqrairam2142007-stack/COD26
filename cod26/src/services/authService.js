import insforge, { unwrap } from "../lib/insforge";

/** 'test' until you explicitly approve live Razorpay charges. */
const PAY_ENV = process.env.REACT_APP_PAYMENT_ENV || "test";

/** Fallback only - the real price is read from public.pricing. */
const FEE_FALLBACK = { amount_minor: 50000, currency: "INR", access_months: 6 };

export function formatFee(fee) {
  const symbol = fee.currency === "INR" ? "₹" : fee.currency + " ";
  return symbol + Math.round(fee.amount_minor / 100);
}

/** Razorpay Checkout.js is loaded on demand rather than on every page view. */
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Could not load Razorpay Checkout.")));
      return;
    }
    const s = document.createElement("script");
    s.id = "razorpay-checkout-js";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Razorpay Checkout. Check your connection."));
    document.body.appendChild(s);
  });
}

const authService = {
  /** The class fee, straight from the database so UI and server never disagree. */
  async classFee() {
    try {
      const rows = unwrap(
        await insforge.database.from("pricing").select("*").eq("id", "class_fee").limit(1)
      );
      return rows?.[0] ?? FEE_FALLBACK;
    } catch {
      return FEE_FALLBACK;
    }
  },

  /** Free access via a school-issued code. Redemption happens server-side. */
  async verifySchoolCode({ code, name, email, phone, class: klass, school, studentId, password }) {
    const signUp = unwrap(await insforge.auth.signUp({ email, password, name }));
    const data = unwrap(
      await insforge.functions.invoke("school-code", {
        body: { code, name, phone, class: klass, school, studentId },
      })
    );
    return { user: data.profile, requireEmailVerification: signUp?.requireEmailVerification };
  },

  async register({ name, email, password, phone, class: klass, school, studentId }) {
    const data = unwrap(await insforge.auth.signUp({ email, password, name }));
    // The profile row is created by a DB trigger; fill in the extra fields.
    if (data?.accessToken) {
      await insforge.database
        .from("profiles")
        .update({ phone, class_level: klass, school, student_id: studentId })
        .eq("id", data.user.id);
    }
    return data;
  },

  async login({ email, password }) {
    return unwrap(await insforge.auth.signInWithPassword({ email, password }));
  },

  async logout() {
    await insforge.auth.signOut();
  },

  async currentUser() {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error) return null;
    return data?.user ?? null;
  },

  async profile(userId) {
    const rows = unwrap(
      await insforge.database.from("profiles").select("*").eq("id", userId).limit(1)
    );
    return rows?.[0] ?? null;
  },

  /**
   * Razorpay one-time order, then Checkout.js in a modal.
   *
   * Signature verification in the handler only proves the callback is
   * authentic. Access is granted by the webhook-driven trigger on
   * payments.webhook_events, which also re-checks the amount against
   * public.pricing - so a tampered amount buys nothing.
   */
  async startCheckout(user, profile) {
    const fee = await this.classFee();
    await loadRazorpayScript();

    const orders = unwrap(
      await insforge.database.from("orders").insert([
        {
          user_id: user.id,
          amount: Math.round(fee.amount_minor / 100),
          currency: fee.currency,
          status: "pending",
        },
      ]).select()
    );
    const order = orders[0];

    const data = unwrap(
      await insforge.payments.razorpay.createOrder(PAY_ENV, {
        amount: fee.amount_minor,
        currency: fee.currency,
        subject: { type: "user", id: user.id },
        customerName: profile?.name ?? null,
        customerEmail: user.email ?? null,
        // Razorpay caps `receipt` at 40 chars and rejects duplicates, so the
        // app's UUID goes in notes instead.
        notes: { order_id: order.id },
      })
    );

    return new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        ...data.checkoutOptions,
        handler: async (response) => {
          try {
            const verified = await insforge.payments.razorpay.verifyOrder(PAY_ENV, {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            if (verified.error) throw new Error(verified.error.message);
            resolve({ status: "processing" });
          } catch (e) {
            reject(e);
          }
        },
        modal: {
          ondismiss: () => resolve({ status: "cancelled" }),
        },
      });
      checkout.on("payment.failed", (e) =>
        reject(new Error(e?.error?.description || "Payment failed. Please try again."))
      );
      checkout.open();
    });
  },
};

export default authService;
