import { services } from "@/data/services"
import { ServiceCard } from "./service-card"

export function ServicesGrid() {
  return (
    <div className="space-y-8">
      {/* Desktop/Tablet Grid */}
      <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
          {services.map((service) => (
            <div key={service.slug} className="flex-none w-80 snap-start">
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
