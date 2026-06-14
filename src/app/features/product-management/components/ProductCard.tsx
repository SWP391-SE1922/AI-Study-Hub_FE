import React from 'react';
import { Edit, Trash2, Tag, Layers, Inbox } from 'lucide-react';
import { Product } from '../services/productApi';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const isLowStock = product.stock <= 10;
  const isOutOfStock = product.stock === 0;

  return (
    <Card className="bg-card border-border hover:border-indigo-500/40 transition-all duration-300 shadow-sm flex flex-col justify-between group overflow-hidden rounded-2xl">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60';
          }}
        />
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm shadow-sm font-semibold rounded-full border border-border/50">
            <Tag className="w-3 h-3 mr-1 text-indigo-500" />
            {product.category}
          </Badge>
          {isOutOfStock ? (
            <Badge variant="destructive" className="rounded-full shadow-sm font-semibold">
              Hết hàng
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" className="bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-sm font-semibold border-none">
              Sắp hết hàng ({product.stock})
            </Badge>
          ) : (
            <Badge variant="success" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-sm font-semibold border-none">
              Sẵn có ({product.stock})
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="space-y-1.5 p-5">
        <CardTitle className="text-lg font-bold text-foreground line-clamp-1 transition-colors group-hover:text-indigo-500">
          {product.name}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pb-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Giá bán</span>
          <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {formatPrice(product.price)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="px-5 py-4 border-t border-border bg-muted/20 flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          className="border-border hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 rounded-xl flex items-center gap-1.5"
        >
          <Edit className="w-3.5 h-3.5" />
          Sửa
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(product.id)}
          className="text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 rounded-xl flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Xóa
        </Button>
      </CardFooter>
    </Card>
  );
}
