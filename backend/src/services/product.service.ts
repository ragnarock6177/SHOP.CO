import { productRepository } from '../repositories/product.repository.js';

export class ProductService {
  async getCatalog(query: { category?: string; search?: string; limit?: number }) {
    return productRepository.findAll(query);
  }

  async getProductDetails(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }
}

export const productService = new ProductService();
