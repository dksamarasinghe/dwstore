import fs from 'fs';
import path from 'path';

const GATEWAYS_FILE = path.join(process.cwd(), 'src', 'data', 'payment-gateways.json');

export interface PaymentGatewaysConfig {
  payhere: {
    enabled: boolean;
    title?: string;
    description?: string;
    mode: 'sandbox' | 'live';
    merchantId: string;
    merchantSecret: string;
    appId?: string;
    appSecret?: string;
  };
  koko: {
    enabled: boolean;
    title?: string;
    description?: string;
    mode: 'test' | 'live';
    merchantId: string;
    apiKey: string;
    publicKey?: string;
    privateKey: string;
  };
  payzy: {
    enabled: boolean;
    title?: string;
    description?: string;
    mode: 'test' | 'live';
    shopId: string;
    secretKey: string;
  };
}

export function getPaymentGatewaysConfig(): PaymentGatewaysConfig {
  try {
    if (fs.existsSync(GATEWAYS_FILE)) {
      const data = fs.readFileSync(GATEWAYS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading payment gateways config:', err);
  }
  return {
    payhere: { enabled: false, mode: 'sandbox', merchantId: '', merchantSecret: '' },
    koko: { enabled: false, mode: 'test', merchantId: '', apiKey: '', privateKey: '' },
    payzy: { enabled: false, mode: 'test', shopId: '', secretKey: '' },
  };
}

export function savePaymentGatewaysConfig(updated: Partial<PaymentGatewaysConfig>): boolean {
  try {
    const current = getPaymentGatewaysConfig();
    const merged = { ...current, ...updated };
    fs.writeFileSync(GATEWAYS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving payment gateways config:', err);
    return false;
  }
}
