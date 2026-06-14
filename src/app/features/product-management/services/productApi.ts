export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  createdAt: string;
}

// Initial mock data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Tài Khoản ChatGPT Plus (1 Tháng)',
    description: 'Tài khoản OpenAI ChatGPT Plus với quyền truy cập GPT-4, GPT-4o và các công cụ phân tích nâng cao.',
    price: 450000,
    category: 'Tài khoản AI',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    stock: 50,
    createdAt: '2026-06-01T08:00:00.000Z',
  },
  {
    id: '2',
    name: 'Khóa học Prompt Engineering Masterclass',
    description: 'Làm chủ nghệ thuật viết prompt cho các mô hình ngôn ngữ lớn (LLM) như GPT-4, Claude 3 và Gemini.',
    price: 299000,
    category: 'Khóa học',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    stock: 999,
    createdAt: '2026-06-05T10:30:00.000Z',
  },
  {
    id: '3',
    name: 'GitHub Copilot Subscription (6 Tháng)',
    description: 'Công cụ lập trình AI đắc lực giúp bạn viết code nhanh hơn và thông minh hơn trực tiếp trong IDE.',
    price: 890000,
    category: 'Công cụ Code',
    imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    stock: 15,
    createdAt: '2026-06-10T15:45:00.000Z',
  },
  {
    id: '4',
    name: 'Ebook Tối Ưu Hóa Quy Trình Với AI',
    description: 'Hướng dẫn chi tiết từng bước tích hợp AI vào quy trình làm việc hàng ngày của cá nhân và doanh nghiệp.',
    price: 99000,
    category: 'Tài liệu PDF',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    stock: 999,
    createdAt: '2026-06-11T12:00:00.000Z',
  },
];

// Helper to interact with localStorage
const getStoredProducts = (): Product[] => {
  const data = localStorage.getItem('hub_products');
  if (!data) {
    localStorage.setItem('hub_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(data);
};

const saveProducts = (products: Product[]) => {
  localStorage.setItem('hub_products', JSON.stringify(products));
};

// Simulate network latency helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const productApi = {
  // GET /products
  async getProducts(params?: { search?: string; category?: string }): Promise<Product[]> {
    await delay(600); // simulate network delay
    let products = getStoredProducts();

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    if (params?.category && params.category !== 'All') {
      products = products.filter((p) => p.category === params.category);
    }

    return products;
  },

  // GET /products/:id
  async getProductById(id: string): Promise<Product> {
    await delay(300);
    const products = getStoredProducts();
    const product = products.find((p) => p.id === id);
    if (!product) {
      throw new Error('Không tìm thấy sản phẩm này!');
    }
    return product;
  },

  // POST /products
  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    await delay(800);
    const products = getStoredProducts();
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    saveProducts(products);
    return newProduct;
  },

  // PUT /products/:id
  async updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
    await delay(800);
    const products = getStoredProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Không tìm thấy sản phẩm để cập nhật!');
    }

    const updatedProduct = {
      ...products[index],
      ...productData,
    };
    products[index] = updatedProduct;
    saveProducts(products);
    return updatedProduct;
  },

  // DELETE /products/:id
  async deleteProduct(id: string): Promise<boolean> {
    await delay(600);
    const products = getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) {
      throw new Error('Không tìm thấy sản phẩm để xóa!');
    }
    saveProducts(filtered);
    return true;
  },
};
