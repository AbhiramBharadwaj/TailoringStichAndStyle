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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scissors className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold text-primary">Stitch & Style</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("enquiry")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Contact
            </button>
            <Button onClick={() => scrollToSection("enquiry")} className="bg-primary hover:bg-primary/90">
              Book Now
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection("home")}
                className="text-left text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="text-left text-sm font-medium hover:text-primary transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("enquiry")}
                className="text-left text-sm font-medium hover:text-primary transition-colors"
              >
                Contact
              </button>
              <Button onClick={() => scrollToSection("enquiry")} className="w-full bg-primary hover:bg-primary/90">
                Book Now
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
