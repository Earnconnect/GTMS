import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GTMS collects, uses, stores, and protects your personal and employment information.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="August 11, 2026"
      intro="This Privacy Policy explains what information GTMS collects when you use the platform, how we use and protect it, and the choices you have. We&rsquo;ve written it in plain language because you deserve to understand exactly how your data is handled."
    >
      <div>
        <h2>1. Scope</h2>
        <p>
          This policy applies to the GTMS workforce and payroll platform (&ldquo;GTMS,&rdquo;
          &ldquo;we,&rdquo; &ldquo;us&rdquo;) and to everyone who uses it — employees, recruiters,
          and administrators. It covers information you provide directly, information created as you
          use the platform, and how that information is stored and shared.
        </p>
      </div>

      <div>
        <h2>2. Information we collect</h2>
        <p>We collect only what we need to run recruiting, onboarding, training, and payroll:</p>
        <ul>
          <li><strong>Account details</strong> — your name, email address, and a securely hashed password.</li>
          <li><strong>Employment information</strong> — job title, department, employment status, salary, and start date.</li>
          <li><strong>Onboarding documents</strong> — files you upload for verification, such as identity, tax, and benefit documents, and your CV.</li>
          <li><strong>Verification details</strong> — information you submit for identity checks required before withdrawals.</li>
          <li><strong>Financial records</strong> — your wallet balance, salary payments, and transaction history. For withdrawal methods, we store only a masked reference (for example, the last four digits) — never full banking credentials.</li>
          <li><strong>Activity</strong> — assignments, training progress, messages, reports, and notifications generated as you use the platform.</li>
        </ul>
      </div>

      <div>
        <h2>3. How we use your information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and operate the platform — placing you in roles, guiding onboarding, delivering training, and processing salary payments.</li>
          <li>Verify your identity where required and keep payouts secure.</li>
          <li>Keep an accurate, audit-ready record of payments and balances.</li>
          <li>Communicate with you about your account, assignments, and pay.</li>
          <li>Protect the platform against fraud, misuse, and unauthorized access.</li>
        </ul>
        <p>We do not sell your personal information, and we do not use it for advertising.</p>
      </div>

      <div>
        <h2>4. How your information is stored and protected</h2>
        <p>
          Security is built into the platform&rsquo;s design. Documents you upload are held in
          private, access-controlled storage and are served only to you or an authorized
          administrator. Access across the platform is governed by role-based permissions, so people
          can only see the information their role requires. Every payment and balance change is
          recorded in an immutable ledger. Passwords are stored using one-way hashing and are never
          visible to anyone, including our team.
        </p>
      </div>

      <div>
        <h2>5. When we share information</h2>
        <p>
          We share your information only in limited, necessary circumstances:
        </p>
        <ul>
          <li><strong>Within your organization</strong> — authorized administrators and recruiters can access the information required to manage your employment, onboarding, and pay.</li>
          <li><strong>Service providers</strong> — trusted infrastructure providers that host the platform, store documents, and power in-platform video interviews, acting on our instructions.</li>
          <li><strong>Legal requirements</strong> — where we are required to do so by law or to protect the rights, safety, and security of our users and the platform.</li>
        </ul>
        <p>We never sell, rent, or trade your personal information to third parties.</p>
      </div>

      <div>
        <h2>6. Data retention</h2>
        <p>
          We keep your information for as long as your account is active and as needed to provide the
          platform, meet legal and financial record-keeping obligations, and resolve disputes. When
          information is no longer required, we take steps to delete or anonymize it.
        </p>
      </div>

      <div>
        <h2>7. Your rights and choices</h2>
        <p>You can:</p>
        <ul>
          <li>Access and update much of your profile and employment information directly in the platform.</li>
          <li>Request a copy of the personal information we hold about you.</li>
          <li>Ask us to correct inaccurate information or to delete information we no longer need to keep.</li>
        </ul>
        <p>
          To make a request, contact us at <a href="mailto:support@gtms.app">support@gtms.app</a>.
          Some information — such as financial records — may need to be retained to meet legal
          obligations even after a deletion request.
        </p>
      </div>

      <div>
        <h2>8. Sessions and cookies</h2>
        <p>
          We use a secure session so you can stay signed in. These are essential to how the platform
          works — we do not use tracking or advertising cookies.
        </p>
      </div>

      <div>
        <h2>9. Eligibility</h2>
        <p>
          GTMS is intended for use by working adults. The platform is not directed to, and should not
          be used by, anyone under the age of 18.
        </p>
      </div>

      <div>
        <h2>10. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. When we make material changes, we&rsquo;ll
          update the date above and, where appropriate, notify you within the platform. Your continued
          use of GTMS after an update means you accept the revised policy.
        </p>
      </div>

      <div>
        <h2>11. Contact us</h2>
        <p>
          If you have any questions about this policy or how your information is handled, reach us at{" "}
          <a href="mailto:support@gtms.app">support@gtms.app</a>.
        </p>
      </div>
    </LegalShell>
  );
}
