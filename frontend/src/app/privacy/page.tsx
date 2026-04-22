import { LegalPageShell } from "@/components/legal-page-shell";

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      subtitle="This policy explains what data we collect, why we collect it, how we use it, and your choices."
      effectiveDate="April 21, 2026"
    >
      <h2>1. Scope</h2>
      <p>
        This Privacy Policy applies to our websites, applications, event-hosting tools, and related services offered under RAGE/After9. It does not
        cover third-party services we do not control.
      </p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li>Account data: name, email, login credentials, profile details.</li>
        <li>Event and ticket data: event content, attendee names/emails, ticket codes, check-in status.</li>
        <li>Payment and payout metadata: transaction identifiers, amounts, processor status, dispute signals.</li>
        <li>Device and usage data: browser type, IP, pages visited, timestamps, interaction events.</li>
        <li>Support and communications: messages, issue reports, and related logs.</li>
      </ul>

      <h2>3. Sensitive and Age-Restricted Data</h2>
      <p>
        We do not intentionally collect sensitive personal data unless needed for legal or payment-compliance purposes. Hosts are responsible for
        lawful age-gate and ID-check procedures at their events.
      </p>

      <h2>4. How We Use Data</h2>
      <ul>
        <li>Provide and operate core services (accounts, event pages, checkout, ticketing, check-in).</li>
        <li>Prevent fraud, abuse, and unauthorized access.</li>
        <li>Support payments, payouts, risk controls, and dispute handling.</li>
        <li>Provide customer support and service communications.</li>
        <li>Improve product quality, performance, and reliability.</li>
        <li>Comply with legal obligations and enforce our agreements.</li>
      </ul>

      <h2>5. Legal Bases (Where Required)</h2>
      <p>
        Depending on jurisdiction, we process personal data under one or more legal bases: contract necessity, legitimate interests, legal obligation,
        consent, and protection against fraud or abuse.
      </p>

      <h2>6. Sharing and Disclosure</h2>
      <p>We may share data with:</p>
      <ul>
        <li>Service providers (hosting, analytics, email, support, security, payments).</li>
        <li>Payment processors and financial partners for transactions and compliance.</li>
        <li>Hosts and authorized event operators for ticketing and check-in operations.</li>
        <li>Authorities, regulators, or courts where required by law or lawful process.</li>
        <li>Potential acquirers in connection with merger, acquisition, or asset sale.</li>
      </ul>

      <h2>7. Cookies and Similar Technologies</h2>
      <p>
        We use cookies and similar technologies for authentication, security, performance, and product analytics. You may control cookies through your
        browser settings, though some features may not function properly if disabled.
      </p>

      <h2>8. Data Retention</h2>
      <p>
        We retain data for as long as needed for service operation, legal compliance, accounting, dispute resolution, and security. Retention
        duration varies by data type and regulatory requirements.
      </p>

      <h2>9. Security</h2>
      <p>
        We use reasonable administrative, technical, and organizational safeguards to protect personal data. No method of transmission or storage is
        completely secure, and we cannot guarantee absolute security.
      </p>

      <h2>10. International Transfers</h2>
      <p>
        Your data may be processed in countries other than your own. Where required, we use appropriate safeguards for international transfers.
      </p>

      <h2>11. Your Privacy Rights</h2>
      <p>Depending on where you live, you may have rights to:</p>
      <ul>
        <li>Access and receive a copy of your personal data.</li>
        <li>Correct inaccurate data.</li>
        <li>Delete data in certain circumstances.</li>
        <li>Object to or restrict certain processing.</li>
        <li>Data portability where applicable.</li>
        <li>Withdraw consent where processing is based on consent.</li>
      </ul>
      <p>
        To exercise rights, email <a href="mailto:ragesupportpage@gmail.com">ragesupportpage@gmail.com</a>. We may need to verify identity before processing a
        request.
      </p>

      <h2>12. Marketing Communications</h2>
      <p>
        You can opt out of non-essential marketing emails by using unsubscribe links in those messages. Transactional and account/security messages
        may still be sent when necessary.
      </p>

      <h2>13. Children’s Privacy</h2>
      <p>
        Our services are not directed to children under 13 (or higher age threshold where required). We do not knowingly collect personal data from
        children in violation of applicable law.
      </p>

      <h2>14. Third-Party Links and Services</h2>
      <p>
        Our platform may link to third-party sites and services. Their privacy practices are governed by their own policies, not this Privacy Policy.
      </p>

      <h2>15. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes are effective when posted with a revised effective date. Continued use after
        updates means acceptance of the revised policy.
      </p>

      <h2>16. Contact</h2>
      <p>
        Privacy and data requests: <a href="mailto:ragesupportpage@gmail.com">ragesupportpage@gmail.com</a>
      </p>
    </LegalPageShell>
  );
}
