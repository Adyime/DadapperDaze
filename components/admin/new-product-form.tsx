"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, X, Plus, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface Category {
  id: string
  name: string
}

interface ImagePreview {
  id: string
  file: File
  preview: string
  colorId: string
}

interface SizeOption {
  size: string
  stock: number
  sku: string
}

interface ColorVariant {
  id: string
  color: string
  images: ImagePreview[]
  sizes: SizeOption[]
}

export default function NewProductForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([])

  // Fetch categories on component mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        })
      })
  }, [toast])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, colorId: string) => {
    const files = Array.from(e.target.files || [])
    
    // Check file types and sizes
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please upload only image files",
          variant: "destructive",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        })
        return
      }
    }

    // Create previews
    const newPreviews = await Promise.all(
      files.map(async (file) => {
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        return {
          id: Math.random().toString(36).substring(7),
          file,
          preview,
          colorId
        }
      })
    )

    setColorVariants(prevVariants => 
      prevVariants.map(variant => 
        variant.id === colorId 
          ? { ...variant, images: [...variant.images, ...newPreviews] }
          : variant
      )
    )
  }

  const removeImage = (colorId: string, imageId: string) => {
    setColorVariants(prevVariants => 
      prevVariants.map(variant => 
        variant.id === colorId 
          ? { ...variant, images: variant.images.filter(img => img.id !== imageId) }
          : variant
      )
    )
  }

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        let width = img.width
        let height = img.height
        const maxSize = 800

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }

        canvas.width = width
        canvas.height = height

        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to compress image"))
            }
          },
          "image/jpeg",
          0.8
        )
      }
      img.onerror = reject
    })
  }

  const addColorVariant = () => {
    setColorVariants(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        color: "",
        images: [],
        sizes: []
      }
    ])
  }

  const removeColorVariant = (colorId: string) => {
    setColorVariants(prev => prev.filter(variant => variant.id !== colorId))
  }

  const updateColorVariant = (colorId: string, color: string) => {
    setColorVariants(prev => 
      prev.map(variant => 
        variant.id === colorId 
          ? { ...variant, color }
          : variant
      )
    )
  }

  const addSizeOption = (colorId: string) => {
    setColorVariants(prev => 
      prev.map(variant => 
        variant.id === colorId 
          ? {
              ...variant,
              sizes: [
                ...variant.sizes,
                { size: "", stock: 0, sku: "" }
              ]
            }
          : variant
      )
    )
  }

  const removeSizeOption = (colorId: string, index: number) => {
    setColorVariants(prev => 
      prev.map(variant => 
        variant.id === colorId 
          ? {
              ...variant,
              sizes: variant.sizes.filter((_, i) => i !== index)
            }
          : variant
      )
    )
  }

  const updateSizeOption = (colorId: string, index: number, field: keyof SizeOption, value: string | number) => {
    setColorVariants(prev => 
      prev.map(variant => 
        variant.id === colorId 
          ? {
              ...variant,
              sizes: variant.sizes.map((size, i) => 
                i === index 
                  ? { ...size, [field]: value }
                  : size
              )
            }
          : variant
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return
    
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      if (colorVariants.length === 0) {
        throw new Error("At least one color variant is required")
      }

      // Validate color variants
      for (const variant of colorVariants) {
        if (!variant.color) {
          throw new Error("Color name is required for all variants")
      }
        if (variant.images.length === 0) {
          throw new Error(`Images are required for ${variant.color} variant`)
        }
        if (variant.sizes.length === 0) {
          throw new Error(`Size options are required for ${variant.color} variant`)
        }
        for (const size of variant.sizes) {
          if (!size.size || !size.sku) {
            throw new Error(`All size fields are required for ${variant.color} variant`)
          }
        }
      }

      // Create FormData with all data
      const submitData = new FormData()
      submitData.append("name", formData.get("name") as string)
      submitData.append("description", formData.get("description") as string)
      submitData.append("price", formData.get("price") as string)
      submitData.append("discountedPrice", formData.get("discountedPrice") as string)
      submitData.append("categoryId", formData.get("categoryId") as string)
      
      // Compress and append all images with their color associations
      for (const variant of colorVariants) {
        for (const img of variant.images) {
          const compressedImage = await compressImage(img.file)
          submitData.append(`images`, compressedImage, img.file.name)
          submitData.append(`imageColors`, variant.color)
        }
      }
      
      submitData.append("variants", JSON.stringify(
        colorVariants.flatMap(variant => 
          variant.sizes.map(size => ({
            color: variant.color,
            size: size.size,
            stock: size.stock,
            sku: size.sku
          }))
        )
      ))

      const response = await fetch("/api/products", {
        method: "POST",
        body: submitData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product")
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      })

      // Navigate and refresh
      router.refresh()
      router.replace("/admin/products")

    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Enter product name"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            placeholder="Enter product description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Enter price"
            />
          </div>

          <div>
            <Label htmlFor="discountedPrice">Discounted Price (Optional)</Label>
            <Input
              id="discountedPrice"
              name="discountedPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter discounted price"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select name="categoryId" required>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Label>Color Variants</Label>
          <Button type="button" variant="outline" size="sm" onClick={addColorVariant}>
            <Plus className="h-4 w-4 mr-2" />
            Add Color Variant
          </Button>
        </div>

        {colorVariants.map((variant) => (
          <div key={variant.id} className="space-y-4 p-6 border rounded-lg">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <Label>Color Name</Label>
                <Input
                  value={variant.color}
                  onChange={(e) => updateColorVariant(variant.id, e.target.value)}
                  placeholder="Enter color name"
                  required
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="mt-6"
                onClick={() => removeColorVariant(variant.id)}
              >
                <X className="h-4 w-4" />
              </Button>
        </div>

        <div>
              <Label>Color Images</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
                onChange={(e) => handleImageChange(e, variant.id)}
                className="cursor-pointer"
          />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {variant.images.map((img) => (
                  <div key={img.id} className="relative aspect-square">
                  <Image
                      src={img.preview}
                      alt={`${variant.color} preview`}
                    fill
                    className="object-cover rounded-lg"
                  />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => removeImage(variant.id, img.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
                <Label>Size Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSizeOption(variant.id)}
                >
            <Plus className="h-4 w-4 mr-2" />
                  Add Size
          </Button>
        </div>

              {variant.sizes.map((size, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
            <div>
              <Label>Size</Label>
              <Input
                      value={size.size}
                      onChange={(e) => updateSizeOption(variant.id, index, "size", e.target.value)}
                placeholder="Enter size"
                required
              />
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                min="0"
                      value={size.stock}
                      onChange={(e) => updateSizeOption(variant.id, index, "stock", parseInt(e.target.value))}
                placeholder="Enter stock"
                required
              />
            </div>
                  <div className="col-span-2">
              <Label>SKU</Label>
              <div className="flex gap-2">
                <Input
                        value={size.sku}
                        onChange={(e) => updateSizeOption(variant.id, index, "sku", e.target.value)}
                  placeholder="Enter SKU"
                  required
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                        onClick={() => removeSizeOption(variant.id, index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="min-w-[120px]" // Ensure button width doesn't change when loading
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Product'
          )}
        </Button>
      </div>
    </form>
  )
} 