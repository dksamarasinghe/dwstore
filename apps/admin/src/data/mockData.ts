import { ProductItem, OrderItem, ReviewItem, CustomerItem, CategoryItem, CouponItem, ShipmentItem, AbandonedCartItem } from '../types';

export const initialProducts: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'T900 Ultra 2 Big 2.19" Bluetooth Calling Smart Watch',
    sku: 'DW-SW-T900U2',
    brand: 'DWstore',
    category: 'SmartWatches',
    regularPrice: 2450,
    salePrice: 1990,
    stock: 84,
    status: 'Active',
    salesCount: 482,
    rating: 4.8,
    shortDesc: '<ul>\n  <li>2.19" Infinite HD Display & Bluetooth Calling</li>\n  <li>Heart rate, SpO2 & Sleep health tracking</li>\n  <li>Wireless Magnetic Charging & IP67 Waterproof</li>\n</ul>',
    description: 'The T900 Ultra 2 combines aerospace titanium-finish casing with a vivid 2.19-inch high-resolution IPS display. Equipped with modern dual-mode Bluetooth calling, real-time sports metrics, customizable watch faces, and 7 days battery standby.',
    attributes: [
      { name: 'Display Size', values: '2.19 inch Infinite HD Screen' },
      { name: 'Colors', values: 'Midnight Black, Alpine Orange, Silver Gray' },
      { name: 'Warranty', values: 'Checking Warranty & 7 Days Replacement' },
      { name: 'Battery Standby', values: 'Up to 7 Days' },
    ]
  },
  {
    id: 'prod-2',
    name: 'Sony Theatre Bar 6 High-Res Cinematic Soundbar with Subwoofer',
    sku: 'DW-AUD-SN-TB6',
    brand: 'Sony',
    category: 'Audio & Speakers',
    regularPrice: 135000,
    salePrice: 119500,
    stock: 12,
    status: 'Active',
    salesCount: 39,
    rating: 4.9,
    shortDesc: '<ul>\n  <li>Dolby Atmos 5.1ch 360 Spatial Sound Mapping</li>\n  <li>Wireless Active Subwoofer for deep bass</li>\n  <li>HDMI eARC & Optical input connectivity</li>\n</ul>',
    description: 'Experience theater-level immersive acoustic performance with the Sony Theatre Bar 6. Features dedicated wireless subwoofer, Dolby Atmos and DTS:X support, and effortless wireless TV sync.',
    attributes: [
      { name: 'Channels', values: '5.1 Channel Surround' },
      { name: 'Connectivity', values: 'HDMI eARC, Bluetooth 5.3, Optical' },
      { name: 'Warranty', values: '6 Months DWstore Replacement Warranty' },
    ]
  },
  {
    id: 'prod-3',
    name: 'Havit H2002D 53mm Driver Professional Gaming Headset',
    sku: 'DW-AUD-HV-2002',
    brand: 'Havit',
    category: 'Audio & Speakers',
    regularPrice: 9500,
    salePrice: 8250,
    stock: 28,
    status: 'Active',
    salesCount: 215,
    rating: 4.7,
    shortDesc: '<ul>\n  <li>53mm high magnetic flux drivers for pinpoint positional audio</li>\n  <li>Detachable noise-cancelling condenser mic</li>\n  <li>Protein memory foam ear cushions</li>\n</ul>',
    description: 'Engineered for esports competitors, the Havit H2002D delivers crisp highs, balanced mids, and thunderous bass. Metal frost headband and plush memory foam ensure marathon comfort.',
    attributes: [
      { name: 'Driver Diameter', values: '53mm' },
      { name: 'Plug Type', values: '3.5mm Gold-plated (PC / PS5 / Xbox / Mobile)' },
      { name: 'Warranty', values: '6 Months Warranty' },
    ]
  },
  {
    id: 'prod-4',
    name: 'Baseus 65W GaN5 Pro Fast Wall Charger 3-Port Quick Charge',
    sku: 'DW-ACC-BS-65W',
    brand: 'Baseus',
    category: 'Accessories & Chargers',
    regularPrice: 8900,
    salePrice: 7490,
    stock: 45,
    status: 'Active',
    salesCount: 310,
    rating: 4.9,
    shortDesc: '<ul>\n  <li>65W GaN5 Technology: 30% smaller & cooler</li>\n  <li>Dual Type-C + USB-A multi-device fast charge</li>\n  <li>Supports PD3.0, QC4+, PPS protocols for MacBooks & Smartphones</li>\n</ul>',
    description: 'Charge your laptop, phone, and tablet simultaneously with the high-efficiency Baseus GaN5 Pro 65W charging adapter. Built with temperature control and surge safeguards.',
    attributes: [
      { name: 'Output Power', values: '65W Max' },
      { name: 'Ports', values: '2x USB-C + 1x USB-A' },
      { name: 'Compatibility', values: 'Apple MacBook, iPhone 16/15, Samsung S24, iPads' },
    ]
  },
  {
    id: 'prod-5',
    name: 'Remax RPP-291 80000mAh Massive Capacity Outdoor Power Bank',
    sku: 'DW-ACC-RX-80K',
    brand: 'Remax',
    category: 'Accessories & Chargers',
    regularPrice: 18500,
    salePrice: 16900,
    stock: 4,
    status: 'Low stock',
    salesCount: 94,
    rating: 4.6,
    shortDesc: '<ul>\n  <li>80,000mAh Polymer battery capacity</li>\n  <li>22.5W Two-Way Fast Charging with built-in LED torch</li>\n  <li>4 Output USB ports + Type-C PD input/output</li>\n</ul>',
    description: 'Ultimate power station for camping, load-shedding, and heavy travel. Charges an iPhone up to 18 times on a single charge.',
    attributes: [
      { name: 'Capacity', values: '80,000mAh / 296Wh' },
      { name: 'Fast Charging', values: '22.5W Super Charge / 20W PD' },
      { name: 'Warranty', values: '6 Months Warranty' },
    ]
  },
  {
    id: 'prod-6',
    name: 'HK9 Pro Max Plus AMOLED Gen 3 Smartwatch (ChatGPT & NFC)',
    sku: 'DW-SW-HK9PMP',
    brand: 'DWstore',
    category: 'SmartWatches',
    regularPrice: 8900,
    salePrice: 7850,
    stock: 0,
    status: 'Out of stock',
    salesCount: 388,
    rating: 4.9,
    shortDesc: '<ul>\n  <li>Genuine AMOLED display with 60Hz high refresh rate</li>\n  <li>Built-in ChatGPT integration & Local music storage</li>\n  <li>Dual-core processor with super smooth animation</li>\n</ul>',
    description: 'Flagship smartwatch with vibrant AMOLED screen, dynamic island notifications, sound recording, and magnetic lock strap design.',
    attributes: [
      { name: 'Display', values: '2.02" AMOLED (485x520)' },
      { name: 'Sensors', values: 'Optical HR, SpO2, Blood Pressure Sensor' },
    ]
  }
];

