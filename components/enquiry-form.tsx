"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Calendar, MapPin, User, Camera } from "lucide-react"
import { suggestETA } from "@/utils/eta"

interface FormData {
  // Contact
  fullName: string
  phone: string
  whatsappSame: boolean
  email: string
  cityArea: string

  // Service
  serviceType: string

  // Pickup & Timing
  pickupMethod: string
  pickupAddress: string
  preferredWindow: string
  urgency: string
  eventDate: string

  // Attachments & Notes
  referencePhotos: File[]
  notes: string

  // Dynamic service-specific fields
  serviceDetails: {
    customStitching?: {
      garmentType: string
      fabricType: string
      fabricProvided: string
      needFabricSourcing: boolean
      budgetRange: string
      liningNeeded: string
      fitPreference: string
      takeMeasurementsDuringPickup: boolean
      measurements: {
        bust: string
        underbust: string
        waist: string
        hip: string
        shoulderWidth: string
        armhole: string
        sleeveLength: string
        topLength: string
        rise: string
        inseam: string
        outseam: string
        hemOpening: string
      }
      designDetails: {
        neckline: string
        sleeveStyle: string
        opening: string
        pockets: string
        slit: string
        slitLength: string
      }
      styleReferenceLink: string
      finishing: {
        interfacing: string
        seamType: string
        hemType: string
      }
    }
    embroidery?: {
      technique: string
      placement: string
      coverage: string
      embellishments: string
      colorPalette: string
      designReferenceLink: string
      fabricThickness: string
      areaWidth: string
      areaHeight: string
      backingCloth: boolean
      liningAdd: boolean
    }
    alteration?: {
      garmentType: string
      requiredChanges: string[]
      lengthChange: string
      lengthAmount: string
      lengthHemType: string
      fitAreas: string[]
      fitAmounts: Record<string, string>
      sleeveChange: string
      sleeveAmount: string
      waistbandAdjust: boolean
      waistbandType: string
      waistbandNewWaist: string
      zipRepair: boolean
      zipLength: string
      buttonRepair: boolean
      buttonCount: string
      currentVsDesired: string
    }
    repair?: {
      issue: string
      location: string
      openingSize: string
      patchStyle: string
      matchingFabricAvailable: string
      fabricPieceSize: string
      durabilityPreference: string
      topstitch: boolean
      edgeBind: boolean
    }
    saree?: {
      workType: string
      sareeMaterial: string
      threadMatch: string
      blouseWorkAlso: boolean
      blouseNeckStyle: string
      blouseSleeveType: string
      blousePadding: boolean
      palluFinishing: string
      preserveZari: boolean
    }
    blouse?: {
      neckStyle: string
      backStyle: string
      sleeve: string
      padding: string
      opening: string
      takeMeasurementsDuringPickup: boolean
      measurements: {
        bust: string
        underbust: string
        waist: string
        shoulder: string
        armhole: string
        sleeveLength: string
        blouseLength: string
      }
      embellishments: string
      pipingColor: string
      hemType: string
    }
  }
}

const initialFormData: FormData = {
  fullName: "",
  phone: "",
  whatsappSame: true,
  email: "",
  cityArea: "",
  serviceType: "",
  pickupMethod: "",
  pickupAddress: "",
  preferredWindow: "",
  urgency: "",
  eventDate: "",
  referencePhotos: [],
  notes: "",
  serviceDetails: {},
}

