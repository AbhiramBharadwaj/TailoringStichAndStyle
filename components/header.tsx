"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Scissors } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-gray-900">Silaaighar</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-sm font-medium text-gray-700 hover:text-rose-500 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-sm font-medium text-gray-700 hover:text-rose-500 transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("enquiry")}
              className="text-sm font-medium text-gray-700 hover:text-rose-500 transition-colors"
            >
              Contact
            </button>
            <Button
              onClick={() => scrollToSection("enquiry")}
              className="bg-rose-400 hover:bg-rose-500 text-white px-6 py-2 rounded-full font-medium"
            >
              Get Quote
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection("home")}
                className="text-left text-sm font-medium text-gray-700 hover:text-rose-500 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="text-left text-sm font-medium text-gray-700 hover:text-rose-500 transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("enquiry")}
                className="text-left text-sm font-medium text-gray-700 hover:text-rose-500 transition-colors"
              >
                Contact
              </button>
              <Button
                onClick={() => scrollToSection("enquiry")}
                className="w-full bg-rose-400 hover:bg-rose-500 text-white rounded-full font-medium"
              >
                Get Quote
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
