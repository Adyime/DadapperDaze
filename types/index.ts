export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
}

export interface ProductImage {
  id: string;
  image: Buffer | Uint8Array;
  color: string | null;
  order: number;
}

export interface ProcessedProductImage {
  id: string;
  image: string;
  color: string | null;
  order: number;
}

export interface ColorOption {
  color: string;
  image: ProcessedProductImage | null;
  variants: ProductVariant[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice: number | null;
  category: {
    name: string;
    slug: string;
  };
  variants: ProductVariant[];
  images: ProductImage[];
  colorOptions: ColorOption[];
}
