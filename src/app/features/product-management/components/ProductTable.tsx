import React from 'react';
import { Edit, Trash2, Tag, Calendar, Layers, Eye } from 'lucide-react';
import { Product } from '../services/productApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border">
            <TableRow>
              <TableHead className="w-[300px] text-xs font-semibold uppercase tracking-wider text-muted-foreground py-4 px-6">Sản phẩm</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-4 px-4">Danh mục</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-4 px-4">Giá bán</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-4 px-4">Tồn kho</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-4 px-4">Ngày tạo</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground py-4 px-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Không tìm thấy sản phẩm nào
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock <= 10;

                return (
                  <TableRow key={product.id} className="hover:bg-muted/10 transition-colors border-b border-border last:border-0">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                          <img
                            src={product.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=60'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=60';
                            }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground text-sm line-clamp-1">{product.name}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{product.description}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-4">
                      <Badge variant="outline" className="border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg px-2.5 py-0.5">
                        {product.category}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 px-4 font-bold text-foreground">
                      {formatPrice(product.price)}
                    </TableCell>

                    <TableCell className="py-4 px-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center text-xs font-semibold text-rose-600 dark:text-rose-400">
                          Hết hàng
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400">
                          Còn {product.stock} sản phẩm
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Còn {product.stock} sản phẩm
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-4 px-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(product.createdAt)}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(product)}
                          className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(product.id)}
                          className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
