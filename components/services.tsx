"use client"

import { ServicesGrid } from "./services-grid"

export function Services() {
  const handleCTAClick = () => {
    const form = document.getElementById("enquiry-form")
    const fileInput = form?.querySelector('input[type="file"]')
    form?.scrollIntoView({ behavior: "smooth" })
    // Focus on file input after scroll
    setTimeout(() => fileInput?.focus(), 500)
  }

  return (
    <section id="services" className="py-16 sm:py-24 bg-gradient-to-b from-rose-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tailoring that meets your calendar.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From pickups after work to 48-hour alterations, we fit around your day.
          </p>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto mb-12">
          <ServicesGrid />
        </div>

        {/* CTA Row */}
        <div className="text-center">
          <div
            className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={handleCTAClick}
          >
            <span className="text-gray-700 font-medium">Not sure what you need? Send a photo</span>
            <span className="text-rose-500 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </section>
  )
}
