import { Request, Response, NextFunction } from 'express';

const MOCK_PRODUCTS = [
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
    colors: [
      { name: 'Olive Green', hex: '#4b5320' },
      { name: 'Forest Teal', hex: '#1e3e3b' },
      { name: 'Dark Navy', hex: '#1c2a38' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    tags: ['T-Shirts', 'Graphic', 'Casual', 'Top Selling'],
    inStock: true,
    featured: true
  },
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
    colors: [{ name: 'Burgundy', hex: '#7f1d1d' }],
    sizes: ['Medium', 'Large', 'X-Large'],
    tags: ['Casual', 'Polo'],
    inStock: true,
    featured: true
  }
];

export const getProducts = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, limit } = req.query;
    let results = [...MOCK_PRODUCTS];

    if (category) {
      results = results.filter(
        (p) => p.category.toLowerCase() === String(category).toLowerCase()
      );
    }

    if (search) {
      const q = String(search).toLowerCase();
      results = results.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    if (limit) {
      results = results.slice(0, Number(limit));
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = MOCK_PRODUCTS.find((p) => p.id === id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};
