import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

// Wadah kontainer kartu dengan styling border dan bayangan halus
export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200",
        hoverEffect && "hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Bagian judul dan deskripsi kartu
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("flex flex-col gap-1 pb-4 border-b border-slate-100", className)} {...props}>
      {children}
    </div>
  );
};

// Bagian isi utama kartu
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
};

// Bagian footer kartu untuk tombol aksi
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-3", className)} {...props}>
      {children}
    </div>
  );
};
