import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of the GTMS workforce and payroll platform.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated="August 11, 2026"
      intro="These Terms of Service govern your access to and use of the GTMS platform. By creating an account or using GTMS, you agree to these terms. Please read them carefully."
    >
      <div>
        <h2>1. Acceptance of these terms</h2>
        <p>
          By registering for, accessing, or using GTMS (the &ldquo;platform&rdquo;), you agree to be
          bound by these terms. If you are using the platform on behalf of an organization, you agree
          to these terms on its behalf. If you do not agree, you may not use the platform.
        </p>
      </div>

      <div>
        <h2>2. Eligibility and accounts</h2>
        <p>
          You must be at least 18 years old to use GTMS. You are responsible for the information you
          provide, for keeping your login credentials confidential, and for all activity that occurs
          under your account. Notify us promptly at <a href="mailto:support@gtms.app">support@gtms.app</a>{" "}
          if you believe your account has been compromised.
        </p>
      </div>

      <div>
        <h2>3. Acceptable use</h2>
        <p>When using the platform, you agree not to:</p>
        <ul>
          <li>Provide false, misleading, or fraudulent information, including during onboarding or identity verification.</li>
          <li>Access, or attempt to access, information or areas you are not authorized to use.</li>
          <li>Interfere with, disrupt, or attempt to compromise the security or integrity of the platform.</li>
          <li>Use the platform for any unlawful purpose or in violation of these terms.</li>
        </ul>
      </div>

      <div>
        <h2>4. Employment, assignments, and content</h2>
        <p>
          The platform is used to manage recruiting, onboarding, training, work assignments, and
          payroll. You are responsible for the accuracy of the documents, submissions, and messages
          you provide, and for completing assigned work in good faith. Roles, assignments, and
          employment decisions are managed by your organization&rsquo;s administrators.
        </p>
      </div>

      <div>
        <h2>5. Payments and payroll</h2>
        <p>
          Salaries and any other payments are funded and administered by the company through the
          platform and credited to your in-platform wallet. Money on GTMS moves in one direction only
          — from the company to you.
        </p>
        <p>
          <strong>You will never be asked to deposit funds, pay a fee, or provide banking credentials
          in order to be hired, onboarded, trained, or paid.</strong> Once you have completed identity
          verification, you may add a withdrawal method and request payouts of your available balance.
          Requests are subject to review before they are processed.
        </p>
      </div>

      <div>
        <h2>6. Intellectual property</h2>
        <p>
          The platform, including its software, design, and content, is owned by GTMS and protected by
          applicable laws. You may use the platform only as permitted by these terms. You retain
          ownership of the documents and content you submit, and you grant us the permissions
          necessary to store and process that content to provide the platform.
        </p>
      </div>

      <div>
        <h2>7. Third-party services</h2>
        <p>
          GTMS relies on trusted third-party providers for hosting, storage, and in-platform video.
          These providers act on our behalf to deliver the platform. Your use of certain features may
          be subject to those providers&rsquo; capabilities and availability.
        </p>
      </div>

      <div>
        <h2>8. Disclaimers</h2>
        <p>
          The platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. While
          we work hard to keep GTMS secure, accurate, and available, we do not warrant that it will be
          uninterrupted or error-free. To the fullest extent permitted by law, we disclaim implied
          warranties not expressly stated in these terms.
        </p>
      </div>

      <div>
        <h2>9. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, GTMS will not be liable for any indirect, incidental,
          or consequential damages arising from your use of, or inability to use, the platform. Nothing
          in these terms limits any rights you have that cannot be limited by law.
        </p>
      </div>

      <div>
        <h2>10. Suspension and termination</h2>
        <p>
          We may suspend or terminate access to the platform if these terms are violated or to protect
          the platform and its users. You may stop using the platform at any time. Provisions that by
          their nature should survive termination — such as record-keeping obligations — will continue
          to apply.
        </p>
      </div>

      <div>
        <h2>11. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. When we make material changes, we&rsquo;ll update
          the date above and, where appropriate, notify you within the platform. Your continued use of
          GTMS after an update means you accept the revised terms.
        </p>
      </div>

      <div>
        <h2>12. Contact us</h2>
        <p>
          Questions about these terms? Contact us at{" "}
          <a href="mailto:support@gtms.app">support@gtms.app</a>.
        </p>
      </div>
    </LegalShell>
  );
}
