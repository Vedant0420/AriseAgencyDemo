"use client";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";

// DEMO VERSION - All content is generic placeholder data for showcase purposes

const services = [
  {
    title: "Service One",
    description: "A structured approach to help you achieve your business objectives.",
    deliverables: [
      "Initial consultation & analysis",
      "Strategic planning & roadmap",
      "Implementation support",
      "Monthly progress reviews",
    ],
  },
  {
    title: "Service Two",
    description: "Professional solutions tailored to your specific needs and goals.",
    deliverables: [
      "Custom assessment",
      "Expert guidance",
      "Ongoing support",
      "Quality assurance",
    ],
  },
  {
    title: "Service Three",
    description: "Complete support so you can focus on your core business activities.",
    deliverables: [
      "End-to-end management",
      "Regular reporting",
      "Performance metrics",
      "Optimization recommendations",
    ],
  },
];

const testimonials = [
  {
    quote:
      "Great experience working with this agency. They provided excellent service and professional support throughout the project.",
    name: "Demo Client One",
    role: "Business Owner",
  },
  {
    quote:
      "Highly recommend. The team was responsive, knowledgeable, and delivered results that exceeded expectations.",
    name: "Demo Client Two",
    role: "Marketing Manager",
  },
];

export default function Home() {
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    if (!db) return;
    
    const unsubscribe = onSnapshot(doc(db, "content", "main"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setShowReviews(data.showReviews !== false);
      }
    }, (error) => {
      console.error("Error listening to content:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-neutral-50 text-neutral-900">

      {/* Hero */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-block text-blue-700 text-sm font-semibold tracking-wide uppercase mb-6">
              Professional Services
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight mb-6">
              Grow Your Business.<br />
              Build Your Brand.<br />
              <span className="text-blue-700">Achieve Your Goals.</span>
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed mb-10 max-w-2xl">
              We provide comprehensive professional services designed to help your business succeed and grow. Strategic planning, expert guidance, and proven solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center bg-blue-700 text-white px-7 py-3.5 text-sm font-semibold rounded-md hover:bg-blue-800 transition-colors duration-200"
              >
                Get in Touch
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center border border-neutral-300 text-neutral-700 px-7 py-3.5 text-sm font-semibold rounded-md hover:bg-neutral-100 hover:border-neutral-400 transition-all duration-200"
              >
                View Services
              </Link>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-neutral-100 flex flex-col sm:flex-row gap-8 sm:gap-16 animate-fade-up animation-delay-200">
            {[
              { stat: "50+", label: "Clients Served" },
              { stat: "95%", label: "Client Satisfaction" },
              { stat: "10+", label: "Years Experience" },
            ].map((item) => (
              <div key={item.stat}>
                <p className="text-2xl font-bold text-neutral-900">{item.stat}</p>
                <p className="text-sm text-neutral-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14 animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
              Our Services
            </h2>
            <p className="text-neutral-600 text-lg">Clear offerings. Professional solutions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div
                key={service.title}
                className={`bg-white border border-neutral-200 rounded-lg p-8 flex flex-col hover:shadow-md transition-shadow duration-200 animate-fade-up animation-delay-${(i + 1) * 100}`}
              >
                <h3 className="text-lg font-bold text-neutral-900 mb-2">{service.title}</h3>
                <p className="text-neutral-600 text-sm mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {service.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-sm text-neutral-700">
                      <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-neutral-100 pt-5">
                  <Link
                    href="/booking"
                    className="text-blue-700 text-sm font-semibold hover:text-blue-900 transition-colors duration-200"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-24 bg-white border-y border-neutral-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-5">
                Professional services built for your success.
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-8">
                We focus on delivering real value and measurable results. Our team brings expertise, dedication, and a commitment to your success.
              </p>
              <Link
                href="/about"
                className="text-blue-700 text-sm font-semibold hover:text-blue-900 transition-colors duration-200"
              >
                Learn about our approach
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-up animation-delay-200">
              {[
                { title: "Professional Team", body: "Experienced professionals dedicated to your success." },
                { title: "Custom Solutions", body: "Tailored services designed for your specific needs." },
                { title: "Transparent Process", body: "Clear communication and honest, upfront pricing." },
                { title: "Proven Track Record", body: "Consistent results and satisfied clients." },
              ].map((item) => (
                <div key={item.title} className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                  <p className="text-sm font-bold text-neutral-900 mb-1">{item.title}</p>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {showReviews && (
        <section className="py-24 bg-neutral-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-14 animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
                Client Feedback
              </h2>
              <p className="text-neutral-600 text-lg">What clients have to say.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((t, i) => (
                <div
                  key={t.name}
                  className={`bg-white border border-neutral-200 rounded-lg p-8 animate-fade-up animation-delay-${(i + 1) * 100}`}
                >
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-blue-600 fill-blue-600" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-neutral-700 leading-relaxed mb-6 text-[15px]">{t.quote}</p>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{t.name}</p>
                    <p className="text-sm text-neutral-500 mt-0.5">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-blue-700">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Ready to get started?
            </h2>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Reach out today and let us help you achieve your business goals. We're here to support your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center bg-white text-blue-700 px-7 py-3.5 text-sm font-semibold rounded-md hover:bg-blue-50 transition-colors duration-200"
              >
                Contact Us
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center border border-blue-500 text-white px-7 py-3.5 text-sm font-semibold rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
