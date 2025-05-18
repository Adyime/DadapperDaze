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

interface ProductImage {
  id: string
  image?: Buffer | Uint8Array | any  // For backward compatibility
  base64Image?: string  // For backward compatibility
  imageUrl?: string  // New field for image URL
  order: number
  color?: string | null
}

interface ProductVariant {
  id: string
  color: string
  size: string
  stock: number
  sku: string
}

interface ImagePreview {
  id: string
  preview: string
  file?: File
  isExisting: boolean
  color: string
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

interface Product {
  id: string
  name: string
  description: string
  price: number
  discountedPrice: number | null
  categoryId: string
  images: ProductImage[]
  variants: ProductVariant[]
}

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Helper function to convert image data to base64 string
  const convertImageToBase64 = (imageData: any): string | null => {
    try {
      if (!imageData) return null;
      
      // If it's already a string, assume it's already base64
      if (typeof imageData === 'string') return imageData;
      
      // If it's a Buffer
      if (Buffer.isBuffer(imageData)) {
        return imageData.toString('base64');
      }
      
      // If it's a Uint8Array
      if (imageData instanceof Uint8Array) {
        return Buffer.from(imageData).toString('base64');
      }
      
      // If it has an ArrayBuffer (e.g., ArrayBuffer, TypedArray views)
      if (imageData.buffer instanceof ArrayBuffer) {
        return Buffer.from(imageData.buffer).toString('base64');
      }
      
      // If it's an object with a 'data' property (some database drivers return this)
      if (typeof imageData === 'object' && imageData !== null && 'data' in imageData) {
        return Buffer.from(imageData.data).toString('base64');
      }
      
      // If it's an ArrayBuffer directly
      if (imageData instanceof ArrayBuffer) {
        return Buffer.from(imageData).toString('base64');
      }
      
      console.warn('Unrecognized image data type:', imageData);
      return null;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  }

  // Group variants by color and initialize colorVariants state
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>(() => {
    console.log("Initializing product with images:", product.images.map(img => ({
      id: img.id,
      color: img.color,
      imageUrl: `/api/product-images/${img.id}`
    })));
    
    // First, create a map of color to variants
    const colorMap = product.variants.reduce((acc, variant) => {
      if (!acc[variant.color]) {
        acc[variant.color] = {
          id: Math.random().toString(36).substring(7),
          color: variant.color,
          images: [],
          sizes: []
        }
      }
      acc[variant.color].sizes.push({
        size: variant.size,
        stock: variant.stock,
        sku: variant.sku
      })
      return acc
    }, {} as Record<string, ColorVariant>)
    
    console.log("Created color map for variants:", Object.keys(colorMap));

    // Then, associate images with their colors
    product.images.forEach(img => {
      const color = img.color || 'default'
      if (colorMap[color]) {
        // For each image, just create a URL to our API endpoint
        colorMap[color].images.push({
          id: img.id,
          preview: `/api/product-images/${img.id}`,
      isExisting: true,
          color: color
        });
      } else {
        console.warn(`Color "${color}" not found for image ${img.id}`);
      }
    })

    // Convert the map to an array
    const variants = Object.values(colorMap)
    
    // Debug log
    console.log('Initializing color variants:', variants.map(v => ({
      color: v.color,
      imageCount: v.images.length,
      sizeCount: v.sizes.length
    })))

    return variants
  })

  // Log the initial state to verify
  useEffect(() => {
    console.log('Initial colorVariants:', colorVariants)
  }, [colorVariants])

  // Add variant management functions
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

  // Update handleImageChange to properly associate images with color variants
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, colorId: string) => {
    const files = Array.from(e.target.files || [])
    const variant = colorVariants.find(v => v.id === colorId)
    
    if (!variant) {
      console.error('Variant not found:', colorId)
      return
    }
    
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

    try {
    // Create previews
    const newPreviews = await Promise.all(
      files.map(async (file) => {
          const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
          reader.readAsDataURL(file)
        })
        return {
          id: Math.random().toString(36).substring(7),
          file,
          preview,
            color: variant.color,
            isExisting: false
          }
        })
      )

      // Update colorVariants state
      setColorVariants(prev => 
        prev.map(v => 
          v.id === colorId
            ? { ...v, images: [...v.images, ...newPreviews] }
            : v
        )
      )

