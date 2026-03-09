'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// DEMO VERSION - Generic placeholder content

interface Content {
  about?: {
    expertiseImage?: string;
    innovationImage?: string;
    resultsImage?: string;
  };
}

const values = [
  {
    title: 'Professional Expertise',
    description: 'We bring deep knowledge and proven methodologies to deliver solutions that work.',
    icon: (
      <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: 'Strategic Focus',
    description: 'Every decision is guided by clear goals and measurable outcomes that drive real results.',
    icon: (
      <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'Proven Results',
    description: 'We focus on outcomes that matter — performance metrics and tangible business impact.',
    icon: (
      <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
];

const stats = [
  { value: '50+', label: 'Happy clients' },
  { value: '95%', label: 'Satisfaction rate' },
  { value: '10+', label: 'Years of experience' },
];

export default function About() {
  const [, setContent] = useState<Content>({ about: {} });

  useEffect(() => {
    const fetchContent = async () => {
      if (!db) return;
      const contentDoc = await getDoc(doc(db, 'content', 'main'));
      if (contentDoc.exists()) {
        setContent(contentDoc.data() as Content);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">

        {/* Hero */}
        <div className="max-w-3xl mb-20 animate-fade-up">
          <span className="inline-block text-xs font-semibold text-blue-700 uppercase tracking-widest mb-4">About Us</span>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-6 leading-tight">
            Professional services that<br className="hidden md:block" /> deliver real value.
          </h1>
          <p className="text-neutral-600 text-lg leading-relaxed">
            We&apos;re committed to helping clients achieve their business goals through strategic planning, expert guidance, and proven solutions.
          </p>
        </div>

        {/* Story */}
        <div className="bg-white border border-neutral-200 rounded-lg p-10 mb-20 animate-fade-up animation-delay-100">
          <div className="max-w-3xl space-y-5 text-neutral-700 text-base leading-relaxed">
            <p>
              Our approach is grounded in research, best practices, and a deep understanding of what drives success in modern business.
            </p>
            <p>
              We work closely with our clients to develop customized strategies and implement solutions that align with their specific needs and objectives.
            </p>
            <p>
              We believe in transparency, accountability, and delivering measurable results that exceed expectations.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-20">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
              <p className="text-4xl font-bold text-neutral-900 mb-1">{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 animate-fade-up animation-delay-200">Our Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className={`bg-white border border-neutral-200 rounded-lg p-8 animate-fade-up animation-delay-${(i + 2) * 100}`}
              >
                <div className="w-11 h-11 bg-blue-50 rounded-md flex items-center justify-center mb-5">
                  {v.icon}
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-2">{v.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-700 rounded-lg px-10 py-14 text-center animate-fade-up animation-delay-400">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to work together?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Let&apos;s discuss how we can help you achieve your goals. Reach out today.
          </p>
          <Link
            href="/booking"
            className="inline-block bg-white text-blue-700 font-semibold text-sm px-8 py-3 rounded-md hover:bg-blue-50 transition-colors duration-200"
          >
            Get in Touch
          </Link>
        </div>

      </div>
    </div>
  );
}
