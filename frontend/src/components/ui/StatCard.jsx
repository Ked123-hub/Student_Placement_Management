import React from 'react';
import { Card, CardContent } from './Card';
import { cn } from '../../utils';

export function StatCard({ title, value, icon: Icon, description, className }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <div className="text-2xl font-bold text-surface-900">{value}</div>
          {description && (
            <p className="text-xs text-surface-400">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-primary-50 text-primary-600 rounded-full">
            <Icon size={24} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
