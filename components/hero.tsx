"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, MapPin, Star } from "lucide-react"

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
    <section id="home" className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-peach-50">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f43f5e' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-1 text-rose-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
              <span className="ml-2 text-sm font-medium text-gray-600">Trusted by 500+ women</span>
            </div>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Pickup to
            <span className="text-rose-500"> Perfect Fit.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tailoring, alterations, and embroidery—scheduled around your day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={scrollToEnquiry}
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 font-medium"
            >
              Book Pickup
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToServices}
              className="px-8 py-3 border-rose-200 text-rose-700 hover:bg-rose-50 bg-transparent"
            >
              Browse Services
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <MapPin className="h-5 w-5 text-rose-500" />
              <span className="text-sm font-medium">Free Pickup & Delivery</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Clock className="h-5 w-5 text-rose-500" />
              <span className="text-sm font-medium">Quick Turnaround</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Star className="h-5 w-5 text-rose-500" />
              <span className="text-sm font-medium">Expert Craftsmanship</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