export const initialOrders: OrderItem[] = [
  {
    orderId: 'DW-10482',
    createdAt: '2026-10-30 09:15 AM',
    customerName: 'Kavindu Perera',
    customerEmail: 'kavindu.p@gmail.com',
    customerPhone: '+94 77 123 4567',
    shippingAddress: 'No. 45/2, Temple Road, Maharagama',
    city: 'Maharagama',
    postalCode: '10280',
    status: 'processing',
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Unpaid',
    total: 3980,
    subtotal: 3500,
    shippingCost: 480,
    items: [
      {
        productId: 'prod-1',
        productTitle: 'T900 Ultra 2 Big 2.19" Bluetooth Calling Smart Watch',
        productSku: 'DW-SW-T900U2',
        quantity: 1,
        price: 1990
      },
      {
        productId: 'prod-misc-1',
        productTitle: 'Silicone Ocean Strap Alpine Orange for Ultra Watch',
        quantity: 2,
        price: 755
      }
    ],
    notes: 'Please call before delivery. Working hours preferred.'
  },
  {
    orderId: 'DW-10481',
    createdAt: '2026-10-29 04:30 PM',
    customerName: 'Nimesha Fernando',
    customerEmail: 'nimesha.f@yahoo.com',
    customerPhone: '+94 71 890 1234',
    shippingAddress: '78 Galle Road, Mount Lavinia',
    city: 'Mount Lavinia',
    postalCode: '10370',
    status: 'delivered',
    paymentMethod: 'Koko (Buy Now Pay Later)',
    paymentStatus: 'Paid',
    total: 8250,
    subtotal: 7850,
    shippingCost: 400,
    items: [
      {
        productId: 'prod-3',
        productTitle: 'Havit H2002D 53mm Driver Professional Gaming Headset',
        productSku: 'DW-AUD-HV-2002',
        quantity: 1,
        price: 7850
      }
    ]
  },
  {
    orderId: 'DW-10480',
    createdAt: '2026-10-29 01:10 PM',
    customerName: 'Roshan Samarasinghe',
    customerEmail: 'roshan.sam@gmail.com',
    customerPhone: '+94 76 543 9876',
    shippingAddress: '23/A, Kandy Road, Kiribathgoda',
    city: 'Kiribathgoda',
    status: 'shipped',
    paymentMethod: 'Direct Bank Transfer / PayHere',
    paymentStatus: 'Paid',
    total: 119900,
    subtotal: 119500,
    shippingCost: 400,
    items: [
      {
        productId: 'prod-2',
        productTitle: 'Sony Theatre Bar 6 High-Res Cinematic Soundbar',
        productSku: 'DW-AUD-SN-TB6',
        quantity: 1,
        price: 119500
      }
    ]
  },
  {
    orderId: 'DW-10479',
    createdAt: '2026-10-28 11:20 AM',
    customerName: 'Chamath Weerakkody',
    customerEmail: 'chamath.w@outlook.com',
    customerPhone: '+94 70 334 1122',
    shippingAddress: '12 Hospital Road, Kalubowila',
    city: 'Dehiwala',
    status: 'pending',
    paymentMethod: 'Mintpay (3-Installments)',
    paymentStatus: 'Paid',
    total: 7890,
    subtotal: 7490,
    shippingCost: 400,
    items: [
      {
        productId: 'prod-4',
        productTitle: 'Baseus 65W GaN5 Pro Fast Wall Charger 3-Port Quick Charge',
        productSku: 'DW-ACC-BS-65W',
        quantity: 1,
        price: 7490
      }
    ]
  },
  {
    orderId: 'DW-10478',
    createdAt: '2026-10-28 09:05 AM',
    customerName: 'Isuru Jayawardena',
    customerEmail: 'isuru.j@gmail.com',
    customerPhone: '+94 78 901 2345',
    shippingAddress: '55 Peradeniya Road, Kandy',
    city: 'Kandy',
    status: 'cancelled',
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Unpaid',
    total: 16900,
    subtotal: 16500,
    shippingCost: 400,
    items: [
      {
        productId: 'prod-5',
        productTitle: 'Remax RPP-291 80000mAh Massive Capacity Outdoor Power Bank',
        productSku: 'DW-ACC-RX-80K',
        quantity: 1,
        price: 16500
      }
    ]
  }
];

