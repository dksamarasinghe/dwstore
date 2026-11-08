<?php

if (!defined('ABSPATH')) {
	exit; 
}

// detect conflicting plugins
$conflicting_plugins = []; //consider this as the flag
$active_plugins = get_option('active_plugins');
if ( is_array($active_plugins) && in_array('woo-discount-rules/woo-discount-rules.php', apply_filters('active_plugins', $active_plugins))){
	$conflicting_plugins = ['woo-discount-rules'];
}

// add jquery
add_action( 'wp_enqueue_scripts', function() {
	// register css
	wp_register_style('my_style', plugins_url('/assets/css/my_style.css', __FILE__));
    wp_enqueue_style('my_style');

	// register js
    wp_register_script('my_script', plugins_url('assets/js/my_script.js', __FILE__), array('jquery'),'1.1', true);
    wp_enqueue_script('my_script');
} );

// method to calculate installment for simple product
function koko_calculate_simple_product_installment($product){
    if ($product->get_type() != 'simple') return;

    // check for conflicts with wdr
    $price = koko_calculate_simple_product_installment_with_wdr($product);
    
    $price = floatval($price);

    // Prevent division by zero
    if ($price == 0) {
        return number_format(0, 2, '.', ',');
    }
    
    return number_format($price / 3, 2, '.', ',');
}

// method to calculate installment for simple product - with woo discount rules
function koko_calculate_simple_product_installment_with_wdr($product){
	$price = $product->get_price(); //gets active price
	
	global $conflicting_plugins;
	if (in_array('woo-discount-rules', $conflicting_plugins, false) == false) return $price;

	$quantity = 1;
	$custom_price = 0;
	$return_details = 'discounted_price';
	$manual_request = true;
	$is_cart = false;

	$wdr = apply_filters('advanced_woo_discount_rules_get_product_discount_price_from_custom_price', 
		$price, 
		$product, 
		$quantity, 
		$custom_price, 
		$return_details, 
		$manual_request, 
		$is_cart
	);

	// wdr is not applied on product - returns active price
	if($wdr === false){
		return $price;
	}
	
	// wdr is applied on product - returns discounted price
	return $wdr;
}

// method to calculate installment for variable product
function koko_calculate_variable_product_installment($product){
	if ($product->get_type() != 'variable') return;

	// check for conflicts with wdr
	list($min_price, $max_price) = koko_calculate_variable_product_installment_with_wdr($product); //this function returns an array

	// if max price == min price return a single price
	if ($min_price === $max_price){
		return number_format($min_price / 3, 2, '.', ',');
	}

	// convert to decimals
	$min_price = number_format($min_price / 3, 2, '.', ',');
	$max_price = number_format($max_price / 3, 2, '.', ',');

	$currency_symbol = get_woocommerce_currency_symbol();

	// if not return the range
	return sprintf("%s - %s%s", $min_price, $currency_symbol, $max_price);
}

// method to calculate installment for variable product - with woo discount rules
function koko_calculate_variable_product_installment_with_wdr($product){
	$min_price = $product->get_variation_price('min');
	$max_price = $product->get_variation_price('max');
	
	global $conflicting_plugins;
	if (in_array('woo-discount-rules', $conflicting_plugins, false) == false) return array($min_price, $max_price);

	$quantity = 1;
	$return_details = 'all';
	$manual_request = true;
	$is_cart = false;

	// get min_price
	$wdr_min = apply_filters('advanced_woo_discount_rules_get_product_discount_price_from_custom_price',
		$min_price,
		$product, 
		$quantity, 
		$min_price, 
		$return_details, 
		$manual_request, 
		$is_cart
	);

	// if wdr is applied
	if($wdr_min !== false){
		$min_price = $wdr_min['discounted_price'];
	}

	// get max_price
	$wdr_max = apply_filters('advanced_woo_discount_rules_get_product_discount_price_from_custom_price',
		$max_price,
		$product, 
		$quantity, 
		$max_price, 
		$return_details, 
		$manual_request, 
		$is_cart
	);

	// if wdr is applied
	if($wdr_max !== false){
		$max_price = $wdr_max['discounted_price'];
	}

	return array($min_price, $max_price);
}

