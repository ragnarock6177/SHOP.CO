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

export const PRODUCTS: Product[] = [];

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
