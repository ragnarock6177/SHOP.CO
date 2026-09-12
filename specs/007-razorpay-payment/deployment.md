# Razorpay Production Deployment & Verification Checklist

## 1. Environment Variables Configuration

### Backend Production Environment (`backend/.env`)
- [ ] `RAZORPAY_KEY_ID`: Live key ID provided by Razorpay Dashboard (starts with `rzp_live_`)
- [ ] `RAZORPAY_KEY_SECRET`: Live secret key (keep confidential, never commit to git)
- [ ] `RAZORPAY_WEBHOOK_SECRET`: Secret token configured in Razorpay Webhook settings
- [ ] `NODE_ENV=production`

### Frontend Production Environment (`frontend/.env.production`)
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Live key ID matching backend (`rzp_live_...`)
- [ ] Ensure `RAZORPAY_KEY_SECRET` is NOT included in frontend environment variables.

---

## 2. Razorpay Dashboard Webhook Configuration

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings** $\rightarrow$ **Webhooks** $\rightarrow$ **Add New Webhook**.
3. **Webhook URL**: `https://api.airave.in/api/v1/payments/webhook` (or your production API domain).
4. **Secret**: Set a strong random string (e.g. 32+ hex characters) matching `RAZORPAY_WEBHOOK_SECRET`.
5. **Active Events**:
   - `order.paid`
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
6. Save and verify webhook status is active.

---

## 3. Post-Deployment Verification Steps

1. **Test Mode / 1-Rupee Live Canary Transaction**:
   - Place an order for a live product.
   - Complete payment using UPI QR or Test Card.
   - Confirm immediate UI redirect to Order Details page.
   - Verify database transition: `Order.status = 'CONFIRMED'`, `Payment.status = 'CAPTURED'`, `Invoice` record created.
2. **Webhook Resilience Check**:
   - Simulate delayed webhook delivery in staging.
   - Confirm backend handles duplicate webhook events idempotently without double-fulfillment.
3. **Admin Refund Canary**:
   - As an admin with `payments:write`, trigger a partial/full refund on the canary transaction.
   - Confirm gateway refund status and `Refund` database record.