// method to calculate installment for a single variant - with woo discount rules
function koko_calculate_variant_installment_with_wdr($variant, $product){
	if ($product->get_type() !== 'variable') return 'Error: not a variable product';

	$price = $variant['display_price']; //gets active price

	global $conflicting_plugins;
	if (in_array('woo-discount-rules', $conflicting_plugins) == false) return $price;

	
	$quantity = 1;
	$custom_price = 0;
	$return_details = 'discounted_price';
	$manual_request = true;
	$is_cart = false;
	
	$wdr = apply_filters('advanced_woo_discount_rules_get_product_discount_price_from_custom_price', 
		$price, 
		$variant, 
		$quantity, 
		$custom_price, 
		$return_details, 
		$manual_request, 
		$is_cart
	);

	if($wdr === false){
		return $price;
	}
	
	return $wdr;
}

// method to create the sentence for displaying price breakdown
function koko_create_sentence($price, $currency_symbol, $wording){
	return sprintf(" or 3 %s <b>%s%s</b> with ", $wording, $currency_symbol, $price);
}

// method to display selected single variant product price
add_filter( 'woocommerce_available_variation', 'koko_get_variable_product_installment', 10, 3 );
function koko_get_variable_product_installment($variation_data, $product, $variation) {
	$koko_font_size = '15px';
	$koko_wording = 'X';
	$koko_css_classname = 'koko-product-price-installment-in-variation';
	$koko_logo_height = '19px';
	$koko_icon_height = '12px';
	$currency_symbol = get_woocommerce_currency_symbol();
	
	// get variable products price
	$price = koko_calculate_variant_installment_with_wdr($variation_data, $product);
	$price = number_format($price / 3, 2, '.', ',');
	$sentence = koko_create_sentence($price, $currency_symbol, $koko_wording);

	if( !empty($variation_data['price_html']) ){
		$koko_logo = '<a href="https://paykoko.com/" style="text-decoration: none;" target="_blank">
				<img style="display: inline-flex; position: relative; cursor: pointer; height: ' . $koko_logo_height . '; vertical-align: middle; width: auto;" class="koko-logo" src="https://paykoko.com/img/logo1.7ff549c0.png" alt="koko">
			</a>
			<a href="https://paykoko.com/customer-education?Amount=' . $price . '" target="_blank">
				<img style="display: inline-flex; position: relative; cursor: pointer; height: ' . $koko_icon_height . '; vertical-align: middle; width: auto;" class="koko-info" src="https://koko-merchant.oss-ap-southeast-1.aliyuncs.com/bnpl-site-cms-dev/koko-images/info.png" alt="koko">
			</a>
		</span>';
		$variation_data['price_html'] .= '<div style="font-size: ' . $koko_font_size . '; color: #8e8e8e; line-height: 30px; font-weight: 500" class="' . $koko_css_classname . '">' . $sentence . $koko_logo . '</div><br>';
	}

	return $variation_data;
}

