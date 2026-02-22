import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto p-8 space-y-6">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-slate-600">Last updated: February 2026</p>

            <section>
                <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
                <p>
                    Welcome to PayEasy. We respect your privacy and are completely committed to protecting your personal data in compliance with the General Data Protection Regulation (GDPR) and other relevant privacy laws.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-2">2. Your GDPR Rights</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Right to Access &amp; Export:</strong> You can request a full JSON or CSV export of all personal information we hold about you at any time via your account settings.</li>
                    <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You may permanently delete your account and all associated personal records using the deletion tool in your account settings. This action is irreversible.</li>
                    <li><strong>Right to Withdraw Consent:</strong> Any consent given (e.g., for marketing or specific data processing) can be tracked and withdrawn freely.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-2">3. Data We Collect</h2>
                <p>
                    We only collect data necessary to provide our services. This includes: public keys, email addresses, usernames, rental listings, messages, and payment records. We never sell your data to third parties.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-2">4. Audit Trails</h2>
                <p>
                    To protect against unauthorized actions and demonstrate compliance, we maintain an immutable audit log of GDPR-related requests (e.g., exports, deletions). This allows us to ensure your rights are properly honored.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-2">5. Contact Us</h2>
                <p>
                    If you have any questions or concerns regarding this privacy policy or your personal data, please contact our Data Protection Officer at privacy@payeasy.com.
                </p>
            </section>
        </div>
    );
}
