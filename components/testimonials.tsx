"use client"

import { useState, useEffect } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
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
  const [currentIndex, setCurrentIndex] = useState(0)

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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

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
    <section className="py-16 bg-gradient-to-b from-rose-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">What Our Clients Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about our tailoring
            services.
          </p>
        </div>

        {/* Desktop Grid (3 per row) */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden relative mb-8">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full bg-transparent"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-rose-500" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full bg-transparent"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
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
