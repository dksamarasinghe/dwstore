const fs = require('fs');
const readline = require('readline');
const path = require('path');

const sqlPath = path.resolve(__dirname, '../dwstorel_wp956.sql');

async function extractTrackingMeta() {
  const rl = readline.createInterface({
    input: fs.createReadStream(sqlPath),
    crlfDelay: Infinity
  });

  let currentTable = '';
  const trackingByOrderId = {};
  const allOrderMetaKeys = new Set();
  let trackingItemLines = 0;

  for await (const line of rl) {
    if (line.includes('INSERT INTO `')) {
      const parts = line.split('INSERT INTO `');
      if (parts[1]) {
        currentTable = parts[1].split('`')[0];
      }
    }

    if (currentTable === 'wpjp_wc_orders_meta') {
      if (line.includes('_wc_shipment_tracking_items')) {
        trackingItemLines++;
        // Format: (id, order_id, meta_key, meta_value)
        // Example: (3821, 31466, '_wc_shipment_tracking_items', 'a:1:{i:0;a:8:{s:17:\"tracking_provider\";s:20:\"cp-koombiyo-delivery\";...
        const m = line.match(/\(\s*(\d+)\s*,\s*(\d+)\s*,\s*'_wc_shipment_tracking_items'\s*,\s*'(.+)'\s*\)[,;]?$/);
        if (m) {
          const orderId = m[2];
          const rawValue = m[3];
          
          let trackingNumber = '';
          let provider = '';
          let dateShipped = '';

          const tnMatch = rawValue.match(/tracking_number[^\w]+s:\d+:\\"([^"\\]+)\\"/);
          if (tnMatch) trackingNumber = tnMatch[1];

          const provMatch = rawValue.match(/tracking_provider[^\w]+s:\d+:\\"([^"\\]+)\\"/);
          if (provMatch) provider = provMatch[1];

          const dateMatch = rawValue.match(/date_shipped[^\w]+s:\d+:\\"([^"\\]+)\\"/);
          if (dateMatch) dateShipped = dateMatch[1];

          trackingByOrderId[orderId] = {
            orderId,
            carrier: provider === 'cp-koombiyo-delivery' ? 'Koombiyo Delivery' : (provider || 'Koombiyo Delivery'),
            trackingNumber,
            dateShipped: dateShipped ? new Date(parseInt(dateShipped, 10) * 1000).toISOString().split('T')[0] : '',
            raw: rawValue
          };
        } else {
          // If regex didn't match line directly, let's do a more tolerant extraction
          const orderIdMatch = line.match(/\(\s*\d+\s*,\s*(\d+)\s*,\s*'_wc_shipment_tracking_items'/);
          if (orderIdMatch) {
            const orderId = orderIdMatch[1];
            let trackingNumber = '';
            let provider = '';
            let dateShipped = '';

            const tnMatch = line.match(/tracking_number[^\w]+s:\d+:\\"([^"\\]+)\\"/);
            if (tnMatch) trackingNumber = tnMatch[1];

            const provMatch = line.match(/tracking_provider[^\w]+s:\d+:\\"([^"\\]+)\\"/);
            if (provMatch) provider = provMatch[1];

            const dateMatch = line.match(/date_shipped[^\w]+s:\d+:\\"([^"\\]+)\\"/);
            if (dateMatch) dateShipped = dateMatch[1];

            trackingByOrderId[orderId] = {
              orderId,
              carrier: provider === 'cp-koombiyo-delivery' ? 'Koombiyo Delivery' : (provider || 'Koombiyo Delivery'),
              trackingNumber,
              dateShipped: dateShipped ? new Date(parseInt(dateShipped, 10) * 1000).toISOString().split('T')[0] : '',
              raw: line.slice(0, 150)
            };
          }
        }
      }

      // Check other meta_keys for courier or waybill
      const metaKeyMatch = line.match(/,\s*'(_?[a-zA-Z0-9_]+)'\s*,/);
      if (metaKeyMatch) {
        const k = metaKeyMatch[1];
        if (k.includes('tracking') || k.includes('courier') || k.includes('koombiyo') || k.includes('waybill') || k.includes('shipment')) {
          allOrderMetaKeys.add(k);
        }
      }
    }
  }

  console.log('Total tracking lines found:', trackingItemLines);
  console.log('Total unique order IDs with tracking items:', Object.keys(trackingByOrderId).length);
  console.log('Related meta keys found in wpjp_wc_orders_meta:', Array.from(allOrderMetaKeys));

  const items = Object.values(trackingByOrderId);
  console.log('\nFirst 20 real tracking items:');
  items.slice(0, 20).forEach(i => {
    console.log(`Order: DWS-${i.orderId} | Carrier: ${i.carrier} | Waybill: ${i.trackingNumber} | Date: ${i.dateShipped}`);
  });

  const providers = new Set(items.map(i => i.carrier));
  console.log('\nAll unique carriers across all tracking items:', Array.from(providers));

  return trackingByOrderId;
}

extractTrackingMeta().catch(console.error);
