'use client';

import { useState } from 'react';

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(() => {
    // Check if user has already accepted the disclaimer
    if (typeof window === 'undefined') return null;
    const hasAccepted = localStorage.getItem('disclaimerAccepted');
    return !hasAccepted;
  });

  const handleProceed = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setIsOpen(false);
  };

  if (isOpen === null) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-8">
          <h1 className="text-3xl font-bold">Important Disclaimer</h1>
          <p className="text-blue-100 mt-2">Please read before proceeding</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Demo Showcase Notice</h2>
            <p className="text-neutral-700 leading-relaxed">
              This is a <strong>demonstration/portfolio project</strong> created for showcase purposes only. 
              All content, including services, portfolio items, testimonials, and case studies are 
              <strong> placeholder/generic demo data</strong> and do not represent any real business, 
              clients, or actual work.
            </p>
          </section>

          <section className="border-l-4 border-blue-700 pl-4">
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Intellectual Property Rights</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              <strong>Unauthorized use, copying, reproduction, or distribution of any part of this project 
              is strictly prohibited.</strong> This includes but is not limited to:
            </p>
            <ul className="text-neutral-700 space-y-2 ml-4">
              <li>• Design, layout, and styling</li>
              <li>• Source code and functionality</li>
              <li>• Content and copy</li>
              <li>• Images and media assets</li>
              <li>• Database structures and configurations</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Unauthorized use may result in legal action. If you wish to use this project or 
              create something similar, please contact the author for permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Terms of Use</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              This demonstration is provided &quot;as-is&quot; for viewing and educational purposes only. 
              By proceeding, you agree that you:
            </p>
            <ul className="text-neutral-700 space-y-2 ml-4">
              <li>• Will not copy, reproduce, or distribute this project or any of its components</li>
              <li>• Will not use this as a basis for your own projects without explicit permission</li>
              <li>• Will not claim ownership of any part of this work</li>
              <li>• Understand that the author retains all intellectual property rights</li>
              <li>• Accept that any unauthorized use may result in legal consequences</li>
            </ul>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-bold text-blue-900 mb-2">Demo Content</h2>
            <p className="text-blue-800 text-sm">
              All data in this project is purely fictional and created for demonstration purposes. 
              Any resemblance to real businesses, services, or individuals is coincidental.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Contact</h2>
            <p className="text-neutral-700 leading-relaxed">
              For inquiries, permissions, or if you believe your intellectual property rights have been 
              violated, please contact the author.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-neutral-100 px-8 py-6 flex gap-4 justify-end border-t">
          <button
            onClick={handleProceed}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105"
          >
            I Understand & Proceed to Demo
          </button>
        </div>
      </div>
    </div>
  );
}