// single function to display monthly installment
add_filter('woocommerce_get_price_html', 'koko_display_price_breakdown', 10, 2);
function koko_display_price_breakdown($default_price, $product)
{		

	// display koko price breakdown - only in frontend
	if (is_admin() && ! wp_doing_ajax()) return $default_price;

	$koko_css_classname = 'product-price-installments-not-in-variation';
	$koko_logo_height = '14px';
	$koko_font_size = '13px';
	$koko_wording = "X";
	$koko_icon_height = '12px';

	// get store currency symbol
	$currency_symbol = get_woocommerce_currency_symbol();

	// get current product
	if (wc_get_product() !== null) $product = wc_get_product();

	// filter hook to display certain categories only
	$display = 1;
	$display = apply_filters('koko_price_breakdown_display', $display, $product);
	if ($display !== 1) return $default_price;

	// check product type : simple, variation, download, grouped, external etc.
	if ($product != null) {
	    $product_type = strtolower(substr(get_class($product), strrpos(get_class($product), "_") + 1));
	} else {
	    $product_type = '';
	}

	global $woocommerce_loop;

	if (is_product() && isset($woocommerce_loop['name']) && $woocommerce_loop['name'] == "" ) {
		$koko_css_classname = 'product-price-installments-not-in-variation-single';
		$koko_wording = "X";
		$koko_font_size = "18px";
		$koko_logo_height = '19px';
		$koko_icon_height = '12px';
	}

	switch ($product_type) {
		case 'variable':
			$price = koko_calculate_variable_product_installment($product);
			$koko_logo = '<span>
				<img style="display: inline-flex; position: relative; cursor: pointer; height: ' . $koko_logo_height . '; vertical-align: middle; width: auto;" class="koko-logo" src="https://paykoko.com/img/logo1.7ff549c0.png" alt="Koko">
				<img style="display: inline-flex; position: relative; cursor: pointer; height: ' . $koko_icon_height . '; vertical-align: middle; width: 12px;" class="koko-info" src="https://koko-merchant.oss-ap-southeast-1.aliyuncs.com/bnpl-site-cms-dev/koko-images/info.png" alt="Koko">
			</span>';
			$sentence = koko_create_sentence($price, $currency_symbol, $koko_wording);
			break;			

		case 'simple':
			$price = koko_calculate_simple_product_installment($product);
			$koko_logo = '<span>
				<img style="display: inline-flex; position: relative; cursor: pointer; height: ' . $koko_logo_height . '; vertical-align: middle; width: auto;" class="koko-logo" src="https://paykoko.com/img/logo1.7ff549c0.png" alt="Koko">
				<img data-price="' . $price . '" style="display: inline-flex; position: relative; cursor: pointer; height: ' . $koko_icon_height . '; vertical-align: middle; width: 12px;" class="koko-info" src="https://koko-merchant.oss-ap-southeast-1.aliyuncs.com/bnpl-site-cms-dev/koko-images/info.png" alt="Koko">
			</span>';
			$sentence = koko_create_sentence($price, $currency_symbol, $koko_wording);
			break;
			
		default:
			return $default_price;
	}
		if (!is_product() || $product_type == 'simple' || ($product->get_variation_price('min') === $product->get_variation_price('max'))) {
			$koko_logo = '<span>
				<img style="display: inline-flex; position: relative; cursor: pointer; height: ' . $koko_logo_height . '; vertical-align: middle; width: auto;" class="koko-logo" src="https://paykoko.com/img/logo1.7ff549c0.png" alt="Koko">
				<img data-price="' . $price . '" style="display: inline-flex; position: relative; cursor: pointer; height: ' . $koko_icon_height . '; vertical-align: middle; width: 12px;" class="koko-info" src="https://koko-merchant.oss-ap-southeast-1.aliyuncs.com/bnpl-site-cms-dev/koko-images/info.png" alt="Koko">
			</span>';
			return $default_price . '<br><div style="font-size: ' . $koko_font_size . '; color: #8e8e8e; line-height: 20px;" class="' . $koko_css_classname . '">' . $sentence . $koko_logo . '</div>';
		}else {
			return $default_price;
		}
}

