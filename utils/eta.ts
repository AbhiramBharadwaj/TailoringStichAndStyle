export interface ETAParams {
  serviceType: string
  urgency: string
  pickupDateTime: string
}

export function suggestETA(serviceType: string, urgency: string, pickupDateTime: string): string {
  const baseDurations: Record<string, { min: number; max: number }> = {
    "Custom Stitching": { min: 3, max: 5 },
    Embroidery: { min: 4, max: 7 },
    Alteration: { min: 1, max: 2 },
    "Repair & Patching": { min: 1, max: 3 },
    "Saree Fall & Edging": { min: 1, max: 2 },
    "Blouse Design": { min: 3, max: 5 },
  }

  const service = baseDurations[serviceType] || { min: 2, max: 4 }
  let estimatedDays = Math.ceil((service.min + service.max) / 2)

  // Express reduces by 1 day, minimum 1 day
  if (urgency === "Express") {
    estimatedDays = Math.max(1, estimatedDays - 1)
  }

  const pickupDate = new Date(pickupDateTime)
  const deliveryDate = new Date(pickupDate)
  deliveryDate.setDate(deliveryDate.getDate() + estimatedDays)

  return deliveryDate.toISOString().split("T")[0] // Return YYYY-MM-DD format
}
