import { useState, useEffect, useCallback } from 'react';
import { Product, productApi } from '../services/productApi';

export interface UseProductListReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: { search: string; category: string };
  setFilters: React.Dispatch<React.SetStateAction<{ search: string; category: string }>>;
  fetchProducts: () => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  editProduct: (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt'>>) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
}

export function useProductList(): UseProductListReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ search: string; category: string }>({
    search: '',
    category: 'All',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.getProducts({
        search: filters.search,
        category: filters.category,
      });
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const newProduct = await productApi.createProduct(productData);
      await fetchProducts();
      return newProduct;
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thêm sản phẩm');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    setLoading(true);
    try {
      const updatedProduct = await productApi.updateProduct(id, productData);
      await fetchProducts();
      return updatedProduct;
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật sản phẩm');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id: string) => {
    setLoading(true);
    try {
      await productApi.deleteProduct(id);
      await fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa sản phẩm');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    filters,
    setFilters,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
  };
}
