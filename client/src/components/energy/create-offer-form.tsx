import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "lucide-react";
import { z } from "zod";

const createOfferSchema = z.object({
  energyAmount: z.string().min(1, "Energy amount is required"),
  pricePerKwh: z.string().min(1, "Price is required"),
  energyType: z.string().min(1, "Energy type is required"),
  location: z.string().optional(),
});

export default function CreateOfferForm() {
  const [formData, setFormData] = useState({
    energyAmount: "",
    pricePerKwh: "",
    energyType: "",
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createOfferMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('User not authenticated');
      return apiRequest('POST', '/api/energy/offers', {
        sellerId: user.id,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/energy/offers'] });
      toast({
        title: "Offer Created",
        description: "Your energy offer has been created successfully.",
      });
      setFormData({
        energyAmount: "",
        pricePerKwh: "",
        energyType: "",
        location: "",
      });
      setErrors({});
    },
    onError: () => {
      toast({
        title: "Failed to Create Offer",
        description: "There was an error creating your offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = createOfferSchema.parse(formData);
      createOfferMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="text-create-offer-title">Create Energy Offer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="energyAmount">Energy Amount (kWh)</Label>
            <Input
              id="energyAmount"
              type="number"
              step="0.1"
              placeholder="25.5"
              value={formData.energyAmount}
              onChange={(e) => handleInputChange("energyAmount", e.target.value)}
              className={errors.energyAmount ? "border-destructive" : ""}
              data-testid="input-energy-amount"
            />
            {errors.energyAmount && (
              <p className="text-xs text-destructive mt-1" data-testid="error-energy-amount">
                {errors.energyAmount}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="pricePerKwh">Price per kWh (ETH)</Label>
            <Input
              id="pricePerKwh"
              type="number"
              step="0.001"
              placeholder="0.05"
              value={formData.pricePerKwh}
              onChange={(e) => handleInputChange("pricePerKwh", e.target.value)}
              className={errors.pricePerKwh ? "border-destructive" : ""}
              data-testid="input-price-per-kwh"
            />
            {errors.pricePerKwh && (
              <p className="text-xs text-destructive mt-1" data-testid="error-price-per-kwh">
                {errors.pricePerKwh}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="energyType">Energy Type</Label>
            <Select 
              value={formData.energyType} 
              onValueChange={(value) => handleInputChange("energyType", value)}
            >
              <SelectTrigger 
                className={errors.energyType ? "border-destructive" : ""}
                data-testid="select-energy-type"
              >
                <SelectValue placeholder="Select energy type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solar">Solar</SelectItem>
                <SelectItem value="wind">Wind</SelectItem>
                <SelectItem value="hydro">Hydro</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.energyType && (
              <p className="text-xs text-destructive mt-1" data-testid="error-energy-type">
                {errors.energyType}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="San Francisco, CA"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              data-testid="input-location"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createOfferMutation.isPending}
            data-testid="button-create-offer"
          >
            {createOfferMutation.isPending ? (
              "Creating..."
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Create Offer
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
