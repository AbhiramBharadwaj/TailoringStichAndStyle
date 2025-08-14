"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Clock, Star } from "lucide-react"
import Image from "next/image"

export function Hero() {
  const scrollToEnquiry = () => {
    const element = document.getElementById("enquiry-form")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToServices = () => {
    const element = document.getElementById("services")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="home"
      className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-rose-50/30 via-white to-pink-50/20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              <span>Premium Tailoring Services</span>
            </div>

            <div className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Perfect Stitches for <span className="text-rose-400">Busy Women</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Professional tailoring, embroidery, and alterations delivered to your doorstep. Custom clothing that
                fits your busy lifestyle and personal style.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-rose-500" />
                </div>
                <span className="text-sm font-medium">Pickup & Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-rose-500" />
                </div>
                <span className="text-sm font-medium">Quick Turnaround</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={scrollToEnquiry}
                className="bg-rose-400 hover:bg-rose-500 text-white px-8 py-3 rounded-full font-medium"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={scrollToServices}
                className="text-gray-700 hover:text-rose-500 px-8 py-3 font-medium"
              >
                View Services
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Available Now</span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%2014%2C%202025%2C%2001_15_08%20PM-RtpFS0DvTeZ4lWi2RSTbsNddA5y67K.png"
                alt="Vintage miniature sewing machine on stacked books with warm lighting - Silaaighar Tailoring craftsmanship"
                width={600}
                height={500}
                className="w-full h-auto object-cover"
                priority
              />

              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg">
                <div className="text-3xl font-bold text-rose-500 mb-1">500+</div>
                <div className="text-sm text-gray-600 font-medium">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
