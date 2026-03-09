'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// DEMO VERSION - Generic placeholder content for showcase

interface Content {
  services: {
    contentStrategyImage: string;
    videoEditingImage: string;
    creatorManagementImage: string;
  };
}

const services = [
  {
    key: 'contentStrategyImage' as const,
    title: 'Service Package A',
    description: 'Comprehensive strategic guidance aligned with your business objectives.',
    deliverables: [
      'Initial assessment and planning',
      'Strategic roadmap development',
      'Implementation framework',
      'Regular progress reviews',
    ],
    defaultImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
  },
  {
    key: 'videoEditingImage' as const,
    title: 'Service Package B',
    description: 'Professional support and expert guidance for optimal results.',
    deliverables: [
      'Expert consultation',
      'Custom solutions',
      'Quality assurance',
      'Ongoing support',
    ],
    defaultImage: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=600&fit=crop',
  },
  {
    key: 'creatorManagementImage' as const,
    title: 'Service Package C',
    description: 'End-to-end management and support for your complete success.',
    deliverables: [
      'Full-service management',
      'Performance tracking',
      'Strategic recommendations',
      'Continuous optimization',
    ],
    defaultImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
  },
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Services() {
  const [content, setContent] = useState<Content>({
    services: { contentStrategyImage: '', videoEditingImage: '', creatorManagementImage: '' }
  });

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

        {/* Header */}
        <div className="mb-16 animate-fade-up">
          <span className="inline-block text-xs font-semibold text-blue-700 uppercase tracking-widest mb-4">Our Services</span>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
            Professional services<br className="hidden md:block" /> tailored to your needs.
          </h1>
          <p className="text-neutral-600 text-lg max-w-2xl leading-relaxed">
            We offer comprehensive solutions designed to help you achieve your business goals and maximize your success.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const imageUrl = content.services[service.key];
            return (
              <div
                key={service.title}
                className={`bg-white border border-neutral-200 rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 animate-fade-up animation-delay-${(i + 1) * 100}`}
              >
                {/* Image slot */}
                <div className="relative h-52 bg-neutral-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={service.title}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                  ) : (
                    <Image
                      src={service.defaultImage}
                      alt={service.title}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <h2 className="text-lg font-bold text-neutral-900 mb-2">{service.title}</h2>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-6">{service.description}</p>
                  <ul className="space-y-2.5 flex-1 mb-8">
                    {service.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2.5 text-sm text-neutral-700">
                        <CheckIcon />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-neutral-100 pt-5">
                    <Link
                      href="/booking"
                      className="text-blue-700 text-sm font-semibold hover:text-blue-900 transition-colors duration-200"
                    >
                      Learn more →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-20 bg-blue-700 rounded-lg px-10 py-14 text-center animate-fade-up animation-delay-400">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">Reach out and let us help you achieve your goals.</p>
          <a
            href="/booking"
            className="inline-block bg-white text-blue-700 font-semibold text-sm px-8 py-3 rounded-md hover:bg-blue-50 transition-colors duration-200"
          >
            Get in Touch
          </a>
        </div>

      </div>
    </div>
  );
}
