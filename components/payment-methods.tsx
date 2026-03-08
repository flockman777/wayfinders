'use client';

import { CreditCard, Building, Wallet, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

const paymentMethods = [
  {
    id: 'bca',
    name: 'Transfer BCA',
    icon: Building,
    description: 'Virtual Account',
  },
  {
    id: 'mandiri',
    name: 'Transfer Mandiri',
    icon: Building,
    description: 'Virtual Account',
  },
  {
    id: 'bni',
    name: 'Transfer BNI',
    icon: Building,
    description: 'Virtual Account',
  },
  {
    id: 'bri',
    name: 'Transfer BRI',
    icon: Building,
    description: 'Virtual Account',
  },
  {
    id: 'qris',
    name: 'QRIS',
    icon: QrCode,
    description: 'Scan QR Code',
  },
  {
    id: 'gopay',
    name: 'GoPay',
    icon: Wallet,
    description: 'E-Wallet',
  },
  {
    id: 'ovo',
    name: 'OVO',
    icon: Wallet,
    description: 'E-Wallet',
  },
  {
    id: 'dana',
    name: 'DANA',
    icon: Wallet,
    description: 'E-Wallet',
  },
  {
    id: 'linkaja',
    name: 'LinkAja',
    icon: Wallet,
    description: 'E-Wallet',
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    icon: Wallet,
    description: 'E-Wallet',
  },
  {
    id: 'credit_card',
    name: 'Kartu Kredit',
    icon: CreditCard,
    description: 'Visa / Mastercard',
  },
];

interface PaymentMethodsProps {
  selectedMethod?: string;
  onSelectMethod: (method: string) => void;
}

export function PaymentMethods({ selectedMethod, onSelectMethod }: PaymentMethodsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;

        return (
          <button
            key={method.id}
            onClick={() => onSelectMethod(method.id)}
            className={cn(
              'p-4 rounded-lg border-2 transition-all duration-200 text-left',
              isSelected
                ? 'border-amber bg-amber/5'
                : 'border-border hover:border-amber/50'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center mb-2',
                isSelected ? 'bg-amber text-white' : 'bg-muted'
              )}
            >
              <Icon size={20} />
            </div>
            <div className="font-medium text-sm">{method.name}</div>
            <div className="text-xs text-muted-foreground">{method.description}</div>
          </button>
        );
      })}
    </div>
  );
}

export function getPaymentMethodIcon(methodId: string) {
  const method = paymentMethods.find((m) => m.id === methodId);
  return method ? method.icon : CreditCard;
}

export function getPaymentMethodName(methodId: string) {
  const method = paymentMethods.find((m) => m.id === methodId);
  return method ? method.name : methodId;
}
