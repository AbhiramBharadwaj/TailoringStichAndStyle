"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Testimonial {
  name: string
  city: string
  service: string
  rating: number
  quote: string
  photo: string
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    // Load testimonials data
    const loadTestimonials = async () => {
      try {
        const response = await fetch("/data/testimonials.json")
        const data = await response.json()
        setTestimonials(data)
      } catch (error) {
        console.error("Failed to load testimonials:", error)
      }
    }
    loadTestimonials()
  }, [])

  const scrollToEnquiry = () => {
    const enquirySection = document.getElementById("enquiry-form")
    if (enquirySection) {
      enquirySection.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-b from-rose-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">What Our Clients Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about our tailoring
            services.
          </p>
        </div>

        <div className="relative mb-8">
          <div className="flex animate-scroll gap-6">
            {/* First set of testimonials */}
            {testimonials.map((testimonial, index) => (
              <div key={`first-${index}`} className="flex-shrink-0 w-80">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {testimonials.map((testimonial, index) => (
              <div key={`second-${index}`} className="flex-shrink-0 w-80">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ready to experience our quality service?</p>
          <Button
            onClick={scrollToEnquiry}
            className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-medium transition-colors"
          >
            Book a Pickup
          </Button>
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Image
            src={testimonial.photo || "/placeholder.svg"}
            alt={`${testimonial.name} profile picture`}
            width={60}
            height={60}
            className="rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
            <p className="text-sm text-gray-600">{testimonial.city}</p>
            <Badge variant="secondary" className="mt-1 bg-rose-100 text-rose-700 text-xs">
              {testimonial.service}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3" aria-label={`${testimonial.rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>

        <blockquote className="text-gray-700 italic leading-relaxed">"{testimonial.quote}"</blockquote>
      </CardContent>
    </Card>
  )
}
