# Runbook: Verify thomasghenry.com in Resend

Agentic runbook. Execute by telling Claude: "run the setup-resend-domain runbook".

## Context

MDE sends magic-link emails from `MDE <auth@thomasghenry.com>`. Resend requires domain
verification before allowing sends from a custom domain. DNS records must be added to
Dreamhost manually — Dreamhost is intentionally NOT managed by Tofu (10+ year stable
account, community provider risk).

## Prerequisites

- Logged into resend.com in Chrome
- Logged into panel.dreamhost.com in Chrome (or have Dreamhost API access)
- `AUTH_EMAIL_FROM` in `infra/app/main.tf` set to `MDE <auth@thomasghenry.com>`

## Steps

### 1. Get verification DNS records from Resend

Navigate to: resend.com/domains

Find or add `thomasghenry.com`. If not listed, click "Add Domain" and enter `thomasghenry.com`.

Resend will show DNS records to add — typically:
- SPF: TXT record on `thomasghenry.com` or `send.thomasghenry.com`
- DKIM: TXT record(s) on `resend._domainkey.thomasghenry.com` (or similar)
- DMARC: TXT record on `_dmarc.thomasghenry.com`

Read and record each record's: Type, Name/Host, Value.

### 2. Add records in Dreamhost

Navigate to: panel.dreamhost.com → Domains → DNS

Select domain: `thomasghenry.com`

Add each record from Step 1. For each:
- Type: as shown (TXT, MX, CNAME)
- Name: the subdomain portion only (e.g. `resend._domainkey` not the full FQDN)
- Value: exact value from Resend

DNS propagation takes 5–30 minutes.

### 3. Verify in Resend

Return to resend.com/domains → `thomasghenry.com` → click "Verify".

If not verified yet, wait 5 minutes and retry.

### 4. Test

Send a test magic-link email from the production app:
`https://market-denoising-engine-thomas-g-henry-llc.vercel.app`

Check Vercel production logs for absence of the `statusCode:403` Resend error.

## Notes

- Do NOT add Dreamhost to Tofu. The DNS records are a one-time manual operation.
- If `thomasghenry.com` DNS is ever migrated away from Dreamhost, update this runbook.
- The `resend_domain` and `dreamhost_dns_record` Tofu resources were removed from
  `infra/app/main.tf` in commit history — see git log for rationale.
