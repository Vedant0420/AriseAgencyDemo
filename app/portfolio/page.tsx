'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

// DEMO VERSION - Generic placeholder portfolio content

interface Content {
  portfolio: {
    item1: { type: 'image' | 'video'; url: string };
    item2: { type: 'image' | 'video'; url: string };
    item3: { type: 'image' | 'video'; url: string };
  };
}

export default function Portfolio() {
  const [content, setContent] = useState<Content>({
    portfolio: { item1: { type: 'image', url: '' }, item2: { type: 'image', url: '' }, item3: { type: 'image', url: '' } }
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

  const renderMedia = (item: { type: 'image' | 'video'; url: string }, title: string) => {
    if (!item.url) {
      return (
        <iframe
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title={title}
          className="w-full h-full rounded"
          allowFullScreen
        ></iframe>
      );
    }
    if (item.type === 'video') {
      return (
        <video
          src={item.url}
          title={title}
          className="w-full h-full rounded"
          controls
        ></video>
      );
    }
    return (
      <Image
        src={item.url}
        alt={title}
        width={400}
        height={300}
        className="w-full h-full object-cover rounded"
      />
    );
  };

  const items = [
    {
      key: 'item1' as const,
      title: 'Project One',
      description: 'A comprehensive project showcasing professional execution and attention to detail.',
      tag: 'Service A',
    },
    {
      key: 'item2' as const,
      title: 'Project Two',
      description: 'Demonstrating high-quality solutions and expert implementation of strategies.',
      tag: 'Service B',
    },
    {
      key: 'item3' as const,
      title: 'Project Three',
      description: 'Example work illustrating our approach and commitment to excellence.',
      tag: 'Service C',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-16 animate-fade-up">
          <span className="inline-block text-xs font-semibold text-blue-700 uppercase tracking-widest mb-4">Our Work</span>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
            Sample portfolio projects.
          </h1>
          <p className="text-neutral-600 text-lg max-w-2xl leading-relaxed">
            Examples of projects across our service offerings, demonstrating our approach and capabilities.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div
              key={item.key}
              className={`bg-white border border-neutral-200 rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 animate-fade-up animation-delay-${(i + 1) * 100}`}
            >
              <div className="aspect-video bg-neutral-100">
                {renderMedia(content.portfolio[item.key], item.title)}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="inline-block text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">{item.tag}</span>
                <h2 className="text-base font-bold text-neutral-900 mb-2">{item.title}</h2>
                <p className="text-neutral-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 bg-blue-700 rounded-lg px-10 py-14 text-center animate-fade-up animation-delay-400">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Interested in working together?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">Let&apos;s discuss how we can help achieve your goals.</p>
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