      // Log state after update
      console.log('Added images to variant:', variant.color)
    } catch (error) {
      console.error('Error processing images:', error)
      toast({
        title: "Error",
        description: "Failed to process images",
        variant: "destructive",
      })
    }
  }

  // Update removeImage to properly handle image removal
  const removeImage = (colorId: string, imageId: string) => {
    setColorVariants(prev => 
      prev.map(variant => 
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return

    try {
      setIsLoading(true)

      // Validate color variants
      if (colorVariants.length === 0) {
        throw new Error("At least one color variant is required")
      }

      for (const variant of colorVariants) {
        if (!variant.color) {
          throw new Error("Color name is required for all variants")
        }
        if (!variant.images || variant.images.length === 0) {
          throw new Error(`Images are required for ${variant.color} variant`)
        }
        if (!variant.sizes || variant.sizes.length === 0) {
          throw new Error(`Size options are required for ${variant.color} variant`)
        }
      }

      // Get form data
      const formData = new FormData(e.currentTarget)
      const submitData = new FormData()

      // Add basic product data
      submitData.append("name", formData.get("name") as string)
      submitData.append("description", formData.get("description") as string)
      submitData.append("price", formData.get("price") as string)
      submitData.append("discountedPrice", formData.get("discountedPrice") as string)
      submitData.append("categoryId", formData.get("categoryId") as string)

      // Get existing image IDs
      const existingImageIds = colorVariants
        .flatMap(variant => variant.images)
        .filter(img => img.isExisting)
        .map(img => img.id)

      submitData.append("existingImageIds", JSON.stringify(existingImageIds))
      
      // Get new images with their color associations
      const newImages = colorVariants
        .flatMap(variant => 
          variant.images
            .filter(img => !img.isExisting)
            .map(img => ({
              file: img.file,
              color: variant.color
            }))
        )

      // Append new images with their color associations
      for (const { file, color } of newImages) {
        if (!file) continue
        submitData.append("images", file)
        submitData.append("imageColors", color)
      }

      // Append variants data
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

      // Log the data being sent
      console.log('Submitting data:', {
        colorVariants: colorVariants.map(v => ({
          color: v.color,
          imageCount: v.images.length,
          sizeCount: v.sizes.length
        })),
        existingImageIds,
        newImagesCount: newImages.length
      })

      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: submitData,
      })

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        // If the response isn't JSON, get the text instead for debugging
        const text = await response.text();
        console.error("Response text:", text);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        const errorMessage = data?.error || "Failed to update product";
        console.error("API error:", errorMessage, data);
        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      })

      // Reset loading state before navigation
      setIsLoading(false)

      // Navigate after a short delay to ensure state is updated
      setTimeout(() => {
      router.refresh()
        router.replace("/admin/products")
      }, 100)

    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
              defaultValue={product.name}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={product.description}
              required
            />
        </div>

        <div>
          <Label htmlFor="categoryId">Category</Label>
            <Select name="categoryId" defaultValue={product.categoryId}>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product.price}
                required
              />
            </div>
            <div>
              <Label htmlFor="discountedPrice">Discounted Price</Label>
              <Input
                id="discountedPrice"
                name="discountedPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product.discountedPrice || ""}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Color Variants</Label>
            <Button type="button" variant="outline" size="sm" onClick={addColorVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Color
            </Button>
          </div>

          <div className="space-y-4">
            {colorVariants.map((variant) => (
              <div key={variant.id} className="space-y-4 p-6 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <Label>Color Name</Label>
                    <Input
                      value={variant.color}
                      onChange={(e) => updateColorVariant(variant.id, e.target.value)}
                      placeholder="e.g., Red, Blue, etc."
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
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

                <div>
                  <div className="flex items-center justify-between mb-4">
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

                  <div className="space-y-4">
                    {variant.sizes.map((size, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 items-end">
                        <div>
                          <Label>Size</Label>
                          <Input
                            value={size.size}
                            onChange={(e) =>
                              updateSizeOption(variant.id, index, "size", e.target.value)
                            }
                            placeholder="e.g., S, M, L"
                            required
                          />
                        </div>
                        <div>
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            min="0"
                            value={size.stock}
                            onChange={(e) =>
                              updateSizeOption(
                                variant.id,
                                index,
                                "stock",
                                parseInt(e.target.value)
                              )
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label>SKU</Label>
                          <Input
                            value={size.sku}
                            onChange={(e) =>
                              updateSizeOption(variant.id, index, "sku", e.target.value)
                            }
                            placeholder="e.g., RED-S-001"
                            required
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                          onClick={() => removeSizeOption(variant.id, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Update Product
        </Button>
      </div>
    </form>
  )
} 