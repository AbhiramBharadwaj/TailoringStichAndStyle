"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ServiceCardProps {
  service: {
    slug: string
    title: string
    blurb: string
    bullets: string[]
    price: string
    eta: string
    image: string
    icon: string
    alt: string
  }
}

export function ServiceCard({ service }: ServiceCardProps) {
  const handleBookClick = () => {
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-rose-500 focus-within:ring-offset-2">
      {/* Image Header with Gradient Overlay */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={service.image || "/placeholder.svg"}
          alt={service.alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Service Icon */}
        <div className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-lg">
          {service.icon}
        </div>

        {/* Price and ETA Chips */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-900">
            From {service.price}
          </span>
          <span className="px-3 py-1 bg-rose-500/90 backdrop-blur-sm rounded-full text-sm font-medium text-white">
            ETA {service.eta}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{service.blurb}</p>

        {/* Key Bullets */}
        <ul className="space-y-2 mb-6">
          {service.bullets.map((bullet, index) => (
            <li key={index} className="flex items-center text-sm text-gray-700">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-3 flex-shrink-0" />
              {bullet}
            </li>
          ))}
        </ul>

        {/* Book Button */}
        <Button
          onClick={handleBookClick}
          size="sm"
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium"
        >
          Book Now
        </Button>
      </div>
    </div>
  )
}