export const initialReviews: ReviewItem[] = [
  { id: 'rev-1', name: 'Sisira Ranasinghe', time: '2 months ago', rating: 5, text: 'Super Quality Genuine Product! Delivery took just 24 hours to Colombo. Thank you DWstore team!', verified: true, location: 'Borella Rd Store' },
  { id: 'rev-2', name: 'Kalder Helessage', time: '2 months ago', rating: 5, text: 'Very good thank you for your service ❤️ Best warranty support in Sri Lanka.', verified: true, location: 'Borella Rd Store' },
  { id: 'rev-3', name: 'Ruwindi Wijethunge', time: '2 months ago', rating: 5, text: "I bought a tripod and it's better than I expected... It's in good quality. I recommend this shop.", verified: true, location: 'Borella Rd Store' },
  { id: 'rev-4', name: 'Mewan Andradi', time: '3 months ago', rating: 5, text: 'Thank you so much, DWstore.lk! I got the Sony Theatre Bar 6 at the best price. Highly recommended!', verified: true, location: 'Borella Rd Store' },
  { id: 'rev-5', name: 'Imesh Jayarathna', time: '2 months ago', rating: 5, text: 'Excellent service and Good quality genuine items. Fast delivery and reliable customer care.', verified: true, location: 'Borella Rd Store' },
  { id: 'rev-6', name: 'Niroshan Fernando', time: '1 month ago', rating: 5, text: 'Best place to buy original smartwatches and accessories with warranty in Sri Lanka. Fast delivery in 24 hours!', verified: true, location: 'Borella Rd Store' },
  { id: 'rev-7', name: 'Dinuka Pathirana', time: '3 weeks ago', rating: 5, text: '100% Genuine Aspor power bank received in perfect condition. Friendly customer support on WhatsApp!', verified: true, location: 'Borella Rd Store' },
  { id: 'rev-8', name: 'Chamara Perera', time: '1 month ago', rating: 5, text: 'Highly recommended store in Pannipitiya. Reasonable prices and authentic gadgets with official warranty.', verified: true, location: 'Borella Rd Store' },
  { id: 'rev-9', name: 'Kasun Wickramasinghe', time: '3 weeks ago', rating: 5, text: 'Ordered an T800 Ultra smartwatch. Arrived within 2 days with cash on delivery. Great battery life and display!', verified: true, location: 'Borella Rd Store' },
  { id: 'rev-10', name: 'Tharindu Madushanka', time: '4 weeks ago', rating: 5, text: 'Friendly staff and quick response. Original Remax fast charger works perfectly with my phone.', verified: true, location: 'Borella Rd Store' },
];

