import { Product, Category, Review } from '../types/ecommerce';

export interface DressStyle {
  id: string;
  name: string;
  slug: string;
  image: string;
  gridSpan: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Casual',
    slug: 'casual',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800',
    itemCount: 142,
    description: 'Everyday comfortable outfits, t-shirts & jeans'
  },
  {
    id: 'cat-2',
    name: 'Formal',
    slug: 'formal',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    itemCount: 98,
    description: 'Tailored suits, dress shirts & elegant attire'
  },
  {
    id: 'cat-3',
    name: 'Party',
    slug: 'party',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
    itemCount: 84,
    description: 'Glamorous evening dresses, jackets & clubwear'
  },
  {
    id: 'cat-4',
    name: 'Gym',
    slug: 'gym',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    itemCount: 115,
    description: 'Activewear, tank tops & athletic bottoms'
  }
];

export const DRESS_STYLES: DressStyle[] = [
  {
    id: 'style-1',
    name: 'Casual',
    slug: 'casual',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    gridSpan: 'md:col-span-1'
  },
  {
    id: 'style-2',
    name: 'Formal',
    slug: 'formal',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200',
    gridSpan: 'md:col-span-2'
  },
  {
    id: 'style-3',
    name: 'Party',
    slug: 'party',
    image: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&q=80&w=1200',
    gridSpan: 'md:col-span-2'
  },
  {
    id: 'style-4',
    name: 'Gym',
    slug: 'gym',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    gridSpan: 'md:col-span-1'
  }
];

