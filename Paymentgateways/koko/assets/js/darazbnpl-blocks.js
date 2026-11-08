// Use the correct WooCommerce Blocks API
const { registerPaymentMethod } = window.wc?.wcBlocksRegistry || {};
const { createElement } = window.wp?.element || {};

if (registerPaymentMethod && createElement) {
    
    // Use localized data from PHP
    const data = window.darazbnplData || {};
    const logoUrl = data.logoUrl || '';
    const title = data.title || 'KokoBNPL';
    const description = data.description || 'Pay in 3 interest-free instalments using your Debit / Credit card.';
    
    registerPaymentMethod({
        name: 'darazbnpl',
        label: createElement('div', { 
            className: 'darazbnpl-payment-label'
        }, [
            createElement('img', {
                key: 'logo',
                src: logoUrl,
                style: { height: '20px', verticalAlign: 'middle', marginRight: '8px' },
                alt: title,
                onError: function(e) { 
                    e.target.style.display = 'none'; 
                }
            }),
            createElement('span', { key: 'text' }, title)
        ]),
        content: createElement('div', { 
            className: 'darazbnpl-payment-description'
        }, description),
        edit: createElement('div', null, description),
        canMakePayment: () => true,
        ariaLabel: title,
        supports: {
            features: ['products']
        }
    });
} else {
    // WooCommerce Blocks API not available — classic checkout will be used
}