export const initialCategories: CategoryItem[] = [
  { id: 'cat-1', name: 'SmartWatches', slug: 'smartwatches', productCount: 142, icon: 'watch', status: 'Active', featured: true },
  { id: 'cat-2', name: 'Audio & Speakers', slug: 'audio-speakers', productCount: 88, icon: 'headphones', status: 'Active', featured: true },
  { id: 'cat-3', name: 'Accessories & Chargers', slug: 'accessories-chargers', productCount: 95, icon: 'zap', status: 'Active', featured: true },
  { id: 'cat-4', name: 'TWS Earbuds', slug: 'tws-earbuds', productCount: 64, icon: 'radio', status: 'Active', featured: true },
  { id: 'cat-5', name: 'Action Cameras & Gimbals', slug: 'cameras-gimbals', productCount: 23, icon: 'video', status: 'Active', featured: false },
  { id: 'cat-6', name: 'Straps & Watch Cases', slug: 'straps-cases', productCount: 52, icon: 'layers', status: 'Active', featured: false },
];

export const initialCustomers: CustomerItem[] = [
  { id: 'c-1', name: 'Kavindu Perera', email: 'kavindu.p@gmail.com', phone: '+94 77 123 4567', city: 'Maharagama', totalOrders: 5, totalSpent: 38450, lastOrderDate: '2026-10-30', status: 'VIP' },
  { id: 'c-2', name: 'Nimesha Fernando', email: 'nimesha.f@yahoo.com', phone: '+94 71 890 1234', city: 'Mount Lavinia', totalOrders: 3, totalSpent: 24700, lastOrderDate: '2026-10-29', status: 'Active' },
  { id: 'c-3', name: 'Roshan Samarasinghe', email: 'roshan.sam@gmail.com', phone: '+94 76 543 9876', city: 'Kiribathgoda', totalOrders: 7, totalSpent: 215400, lastOrderDate: '2026-10-29', status: 'VIP' },
  { id: 'c-4', name: 'Chamath Weerakkody', email: 'chamath.w@outlook.com', phone: '+94 70 334 1122', city: 'Dehiwala', totalOrders: 1, totalSpent: 7890, lastOrderDate: '2026-10-28', status: 'New' },
  { id: 'c-5', name: 'Dilshan Madusanka', email: 'dilshan.m@gmail.com', phone: '+94 75 889 0012', city: 'Nugegoda', totalOrders: 4, totalSpent: 42100, lastOrderDate: '2026-10-26', status: 'Active' },
];

