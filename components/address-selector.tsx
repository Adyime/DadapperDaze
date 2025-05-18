"use client"

import { useState, useEffect } from "react"
import { Plus, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import AddressFormDialog, { Address } from "@/components/address-form-dialog"

interface AddressSelectorProps {
  userId: string
  onSelect: (address: Address) => void
  selectedAddressId?: string
}

export default function AddressSelector({ userId, onSelect, selectedAddressId }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch user's saved addresses
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const response = await fetch('/api/addresses')
        
        if (!response.ok) {
          throw new Error('Failed to fetch addresses')
        }
        
        const data = await response.json()
        setAddresses(data)
        
        // Auto-select default address if no address is selected
        if (!selectedAddressId && data.length > 0) {
          const defaultAddress = data.find((addr: Address) => addr.isDefault) || data[0]
          onSelect(defaultAddress)
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
        toast({
          title: "Error",
          description: "Could not load your saved addresses",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAddresses()
  }, [userId, selectedAddressId, onSelect, toast])

  // Handle radio change
  const handleAddressSelect = (addressId: string) => {
    const selectedAddress = addresses.find(addr => addr.id === addressId)
    if (selectedAddress) {
      onSelect(selectedAddress)
    }
  }
  
  // Handle new address added
  const handleAddressAdded = () => {
    // Reload addresses
    setIsLoading(true)
    fetch('/api/addresses')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch addresses')
        return response.json()
      })
      .then(data => {
        setAddresses(data)
        // Find the new default address if there is one
        const newDefaultAddress = data.find((addr: Address) => addr.isDefault)
        if (newDefaultAddress) {
          onSelect(newDefaultAddress)
        }
      })
      .catch(error => {
        console.error('Error reloading addresses:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  if (isLoading) {
    return <div className="py-4">Loading addresses...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shipping Address</h3>
        <AddressFormDialog 
          trigger={
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add New Address
            </Button>
          }
          onAddressSubmitted={handleAddressAdded}
        />
      </div>
      
      {addresses.length > 0 ? (
        <RadioGroup
          defaultValue={selectedAddressId || addresses.find(addr => addr.isDefault)?.id || addresses[0].id}
          onValueChange={handleAddressSelect}
          className="space-y-3"
        >
          {addresses.map((address) => (
            <div key={address.id} className="flex items-start space-x-3">
              <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-1" />
              <Label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer">
                <Card className={`p-3 ${selectedAddressId === address.id ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{address.fullName}</p>
                      <p className="text-sm text-muted-foreground">{address.streetAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-sm text-muted-foreground">{address.country}</p>
                    </div>
                    {address.isDefault && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        <Check className="mr-1 h-3 w-3" /> Default
                      </span>
                    )}
                  </div>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <div className="py-4 text-center text-muted-foreground rounded-lg border-2 border-dashed p-8">
          <p>You don't have any saved addresses.</p>
          <p className="mt-1">Please add a new address to continue.</p>
        </div>
      )}
    </div>
  )
} 