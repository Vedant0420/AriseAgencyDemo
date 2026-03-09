export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">Privacy Policy</h1>
        
        <div className="text-slate-600 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-slate-900">1. Introduction</h2>
            <p>
              Arise Agency (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-slate-900">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">Personal Information</h3>
                <p>We may collect personal information that you voluntarily provide when you:</p>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                  <li>Contact us via email or phone</li>
                  <li>Fill out booking forms or inquiry forms</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Request our services</li>
                </ul>
                <p className="mt-2">This information may include your name, email address, phone number, company name, and message content.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mt-4">Automatically Collected Information</h3>
                <p>When you visit our website, we automatically collect certain information including:</p>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                  <li>Device information (browser type, IP address, device type)</li>
                  <li>Usage data (pages visited, time spent, referral source)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-slate-900">3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
              <li>To provide and improve our services</li>
              <li>To respond to your inquiries and requests</li>
              <li>To send newsletters and marketing communications (with your consent)</li>
              <li>To analyze website usage and optimize user experience</li>
              <li>To prevent fraudulent activities and ensure security</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-slate-900">4. Information Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
              <li>With service providers who assist us in operating our website and conducting our business</li>
              <li>When required by law or to protect our legal rights</li>
              <li>With your consent for specific purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-slate-900">5. Data Security</h2>
            <p>
              We implement appropriate technical, administrative, and physical security measures to protect your personal information against unauthorized access, alteration, disclosure, and destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-slate-900">6. Cookies</h2>
            <p>
              Our website uses cookies to enhance your browsing experience. Cookies are small data files stored on your device that help us remember your preferences and track website usage. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-slate-900">7. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of external sites. Please review their privacy policies before providing any information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-slate-900">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-slate-900">9. Children&apos;s Privacy</h2>
            <p>
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If we become aware of such collection, we will take appropriate steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-slate-900">10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the updated policy on our website with an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-slate-900">11. Contact Us</h2>
            <p>If you have any questions or concerns about our Privacy Policy or privacy practices, please contact us at:</p>
            <div className="mt-4 bg-slate-100 p-4 rounded-lg">
              <p className="font-semibold">Arise Agency</p>
              <p>Email: ariseagencysmm@gmail.com</p>
              <p>Phone: +91 9022612342</p>
            </div>
          </section>

          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
