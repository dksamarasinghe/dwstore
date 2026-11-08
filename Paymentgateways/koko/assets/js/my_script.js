jQuery(document).ready(function($) {
    const baseUrl = 'https://paykoko.com/'; // Replace with a dynamic value if possible

    $('.koko-logo').click(function() {
        window.open(baseUrl, "_blank");
    });

    $('.koko-info').click(function() {
        const price = $(this).data('price') || 0; // Default to 0 if price is undefined
        window.open(`${baseUrl}customer-education?Amount=${price}`, "_blank");
    });
});