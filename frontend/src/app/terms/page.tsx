import { LegalPageShell } from "@/components/legal-page-shell";

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      subtitle="These terms govern your use of RAGE (After9) as a guest, buyer, organizer, team operator, and account holder."
      effectiveDate="April 21, 2026"
    >
      <h2>1. Agreement to Terms</h2>
      <p>
        By accessing or using RAGE, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the platform.
        You represent that you are legally able to enter into this agreement.
      </p>

      <h2>2. Platform Role</h2>
      <p>
        RAGE provides software tools that allow organizers to publish events, sell tickets, manage attendee lists, and run check-in. Event
        organizers are responsible for their events, venues, and on-site operations. We are not an event producer, promoter, venue owner, or
        insurer unless explicitly stated for a specific event.
      </p>

      <h2>3. Account Eligibility and Security</h2>
      <ul>
        <li>You must provide accurate account information and keep it current.</li>
        <li>You are responsible for all activity under your account and team access.</li>
        <li>You must safeguard credentials and notify us promptly about unauthorized use.</li>
        <li>We may suspend or terminate accounts that violate these terms or applicable law.</li>
      </ul>

      <h2>4. Host Responsibilities</h2>
      <ul>
        <li>Hosts must ensure event descriptions, pricing, and policies are accurate and lawful.</li>
        <li>Hosts are solely responsible for permits, licenses, staffing, age-gate checks, and venue compliance.</li>
        <li>Hosts must honor valid purchases except where cancellation/refund terms lawfully apply.</li>
        <li>Hosts must not oversell capacity beyond venue/legal limits.</li>
      </ul>

      <h2>5. Team Invites and Operator Access</h2>
      <p>
        Hosts may invite teammates (for example, scanner/manager roles). Hosts are fully responsible for permissions they grant and for all actions
        performed by invited operators. Revoke access immediately when no longer needed.
      </p>

      <h2>6. Ticket Sales and Payments</h2>
      <ul>
        <li>All prices, fees, taxes, and payout timelines are subject to the checkout flow and host settings.</li>
        <li>Payment processing is provided by third-party processors such as Stripe.</li>
        <li>We may hold, delay, or restrict payouts to manage risk, disputes, fraud, or legal compliance.</li>
        <li>We may offset refunds, chargebacks, or penalties against current or future host balances where permitted.</li>
      </ul>

      <h2>7. Payouts and Withdrawing Funds</h2>
      <p>
        Host payouts may require connected account onboarding, identity verification, and ongoing compliance reviews. Payout availability can be
        affected by processor rules, reserves, disputes, sanctions screening, and fraud controls.
      </p>

      <h2>8. Refunds, Cancellations, and Disputes</h2>
      <ul>
        <li>Unless required by law or expressly promised, ticket sales may be final.</li>
        <li>Hosts are responsible for published refund/cancellation policies.</li>
        <li>Chargebacks and payment disputes may result in holds, reversals, and admin actions.</li>
      </ul>

      <h2>9. Acceptable Use</h2>
      <p>You may not use the platform to:</p>
      <ul>
        <li>Violate laws, infringe rights, or facilitate unsafe or prohibited events.</li>
        <li>Commit fraud, abuse checkout flows, scrape data, or bypass security controls.</li>
        <li>Upload malware, exploit vulnerabilities, or interfere with normal platform operations.</li>
        <li>Publish misleading, defamatory, or illegal content.</li>
      </ul>

      <h2>10. User Content and License</h2>
      <p>
        You retain ownership of content you submit (for example flyers and event copy). You grant us a worldwide, non-exclusive, royalty-free
        license to host, reproduce, display, distribute, and adapt such content solely to operate, improve, secure, and promote the platform.
      </p>

      <h2>11. Intellectual Property</h2>
      <p>
        The platform, branding, software, and non-user content are owned by us or our licensors and protected by applicable intellectual property
        laws. Except as expressly allowed, you may not copy, modify, reverse engineer, or create derivative works.
      </p>

      <h2>12. Third-Party Services</h2>
      <p>
        The platform may integrate with third-party services (for example payment processors, analytics, infrastructure providers). Their services
        are governed by their own terms and policies, and we are not responsible for their acts or omissions.
      </p>

      <h2>13. No Warranty</h2>
      <p>
        The platform is provided “as is” and “as available” without warranties of any kind, express or implied, including merchantability, fitness
        for a particular purpose, non-infringement, and uninterrupted availability.
      </p>

      <h2>14. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, exemplary, or punitive damages,
        including lost profits, lost revenue, lost data, event losses, reputational harm, or business interruption. Our aggregate liability for any
        claim arising from or relating to the platform will not exceed the greater of (a) amounts you paid us in the prior 12 months or (b) $100.
      </p>

      <h2>15. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless RAGE/After9 and its affiliates, officers, employees, and agents from claims, damages,
        liabilities, costs, and expenses (including reasonable attorney fees) arising from your use of the platform, your content, your events, or
        your violation of these terms or law.
      </p>

      <h2>16. Suspension and Termination</h2>
      <p>
        We may suspend, restrict, or terminate access at any time for security, legal, policy, or risk reasons. Certain sections (including payment,
        liability, indemnity, dispute, and IP terms) survive termination.
      </p>

      <h2>17. Dispute Resolution; Arbitration; Class Waiver</h2>
      <p>
        Except where prohibited by law, disputes will be resolved by binding individual arbitration, not jury trial or class action. You and we each
        waive any right to participate in a class, consolidated, or representative proceeding. You may opt out of arbitration by emailing{" "}
        <a href="mailto:support@after9.app">support@after9.app</a> within 30 days of first accepting these terms, including your name and account
        email.
      </p>

      <h2>18. Governing Law</h2>
      <p>
        These terms are governed by applicable laws of the governing jurisdiction stated by the company, without regard to conflict-of-law rules,
        except where consumer law requires otherwise.
      </p>

      <h2>19. Changes to Terms</h2>
      <p>
        We may update these terms from time to time. Updated terms become effective when posted. Continued platform use after effective date means
        acceptance of revised terms.
      </p>

      <h2>20. Contact</h2>
      <p>
        Legal, compliance, and support requests: <a href="mailto:support@after9.app">support@after9.app</a>
      </p>
    </LegalPageShell>
  );
}