export const initialCoupons: CouponItem[] = [
  { id: 'cp-1', code: 'DWFIRST', discountType: 'percentage', discountValue: 10, minSpend: 3000, usedCount: 184, maxUsage: 500, expiryDate: '2026-12-31', status: 'Active' },
  { id: 'cp-2', code: 'FLASH2026', discountType: 'fixed', discountValue: 500, minSpend: 5000, usedCount: 92, maxUsage: 200, expiryDate: '2026-11-15', status: 'Active' },
  { id: 'cp-3', code: 'FREESHIP', discountType: 'fixed', discountValue: 400, minSpend: 4000, usedCount: 312, maxUsage: 1000, expiryDate: '2026-12-31', status: 'Active' },
];

export const initialShipments: ShipmentItem[] = [
  { id: 'shp-1', orderId: 'DW-10480', customerName: 'Roshan Samarasinghe', carrier: 'Koombiyo Delivery', trackingNumber: 'KMB-LK-90231', dispatchedDate: '2026-10-29', status: 'Out for Delivery', destinationCity: 'Kiribathgoda' },
  { id: 'shp-2', orderId: 'DW-10481', customerName: 'Nimesha Fernando', carrier: 'Prompt Xpress', trackingNumber: 'PXP-7782190', dispatchedDate: '2026-10-28', status: 'Delivered', destinationCity: 'Mount Lavinia' },
  { id: 'shp-3', orderId: 'DW-10476', customerName: 'Malik Rizwan', carrier: 'Domex', trackingNumber: 'DMX-445102', dispatchedDate: '2026-10-27', status: 'Delivered', destinationCity: 'Kandy' },
  { id: 'shp-4', orderId: 'DW-10482', customerName: 'Kavindu Perera', carrier: 'DW Express', trackingNumber: 'DWE-COL-109', dispatchedDate: '2026-10-30', status: 'Dispatched', destinationCity: 'Maharagama' },
];

export const initialAbandonedCarts: AbandonedCartItem[] = [
  { id: 'ab-1', customerName: 'Tharindu Wickramasinghe', phone: '+94 77 445 6789', email: 'tharindu.w@gmail.com', itemCount: 2, itemsSummary: 'HK9 Pro Max Plus AMOLED + Case', totalValue: 8840, date: '1 hour ago', recoverySent: false },
  { id: 'ab-2', customerName: 'Sunil Rathnayake', phone: '+94 71 223 9081', email: 'sunil.r@live.com', itemCount: 1, itemsSummary: 'Baseus 65W GaN5 Pro Fast Charger', totalValue: 7490, date: '3 hours ago', recoverySent: true },
  { id: 'ab-3', customerName: 'Sanjeewa Silva', phone: '+94 78 554 1120', email: 'sanjeewa.silva@yahoo.com', itemCount: 1, itemsSummary: 'Remax 80000mAh Power Bank', totalValue: 16900, date: 'Yesterday', recoverySent: false },
];
