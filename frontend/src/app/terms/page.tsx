import { LegalPageShell } from "@/components/legal-page-shell";

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      subtitle="These terms govern use of RAGE by guests, ticket buyers, hosts, team operators, and account holders."
      effectiveDate="January 28, 2026"
    >
      <h2>Quick Summary</h2>
      <ul>
        <li>Hosts are responsible for their events, compliance, staffing, and on-site safety.</li>
        <li>Payments and payouts are subject to processor rules, risk review, and dispute outcomes.</li>
        <li>You must use the platform lawfully and protect account credentials.</li>
        <li>Liability is limited to the maximum extent permitted by law.</li>
      </ul>

      <h2>1. Agreement to Terms</h2>
      <p>
        By accessing or using RAGE, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the platform.
        You represent that you are legally able to enter into this agreement.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li>
          <strong>"Platform"</strong> means RAGE websites, apps, APIs, and related services.
        </li>
        <li>
          <strong>"Host"</strong> means any organizer publishing events or selling tickets.
        </li>
        <li>
          <strong>"Team Operator"</strong> means any invited teammate with event permissions.
        </li>
        <li>
          <strong>"Buyer" or "Guest"</strong> means a user browsing, purchasing, or attending events.
        </li>
      </ul>

      <h2>3. Platform Role</h2>
      <p>
        RAGE provides software tools that allow organizers to publish events, sell tickets, manage attendee lists, and run check-in. Event
        organizers are responsible for their events, venues, and on-site operations. We are not an event producer, promoter, venue owner, or
        insurer unless explicitly stated for a specific event.
      </p>

      <h2>4. Account Eligibility and Security</h2>
      <ul>
        <li>You must provide accurate account information and keep it current.</li>
        <li>You are responsible for all activity under your account and team access.</li>
        <li>You must safeguard credentials and notify us promptly about unauthorized use.</li>
        <li>We may suspend or terminate accounts that violate these terms or applicable law.</li>
      </ul>

      <h2>5. Host Responsibilities</h2>
      <ul>
        <li>Hosts must ensure event descriptions, pricing, and policies are accurate and lawful.</li>
        <li>Hosts are solely responsible for permits, licenses, staffing, age-gate checks, and venue compliance.</li>
        <li>Hosts must honor valid purchases except where cancellation/refund terms lawfully apply.</li>
        <li>Hosts must not oversell capacity beyond venue/legal limits.</li>
        <li>Hosts are solely responsible for all conduct at their events, including criminal, unsafe, or otherwise unlawful acts by hosts, staff, contractors, guests, or third parties at or around the venue.</li>
      </ul>

      <h2>6. Team Invites and Operator Access</h2>
      <p>
        Hosts may invite teammates (for example, scanner/manager roles). Hosts are fully responsible for permissions they grant and for all actions
        performed by invited operators. Revoke access immediately when no longer needed.
      </p>

      <h2>7. Ticket Sales and Payments</h2>
      <ul>
        <li>All prices, fees, taxes, and payout timelines are subject to the checkout flow and host settings.</li>
        <li>Payment processing is provided by third-party processors such as Stripe.</li>
        <li>We may hold, delay, or restrict payouts to manage risk, disputes, fraud, or legal compliance.</li>
        <li>We may offset refunds, chargebacks, or penalties against current or future host balances where permitted.</li>
      </ul>

      <h2>8. Payouts and Withdrawing Funds</h2>
      <p>
        Host payouts may require connected account onboarding, identity verification, and ongoing compliance reviews. Payout availability can be
        affected by processor rules, reserves, disputes, sanctions screening, and fraud controls.
      </p>

      <h2>9. Refunds, Cancellations, and Disputes</h2>
      <ul>
        <li>Hosts must publish a clear refund policy on their event listing before tickets are sold.</li>
        <li>Unless required by law or expressly stated by the host, ticket sales may be final.</li>
        <li>When an event is canceled (and not rescheduled), hosts must issue refunds as required by law and platform policy.</li>
        <li>
          Buyers can request refund help by emailing <a href="mailto:ragesupportpage@gmail.com">ragesupportpage@gmail.com</a>; we may assist with host
          coordination and payment dispute handling where appropriate.
        </li>
        <li>Chargebacks and payment disputes may result in payout holds, reversals, and account actions.</li>
      </ul>

      <h2>10. Age Restrictions and Identity Checks</h2>
      <ul>
        <li>Hosts are solely responsible for enforcing age restrictions and verifying identification at entry.</li>
        <li>Any displayed age guidance on the platform is informational and does not replace legal compliance obligations.</li>
        <li>We are not liable for underage attendance, false identification, or host failures to enforce age-gate requirements.</li>
      </ul>

      <h2>11. Illegal Events and Prohibited Activity</h2>
      <p>
        You may not use the platform to organize or facilitate illegal activity. We may remove content, suspend accounts, and cooperate with law
        enforcement where required. We do not monitor every event in real time and are not responsible for unlawful acts carried out by hosts,
        operators, attendees, or third parties.
      </p>
      <ul>
        <li>Examples include events involving violence, trafficking, unlawful substances, fraud, weapons violations, or other prohibited conduct.</li>
        <li>We may take immediate enforcement action when there is safety risk, legal exposure, or credible abuse signals.</li>
      </ul>

      <h2>12. Acceptable Use</h2>
      <p>You may not use the platform to:</p>
      <ul>
        <li>Violate laws, infringe rights, or facilitate unsafe or prohibited events.</li>
        <li>Commit fraud, abuse checkout flows, scrape data, or bypass security controls.</li>
        <li>Upload malware, exploit vulnerabilities, or interfere with normal platform operations.</li>
        <li>Publish misleading, defamatory, or illegal content.</li>
      </ul>

      <h2>13. User Content and License</h2>
      <p>
        You retain ownership of content you submit (for example flyers and event copy). You grant us a worldwide, non-exclusive, royalty-free
        license to host, reproduce, display, distribute, and adapt such content solely to operate, improve, secure, and promote the platform.
      </p>

      <h2>14. Intellectual Property</h2>
      <p>
        The platform, branding, software, and non-user content are owned by us or our licensors and protected by applicable intellectual property
        laws. Except as expressly allowed, you may not copy, modify, reverse engineer, or create derivative works.
      </p>

      <h2>15. Third-Party Services</h2>
      <p>
        The platform may integrate with third-party services (for example payment processors, analytics, infrastructure providers). Their services
        are governed by their own terms and policies, and we are not responsible for their acts or omissions.
      </p>

      <h2>16. Communications and Electronic Records</h2>
      <p>
        By using the platform, you consent to receive electronic communications from us (including policy updates, account notices, and transactional
        messages). You agree these communications satisfy legal requirements for written notice where permitted by law.
      </p>

      <h2>17. No Warranty</h2>
      <p>
        The platform is provided “as is” and “as available” without warranties of any kind, express or implied, including merchantability, fitness
        for a particular purpose, non-infringement, and uninterrupted availability.
      </p>

      <h2>18. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, exemplary, or punitive damages,
        including lost profits, lost revenue, lost data, event losses, reputational harm, or business interruption. Our aggregate liability for any
        claim arising from or relating to the platform will not exceed the greater of (a) amounts you paid us in the prior 12 months or (b) $100.
      </p>

      <h2>19. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless RAGE and its affiliates, officers, employees, and agents from claims, damages,
        liabilities, costs, and expenses (including reasonable attorney fees) arising from your use of the platform, your content, your events, or
        your violation of these terms or law.
      </p>

      <h2>20. Suspension and Termination</h2>
      <p>
        We may suspend, restrict, or terminate access at any time for security, legal, policy, or risk reasons. Certain sections (including payment,
        liability, indemnity, dispute, and IP terms) survive termination.
      </p>

      <h2>21. Dispute Resolution; Arbitration; Class Waiver</h2>
      <p>
        Except where prohibited by law, disputes will be resolved by binding individual arbitration, not jury trial or class action. You and we each
        waive any right to participate in a class, consolidated, or representative proceeding. You may opt out of arbitration by emailing{" "}
        <a href="mailto:ragesupportpage@gmail.com">ragesupportpage@gmail.com</a> within 30 days of first accepting these terms, including your name and account
        email.
      </p>

      <h2>22. Governing Law</h2>
      <p>
        These terms are governed by applicable laws of the governing jurisdiction stated by the company, without regard to conflict-of-law rules,
        except where consumer law requires otherwise.
      </p>

      <h2>23. Force Majeure</h2>
      <p>
        We are not liable for delays or failures caused by events beyond reasonable control, including outages, internet failures, labor disputes,
        natural disasters, governmental actions, and acts of war or terrorism.
      </p>

      <h2>24. Changes to Terms</h2>
      <p>
        We may update these terms from time to time. Updated terms become effective when posted. Continued platform use after effective date means
        acceptance of revised terms.
      </p>

      <h2>25. Contracting Entity and Notices</h2>
      <p>
        The contracting RAGE entity for your account may be shown in platform notices, payment records, invoices, or onboarding materials. You agree
        to receive legal and operational notices by email or in-product notice where permitted by law.
      </p>

      <h2>26. Intellectual Property Takedown (DMCA-style Process)</h2>
      <p>
        If you believe content on the platform infringes your intellectual property rights, email{" "}
        <a href="mailto:ragesupportpage@gmail.com">ragesupportpage@gmail.com</a> with your contact details, a description of the work, the infringing
        URL/content, and a good-faith statement. We may remove or restrict content while reviewing notices and may process valid counter-notices where
        applicable.
      </p>

      <h2>27. Tax and Invoicing</h2>
      <p>
        Hosts are responsible for determining, collecting, reporting, and remitting applicable taxes unless the law requires otherwise. Platform
        records and payout statements may be used as transaction support but are not tax advice. Consult your tax advisor for filing obligations.
      </p>

      <h2>28. Reserves, AML, and Enhanced Risk Controls</h2>
      <p>
        To comply with legal and payment network obligations, we and our processors may apply reserves, rolling holds, sanctions checks, KYC reviews,
        or enhanced monitoring on accounts or transactions that present elevated risk.
      </p>

      <h2>29. Refund Operations and Timelines</h2>
      <p>
        Where refunds are approved, processing time depends on the payment method and processor, and may take several business days after authorization.
        We will provide status updates through platform messaging or support responses when available.
      </p>

      <h2>30. Contact</h2>
      <p>
        Legal, compliance, and support requests: <a href="mailto:ragesupportpage@gmail.com">ragesupportpage@gmail.com</a>
      </p>
    </LegalPageShell>
  );
}
