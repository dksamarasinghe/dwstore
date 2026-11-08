// Utility to extract comprehensive technical specifications and Additional Information from product data

export interface ExtractedSpecs {
  // Identification
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  sku: string;
  displayImage: string;
  salePriceMinor: number;
  regularPriceMinor: number;
  kokoInstallmentMinor: number;
  payzyInstallmentMinor: number;
  inStock: boolean;
  stockText: string;

  // Additional Information (Attributes & Variations)
  colors: string[];
  model: string;
  type: string;
  capacity: string;
  cable: string;
  microphone: string;
  variationsCount: number;

  // Technical Hardware Specifications
  displayScreen: string;
  batteryLife: string;
  chargingMode: string;
  bluetoothConnectivity: string;
  waterResistance: string;
  buildMaterial: string;
  appCompatibility: string;
  sensorFunctions: string;
  keyFeatures: string;

  // Services & Warranties
  warranty: string;
  cashOnDelivery: string;
  deliverySpeed: string;
  returnPolicy: string;
  rating: string;
}

function cleanHtml(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\r\\n|\\n|\\r|\/n/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

export function extractProductSpecs(p: any): ExtractedSpecs {
  if (!p) {
    return {
      id: '',
      name: 'Select Product',
      slug: '',
      brand: 'DWstore',
      category: 'Electronics',
      sku: 'N/A',
      displayImage: '/dwstore_logo.png',
      salePriceMinor: 0,
      regularPriceMinor: 0,
      kokoInstallmentMinor: 0,
      payzyInstallmentMinor: 0,
      inStock: true,
      stockText: 'In Stock',
      colors: ['Standard'],
      model: '-',
      type: '-',
      capacity: '-',
      cable: '-',
      microphone: '-',
      variationsCount: 0,
      displayScreen: '-',
      batteryLife: '-',
      chargingMode: '-',
      bluetoothConnectivity: '-',
      waterResistance: '-',
      buildMaterial: '-',
      appCompatibility: '-',
      sensorFunctions: '-',
      keyFeatures: '-',
      warranty: '7-Day Checking Warranty',
      cashOnDelivery: 'Island-Wide Available',
      deliverySpeed: '1-3 Business Days',
      returnPolicy: '7 Days Replacement',
      rating: '5.0',
    };
  }

  const descClean = cleanHtml(p.description);
  const shortDescClean = cleanHtml(p.shortDescription);
  const fullText = `${descClean}\n${shortDescClean}`;

  // Price calculations
  const salePrice = p.salePriceMinor || p.minPriceMinor || p.regularPriceMinor || 0;
  const regularPrice = p.regularPriceMinor || salePrice;
  const kokoInstallment = Math.round((salePrice * 1.10) / 3);
  const payzyInstallment = Math.round((salePrice * 1.13) / 4);

  // 1. Attributes & Colors (WooCommerce Additional Information)
  const attrs = p.attributes || {};
  let colors: string[] = [];

  if (attrs.Color) {
    colors = Array.isArray(attrs.Color) ? attrs.Color : [attrs.Color];
  } else if (p.variations && p.variations.length > 0) {
    const vColors = p.variations
      .map((v: any) => v.attributes?.Color)
      .filter(Boolean);
    colors = Array.from(new Set(vColors)) as string[];
  }

  if (colors.length === 0) {
    const colMatch = fullText.match(/color(?:s)?[\s:=-]+([a-zA-Z\s,/]+)/i);
    if (colMatch && colMatch[1].length < 40) {
      colors = colMatch[1].split(/[,/]/).map((c) => c.trim()).filter(Boolean);
    }
  }

  // Model & Type
  let model = attrs.Modle || attrs.Model || '';
  if (!model) {
    const modelMatch = fullText.match(/model[\s:=-]+([^\n,.<]+)/i);
    if (modelMatch) model = modelMatch[1].trim();
    else if (p.name.includes('Series')) model = 'Series 8 / Ultra';
  }

  let type = attrs.Type || '';
  if (!type && p.categorySlugs && p.categorySlugs.length > 0) {
    type = p.categorySlugs[0].replace(/-/g, ' ').toUpperCase();
  }

  // Capacity
  let capacity = attrs.Capacity ? (Array.isArray(attrs.Capacity) ? attrs.Capacity.join(', ') : attrs.Capacity) : '';
  if (!capacity) {
    const capMatch = fullText.match(/([0-9]{3,6}\s*mAh)/i) || fullText.match(/battery[\s:=-]+([^\n,.]+)/i);
    if (capMatch) capacity = capMatch[1].trim();
  }

  // Cable
  let cable = attrs.Cable ? (Array.isArray(attrs.Cable) ? attrs.Cable.join(', ') : attrs.Cable) : '';
  if (!cable) {
    const cableMatch = fullText.match(/(type-c|lightning|micro\s*usb|usb-c|dual\s*usb)/i);
    if (cableMatch) cable = cableMatch[0].toUpperCase();
  }

  // Microphone
  let microphone = attrs.Microphone ? (Array.isArray(attrs.Microphone) ? attrs.Microphone.join(', ') : attrs.Microphone) : '';
  if (!microphone) {
    if (fullText.toLowerCase().includes('call function') || fullText.toLowerCase().includes('bluetooth calling') || fullText.toLowerCase().includes('built-in mic') || fullText.toLowerCase().includes('dual mic')) {
      microphone = 'Built-in HD Microphone (Bluetooth Calling)';
    }
  }

  // 2. Hardware specs: Screen
  let displayScreen = '';
  const screenMatch = fullText.match(/([0-9]+\.[0-9]+\s*(?:inch|[\"-]|')\s*(?:hd|lcd|amoled|ips|screen|display)?)/i)
    || fullText.match(/(?:main\s*screen|screen|display)[\s:=-]+([^\n,.<]+)/i);
  if (screenMatch) {
    displayScreen = (screenMatch[1] || screenMatch[0]).trim();
  }

  // Battery life
  let batteryLife = capacity ? `${capacity} Rechargeable` : '';
  const standbyMatch = fullText.match(/(?:standby|battery\s*life|working\s*time)[\s:=-]+([^\n,.<]+)/i);
  if (standbyMatch) {
    batteryLife = batteryLife ? `${batteryLife} (${standbyMatch[1].trim()})` : standbyMatch[1].trim();
  }

  // Charging Mode
  let chargingMode = '';
  const chgMatch = fullText.match(/(?:charging\s*mode|charging|fast\s*charging|input|output)[\s:=-]+([^\n,.<]+)/i);
  if (chgMatch) {
    chargingMode = chgMatch[0].trim();
  } else if (fullText.toLowerCase().includes('wireless charging')) {
    chargingMode = 'Wireless Magnetic Charging';
  } else if (fullText.toLowerCase().includes('22.5w')) {
    chargingMode = '22.5W PD + QC Super Fast Charge';
  } else if (fullText.toLowerCase().includes('fast charge')) {
    chargingMode = 'Fast Charging Supported';
  }

  // Bluetooth
  let bluetoothConnectivity = '';
  const btMatch = fullText.match(/(?:bluetooth|bt)[\s:=-]*(?:v|ver|version)?\s*([0-9]\.[0-9])/i)
    || fullText.match(/(bluetooth\s*[0-9]\.[0-9])/i);
  if (btMatch) {
    bluetoothConnectivity = typeof btMatch === 'string' ? btMatch : (btMatch[1] ? `Bluetooth ${btMatch[1]}` : btMatch[0]);
  } else if (fullText.toLowerCase().includes('bluetooth') || fullText.toLowerCase().includes('wireless')) {
    bluetoothConnectivity = 'Wireless Bluetooth Connectivity';
  }

  // Water Resistance
  let waterResistance = 'Standard Splash Resistant';
  const wpMatch = fullText.match(/(ip[0-9]{2}|ipx[0-9]|waterproof|water\s*resistant)/i);
  if (wpMatch) {
    waterResistance = wpMatch[0].toUpperCase();
  }

  // Build Material
  let buildMaterial = '';
  const matMatch = fullText.match(/(?:appearance\s*material|strap\s*meterial|material)[\s:=-]+([^\n,.<]+)/i);
  if (matMatch) {
    buildMaterial = matMatch[1].trim();
  } else if (fullText.toLowerCase().includes('silica gel')) {
    buildMaterial = 'Zinc Alloy Body + Silica Gel Strap';
  } else if (fullText.toLowerCase().includes('aluminum')) {
    buildMaterial = 'Aluminum Alloy Shell';
  }

  // App Compatibility
  let appCompatibility = '';
  const appMatch = fullText.match(/(?:app)[\s:=-]+([^\n,.<]+)/i);
  if (appMatch) {
    appCompatibility = `${appMatch[1].trim()} (iOS & Android Compatible)`;
  } else if (p.categorySlugs?.includes('smartwatches')) {
    appCompatibility = 'FitPro / HiWatch Pro (Android & iOS)';
  }

  // Sensor & Health Functions
  let sensorFunctions = '';
  if (fullText.toLowerCase().includes('heart rate') || fullText.toLowerCase().includes('blood pressure') || fullText.toLowerCase().includes('blood oxygen')) {
    sensorFunctions = 'Heart Rate, Blood Pressure, SpO2 Oxygen, Pedometer, Sleep Tracker';
  } else if (fullText.toLowerCase().includes('pedometer') || fullText.toLowerCase().includes('motion monitoring')) {
    sensorFunctions = 'Pedometer, Calorie Counter, Multi-Sport Motion Tracking';
  }

  // Key Features
  let keyFeatures = '';
  if (fullText.toLowerCase().includes('call function') || fullText.toLowerCase().includes('bluetooth call')) {
    keyFeatures = 'Bluetooth Dialing, Contact Sync, Call Log, Smart Reminders';
  } else if (fullText.toLowerCase().includes('led display') || fullText.toLowerCase().includes('digital display')) {
    keyFeatures = 'Digital LED Battery Display, Multi-Port Output';
  } else if (fullText.toLowerCase().includes('rgb')) {
    keyFeatures = 'RGB Ambient Lighting, High-Fidelity Audio, Deep Bass';
  }

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand || 'DWstore Genuine',
    category: p.categorySlugs?.[0]?.replace(/-/g, ' ').toUpperCase() || 'Electronics',
    sku: p.sku || `DW-${p.id}`,
    displayImage: p.displayImage || p.imageUrls?.[0] || '/dwstore_logo.png',
    salePriceMinor: salePrice,
    regularPriceMinor: regularPrice,
    kokoInstallmentMinor: kokoInstallment,
    payzyInstallmentMinor: payzyInstallment,
    inStock: p.inStock !== false,
    stockText: p.inStock !== false ? 'In Stock (Island-Wide Available)' : 'Available on Order',
    colors: colors.length > 0 ? colors : ['Standard Edition'],
    model: model || 'Standard Model',
    type: type || 'Genuine Electronic Accessory',
    capacity: capacity || 'Optimized Specification',
    cable: cable || 'Included / Compatible',
    microphone: microphone || 'Standard Interface',
    variationsCount: p.variations?.length || 0,
    displayScreen: displayScreen || 'Non-Display Device',
    batteryLife: batteryLife || 'Optimized Energy Consumption',
    chargingMode: chargingMode || 'Standard USB Charging',
    bluetoothConnectivity: bluetoothConnectivity || 'Standard Connection',
    waterResistance,
    buildMaterial: buildMaterial || 'Durable Impact-Resistant Enclosure',
    appCompatibility: appCompatibility || 'Universal Phone / Device Compatibility',
    sensorFunctions: sensorFunctions || 'Standard Controller',
    keyFeatures: keyFeatures || 'Original Sri Lankan Import with DWstore Quality Check',
    warranty: '7-Day Checking Warranty & Official Support',
    cashOnDelivery: 'Island-Wide Cash on Delivery (COD)',
    deliverySpeed: '1-3 Business Days Island-Wide',
    returnPolicy: '7-Day Replacement Guarantee for Manufacturer Faults',
    rating: '5.0',
  };
}
