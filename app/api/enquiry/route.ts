import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Validate required fields
    const { name, phone, serviceType, pickupDate, timeWindow, pickupMethod } = formData

    if (!name || !phone || !serviceType || !pickupDate || !timeWindow || !pickupMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (pickupMethod === "pickup-from-home" && !formData.pickupAddress) {
      return NextResponse.json({ error: "Pickup address is required for home pickup" }, { status: 400 })
    }

    const serviceDetails = formData.serviceDetails?.[serviceType]
    if (!serviceDetails) {
      return NextResponse.json({ error: "Service-specific details are required" }, { status: 400 })
    }

    // Service-specific validation
    switch (serviceType) {
      case "stitching":
        if (!serviceDetails.garmentType || !serviceDetails.fabricType) {
          return NextResponse.json(
            { error: "Garment type and fabric type are required for stitching" },
            { status: 400 },
          )
        }
        break
      case "embroidery":
        if (!serviceDetails.embroideryType || !serviceDetails.placement) {
          return NextResponse.json({ error: "Embroidery type and placement are required" }, { status: 400 })
        }
        break
      case "alteration":
        if (!serviceDetails.garmentType || !serviceDetails.changes?.length) {
          return NextResponse.json({ error: "Garment type and changes are required for alterations" }, { status: 400 })
        }
        break
      case "repair":
        if (!serviceDetails.issueType || !serviceDetails.area) {
          return NextResponse.json({ error: "Issue type and area are required for repairs" }, { status: 400 })
        }
        break
      case "saree":
        if (!serviceDetails.type || !serviceDetails.material) {
          return NextResponse.json({ error: "Type and material are required for saree work" }, { status: 400 })
        }
        break
    }

    console.log("New enquiry received:", {
      customer: { name, phone, email: formData.email },
      service: { type: serviceType, urgency: formData.urgency },
      pickup: {
        method: pickupMethod,
        date: pickupDate,
        timeWindow,
        address: formData.pickupAddress,
      },
      serviceDetails,
      hasPhotos: formData.referencePhotos?.length > 0,
      notes: formData.notes,
    })

    // Here you would typically:
    // 1. Save to database (when integration is added)
    // 2. Send email notification with service details
    // 3. Send SMS confirmation
    // 4. Process uploaded reference photos
    // 5. Calculate pricing based on service complexity and urgency

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(
      {
        message: "Enquiry submitted successfully",
        enquiryId: `ENQ-${Date.now()}`,
        service: serviceType,
        pickupDate,
        urgency: formData.urgency,
        estimatedResponse: "We'll contact you within 24 hours to confirm details",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error processing enquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