export function EnquiryForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const saved = localStorage.getItem("enquiryForm_v1")
    if (saved) {
      try {
        const parsedData = JSON.parse(saved)
        setFormData(parsedData)
      } catch (e) {
        console.error("Failed to parse saved form data")
      }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("enquiryForm_v1", JSON.stringify(formData))
    }, 2000)
    return () => clearTimeout(timer)
  }, [formData])

  useEffect(() => {
    if (formData.serviceType && formData.urgency && formData.preferredWindow) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const pickupDateTime = tomorrow.toISOString()
      const eta = suggestETA(formData.serviceType, formData.urgency, pickupDateTime)
      setEstimatedDelivery(eta)
    }
  }, [formData.serviceType, formData.urgency, formData.preferredWindow])

  const handleInputChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => {
        const keys = field.split(".")
        const newData = { ...prev }
        let current: any = newData

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {}
          current = current[keys[i]]
        }

        current[keys[keys.length - 1]] = value
        return newData
      })

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }))
      }
    },
    [errors],
  )

  const handleArrayChange = useCallback((field: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const keys = field.split(".")
      const newData = { ...prev }
      let current: any = newData

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }

      const currentArray = current[keys[keys.length - 1]] || []
      if (checked) {
        current[keys[keys.length - 1]] = [...currentArray, value]
      } else {
        current[keys[keys.length - 1]] = currentArray.filter((item: string) => item !== value)
      }

      return newData
    })
  }, [])

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const validFiles = Array.from(files).filter((file) => {
        const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type)
        const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
        return isValidType && isValidSize
      })

      if (validFiles.length + formData.referencePhotos.length > 3) {
        toast({
          title: "Too many files",
          description: "You can upload maximum 3 photos",
          variant: "destructive",
        })
        return
      }

      setFormData((prev) => ({
        ...prev,
        referencePhotos: [...prev.referencePhotos, ...validFiles],
      }))
    },
    [formData.referencePhotos.length, toast],
  )

  const removePhoto = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      referencePhotos: prev.referencePhotos.filter((_, i) => i !== index),
    }))
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    else if (!/^[+]?[\d\s]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number (10-15 digits)"
    }
    if (!formData.cityArea.trim()) newErrors.cityArea = "City/Area is required"
    if (!formData.serviceType) newErrors.serviceType = "Service type is required"
    if (!formData.pickupMethod) newErrors.pickupMethod = "Pickup method is required"
    if (
      (formData.pickupMethod === "Pickup from home" || formData.pickupMethod === "Both") &&
      !formData.pickupAddress.trim()
    ) {
      newErrors.pickupAddress = "Pickup address is required"
    }
    if (!formData.preferredWindow) newErrors.preferredWindow = "Preferred pickup window is required"
    if (!formData.urgency) newErrors.urgency = "Urgency is required"

    // Service-specific validation
    const serviceDetails = formData.serviceDetails
    switch (formData.serviceType) {
      case "Custom Stitching":
        if (!serviceDetails.customStitching?.garmentType)
          newErrors["serviceDetails.customStitching.garmentType"] = "Garment type is required"
        if (!serviceDetails.customStitching?.fabricType)
          newErrors["serviceDetails.customStitching.fabricType"] = "Fabric type is required"
        if (!serviceDetails.customStitching?.fabricProvided)
          newErrors["serviceDetails.customStitching.fabricProvided"] = "Please specify if fabric is provided"
        if (!serviceDetails.customStitching?.liningNeeded)
          newErrors["serviceDetails.customStitching.liningNeeded"] = "Please specify if lining is needed"
        if (!serviceDetails.customStitching?.fitPreference)
          newErrors["serviceDetails.customStitching.fitPreference"] = "Fit preference is required"
        break
      case "Embroidery":
        if (!serviceDetails.embroidery?.technique)
          newErrors["serviceDetails.embroidery.technique"] = "Technique is required"
        if (!serviceDetails.embroidery?.placement)
          newErrors["serviceDetails.embroidery.placement"] = "Placement is required"
        if (!serviceDetails.embroidery?.coverage)
          newErrors["serviceDetails.embroidery.coverage"] = "Coverage is required"
        if (!serviceDetails.embroidery?.embellishments)
          newErrors["serviceDetails.embroidery.embellishments"] = "Embellishments selection is required"
        if (!serviceDetails.embroidery?.fabricThickness)
          newErrors["serviceDetails.embroidery.fabricThickness"] = "Fabric thickness is required"
        break
      case "Alteration":
        if (!serviceDetails.alteration?.garmentType)
          newErrors["serviceDetails.alteration.garmentType"] = "Garment type is required"
        if (!serviceDetails.alteration?.requiredChanges?.length)
          newErrors["serviceDetails.alteration.requiredChanges"] = "At least one change is required"
        break
      case "Repair & Patching":
        if (!serviceDetails.repair?.issue) newErrors["serviceDetails.repair.issue"] = "Issue type is required"
        if (!serviceDetails.repair?.location?.trim())
          newErrors["serviceDetails.repair.location"] = "Location is required"
        if (!serviceDetails.repair?.openingSize)
          newErrors["serviceDetails.repair.openingSize"] = "Opening size is required"
        if (!serviceDetails.repair?.patchStyle)
          newErrors["serviceDetails.repair.patchStyle"] = "Patch style is required"
        if (!serviceDetails.repair?.matchingFabricAvailable)
          newErrors["serviceDetails.repair.matchingFabricAvailable"] = "Matching fabric availability is required"
        if (!serviceDetails.repair?.durabilityPreference)
          newErrors["serviceDetails.repair.durabilityPreference"] = "Durability preference is required"
        break
      case "Saree Fall & Edging":
        if (!serviceDetails.saree?.workType) newErrors["serviceDetails.saree.workType"] = "Work type is required"
        if (!serviceDetails.saree?.sareeMaterial)
          newErrors["serviceDetails.saree.sareeMaterial"] = "Saree material is required"
        if (!serviceDetails.saree?.threadMatch)
          newErrors["serviceDetails.saree.threadMatch"] = "Thread match preference is required"
        break
      case "Blouse Design":
        if (!serviceDetails.blouse?.neckStyle) newErrors["serviceDetails.blouse.neckStyle"] = "Neck style is required"
        if (!serviceDetails.blouse?.backStyle) newErrors["serviceDetails.blouse.backStyle"] = "Back style is required"
        if (!serviceDetails.blouse?.sleeve) newErrors["serviceDetails.blouse.sleeve"] = "Sleeve type is required"
        if (!serviceDetails.blouse?.padding)
          newErrors["serviceDetails.blouse.padding"] = "Padding preference is required"
        if (!serviceDetails.blouse?.opening) newErrors["serviceDetails.blouse.opening"] = "Opening type is required"
        if (!serviceDetails.blouse?.embellishments)
          newErrors["serviceDetails.blouse.embellishments"] = "Embellishments selection is required"
        break
    }

    setErrors(newErrors)

    // Scroll to first error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0]
      const element =
        document.querySelector(`[data-field="${firstErrorField}"]`) || document.querySelector(`#${firstErrorField}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        if (element instanceof HTMLElement) element.focus()
      }
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "referencePhotos") {
          formData.referencePhotos.forEach((file, index) => {
            formDataToSend.append(`referencePhoto_${index}`, file)
          })
        } else if (key === "serviceDetails") {
          formDataToSend.append("serviceDetails", JSON.stringify(value))
        } else {
          formDataToSend.append(key, String(value))
        }
      })

      const response = await fetch("/api/enquiry", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) throw new Error("Failed to submit enquiry")

      const result = await response.json()

      toast({
        title: "Enquiry Submitted Successfully!",
        description: `We'll contact you within 2 hours. Estimated delivery: ${estimatedDelivery}`,
      })

      // Clear form and localStorage
      setFormData(initialFormData)
      localStorage.removeItem("enquiryForm_v1")
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or call us directly.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.fullName &&
    formData.phone &&
    formData.cityArea &&
    formData.serviceType &&
    formData.pickupMethod &&
    formData.preferredWindow &&
    formData.urgency &&
    ((formData.pickupMethod !== "Pickup from home" && formData.pickupMethod !== "Both") || formData.pickupAddress)

  return (
    <section id="enquiry" className="py-16 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Book Your Service</h2>
            <p className="text-gray-600">Tell us about your requirements and we'll take care of the rest</p>
            {estimatedDelivery && (
              <Badge variant="secondary" className="mt-2">
                <Calendar className="w-4 h-4 mr-1" />
                Estimated Delivery: {new Date(estimatedDelivery).toLocaleDateString()}
              </Badge>
            )}
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        data-field="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="Enter your full name"
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                      {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        data-field="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      <p className="text-xs text-gray-500">10-15 digits, + and spaces allowed</p>
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}

                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id="whatsappSame"
                          checked={formData.whatsappSame}
                          onCheckedChange={(checked) => handleInputChange("whatsappSame", checked)}
                        />
                        <Label htmlFor="whatsappSame" className="text-sm">
                          Same number for WhatsApp
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                      />
                      <p className="text-xs text-gray-500">Optional</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cityArea">City/Area *</Label>
                      <Input
                        id="cityArea"
                        data-field="cityArea"
                        value={formData.cityArea}
                        onChange={(e) => handleInputChange("cityArea", e.target.value)}
                        placeholder="Enter your city or area"
                        className={errors.cityArea ? "border-red-500" : ""}
                      />
                      {errors.cityArea && <p className="text-sm text-red-500">{errors.cityArea}</p>}
                    </div>
                  </div>
                </div>

                {/* Service Type Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Service Type</h3>

                  <div className="space-y-2">
                    <Label htmlFor="serviceType">What service do you need? *</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => handleInputChange("serviceType", value)}
                    >
                      <SelectTrigger data-field="serviceType" className={errors.serviceType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Custom Stitching">Custom Stitching</SelectItem>
                        <SelectItem value="Embroidery">Embroidery</SelectItem>
                        <SelectItem value="Alteration">Alteration</SelectItem>
                        <SelectItem value="Repair & Patching">Repair & Patching</SelectItem>
                        <SelectItem value="Saree Fall & Edging">Saree Fall & Edging</SelectItem>
                        <SelectItem value="Blouse Design">Blouse Design</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.serviceType && <p className="text-sm text-red-500">{errors.serviceType}</p>}
                  </div>
                </div>

                {/* Dynamic Service Fields */}
                {formData.serviceType && (
                  <div className="space-y-4 p-4 bg-rose-50 rounded-lg border-l-4 border-rose-400">
                    {formData.serviceType === "Custom Stitching" && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Custom Stitching Details</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Garment Type *</Label>
                            <Select
                              onValueChange={(value) =>
                                handleInputChange("serviceDetails.customStitching.garmentType", value)
                              }
                            >
                              <SelectTrigger
                                data-field="serviceDetails.customStitching.garmentType"
                                className={errors["serviceDetails.customStitching.garmentType"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select garment" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Kurti">Kurti</SelectItem>
                                <SelectItem value="Blouse">Blouse</SelectItem>
                                <SelectItem value="Salwar">Salwar</SelectItem>
                                <SelectItem value="Lehenga">Lehenga</SelectItem>
                                <SelectItem value="Gown">Gown</SelectItem>
                                <SelectItem value="Shirt">Shirt</SelectItem>
                                <SelectItem value="Trousers">Trousers</SelectItem>
                                <SelectItem value="Kidswear">Kidswear</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.customStitching.garmentType"] && (
                              <p className="text-sm text-red-500">
                                {errors["serviceDetails.customStitching.garmentType"]}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Fabric Type *</Label>
                            <Select
                              onValueChange={(value) =>
                                handleInputChange("serviceDetails.customStitching.fabricType", value)
                              }
                            >
                              <SelectTrigger
                                data-field="serviceDetails.customStitching.fabricType"
                                className={errors["serviceDetails.customStitching.fabricType"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select fabric" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cotton">Cotton</SelectItem>
                                <SelectItem value="Silk">Silk</SelectItem>
                                <SelectItem value="Chiffon">Chiffon</SelectItem>
                                <SelectItem value="Georgette">Georgette</SelectItem>
                                <SelectItem value="Linen">Linen</SelectItem>
                                <SelectItem value="Denim">Denim</SelectItem>
                                <SelectItem value="Mixed">Mixed</SelectItem>
                                <SelectItem value="Not sure">Not sure</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.customStitching.fabricType"] && (
                              <p className="text-sm text-red-500">
                                {errors["serviceDetails.customStitching.fabricType"]}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Fabric Provided? *</Label>
                            <Select
                              onValueChange={(value) =>
                                handleInputChange("serviceDetails.customStitching.fabricProvided", value)
                              }
                            >
                              <SelectTrigger
                                data-field="serviceDetails.customStitching.fabricProvided"
                                className={
                                  errors["serviceDetails.customStitching.fabricProvided"] ? "border-red-500" : ""
                                }
                              >
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.customStitching.fabricProvided"] && (
                              <p className="text-sm text-red-500">
                                {errors["serviceDetails.customStitching.fabricProvided"]}
                              </p>
                            )}
                          </div>

                          {formData.serviceDetails.customStitching?.fabricProvided === "No" && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="needFabricSourcing"
                                  checked={formData.serviceDetails.customStitching?.needFabricSourcing || false}
                                  onCheckedChange={(checked) =>
                                    handleInputChange("serviceDetails.customStitching.needFabricSourcing", checked)
                                  }
                                />
                                <Label htmlFor="needFabricSourcing">Need fabric sourcing</Label>
                              </div>
                              {formData.serviceDetails.customStitching?.needFabricSourcing && (
                                <Input
                                  placeholder="Budget range (₹)"
                                  value={formData.serviceDetails.customStitching?.budgetRange || ""}
                                  onChange={(e) =>
                                    handleInputChange("serviceDetails.customStitching.budgetRange", e.target.value)
                                  }
                                />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Lining Needed? *</Label>
                            <Select
                              onValueChange={(value) =>
                                handleInputChange("serviceDetails.customStitching.liningNeeded", value)
                              }
                            >
                              <SelectTrigger
                                data-field="serviceDetails.customStitching.liningNeeded"
                                className={
                                  errors["serviceDetails.customStitching.liningNeeded"] ? "border-red-500" : ""
                                }
                              >
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.customStitching.liningNeeded"] && (
                              <p className="text-sm text-red-500">
                                {errors["serviceDetails.customStitching.liningNeeded"]}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Fit Preference *</Label>
                            <Select
                              onValueChange={(value) =>
                                handleInputChange("serviceDetails.customStitching.fitPreference", value)
                              }
                            >
                              <SelectTrigger
                                data-field="serviceDetails.customStitching.fitPreference"
                                className={
                                  errors["serviceDetails.customStitching.fitPreference"] ? "border-red-500" : ""
                                }
                              >
                                <SelectValue placeholder="Select fit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Snug">Snug</SelectItem>
                                <SelectItem value="Regular">Regular</SelectItem>
                                <SelectItem value="Relaxed">Relaxed</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.customStitching.fitPreference"] && (
                              <p className="text-sm text-red-500">
                                {errors["serviceDetails.customStitching.fitPreference"]}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Measurements Toggle */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="takeMeasurementsDuringPickup"
                              checked={formData.serviceDetails.customStitching?.takeMeasurementsDuringPickup || false}
                              onCheckedChange={(checked) =>
                                handleInputChange(
                                  "serviceDetails.customStitching.takeMeasurementsDuringPickup",
                                  checked,
                                )
                              }
                            />
                            <Label htmlFor="takeMeasurementsDuringPickup">Take measurements during pickup</Label>
                          </div>

                          {!formData.serviceDetails.customStitching?.takeMeasurementsDuringPickup && (
                            <div className="space-y-4 p-4 bg-white rounded border">
                              <h5 className="font-medium">Measurements (cm)</h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                  "bust",
                                  "underbust",
                                  "waist",
                                  "hip",
                                  "shoulderWidth",
                                  "armhole",
                                  "sleeveLength",
                                  "topLength",
                                ].map((field) => (
                                  <div key={field} className="space-y-1">
                                    <Label className="text-sm capitalize">{field.replace(/([A-Z])/g, " $1")}</Label>
                                    <div className="relative">
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={
                                          formData.serviceDetails.customStitching?.measurements?.[
                                            field as keyof typeof formData.serviceDetails.customStitching.measurements
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            `serviceDetails.customStitching.measurements.${field}`,
                                            e.target.value,
                                          )
                                        }
                                      />
                                      <span className="absolute right-2 top-2 text-xs text-gray-500">cm</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {formData.serviceType === "Embroidery" && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Embroidery Details</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Technique *</Label>
                            <Select
                              onValueChange={(value) => handleInputChange("serviceDetails.embroidery.technique", value)}
                            >
                              <SelectTrigger
                                data-field="serviceDetails.embroidery.technique"
                                className={errors["serviceDetails.embroidery.technique"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select technique" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Hand">Hand</SelectItem>
                                <SelectItem value="Machine">Machine</SelectItem>
                                <SelectItem value="Aari">Aari</SelectItem>
                                <SelectItem value="Zardozi">Zardozi</SelectItem>
                                <SelectItem value="Appliqué">Appliqué</SelectItem>
                                <SelectItem value="Custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.embroidery.technique"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.embroidery.technique"]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Placement *</Label>
                            <Select
                              onValueChange={(value) => handleInputChange("serviceDetails.embroidery.placement", value)}
                            >
                              <SelectTrigger
                                data-field="serviceDetails.embroidery.placement"
                                className={errors["serviceDetails.embroidery.placement"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select placement" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Neckline">Neckline</SelectItem>
                                <SelectItem value="Sleeves">Sleeves</SelectItem>
                                <SelectItem value="Hem">Hem</SelectItem>
                                <SelectItem value="Dupatta border">Dupatta border</SelectItem>
                                <SelectItem value="Front panel">Front panel</SelectItem>
                                <SelectItem value="Full panel">Full panel</SelectItem>
                                <SelectItem value="Custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.embroidery.placement"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.embroidery.placement"]}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Coverage/Density *</Label>
                            <Select
                              onValueChange={(value) => handleInputChange("serviceDetails.embroidery.coverage", value)}
                            >
                              <SelectTrigger
                                data-field="serviceDetails.embroidery.coverage"
                                className={errors["serviceDetails.embroidery.coverage"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select coverage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Light">Light</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Heavy">Heavy</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.embroidery.coverage"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.embroidery.coverage"]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Embellishments *</Label>
                            <Select
                              onValueChange={(value) =>
                                handleInputChange("serviceDetails.embroidery.embellishments", value)
                              }
                            >
                              <SelectTrigger
                                data-field="serviceDetails.embroidery.embellishments"
                                className={errors["serviceDetails.embroidery.embellishments"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select embellishments" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Thread only">Thread only</SelectItem>
                                <SelectItem value="Sequins">Sequins</SelectItem>
                                <SelectItem value="Beads">Beads</SelectItem>
                                <SelectItem value="Stones">Stones</SelectItem>
                                <SelectItem value="Mix">Mix</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.embroidery.embellishments"] && (
                              <p className="text-sm text-red-500">
                                {errors["serviceDetails.embroidery.embellishments"]}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Color Palette</Label>
                          <Input
                            placeholder="Describe your preferred colors"
                            value={formData.serviceDetails.embroidery?.colorPalette || ""}
                            onChange={(e) =>
                              handleInputChange("serviceDetails.embroidery.colorPalette", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Design Reference Link</Label>
                          <Input
                            type="url"
                            placeholder="https://example.com/design-reference"
                            value={formData.serviceDetails.embroidery?.designReferenceLink || ""}
                            onChange={(e) =>
                              handleInputChange("serviceDetails.embroidery.designReferenceLink", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Fabric Thickness *</Label>
                          <Select
                            onValueChange={(value) =>
                              handleInputChange("serviceDetails.embroidery.fabricThickness", value)
                            }
                          >
                            <SelectTrigger
                              data-field="serviceDetails.embroidery.fabricThickness"
                              className={errors["serviceDetails.embroidery.fabricThickness"] ? "border-red-500" : ""}
                            >
                              <SelectValue placeholder="Select thickness" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Light">Light</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Heavy">Heavy</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors["serviceDetails.embroidery.fabricThickness"] && (
                            <p className="text-sm text-red-500">
                              {errors["serviceDetails.embroidery.fabricThickness"]}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Area Width (cm)</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="0"
                                value={formData.serviceDetails.embroidery?.areaWidth || ""}
                                onChange={(e) =>
                                  handleInputChange("serviceDetails.embroidery.areaWidth", e.target.value)
                                }
                              />
                              <span className="absolute right-2 top-2 text-xs text-gray-500">cm</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Area Height (cm)</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="0"
                                value={formData.serviceDetails.embroidery?.areaHeight || ""}
                                onChange={(e) =>
                                  handleInputChange("serviceDetails.embroidery.areaHeight", e.target.value)
                                }
                              />
                              <span className="absolute right-2 top-2 text-xs text-gray-500">cm</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-base font-medium">Edge Finishing</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="backingCloth"
                                checked={formData.serviceDetails.embroidery?.backingCloth || false}
                                onCheckedChange={(checked) =>
                                  handleInputChange("serviceDetails.embroidery.backingCloth", checked)
                                }
                              />
                              <Label htmlFor="backingCloth">Backing cloth</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="liningAdd"
                                checked={formData.serviceDetails.embroidery?.liningAdd || false}
                                onCheckedChange={(checked) =>
                                  handleInputChange("serviceDetails.embroidery.liningAdd", checked)
                                }
                              />
                              <Label htmlFor="liningAdd">Lining add</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.serviceType === "Alteration" && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Alteration Details</h4>

                        <div className="space-y-2">
                          <Label>Garment Type *</Label>
                          <Select
                            onValueChange={(value) => handleInputChange("serviceDetails.alteration.garmentType", value)}
                          >
                            <SelectTrigger
                              data-field="serviceDetails.alteration.garmentType"
                              className={errors["serviceDetails.alteration.garmentType"] ? "border-red-500" : ""}
                            >
                              <SelectValue placeholder="Select garment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Shirt">Shirt</SelectItem>
                              <SelectItem value="T-shirt">T-shirt</SelectItem>
                              <SelectItem value="Kurti">Kurti</SelectItem>
                              <SelectItem value="Blouse">Blouse</SelectItem>
                              <SelectItem value="Jeans">Jeans</SelectItem>
                              <SelectItem value="Trousers">Trousers</SelectItem>
                              <SelectItem value="Dress">Dress</SelectItem>
                              <SelectItem value="Skirt">Skirt</SelectItem>
                              <SelectItem value="Saree blouse">Saree blouse</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors["serviceDetails.alteration.garmentType"] && (
                            <p className="text-sm text-red-500">{errors["serviceDetails.alteration.garmentType"]}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-base font-medium">Required Changes * (Select all that apply)</Label>
                          {errors["serviceDetails.alteration.requiredChanges"] && (
                            <p className="text-sm text-red-500">
                              {errors["serviceDetails.alteration.requiredChanges"]}
                            </p>
                          )}

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="lengthChange"
                                  checked={
                                    formData.serviceDetails.alteration?.requiredChanges?.includes("Length") || false
                                  }
                                  onCheckedChange={(checked) =>
                                    handleArrayChange(
                                      "serviceDetails.alteration.requiredChanges",
                                      "Length",
                                      checked as boolean,
                                    )
                                  }
                                />
                                <Label htmlFor="lengthChange">Length</Label>
                              </div>

                              {formData.serviceDetails.alteration?.requiredChanges?.includes("Length") && (
                                <div className="ml-6 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <Select
                                      onValueChange={(value) =>
                                        handleInputChange("serviceDetails.alteration.lengthChange", value)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Shorten/Lengthen" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Shorten">Shorten</SelectItem>
                                        <SelectItem value="Lengthen">Lengthen</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <div className="relative">
                                      <Input
                                        type="number"
                                        placeholder="Amount"
                                        value={formData.serviceDetails.alteration?.lengthAmount || ""}
                                        onChange={(e) =>
                                          handleInputChange("serviceDetails.alteration.lengthAmount", e.target.value)
                                        }
                                      />
                                      <span className="absolute right-2 top-2 text-xs text-gray-500">cm</span>
                                    </div>
                                  </div>
                                  <Select
                                    onValueChange={(value) =>
                                      handleInputChange("serviceDetails.alteration.lengthHemType", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Hem type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Blind">Blind</SelectItem>
                                      <SelectItem value="Regular">Regular</SelectItem>
                                      <SelectItem value="Chain">Chain</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="fitChange"
                                  checked={
                                    formData.serviceDetails.alteration?.requiredChanges?.includes("Fit") || false
                                  }
                                  onCheckedChange={(checked) =>
                                    handleArrayChange(
                                      "serviceDetails.alteration.requiredChanges",
                                      "Fit",
                                      checked as boolean,
                                    )
                                  }
                                />
                                <Label htmlFor="fitChange">Fit (Take in / Let out)</Label>
                              </div>

                              {formData.serviceDetails.alteration?.requiredChanges?.includes("Fit") && (
                                <div className="ml-6 space-y-2">
                                  <Label className="text-sm">Areas (select all that apply):</Label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {["Waist", "Hip", "Thigh", "Seat", "Chest", "Bust", "Back", "Arm"].map((area) => (
                                      <div key={area} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`fit-${area}`}
                                          checked={
                                            formData.serviceDetails.alteration?.fitAreas?.includes(area) || false
                                          }
                                          onCheckedChange={(checked) =>
                                            handleArrayChange(
                                              "serviceDetails.alteration.fitAreas",
                                              area,
                                              checked as boolean,
                                            )
                                          }
                                        />
                                        <Label htmlFor={`fit-${area}`} className="text-sm">
                                          {area}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>

                                  {formData.serviceDetails.alteration?.fitAreas?.map((area) => (
                                    <div key={area} className="flex items-center space-x-2">
                                      <Label className="text-sm w-16">{area}:</Label>
                                      <div className="relative flex-1">
                                        <Input
                                          type="number"
                                          placeholder="Amount"
                                          value={formData.serviceDetails.alteration?.fitAmounts?.[area] || ""}
                                          onChange={(e) =>
                                            handleInputChange(
                                              `serviceDetails.alteration.fitAmounts.${area}`,
                                              e.target.value,
                                            )
                                          }
                                        />
                                        <span className="absolute right-2 top-2 text-xs text-gray-500">cm</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="sleeveChange"
                                  checked={
                                    formData.serviceDetails.alteration?.requiredChanges?.includes("Sleeve") || false
                                  }
                                  onCheckedChange={(checked) =>
                                    handleArrayChange(
                                      "serviceDetails.alteration.requiredChanges",
                                      "Sleeve",
                                      checked as boolean,
                                    )
                                  }
                                />
                                <Label htmlFor="sleeveChange">Sleeve</Label>
                              </div>

                              {formData.serviceDetails.alteration?.requiredChanges?.includes("Sleeve") && (
                                <div className="ml-6 grid grid-cols-2 gap-2">
                                  <Select
                                    onValueChange={(value) =>
                                      handleInputChange("serviceDetails.alteration.sleeveChange", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Change type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Shorten">Shorten</SelectItem>
                                      <SelectItem value="Lengthen">Lengthen</SelectItem>
                                      <SelectItem value="Taper">Taper</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {(formData.serviceDetails.alteration?.sleeveChange === "Shorten" ||
                                    formData.serviceDetails.alteration?.sleeveChange === "Lengthen") && (
                                    <div className="relative">
                                      <Input
                                        type="number"
                                        placeholder="Amount"
                                        value={formData.serviceDetails.alteration?.sleeveAmount || ""}
                                        onChange={(e) =>
                                          handleInputChange("serviceDetails.alteration.sleeveAmount", e.target.value)
                                        }
                                      />
                                      <span className="absolute right-2 top-2 text-xs text-gray-500">cm</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="waistbandAdjust"
                              checked={formData.serviceDetails.alteration?.waistbandAdjust || false}
                              onCheckedChange={(checked) =>
                                handleInputChange("serviceDetails.alteration.waistbandAdjust", checked)
                              }
                            />
                            <Label htmlFor="waistbandAdjust">Waistband adjust</Label>
                          </div>

                          {formData.serviceDetails.alteration?.waistbandAdjust && (
                            <div className="ml-6 grid grid-cols-2 gap-2">
                              <Select
                                onValueChange={(value) =>
                                  handleInputChange("serviceDetails.alteration.waistbandType", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Add/Remove darts" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Add darts">Add darts</SelectItem>
                                  <SelectItem value="Remove darts">Remove darts</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="New waist"
                                  value={formData.serviceDetails.alteration?.waistbandNewWaist || ""}
                                  onChange={(e) =>
                                    handleInputChange("serviceDetails.alteration.waistbandNewWaist", e.target.value)
                                  }
                                />
                                <span className="absolute right-2 top-2 text-xs text-gray-500">cm</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-base font-medium">Closure Repairs</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="zipRepair"
                                checked={formData.serviceDetails.alteration?.zipRepair || false}
                                onCheckedChange={(checked) =>
                                  handleInputChange("serviceDetails.alteration.zipRepair", checked)
                                }
                              />
                              <Label htmlFor="zipRepair">Zip repair</Label>
                            </div>
                            {formData.serviceDetails.alteration?.zipRepair && (
                              <div className="ml-6">
                                <div className="relative">
                                  <Input
                                    type="number"
                                    placeholder="Zip length"
                                    value={formData.serviceDetails.alteration?.zipLength || ""}
                                    onChange={(e) =>
                                      handleInputChange("serviceDetails.alteration.zipLength", e.target.value)
                                    }
                                  />
                                  <span className="absolute right-2 top-2 text-xs text-gray-500">cm</span>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="buttonRepair"
                                checked={formData.serviceDetails.alteration?.buttonRepair || false}
                                onCheckedChange={(checked) =>
                                  handleInputChange("serviceDetails.alteration.buttonRepair", checked)
                                }
                              />
                              <Label htmlFor="buttonRepair">Button repair</Label>
                            </div>
                            {formData.serviceDetails.alteration?.buttonRepair && (
                              <div className="ml-6">
                                <Input
                                  type="number"
                                  placeholder="How many buttons"
                                  value={formData.serviceDetails.alteration?.buttonCount || ""}
                                  onChange={(e) =>
                                    handleInputChange("serviceDetails.alteration.buttonCount", e.target.value)
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Current fit vs desired fit</Label>
                          <Textarea
                            placeholder="e.g., Loose at waist, long by 6 cm"
                            value={formData.serviceDetails.alteration?.currentVsDesired || ""}
                            onChange={(e) =>
                              handleInputChange("serviceDetails.alteration.currentVsDesired", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}

                    {formData.serviceType === "Repair & Patching" && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Repair & Patching Details</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Issue *</Label>
                            <Select onValueChange={(value) => handleInputChange("serviceDetails.repair.issue", value)}>
                              <SelectTrigger
                                data-field="serviceDetails.repair.issue"
                                className={errors["serviceDetails.repair.issue"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select issue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tear">Tear</SelectItem>
                                <SelectItem value="Hole">Hole</SelectItem>
                                <SelectItem value="Seam open">Seam open</SelectItem>
                                <SelectItem value="Zip broken">Zip broken</SelectItem>
                                <SelectItem value="Missing button">Missing button</SelectItem>
                                <SelectItem value="Hem undone">Hem undone</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.repair.issue"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.repair.issue"]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Location *</Label>
                            <Input
                              data-field="serviceDetails.repair.location"
                              placeholder="e.g., left knee, inner seam"
                              value={formData.serviceDetails.repair?.location || ""}
                              onChange={(e) => handleInputChange("serviceDetails.repair.location", e.target.value)}
                              className={errors["serviceDetails.repair.location"] ? "border-red-500" : ""}
                            />
                            {errors["serviceDetails.repair.location"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.repair.location"]}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Opening Size *</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                data-field="serviceDetails.repair.openingSize"
                                placeholder="0"
                                value={formData.serviceDetails.repair?.openingSize || ""}
                                onChange={(e) => handleInputChange("serviceDetails.repair.openingSize", e.target.value)}
                                className={errors["serviceDetails.repair.openingSize"] ? "border-red-500" : ""}
                              />
                              <span className="absolute right-2 top-2 text-xs text-gray-500">cm</span>
                            </div>
                            {errors["serviceDetails.repair.openingSize"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.repair.openingSize"]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Patch Style *</Label>
                            <Select
                              onValueChange={(value) => handleInputChange("serviceDetails.repair.patchStyle", value)}
                            >
                              <SelectTrigger
                                data-field="serviceDetails.repair.patchStyle"
                                className={errors["serviceDetails.repair.patchStyle"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Visible contrast">Visible contrast</SelectItem>
                                <SelectItem value="Invisible blend">Invisible blend</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.repair.patchStyle"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.repair.patchStyle"]}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Matching Fabric Available? *</Label>
                          <Select
                            onValueChange={(value) =>
                              handleInputChange("serviceDetails.repair.matchingFabricAvailable", value)
                            }
                          >
                            <SelectTrigger
                              data-field="serviceDetails.repair.matchingFabricAvailable"
                              className={
                                errors["serviceDetails.repair.matchingFabricAvailable"] ? "border-red-500" : ""
                              }
                            >
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="Use shop's stock">Use shop's stock</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors["serviceDetails.repair.matchingFabricAvailable"] && (
                            <p className="text-sm text-red-500">
                              {errors["serviceDetails.repair.matchingFabricAvailable"]}
                            </p>
                          )}

                          {formData.serviceDetails.repair?.matchingFabricAvailable === "Yes" && (
                            <div className="mt-2">
                              <Label>Fabric Piece Size</Label>
                              <div className="relative">
                                <Input
                                  placeholder="Size of fabric piece"
                                  value={formData.serviceDetails.repair?.fabricPieceSize || ""}
                                  onChange={(e) =>
                                    handleInputChange("serviceDetails.repair.fabricPieceSize", e.target.value)
                                  }
                                />
                                <span className="absolute right-2 top-2 text-xs text-gray-500">cm</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Durability Preference *</Label>
                          <Select
                            onValueChange={(value) =>
                              handleInputChange("serviceDetails.repair.durabilityPreference", value)
                            }
                          >
                            <SelectTrigger
                              data-field="serviceDetails.repair.durabilityPreference"
                              className={errors["serviceDetails.repair.durabilityPreference"] ? "border-red-500" : ""}
                            >
                              <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Standard">Standard</SelectItem>
                              <SelectItem value="Reinforced">Reinforced</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors["serviceDetails.repair.durabilityPreference"] && (
                            <p className="text-sm text-red-500">
                              {errors["serviceDetails.repair.durabilityPreference"]}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-base font-medium">Extra Finishing</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="topstitch"
                                checked={formData.serviceDetails.repair?.topstitch || false}
                                onCheckedChange={(checked) =>
                                  handleInputChange("serviceDetails.repair.topstitch", checked)
                                }
                              />
                              <Label htmlFor="topstitch">Topstitch</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="edgeBind"
                                checked={formData.serviceDetails.repair?.edgeBind || false}
                                onCheckedChange={(checked) =>
                                  handleInputChange("serviceDetails.repair.edgeBind", checked)
                                }
                              />
                              <Label htmlFor="edgeBind">Edge bind</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.serviceType === "Saree Fall & Edging" && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Saree Fall & Edging Details</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Work Type *</Label>
                            <Select
                              onValueChange={(value) => handleInputChange("serviceDetails.saree.workType", value)}
                            >
                              <SelectTrigger
                                data-field="serviceDetails.saree.workType"
                                className={errors["serviceDetails.saree.workType"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select work type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Fall stitch">Fall stitch</SelectItem>
                                <SelectItem value="Pico">Pico</SelectItem>
                                <SelectItem value="Fall + Pico">Fall + Pico</SelectItem>
                                <SelectItem value="Rolled hem">Rolled hem</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.saree.workType"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.saree.workType"]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Saree Material *</Label>
                            <Select
                              onValueChange={(value) => handleInputChange("serviceDetails.saree.sareeMaterial", value)}
                            >
                              <SelectTrigger
                                data-field="serviceDetails.saree.sareeMaterial"
                                className={errors["serviceDetails.saree.sareeMaterial"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select material" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cotton">Cotton</SelectItem>
                                <SelectItem value="Silk">Silk</SelectItem>
                                <SelectItem value="Chiffon">Chiffon</SelectItem>
                                <SelectItem value="Georgette">Georgette</SelectItem>
                                <SelectItem value="Organza">Organza</SelectItem>
                                <SelectItem value="Net">Net</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.saree.sareeMaterial"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.saree.sareeMaterial"]}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Thread Match *</Label>
                          <Select
                            onValueChange={(value) => handleInputChange("serviceDetails.saree.threadMatch", value)}
                          >
                            <SelectTrigger
                              data-field="serviceDetails.saree.threadMatch"
                              className={errors["serviceDetails.saree.threadMatch"] ? "border-red-500" : ""}
                            >
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="Match for me">Match for me</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors["serviceDetails.saree.threadMatch"] && (
                            <p className="text-sm text-red-500">{errors["serviceDetails.saree.threadMatch"]}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="blouseWorkAlso"
                              checked={formData.serviceDetails.saree?.blouseWorkAlso || false}
                              onCheckedChange={(checked) =>
                                handleInputChange("serviceDetails.saree.blouseWorkAlso", checked)
                              }
                            />
                            <Label htmlFor="blouseWorkAlso">Blouse work also?</Label>
                          </div>

                          {formData.serviceDetails.saree?.blouseWorkAlso && (
                            <div className="ml-6 space-y-4 p-4 bg-white rounded border">
                              <h5 className="font-medium">Blouse Details</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Neck Style</Label>
                                  <Select
                                    onValueChange={(value) =>
                                      handleInputChange("serviceDetails.saree.blouseNeckStyle", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select neck style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Round">Round</SelectItem>
                                      <SelectItem value="V">V</SelectItem>
                                      <SelectItem value="Boat">Boat</SelectItem>
                                      <SelectItem value="Sweetheart">Sweetheart</SelectItem>
                                      <SelectItem value="High">High</SelectItem>
                                      <SelectItem value="Custom">Custom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>Sleeve Type</Label>
                                  <Select
                                    onValueChange={(value) =>
                                      handleInputChange("serviceDetails.saree.blouseSleeveType", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select sleeve type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Sleeveless">Sleeveless</SelectItem>
                                      <SelectItem value="Cap">Cap</SelectItem>
                                      <SelectItem value="Elbow">Elbow</SelectItem>
                                      <SelectItem value="Full">Full</SelectItem>
                                      <SelectItem value="Puff">Puff</SelectItem>
                                      <SelectItem value="Custom">Custom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="blousePadding"
                                  checked={formData.serviceDetails.saree?.blousePadding || false}
                                  onCheckedChange={(checked) =>
                                    handleInputChange("serviceDetails.saree.blousePadding", checked)
                                  }
                                />
                                <Label htmlFor="blousePadding">Padding</Label>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Pallu Finishing Preference</Label>
                          <Input
                            placeholder="Describe your pallu finishing preference"
                            value={formData.serviceDetails.saree?.palluFinishing || ""}
                            onChange={(e) => handleInputChange("serviceDetails.saree.palluFinishing", e.target.value)}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="preserveZari"
                            checked={formData.serviceDetails.saree?.preserveZari || false}
                            onCheckedChange={(checked) =>
                              handleInputChange("serviceDetails.saree.preserveZari", checked)
                            }
                          />
                          <Label htmlFor="preserveZari">Preserve zari (border care)</Label>
                        </div>
                      </div>
                    )}

                    {formData.serviceType === "Blouse Design" && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Blouse Design Details</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Neck Style *</Label>
                            <Select
                              onValueChange={(value) => handleInputChange("serviceDetails.blouse.neckStyle", value)}
                            >
                              <SelectTrigger
                                data-field="serviceDetails.blouse.neckStyle"
                                className={errors["serviceDetails.blouse.neckStyle"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select neck style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Round">Round</SelectItem>
                                <SelectItem value="V">V</SelectItem>
                                <SelectItem value="Boat">Boat</SelectItem>
                                <SelectItem value="Sweetheart">Sweetheart</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.blouse.neckStyle"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.blouse.neckStyle"]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Back Style *</Label>
                            <Select
                              onValueChange={(value) => handleInputChange("serviceDetails.blouse.backStyle", value)}
                            >
                              <SelectTrigger
                                data-field="serviceDetails.blouse.backStyle"
                                className={errors["serviceDetails.blouse.backStyle"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select back style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Hook">Hook</SelectItem>
                                <SelectItem value="Tie">Tie</SelectItem>
                                <SelectItem value="Dori">Dori</SelectItem>
                                <SelectItem value="Deep back">Deep back</SelectItem>
                                <SelectItem value="Button">Button</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.blouse.backStyle"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.blouse.backStyle"]}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Sleeve *</Label>
                            <Select onValueChange={(value) => handleInputChange("serviceDetails.blouse.sleeve", value)}>
                              <SelectTrigger
                                data-field="serviceDetails.blouse.sleeve"
                                className={errors["serviceDetails.blouse.sleeve"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select sleeve" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sleeveless">Sleeveless</SelectItem>
                                <SelectItem value="Cap">Cap</SelectItem>
                                <SelectItem value="Elbow">Elbow</SelectItem>
                                <SelectItem value="Full">Full</SelectItem>
                                <SelectItem value="Puff">Puff</SelectItem>
                                <SelectItem value="Custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.blouse.sleeve"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.blouse.sleeve"]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Padding *</Label>
                            <Select
                              onValueChange={(value) => handleInputChange("serviceDetails.blouse.padding", value)}
                            >
                              <SelectTrigger
                                data-field="serviceDetails.blouse.padding"
                                className={errors["serviceDetails.blouse.padding"] ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="Select padding" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors["serviceDetails.blouse.padding"] && (
                              <p className="text-sm text-red-500">{errors["serviceDetails.blouse.padding"]}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Opening *</Label>
                          <Select onValueChange={(value) => handleInputChange("serviceDetails.blouse.opening", value)}>
                            <SelectTrigger
                              data-field="serviceDetails.blouse.opening"
                              className={errors["serviceDetails.blouse.opening"] ? "border-red-500" : ""}
                            >
                              <SelectValue placeholder="Select opening" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Front">Front</SelectItem>
                              <SelectItem value="Back">Back</SelectItem>
                              <SelectItem value="Side">Side</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors["serviceDetails.blouse.opening"] && (
                            <p className="text-sm text-red-500">{errors["serviceDetails.blouse.opening"]}</p>
                          )}
                        </div>

                        {/* Measurements Toggle */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="takeMeasurementsDuringPickupBlouse"
                              checked={formData.serviceDetails.blouse?.takeMeasurementsDuringPickup || false}
                              onCheckedChange={(checked) =>
                                handleInputChange("serviceDetails.blouse.takeMeasurementsDuringPickup", checked)
                              }
                            />
                            <Label htmlFor="takeMeasurementsDuringPickupBlouse">Take measurements during pickup</Label>
                          </div>

                          {!formData.serviceDetails.blouse?.takeMeasurementsDuringPickup && (
                            <div className="space-y-4 p-4 bg-white rounded border">
                              <h5 className="font-medium">Measurements (cm)</h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                  "bust",
                                  "underbust",
                                  "waist",
                                  "shoulder",
                                  "armhole",
                                  "sleeveLength",
                                  "blouseLength",
                                ].map((field) => (
                                  <div key={field} className="space-y-1">
                                    <Label className="text-sm capitalize">{field.replace(/([A-Z])/g, " $1")}</Label>
                                    <div className="relative">
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={
                                          formData.serviceDetails.blouse?.measurements?.[
                                            field as keyof typeof formData.serviceDetails.blouse.measurements
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            `serviceDetails.blouse.measurements.${field}`,
                                            e.target.value,
                                          )
                                        }
                                      />
                                      <span className="absolute right-2 top-2 text-xs text-gray-500">cm</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Embellishments *</Label>
                          <Select
                            onValueChange={(value) => handleInputChange("serviceDetails.blouse.embellishments", value)}
                          >
                            <SelectTrigger
                              data-field="serviceDetails.blouse.embellishments"
                              className={errors["serviceDetails.blouse.embellishments"] ? "border-red-500" : ""}
                            >
                              <SelectValue placeholder="Select embellishments" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="None">None</SelectItem>
                              <SelectItem value="Piping">Piping</SelectItem>
                              <SelectItem value="Border">Border</SelectItem>
                              <SelectItem value="Embroidery">Embroidery</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors["serviceDetails.blouse.embellishments"] && (
                            <p className="text-sm text-red-500">{errors["serviceDetails.blouse.embellishments"]}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Piping Color</Label>
                            <Input
                              placeholder="Describe piping color"
                              value={formData.serviceDetails.blouse?.pipingColor || ""}
                              onChange={(e) => handleInputChange("serviceDetails.blouse.pipingColor", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Hem Type</Label>
                            <Select
                              onValueChange={(value) => handleInputChange("serviceDetails.blouse.hemType", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select hem type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Blind">Blind</SelectItem>
                                <SelectItem value="Regular">Regular</SelectItem>
                                <SelectItem value="Rolled">Rolled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pickup & Timing Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Pickup & Timing
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pickup Method *</Label>
                      <Select
                        value={formData.pickupMethod}
                        onValueChange={(value) => handleInputChange("pickupMethod", value)}
                      >
                        <SelectTrigger
                          data-field="pickupMethod"
                          className={errors.pickupMethod ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select pickup method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pickup from home">Pickup from home</SelectItem>
                          <SelectItem value="Drop-off">Drop-off</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.pickupMethod && <p className="text-sm text-red-500">{errors.pickupMethod}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Pickup Window *</Label>
                      <Select
                        value={formData.preferredWindow}
                        onValueChange={(value) => handleInputChange("preferredWindow", value)}
                      >
                        <SelectTrigger
                          data-field="preferredWindow"
                          className={errors.preferredWindow ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select time window" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning (8–11)">Morning (8–11)</SelectItem>
                          <SelectItem value="Afternoon (12–4)">Afternoon (12–4)</SelectItem>
                          <SelectItem value="Evening (5–8)">Evening (5–8)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.preferredWindow && <p className="text-sm text-red-500">{errors.preferredWindow}</p>}
                    </div>
                  </div>

                  {(formData.pickupMethod === "Pickup from home" || formData.pickupMethod === "Both") && (
                    <div className="space-y-2">
                      <Label>Pickup Address *</Label>
                      <Textarea
                        data-field="pickupAddress"
                        placeholder="Enter your complete pickup address"
                        value={formData.pickupAddress}
                        onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                        className={errors.pickupAddress ? "border-red-500" : ""}
                      />
                      {errors.pickupAddress && <p className="text-sm text-red-500">{errors.pickupAddress}</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Urgency *</Label>
                      <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                        <SelectTrigger data-field="urgency" className={errors.urgency ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Regular">Regular</SelectItem>
                          <SelectItem value="Express">Express (+fee applies)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.urgency && <p className="text-sm text-red-500">{errors.urgency}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Event Date</Label>
                      <Input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => handleInputChange("eventDate", e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <p className="text-xs text-gray-500">Optional - when do you need this ready?</p>
                    </div>
                  </div>
                </div>

                {/* Attachments & Notes Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Attachments & Notes
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Reference Photos (0-3 images)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500">JPG, PNG, WEBP up to 5MB each</p>
                        </label>
                      </div>

                      {formData.referencePhotos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {formData.referencePhotos.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file) || "/placeholder.svg"}
                                alt={`Reference ${index + 1}`}
                                className="w-full h-24 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Notes</Label>
                      <Textarea
                        placeholder="Any special instructions or additional details..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      "Book Pickup"
                    )}
                  </Button>

                  {estimatedDelivery && (
                    <p className="text-center text-sm text-gray-600 mt-2">
                      Estimated delivery: {new Date(estimatedDelivery).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 font-semibold"
        >
          {isSubmitting ? "Submitting..." : "Book Pickup"}
        </Button>
      </div>
    </section>
  )
}
