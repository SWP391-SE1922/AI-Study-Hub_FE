import React, { useState } from 'react';
import { Plus, Search, Grid, List, PlusCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { useProductList, ProductCard, ProductTable, Product } from '@/app/features/product-management';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';

export function AdminProductPage() {
  const {
    products,
    loading,
    error,
    filters,
    setFilters,
    addProduct,
    editProduct,
    removeProduct,
  } = useProductList();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('Tài khoản AI');
  const [stock, setStock] = useState(10);
  const [imageUrl, setImageUrl] = useState('');

  const openAddDialog = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(0);
    setCategory('Tài khoản AI');
    setStock(10);
    setImageUrl('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategory(product.category);
    setStock(product.stock);
    setImageUrl(product.imageUrl);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      imageUrl,
    };

    try {
      if (editingProduct) {
        await editProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await removeProduct(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const categories = ['All', 'Tài khoản AI', 'Khóa học', 'Công cụ Code', 'Tài liệu PDF'];

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500" />
              Quản lý sản phẩm (Product Management)
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Quản lý các sản phẩm, khóa học, và công cụ hỗ trợ học tập bằng AI.
            </p>
          </div>
          <Button onClick={openAddDialog} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </Button>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] items-center pt-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Tìm kiếm theo tên sản phẩm..."
              className="pl-10 rounded-xl"
            />
          </div>

          {/* Category badges/filters */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={filters.category === cat ? 'default' : 'outline'}
                onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
                className={`cursor-pointer rounded-lg px-3 py-1 font-medium select-none transition-colors ${
                  filters.category === cat
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900'
                }`}
              >
                {cat === 'All' ? 'Tất cả' : cat}
              </Badge>
            ))}
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-slate-900/50">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('table')}
              className={`h-8 w-8 rounded-lg ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-950 dark:text-indigo-400' : 'text-slate-500'}`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`h-8 w-8 rounded-lg ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-950 dark:text-indigo-400' : 'text-slate-500'}`}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải danh sách sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-5 rounded-2xl border border-rose-200/50 bg-rose-50/50 text-rose-600 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-3xl border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-base">Không tìm thấy sản phẩm nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Thử thay đổi bộ lọc tìm kiếm hoặc thêm sản phẩm mới.</p>
          <Button onClick={openAddDialog} size="sm" variant="outline" className="mt-2 rounded-xl">
            Tạo sản phẩm đầu tiên
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <ProductTable products={products} onEdit={openEditDialog} onDelete={handleDelete} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={openEditDialog}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 border-border bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Điền các thông tin sản phẩm bên dưới để lưu vào hệ thống.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">Tên sản phẩm *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: ChatGPT Plus Subscription"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-semibold text-foreground">Mô tả sản phẩm *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập thông tin chi tiết về sản phẩm..."
                required
                className="min-h-[90px] rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-sm font-semibold text-foreground">Giá bán (VND) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={0}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stock" className="text-sm font-semibold text-foreground">Tồn kho *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  min={0}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm font-semibold text-foreground">Danh mục *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Tài khoản AI">Tài khoản AI</option>
                <option value="Khóa học">Khóa học</option>
                <option value="Công cụ Code">Công cụ Code</option>
                <option value="Tài liệu PDF">Tài liệu PDF</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imageUrl" className="text-sm font-semibold text-foreground">Đường dẫn hình ảnh (URL)</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Đường dẫn đến hình ảnh (Unsplash, v.v.)"
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl border-slate-200">
                Hủy
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                {editingProduct ? 'Cập nhật' : 'Lưu sản phẩm'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