// method to display price breakdown in checkout page
add_action('woocommerce_review_order_before_payment', 'koko_display_price_breakdown_in_checkout_page');
function koko_display_price_breakdown_in_checkout_page(){
	// 
	$cart = WC()->cart;
	if( !$cart->is_empty() ){
		$koko_css_classname = 'koko-checkout-price-installment';
		$koko_font_size = "14px";
		$koko_logo_height = '19px';
		$koko_logo = '<img style="display: inline-flex; position: relative; cursor: pointer; height: ' . $koko_logo_height . '; vertical-align: middle; width: auto;" class="koko-logo" src="https://paykoko.com/img/logo1.7ff549c0.png" alt="koko">';
		
		$currency = get_woocommerce_currency_symbol();
		$total = number_format($cart->get_total('raw') / 3, 2, '.', ',');
		
		echo '<div style="padding: 10px 0 10px 0; font-size: ' . esc_attr($koko_font_size) . '; color: #8e8e8e; line-height: 20px;" class="' . esc_attr($koko_css_classname) . '">Pay in 3 installments of ' . esc_html($currency) . esc_html($total) . ' with ' . $koko_logo . '</div>';
	}	
}


// display price taking only product price
function koko_display_price_breakdown_only_with_product($product)
{
	$koko_css_classname = 'product-price-installments-not-in-variation';
	$koko_logo_height = '14px';
	$koko_logo = '<img style="display: inline-flex; position: relative; cursor: pointer; height: ' . $koko_logo_height . '; vertical-align: middle; width: auto;" class="koko-logo" src="https://paykoko.com/img/logo1.7ff549c0.png" alt="koko">';
	$koko_font_size = '13px';
	$koko_wording = "X";

	// get store currency symbol
	$currency_symbol = get_woocommerce_currency_symbol();

	// get current product
	$wc_product = wc_get_product();
	if ($wc_product !== null && $wc_product !== false) $product = $wc_product;

	// filter hook to display certain categories only
	$display = 1;
	$display = apply_filters('koko_price_breakdown_display', $display, $product);
	if ($display !== 1) return;

	// check product type : simple, variation, download, grouped, external etc.
	if ($product != null){
		$product_type = strtolower(substr(get_class($product), strrpos(get_class($product), "_") + 1));
	} else {
		$product_type = '';
	}

// check if product is in single page and NOT in a loop
	global $woocommerce_loop;

	if (is_product() && isset($woocommerce_loop['name']) && $woocommerce_loop['name'] == "" ) {
		$koko_css_classname = 'product-price-installments-not-in-variation-single';
		$koko_wording = "or 3 X";
		$koko_font_size = "14px";
		$koko_logo_height = '19px';
		$koko_logo = '<img style="display: inline-flex; position: relative; cursor: pointer; height: ' . $koko_logo_height . '; vertical-align: middle; width: auto;" class="koko-logo" src="https://paykoko.com/img/logo1.7ff549c0.png" alt="koko">';
	}

	switch ($product_type) {
		case 'variable':
			$price = koko_calculate_variable_product_installment($product);
			$sentence = koko_create_sentence($price, $currency_symbol, $koko_wording);
			break;

		case 'simple':
			$price = koko_calculate_simple_product_installment($product);
			$sentence = koko_create_sentence($price, $currency_symbol, $koko_wording);
			break;

		default:
			return "Product type not identified";
	}

		return '<div style="font-size: ' . $koko_font_size . '; color: #8e8e8e; line-height: 20px;" class="' . $koko_css_classname . '">' . $sentence . $koko_logo . '</div>';
}

// short-code to display price
add_shortcode('koko_price_breakdown', 'koko_woo_product_price_shortcode'); 
function koko_woo_product_price_shortcode( $atts ) { 
    $atts = shortcode_atts( array( 'id' => null ), $atts, 'koko_price_breakdown' ); 
    $product = null;
    if ( $atts['id'] ) {
        $product = wc_get_product( $atts['id'] );
    } else {
        global $product;
    }
    if ( ! $product ) { 
        return 'Error retrieving koko Installment: Product Not Found.';
    }
    return koko_display_price_breakdown_only_with_product($product);
}

// Initialize global variables properly
global $conflicting_plugins;
$conflicting_plugins = $conflicting_plugins ?? [];

// Replace hardcoded URLs with a filterable constant
if ( ! defined('KOKO_BASE_URL') ) {
    define('KOKO_BASE_URL', apply_filters('koko_base_url', 'https://paykoko.com/'));
}