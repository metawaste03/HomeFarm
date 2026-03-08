import React from 'react';
import { Screen } from '../App';
import { ChevronLeftIcon } from './icons';

interface PrivacyPolicyScreenProps {
  onNavigate: (screen: Screen) => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onNavigate }) => {
  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Back to Settings"
          >
            <ChevronLeftIcon className="w-6 h-6 text-text-secondary" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">Privacy Policy</h1>
        </div>
      </header>

      <div className="p-5 max-w-2xl mx-auto space-y-6 pb-12">
        <p className="text-xs text-text-secondary text-right">Effective: 2026-03-07</p>

        <p className="text-text-secondary leading-relaxed">
          This privacy policy applies to the Homefarm app (hereby referred to as "Application") for mobile devices that was created by (hereby referred to as "Service Provider") as a Free service. This service is intended for use "AS IS".
        </p>

        <Section title="Information Collection and Use">
          <p className="text-text-secondary leading-relaxed">
            The Application collects information when you download and use it. This information may include:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-text-secondary">
            <li>Your device's Internet Protocol address (e.g. IP address)</li>
            <li>The pages of the Application that you visit, the time and date of your visit, the time spent on those pages</li>
            <li>The time spent on the Application</li>
            <li>The operating system you use on your mobile device</li>
          </ul>
          <p className="text-text-secondary leading-relaxed mt-3">
            The Application does not gather precise information about the location of your mobile device.
          </p>
          <p className="text-text-secondary leading-relaxed mt-3">
            The Application does not use Artificial Intelligence (AI) technologies to process your data or provide features.
          </p>
          <p className="text-text-secondary leading-relaxed mt-3">
            The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices and marketing promotions.
          </p>
          <p className="text-text-secondary leading-relaxed mt-3">
            For a better experience, while using the Application, the Service Provider may require you to provide us with certain personally identifiable information, including but not limited to Email. The information that the Service Provider requests will be retained by them and used as described in this privacy policy.
          </p>
        </Section>

        <Section title="Third Party Access">
          <p className="text-text-secondary leading-relaxed">
            Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.
          </p>
          <p className="text-text-secondary leading-relaxed mt-3">
            The Service Provider may disclose User Provided and Automatically Collected Information:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-text-secondary">
            <li>as required by law, such as to comply with a subpoena, or similar legal process;</li>
            <li>when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;</li>
            <li>with their trusted service providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement.</li>
          </ul>
        </Section>

        <Section title="Opt-Out Rights">
          <p className="text-text-secondary leading-relaxed">
            You can stop all collection of information by the Application easily by uninstalling it. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.
          </p>
        </Section>

        <Section title="Data Retention Policy">
          <p className="text-text-secondary leading-relaxed">
            The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you'd like them to delete User Provided Data that you have provided via the Application, please contact them at{' '}
            <a href="mailto:metawaste03@gmail.com" className="text-primary hover:underline">metawaste03@gmail.com</a>{' '}
            and they will respond in a reasonable time.
          </p>
        </Section>

        <Section title="Children">
          <p className="text-text-secondary leading-relaxed">
            The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
          </p>
          <p className="text-text-secondary leading-relaxed mt-3">
            The Service Provider does not knowingly collect personally identifiable information from children. The Service Provider encourages all children to never submit any personally identifiable information through the Application and/or Services. The Service Provider encourages parents and legal guardians to monitor their children's Internet usage and to help enforce this Policy by instructing their children never to provide personally identifiable information through the Application and/or Services without their permission.
          </p>
          <p className="text-text-secondary leading-relaxed mt-3">
            If you have reason to believe that a child has provided personally identifiable information to the Service Provider through the Application and/or Services, please contact the Service Provider at{' '}
            <a href="mailto:metawaste03@gmail.com" className="text-primary hover:underline">metawaste03@gmail.com</a>{' '}
            so that they will be able to take the necessary actions. You must also be at least 16 years of age to consent to the processing of your personally identifiable information in your country (in some countries we may allow your parent or guardian to do so on your behalf).
          </p>
        </Section>

        <Section title="Security">
          <p className="text-text-secondary leading-relaxed">
            The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.
          </p>
        </Section>

        <Section title="Changes">
          <p className="text-text-secondary leading-relaxed">
            This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
          </p>
        </Section>

        <Section title="Your Consent">
          <p className="text-text-secondary leading-relaxed">
            By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.
          </p>
        </Section>

        <Section title="Contact Us">
          <p className="text-text-secondary leading-relaxed">
            If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at{' '}
            <a href="mailto:metawaste03@gmail.com" className="text-primary hover:underline">metawaste03@gmail.com</a>.
          </p>
        </Section>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="text-base font-bold text-text-primary mb-2">{title}</h2>
    {children}
  </div>
);

export default PrivacyPolicyScreen;