export const PRODUCTS: Product[] = [
  // --- HERO PRODUCT FROM SCREENSHOT (Images 2 & 4) ---
  {
    id: 'prod-one-life',
    title: 'ONE LIFE GRAPHIC T-SHIRT',
    subtitle: '100% Organic Heavyweight Streetwear Cotton',
    description: 'This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.',
    price: 260,
    originalPrice: 300,
    discount: 40,
    rating: 4.5,
    reviewsCount: 451,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800'
    ],
    colors: [
      { name: 'Olive Green', hex: '#4b5320' },
      { name: 'Forest Teal', hex: '#1e3e3b' },
      { name: 'Dark Navy', hex: '#1c2a38' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    tags: ['T-Shirts', 'Graphic', 'Casual', 'Top Selling'],
    inStock: true,
    featured: true,
    isNew: true
  },

  // --- CATALOG ITEMS FROM SCREENSHOT (Images 3 & 5) ---
  {
    id: 'prod-gradient',
    title: 'Gradient Graphic T-shirt',
    subtitle: 'Vibrant Art Streetwear Printed Tee',
    description: 'Featuring an eye-catching gradient art design on premium combed cotton.',
    price: 145,
    originalPrice: 242,
    discount: 20,
    rating: 3.5,
    reviewsCount: 88,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800'],
    colors: [{ name: 'White', hex: '#ffffff' }],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    tags: ['Casual', 'T-Shirts'],
    inStock: true,
    featured: true
  },
  {
    id: 'prod-polo-tipping',
    title: 'Polo with Tipping Details',
    subtitle: 'Textured Cotton Pique Polo Shirt',
    description: 'Classic polo shirt enhanced with contrasting collar tipping details.',
    price: 180,
    originalPrice: 242,
    discount: 20,
    rating: 4.5,
    reviewsCount: 120,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1625910513413-43d94eb38e21?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1625910513413-43d94eb38e21?auto=format&fit=crop&q=80&w=800'],
    colors: [{ name: 'Burgundy', hex: '#7f1d1d' }],
    sizes: ['Medium', 'Large', 'X-Large'],
    tags: ['Casual', 'Polo'],
    inStock: true,
    featured: true
  },
  {
    id: 'prod-black-striped',
    title: 'Black Striped T-shirt',
    subtitle: 'Raglan Baseball Vertical Striped Tee',
    description: 'Classic vertical pinstripe raglan sleeve t-shirt.',
    price: 120,
    originalPrice: 160,
    discount: 30,
    rating: 4.0,
    reviewsCount: 95,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800'],
    colors: [{ name: 'Striped White', hex: '#18181b' }],
    sizes: ['Small', 'Medium', 'Large'],
    tags: ['Casual', 'T-Shirts', 'New'],
    inStock: true,
    featured: true
  },
  {
    id: 'prod-skinny-jeans',
    title: 'Skinny Fit Jeans',
    subtitle: 'Stretch Tapered Denim Pants',
    description: 'Flexible denim with sleek tapered leg for everyday comfort.',
    price: 240,
    originalPrice: 260,
    discount: 20,
    rating: 3.5,
    reviewsCount: 160,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800'],
    colors: [{ name: 'Indigo Blue', hex: '#1e40af' }],
    sizes: ['30', '32', '34', '36'],
    tags: ['Casual', 'Jeans', 'New'],
    inStock: true,
    featured: true,
    isNew: true
  },
  {
    id: 'prod-checkered-shirt',
    title: 'Checkered Shirt',
    subtitle: 'Soft Cotton Plaid Button Down',
    description: 'Casual plaid shirt suitable for layering.',
    price: 180,
    rating: 4.5,
    reviewsCount: 110,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800'],
    colors: [{ name: 'Red Plaid', hex: '#991b1b' }],
    sizes: ['Small', 'Medium', 'Large'],
    tags: ['Casual', 'Shirts', 'New'],
    inStock: true,
    featured: true,
    isNew: true
  },
  {
    id: 'prod-sleeve-striped',
    title: 'Sleeve Striped T-shirt',
    subtitle: 'Contrast Striped Sleeve Raglan Tee',
    description: 'Breathable cotton tee with active sleeve stripe accents.',
    price: 130,
    originalPrice: 160,
    discount: 30,
    rating: 4.5,
    reviewsCount: 88,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'],
    colors: [{ name: 'Orange Black', hex: '#ea580c' }],
    sizes: ['Small', 'Medium', 'Large'],
    tags: ['Casual', 'T-Shirts', 'New'],
    inStock: true,
    featured: true,
    isNew: true
  },
  {
    id: 'prod-vertical-striped',
    title: 'Vertical Striped Shirt',
    subtitle: 'Breathable Linen Summer Shirt',
    description: 'Lightweight linen blend striped shirt.',
    price: 212,
    originalPrice: 232,
    discount: 20,
    rating: 5.0,
    reviewsCount: 210,
    category: 'formal',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800'],
    colors: [{ name: 'Sage Green', hex: '#15803d' }],
    sizes: ['Medium', 'Large', 'X-Large'],
    tags: ['Top Selling', 'Shirt'],
    inStock: true,
    featured: true
  },
  {
    id: 'prod-courage-graphic',
    title: 'Courage Graphic T-shirt',
    subtitle: 'Streetwear Printed Oversized Tee',
    description: 'Heavyweight graphic tee with typography.',
    price: 145,
    rating: 4.0,
    reviewsCount: 175,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800'],
    colors: [{ name: 'Terracotta', hex: '#c2410c' }],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    tags: ['Top Selling', 'Graphic Tee'],
    inStock: true,
    featured: true
  },
  {
    id: 'prod-loose-bermuda',
    title: 'Loose Fit Bermuda Shorts',
    subtitle: 'Denim Knee-Length Shorts',
    description: 'Relaxed fit 5-pocket denim bermuda shorts.',
    price: 80,
    rating: 3.0,
    reviewsCount: 64,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=800'],
    colors: [{ name: 'Light Wash', hex: '#60a5fa' }],
    sizes: ['30', '32', '34', '36'],
    tags: ['Top Selling', 'Shorts'],
    inStock: true,
    featured: true
  },
  {
    id: 'prod-polo-contrast',
    title: 'Polo with Contrast Trims',
    subtitle: 'Teal Blue Casual Collar Polo Shirt',
    description: 'Sophisticated polo shirt with contrast collar trims.',
    price: 212,
    originalPrice: 242,
    discount: 20,
    rating: 4.0,
    reviewsCount: 78,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800'],
    colors: [{ name: 'Teal Blue', hex: '#0284c7' }],
    sizes: ['Medium', 'Large', 'X-Large'],
    tags: ['Casual', 'Polo'],
    inStock: true,
    featured: false
  }
];

// --- 6 EXACT REVIEWS FROM REFERENCE SCREENSHOTS (Images 2 & 4) ---
export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    userName: 'Samantha D.',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    rating: 4.5,
    comment: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt!",
    date: 'Posted on August 14, 2023',
    verified: true
  },
  {
    id: 'rev-2',
    userName: 'Alex M.',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    rating: 4.0,
    comment: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this shirt definitely gets a thumbs up from me!",
    date: 'Posted on August 15, 2023',
    verified: true
  },
  {
    id: 'rev-3',
    userName: 'Ethan R.',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    rating: 4.5,
    comment: "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt.",
    date: 'Posted on August 16, 2023',
    verified: true
  },
  {
    id: 'rev-4',
    userName: 'Olivia P.',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    rating: 4.0,
    comment: "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this shirt stand out.",
    date: 'Posted on August 17, 2023',
    verified: true
  },
  {
    id: 'rev-5',
    userName: 'Liam K.',
    userAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    rating: 4.5,
    comment: "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of art that reflects my passion for both design and fashion.",
    date: 'Posted on August 18, 2023',
    verified: true
  },
  {
    id: 'rev-6',
    userName: 'Ava H.',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    rating: 4.5,
    comment: "I'm not just wearing a t-shirt; I'm wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this shirt a conversation starter.",
    date: 'Posted on August 19, 2023',
    verified: true
  }
];
