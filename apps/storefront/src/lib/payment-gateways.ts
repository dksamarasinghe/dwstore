import fs from 'fs';
import path from 'path';

function getGatewaysFilePath(): string {
  const p1 = path.join(process.cwd(), 'apps', 'storefront', 'src', 'data', 'payment-gateways.json');
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(process.cwd(), 'src', 'data', 'payment-gateways.json');
  if (fs.existsSync(p2)) return p2;
  if (process.cwd().endsWith('storefront')) {
    return p2;
  }
  return p1;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
}

export interface GatewayDiscount {
  discountEnabled?: boolean;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountBadge?: string;
}

export interface PaymentGatewaysConfig {
  payhere: GatewayDiscount & {
    enabled: boolean;
    title?: string;
    description?: string;
    mode: 'sandbox' | 'live';
    merchantId: string;
    merchantSecret: string;
    appId?: string;
    appSecret?: string;
  };
  koko: GatewayDiscount & {
    enabled: boolean;
    title?: string;
    description?: string;
    mode: 'test' | 'live';
    merchantId: string;
    apiKey: string;
    publicKey?: string;
    privateKey: string;
  };
  payzy: GatewayDiscount & {
    enabled: boolean;
    title?: string;
    description?: string;
    mode: 'test' | 'live';
    shopId: string;
    secretKey: string;
  };
  bank: GatewayDiscount & {
    enabled: boolean;
    title?: string;
    description?: string;
    accounts: BankAccount[];
    instructions: string;
  };
  cod: GatewayDiscount & {
    enabled: boolean;
    title?: string;
    description?: string;
  };
}

const DEFAULT_CONFIG: PaymentGatewaysConfig = {
  payhere: {
    enabled: false,
    title: 'PayHere Online Payment',
    description: 'Pay securely with Visa, MasterCard, Genie, FriMi or eZ Cash.',
    mode: 'sandbox',
    merchantId: '',
    merchantSecret: '',
    discountEnabled: false,
    discountType: 'percentage',
    discountValue: 0,
    discountBadge: '',
  },
  koko: {
    enabled: false,
    title: 'Koko (Buy Now Pay Later)',
    description: 'Pay in 3 interest-free installments using Debit / Credit card.',
    mode: 'test',
    merchantId: '',
    apiKey: '',
    publicKey: '',
    privateKey: '',
    discountEnabled: false,
    discountType: 'percentage',
    discountValue: 0,
    discountBadge: '',
  },
  payzy: {
    enabled: false,
    title: 'Payzy (Buy Now Pay Later)',
    description: 'Pay in up to 4 interest-free installments with Payzy.',
    mode: 'test',
    shopId: '',
    secretKey: '',
    discountEnabled: false,
    discountType: 'percentage',
    discountValue: 0,
    discountBadge: '',
  },
  bank: {
    enabled: true,
    title: 'Direct Bank Transfer / Deposit',
    description: 'Transfer directly into our Commercial Bank or Sampath Bank account and WhatsApp the slip.',
    accounts: [
      {
        id: '1',
        bankName: 'Commercial Bank of Ceylon',
        accountName: 'DWstore (Pvt) Ltd',
        accountNumber: '8010023456',
        branch: 'Colombo',
      },
    ],
    instructions: '* Please transfer the total amount and send the deposit receipt / screenshot to our WhatsApp (+94 75 669 3358) with your Order ID after placing the order.',
    discountEnabled: false,
    discountType: 'percentage',
    discountValue: 0,
    discountBadge: '',
  },
  cod: {
    enabled: true,
    title: 'Cash on Delivery (COD)',
    description: 'Pay cash to the courier delivery rider when your package arrives at your doorstep.',
    discountEnabled: false,
    discountType: 'percentage',
    discountValue: 0,
    discountBadge: '',
  },
};

export function getPaymentGatewaysConfig(): PaymentGatewaysConfig {
  const filePath = getGatewaysFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        payhere: { ...DEFAULT_CONFIG.payhere, ...parsed.payhere },
        koko: { ...DEFAULT_CONFIG.koko, ...parsed.koko },
        payzy: { ...DEFAULT_CONFIG.payzy, ...parsed.payzy },
        bank: { ...DEFAULT_CONFIG.bank, ...parsed.bank },
        cod: { ...DEFAULT_CONFIG.cod, ...parsed.cod },
      };
    }
  } catch (err) {
    console.error('Error reading payment gateways config:', err);
  }
  return DEFAULT_CONFIG;
}

export function savePaymentGatewaysConfig(updated: Partial<PaymentGatewaysConfig>): boolean {
  const filePath = getGatewaysFilePath();
  try {
    const current = getPaymentGatewaysConfig();
    const merged: PaymentGatewaysConfig = {
      ...current,
      ...updated,
      payhere: { ...current.payhere, ...updated.payhere },
      koko: { ...current.koko, ...updated.koko },
      payzy: { ...current.payzy, ...updated.payzy },
      bank: { ...current.bank, ...updated.bank },
      cod: { ...current.cod, ...updated.cod },
    };
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving payment gateways config:', err);
    return false;
  }
}
