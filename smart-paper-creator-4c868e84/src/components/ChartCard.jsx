import React from 'react';

export default function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`card-elevated p-6 ${className}`}>
      <h3 className="font-heading font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}
