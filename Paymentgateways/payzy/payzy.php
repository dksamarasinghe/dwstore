<?php
/*
  Plugin Name: Payzy Payment Gateway For WooCommerce
  Description: Extends WooCommerce to Process Payments with Payzy gateway. Sri Lanka's most flexible Buy Now Pay Later platform with installments.
  Version: 1.7
  Plugin URI: https://payzy.lk
  Author: payzy(pvt) ltd.
  Author URI: https://payzy.lk
  Text Domain: payzy
  WC requires at least: 4.0.0
  WC tested up to: 9.5.1
*/

add_action('plugins_loaded', 'woocommerce_payzy_gateway_init', 0);

function woocommerce_payzy_gateway_init()
{
    // Check if WooCommerce is active
    if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
        add_action('admin_notices', function () {
            echo '<div class="error"><p><strong>' . sprintf(esc_html__('Payzy Payments requires WooCommerce to be installed and active. You can download %s here.', 'woocommerce-paypal-payments'), '<a href="https://woocommerce.com/" target="_blank">WooCommerce</a>') . '</strong></p></div>';
        });
        return;
    }

    if (!class_exists('WC_Payment_Gateway'))
        return;

    class WC_Payzy_Gateway extends WC_Payment_Gateway
    {
		public $id;
		public $method_title;
		public $method_description;
		public $has_fields;
		public $title;
		public $description;
		public $icon;
		public $testmode;
		public $shopid;
		public $secret_key;
		
        public function __construct()
        {
            $this->id = 'payzy';
            $this->method_title = __('Payzy', 'payzy');
            $this->method_description = "Payzy. Sri Lanka's most flexible Buy Now Pay Later platform.";
            $this->has_fields = false;
            $this->init_form_fields();
            $this->init_settings();

            $this->title = $this->get_option('title');
            $this->description = $this->get_option('description');
            //$this->icon = 'https://res.cloudinary.com/dhijkqc0i/image/upload/v1688709707/logo_azfw8r.png';
			$this->icon = plugin_dir_url(__FILE__) . '/assets/img/icon-payzy.png';
			$icon_path = plugin_dir_url(__FILE__) . '/assets/img/icon-info-20.png';

            $this->testmode = $this->get_option('testmode');
            $this->shopid = $this->get_option('shop_id');
            $this->secret_key = $this->get_option('secret_key');

            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
            add_action('woocommerce_receipt_' . $this->id, array($this, 'receipt_page'));
            add_action('woocommerce_api_' . strtolower(get_class($this)), array($this, 'check_authorize_response'));
        }

        function init_form_fields()
        {
            $this->form_fields = array(
                'enabled' => array(
                    'title' => __('Enable/Disable', 'payzy'),
                    'type' => 'checkbox',
                    'label' => __('Enable Payzy Payment Module.', 'payzy'),
                    'default' => 'no'
                ),
                'title' => array(
                    'title' => __('Title', 'payzy'),
                    'type' => 'text',
                    'description' => __('Title to be displayed on the checkout page.', 'payzy'),
                    'default' => __('Payzy', 'payzy'),
                    'desc_tip' => true
                ),
                'description' => array(
                    'title' => __('Description', 'payzy'),
                    'type' => 'textarea',
                    'description' => __('Description to be displayed on the checkout page.', 'payzy'),
                    'default' => __('Pay in up to 4 interest-free installments with Payzy.', 'payzy'),
                    'desc_tip' => true
                ),
                'testmode' => array(
                    'title' => __('Test mode', 'payzy'),
                    'label' => __('Enable Test Mode', 'payzy'),
                    'type' => 'checkbox',
                    'description' => __('Place the payment gateway in test mode using test API keys.', 'payzy'),
                    'default' => 'yes',
                    'desc_tip' => true
                ),
                'shop_id' => array(
                    'title' => __('Shop ID', 'payzy'),
                    'type' => 'password',
                    'description' => __('Your Payzy Shop ID', 'payzy'),
                    'desc_tip' => true
                ),
                'secret_key' => array(
                    'title' => __('Secret Key', 'payzy'),
                    'type' => 'password',
                    'description' => __('Your Payzy Secret key', 'payzy'),
                    'desc_tip' => true
                )
            );
        }
        public function sign($params, $secret_key)
        {

            $signedFieldNames = explode(",", $params["signed_field_names"]);
            foreach ($signedFieldNames as $field) {
                $dataToSign[] = $field . "=" . $params[$field];
            }

            return base64_encode(hash_hmac('sha256', implode(",", $dataToSign), $secret_key, true));
        }

        public function admin_options()
        {
            echo '<h3>' . __('Payzy Payment Gateway', 'payzy') . '</h3>';
            echo '<p>' . __('Payzy is a popular payment gateway for online payment processing.', 'payzy') . '</p>';
            echo '<table class="form-table">';
            $this->generate_settings_html();
            echo '</table>';
        }

        function payment_fields()
        {
            if ($this->description)
                echo wpautop(wptexturize($this->description));
        }

        function receipt_page($order)
        {
            echo '<p>' . __('Thank you for your order, please click the button below to pay with Payzy.', 'payzy') . '</p>';
            echo $this->generate_payzy_form($order);
        }

        function process_payment($order_id)
        {
            $order = wc_get_order($order_id);
            return array(
                'result' => 'success',
                'redirect' => $order->get_checkout_payment_url(true)
            );
        }

        function check_authorize_response()
        {

            global $woocommerce;
            $temp_order = new WC_Order();

            $redirect_url = '';
            $success_message = 'Payzy payment completed';
            $failed_message = 'Payzy payment failed';
            $invalid_response_message = 'Invalid payment response';
            $shopId = ($this->shopid != '') ? $this->shopid : '';
            $secretKey = ($this->secret_key != '') ? $this->secret_key : '';



            if (isset($_GET['x_order_id']) && isset($_GET['response_code']) && isset($_GET['signature'])) {

                $order_id = sanitize_text_field($_GET['x_order_id']);
                $response_code = sanitize_text_field($_GET['response_code']);
                $recieved_signature = $_GET['signature'];

                if (empty(get_post_meta($order_id, '_payzy_payment_done', true))) {

                    try {

                        $order = new WC_Order($order_id);
                        //$order = wc_get_order($_GET['orderId']);
                        $order_created = $order->get_date_created();
                        $order_total = $order->get_total();
                        $relay_url = get_site_url() . '/?wc-api=' . strtolower(get_class($this));

                        if ($order) {
                            //create hash

                            $post_data['response_code'] = $response_code;
                            $post_data['x_shopid'] = $shopId;
                            $post_data['x_test_mode'] = $this->testmode;
                            $post_data['x_amount'] = $order_total;
                            $post_data['x_order_id'] = $order_id;
                            $post_data['x_response_url'] = $relay_url;
                            $post_data['x_first_name'] = $order->get_billing_first_name();
                            $post_data['x_last_name'] = $order->get_billing_last_name();
                            $post_data['x_company'] = $order->get_billing_company();
                            $post_data['x_address'] = $order->get_billing_address_1() . ' ' . $order->get_billing_address_2();
                            $post_data['x_country'] = $order->get_billing_country();
                            $post_data['x_state'] = $order->get_billing_state();
                            $post_data['x_city'] = $order->get_billing_city();
                            $post_data['x_zip'] = $order->get_billing_postcode();
                            $post_data['x_phone'] = $order->get_billing_phone();
                            $post_data['x_email'] = $order->get_billing_email();
                            $post_data['x_ship_to_first_name'] = $order->get_shipping_first_name();
                            $post_data['x_ship_to_last_name'] = $order->get_shipping_last_name();
                            $post_data['x_ship_to_company'] = $order->get_shipping_company();
                            $post_data['x_ship_to_address'] = $order->get_shipping_address_1() . ' ' . $order->get_shipping_address_2();
                            $post_data['x_ship_to_country'] = $order->get_shipping_country();
                            $post_data['x_ship_to_state'] = $order->get_shipping_state();
                            $post_data['x_ship_to_city'] = $order->get_shipping_city();
                            $post_data['x_ship_to_zip'] = $order->get_shipping_postcode();
                            $post_data['x_freight'] = $order->get_total_shipping();
                            $post_data['x_platform'] = 'woocommerce';
                            $post_data['x_version'] = 1.7;
                            $post_data['signed_field_names'] = 'response_code,x_test_mode,x_shopid,x_amount,x_order_id,x_response_url,x_first_name,x_last_name,x_company,x_address,x_country,x_state,x_city,x_zip,x_phone,x_email,x_ship_to_first_name,x_ship_to_last_name,x_ship_to_company,x_ship_to_address,x_ship_to_country,x_ship_to_state,x_ship_to_city,x_ship_to_zip,x_freight,x_platform,x_version,signed_field_names';

                            $our_hash = $this->sign($post_data, $secretKey);

                            //check for all post data

                            if (strcmp($recieved_signature, $our_hash) == 0) {

                                $signature = 'True';
                            } else {

                                $signature = "False";
                            }


                            if ($signature == "True" && $_GET['response_code'] == '00') {

                                //order success
                                $order->payment_complete();
                                $order->reduce_order_stock();

                                // notes to customer
                                $order->add_order_note($success_message, true);
                                // empty cart
                                $woocommerce->cart->empty_cart();
                                $redirect_url = $order->get_checkout_order_received_url();
                                //update meta value
                                update_post_meta($order_id, '_payzy_payment_done', 1);
                                $this->web_redirect($redirect_url);
                                exit;
                            } else if ($signature == "True" && $_GET['response_code'] == '10') {
                                //failed order

                                wc_add_notice($failed_message, 'error');
                                $order->update_status('failed', $failed_message);
                                wp_redirect($order->get_checkout_payment_url());
                                exit;
                            } else {

                                $order->update_status('cancelled', $invalid_response_message);
                                wc_add_notice($invalid_response_message, 'error');
                                wp_redirect($order->get_checkout_payment_url());
                                exit;
                            }
                        } else {
                            wp_redirect(wc_get_checkout_url());
                            exit;
                        }

                        // compare hash key recieved and created
                    } catch (Exception $e) {
                        //$msg = "Error";
                        wp_redirect(wc_get_checkout_url());
                        exit;
                    }
                } else {
                    wp_redirect(wc_get_checkout_url());
                    exit;
                }


                wp_redirect(wc_get_checkout_url());
                exit;
            } else {

                wp_redirect(wc_get_checkout_url());
                exit;
            }
        }
        public function web_redirect($url)
        {

            echo "<html><head><script language=\"javascript\">
                <!--
                window.location=\"{$url}\";
                //-->
                </script>
                </head><body><noscript><meta http-equiv=\"refresh\" content=\"0;url={$url}\"></noscript></body></html>";
        }

        public function generate_payzy_form($order_id)
        {
            global $woocommerce;
            $order = new WC_Order($order_id);

            $order_items = $order->get_items();

            $order_created = $order->get_date_created();
            $order_total = $order->get_total();
            $shopId = ($this->shopid != '') ? $this->shopid : '';
            $secretKey = ($this->secret_key != '') ? $this->secret_key : '';


            $relay_url = get_site_url() . '/?wc-api=' . strtolower(get_class($this));


            //$redirect_url = $order->get_checkout_order_received_url();

            $redirect_url = $order->get_checkout_order_received_url();

            $notify_url = add_query_arg('wc-api', get_class($this), $redirect_url);


            $post_data['x_shopid'] = $shopId;
            $post_data['x_test_mode'] = $this->testmode;
            $post_data['x_amount'] = $order_total;
            $post_data['x_order_id'] = $order_id;
            $post_data['x_response_url'] = $relay_url;
            $post_data['x_first_name'] = $order->get_billing_first_name();
            $post_data['x_last_name'] = $order->get_billing_last_name();
            $post_data['x_company'] = $order->get_billing_company();
            $post_data['x_address'] = $order->get_billing_address_1() . ' ' . $order->get_billing_address_2();
            $post_data['x_country'] = $order->get_billing_country();
            $post_data['x_state'] = $order->get_billing_state();
            $post_data['x_city'] = $order->get_billing_city();
            $post_data['x_zip'] = $order->get_billing_postcode();
            $post_data['x_phone'] = $order->get_billing_phone();
            $post_data['x_email'] = $order->get_billing_email();
            $post_data['x_ship_to_first_name'] = $order->get_shipping_first_name();
            $post_data['x_ship_to_last_name'] = $order->get_shipping_last_name();
            $post_data['x_ship_to_company'] = $order->get_shipping_company();
            $post_data['x_ship_to_address'] = $order->get_shipping_address_1() . ' ' . $order->get_shipping_address_2();
            $post_data['x_ship_to_country'] = $order->get_shipping_country();
            $post_data['x_ship_to_state'] = $order->get_shipping_state();
            $post_data['x_ship_to_city'] = $order->get_shipping_city();
            $post_data['x_ship_to_zip'] = $order->get_shipping_postcode();
            $post_data['x_freight'] = $order->get_total_shipping();
            $post_data['x_platform'] = 'woocommerce';
            $post_data['x_version'] = 1.7;
            $post_data['signed_field_names'] = 'x_test_mode,x_shopid,x_amount,x_order_id,x_response_url,x_first_name,x_last_name,x_company,x_address,x_country,x_state,x_city,x_zip,x_phone,x_email,x_ship_to_first_name,x_ship_to_last_name,x_ship_to_company,x_ship_to_address,x_ship_to_country,x_ship_to_state,x_ship_to_city,x_ship_to_zip,x_freight,x_platform,x_version,signed_field_names';




            if ($this->testmode == 'yes') {
                $processURI = 'https://api.payzypay.xyz/checkout/checkout-start';
            } else {

                $processURI = 'https://api.payzy.lk/checkout/checkout-start';
            }
            $in_data = '';
            foreach ($post_data as $name => $value) {

                $in_data .= "<input type=\"hidden\" id=\"" . $name . "\" name=\"" . $name . "\" value=\"" . $value . "\"/>\n";
            }


            $in_data .= '<input type="hidden" readonly="readonly" name="signature" class="input-sm" value="' . $this->sign($post_data, $secretKey) . '" id="signature"/>';

            $html_form = '<form action="' . $processURI . '" method="post" id="payzy_pay_form">'
                . $in_data
                . '<input type="submit" class="button" id="submit_cy_form" value="' . __('Pay via PAYZY', 'payzy') . '" /> <a class="button cancel" href="' . $order->get_cancel_order_url() . '">' . __('Cancel order &amp; restore cart', 'payzy') . '</a>'
                . '<script type="text/javascript">
                  jQuery(function(){
                     jQuery("body").block({
                           message: "<img src=\"' . plugin_dir_url(__FILE__) . '/assets/img/loader.gif\" alt=\"Redirecting�\" style=\"float:left; margin-right: 10px; width:48px;\" />' . __('Thank you for your order. We are now redirecting you to Payzy to make payment.', 'payzy') . '",
                           overlayCSS:
                        {
                           background:       "#f9f9fa",
                           opacity:          0.5,
                           "z-index": "10"
                        },
                     css: {
                           padding:          20,
                           textAlign:        "center",
                           color:            "#6b6767",
                           border:           "1px solid #bababa",
                           backgroundColor:  "#fff",
                           cursor:           "wait",
                           lineHeight:       "32px",
                           "z-index": "10",
                          
                     }
                     });
               jQuery("#submit_cy_form").click();
               });
               </script>
               </form>';

            error_log($html_form);
            return $html_form;
        }

    }

    function woocommerce_add_payzy_gateway($methods)
    {
        $methods[] = 'WC_Payzy_Gateway';
        return $methods;
    }

    add_filter('woocommerce_payment_gateways', 'woocommerce_add_payzy_gateway');

    add_action('before_woocommerce_init', 'before_woocommerce_hpos');

    function before_woocommerce_hpos()
    {
        if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
        }
    }
    function declare_cart_checkout_blocks_compatibility()
    {

        if (class_exists('\Automattic\WooCommerce\Utilities\FeaturesUtil')) {

            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__, true);
        }
    }

    add_action('before_woocommerce_init', 'declare_cart_checkout_blocks_compatibility');


    add_action('woocommerce_blocks_loaded', 'payzy_register_order_approval_payment_method_type');

    function payzy_register_order_approval_payment_method_type()
    {

        if (!class_exists('Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType')) {
            return;
        }

        require_once plugin_dir_path(__FILE__) . 'class-block.php';
        add_action(
            'woocommerce_blocks_payment_method_type_registration',
            function (Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry $payment_method_registry) {

                $payment_method_registry->register(new WC_Payzy_Gateway_Blocks);
            }
        );
    }

    global $conflict_yes;
    $conflict_yes = [];

    include_once(ABSPATH . 'wp-admin/includes/plugin.php');
    if (is_plugin_active('woo-discount-rules/woo-discount-rules.php')) {
        $conflict_yes = ['woo-discount-rules'];
    }

    function thp_payzy_frontend_scripts_enqueuing()
    {
        wp_enqueue_style('payzy-cus-style', plugin_dir_url(__FILE__) . '/assets/css/payzy-frontend.css');
    }

    add_action('wp_enqueue_scripts', 'thp_payzy_frontend_scripts_enqueuing');


    //woo discount rules price for simple product
    function payzy_calc_simple_product_installment_with_woo_discount($product)
    {

        $price = $product->get_price();
        $quantity = 1;
        $custom_price = 0;
        $return_details = 'discounted_price';
        $manual_request = true;
        $is_cart = false;

        $wdr_price = apply_filters(
            'advanced_woo_discount_rules_get_product_discount_price_from_custom_price',
            $price,
            $product,
            $quantity,
            $custom_price,
            $return_details,
            $manual_request,
            $is_cart
        );

        if ($wdr_price === false) {
            return $product->get_price();
        }
        return $wdr_price;
    }

    //woo discount rule price for variable product
    function payzy_calc_variable_product_installment_with_woo_discount($product)
    {

        $min_price = $product->get_variation_price('min');
        $max_price = $product->get_variation_price('max');

        global $conflict_yes;
        if (in_array('woo-discount-rules', $conflict_yes) == false) {
            return array($min_price, $max_price);
        }


        $quantity = 1;
        $return_details = 'all';
        $manual_request = true;
        $is_cart = false;

        $wdr_variable_min = apply_filters(
            'advanced_woo_discount_rules_get_product_discount_price_from_custom_price',
            $min_price,
            $product,
            $quantity,
            $min_price,
            $return_details,
            $manual_request,
            $is_cart
        );

        // if woo discount applied
        if ($wdr_variable_min !== false) {
            $min_price = $wdr_variable_min['discounted_price'];
        }

        $wdr_variable_max = apply_filters(
            'advanced_woo_discount_rules_get_product_discount_price_from_custom_price',
            $max_price,
            $product,
            $quantity,
            $max_price,
            $return_details,
            $manual_request,
            $is_cart
        );

        // if wdr is applied
        if ($wdr_variable_max !== false) {
            $max_price = $wdr_variable_max['discounted_price'];
        }

        return array($min_price, $max_price);
    }


    function single_html_css()
    {
        $cstyles['font_size'] = "18px";
        $cstyles['font_color'] = "#8e8e8e";
        $cstyles['logo_size'] = "18px";
        $cstyles['font_weight'] = "normal";
        $cstyles['icon_size'] = "13px";
        $cstyles['icon_class'] = "payzy-ic-single";
        $cstyles['cs_class'] = "single-display";
        $cstyles['icon_display'] = "inline-flex !important";
        return $cstyles;
    }


    function loop_html_css()
    {

        $cstyles['font_size'] = "14px";
        $cstyles['font_color'] = "#8e8e8e";
        $cstyles['logo_size'] = "14px";
        $cstyles['font_weight'] = "normal";
        $cstyles['icon_size'] = "13px";
        $cstyles['icon_class'] = "payzy-ic-loop";
        $cstyles['cs_class'] = "payzy-item-loop-display";
        $cstyles['icon_display'] = "none";
        return $cstyles;
    }

    add_filter('woocommerce_get_price_html', 'payzy_change_product_price_display', 9999, 2);

    function payzy_change_product_price_display($price, $product)
    {
        // ONLY ON FRONTEND

        if (is_admin() && !wp_doing_ajax())
            return $price;
        if (wc_get_product() !== null)
            $product = wc_get_product();
        if ((!$product) || ($product == null))
            return $price;

        //global $product;
        global $conflict_yes;

        $custom_html = single_html_css();

        $currency_symbol = get_woocommerce_currency_symbol();
        //$logo_path = 'https://res.cloudinary.com/dhijkqc0i/image/upload/v1688709707/logo_azfw8r.png';
		$logo_path = plugin_dir_url(__FILE__) . '/assets/img/icon-payzy.png';
		$icon_path = plugin_dir_url(__FILE__) . '/assets/img/icon-info-20.png';

        //change style to single product
        // change style for product loop
        global $woocommerce_loop;

        if ((is_product() && isset($woocommerce_loop['name']) && !empty($woocommerce_loop['name'])) || !is_product()) {

            $custom_html = loop_html_css();
        }


        if ($product->get_type() == 'variable') {


            $prices = payzy_calc_variable_product_installment_with_woo_discount($product);

            $min = $prices[0];
            $max = $prices[1];

            $payzy_price = $min . '-' . $max;

            $min_ins_price = number_format((float) ($min / 4), 2, '.', '');
            $max_ins_price = number_format((float) ($max / 4), 2, '.', '');
            $ins_price = $currency_symbol . $min_ins_price . ' - ' . $currency_symbol . $max_ins_price;

            if ($min == $max) {
                $ins_price = $currency_symbol . $min_ins_price;
                $payzy_price = $min;
            }

            $price .= '<div style="font-size: ' . $custom_html['font_size'] . '; color: ' . $custom_html['font_color'] . '; font-weight:' . $custom_html['font_weight'] . '; line-height:22px;" class="' . $custom_html['cs_class'] . '"> or up to 4 X <b>' . $ins_price . '</b> with 
			  <a style="display: inline-flex !important;" href="https://payzy.lk/" target="_blank">
				<img style="height: ' . $custom_html['logo_size'] . ' !important; width: auto !important;margin-top: 0px;top: 3px !important;position: relative;" src="' . $logo_path . '" alt="Payzy">
				</a>
			  <a style="display: ' . $custom_html['icon_display'] . '" href="https://payzy.lk/installment?price=' . $payzy_price . '" target="_blank">
			  <img style="position: relative; height: ' . $custom_html['icon_size'] . ' !important; width: auto !important;margin-top: 0px;top: 2px !important;" src="' . $icon_path . '" alt="Payzy" class="' . $custom_html['icon_class'] . '">  
			</a></div>';
            return $price;
        } elseif ($product->get_type() == 'simple' || $product->get_type() == 'external') {


            $wdr_price = payzy_calc_simple_product_installment_with_woo_discount($product);
			
            //$payzy_price = number_format($wdr_price, 2, '.', ',');
            //$ins_price = number_format($wdr_price / 4, 2, '.', ',');
            if (is_numeric($wdr_price)) {
				$payzy_price = number_format((float) $wdr_price, 2, '.', ',');
				$ins_price = number_format($wdr_price / 4, 2, '.', ',');
			} else {
				$payzy_price = '0.00'; 
				$ins_price = '0.00';
			}

            $ins_price = $currency_symbol . $ins_price;

            return $price . '<div style="font-size: ' . $custom_html['font_size'] . '; color: ' . $custom_html['font_color'] . '; font-weight:' . $custom_html['font_weight'] . '; line-height:22px;" class="' . $custom_html['cs_class'] . '"> or up to 4 X <b>' . $ins_price . '</b> with 
			  <a style="display: inline-flex !important;" href="https://payzy.lk/" target="_blank">
				<img style="height: ' . $custom_html['logo_size'] . ' !important; width: auto !important;margin-top: 0px;top: 3px !important;position: relative;" src="' . $logo_path . '" alt="Payzy">
				</a>
			  <a style="display: ' . $custom_html['icon_display'] . '" href="https://payzy.lk/installment?price=' . $payzy_price . '" target="_blank">
			  <img style="position: relative; height: ' . $custom_html['icon_size'] . ' !important; width: auto !important;margin-top: 0px;top: 2px !important;" src="' . $icon_path . '" alt="Payzy" class="' . $custom_html['icon_class'] . '">  
			</a></div>';
        } else {
            return $price;
        }
    }


    add_filter('woocommerce_available_variation', 'payzy_change_selected_variation_price', 10, 3);

    function payzy_change_selected_variation_price($data, $product, $variation)
    {


        if ((!$product) || ($product == null))
            return;
        if ($product->get_type() != 'variable')
            return;

        if ($product->get_variation_price('min') == $product->get_variation_price('max')) {
            return $data;
        }

        $custom_html = single_html_css();
        $custom_html['cs_class'] = 'variable-display';


        $currency_symbol = get_woocommerce_currency_symbol();
        //$logo_path = 'https://res.cloudinary.com/dhijkqc0i/image/upload/v1688709707/logo_azfw8r.png';
		$logo_path = plugin_dir_url(__FILE__) . '/assets/img/icon-payzy.png';
		
        //$icon_path = 'https://res.cloudinary.com/www-onfowoodparadise-lk/image/upload/v1690256130/info_i7ami6.png';

		$icon_path = plugin_dir_url(__FILE__) . '/assets/img/icon-info-20.png';
        $price = $data['display_price'];

        $ins_price = number_format((float) ($price / 4), 2, '.', '');

        $ins_price = $currency_symbol . $ins_price;

        $data['price_html'] .= '<div style="font-size: ' . $custom_html['font_size'] . '; color: ' . $custom_html['font_color'] . '; font-weight:' . $custom_html['font_weight'] . '; line-height:22px;" class="' . $custom_html['cs_class'] . '"> or up to 4 X <b>' . $ins_price . '</b> with 
			  <a style="display: inline-flex !important;" href="https://payzy.lk/" target="_blank">
				<img style="height: ' . $custom_html['logo_size'] . ' !important; width: auto !important;margin-top: 0px;top: 3px !important;position: relative;" src="' . $logo_path . '" alt="Payzy">
				</a>
			  <a style="display: ' . $custom_html['icon_display'] . '" href="https://payzy.lk/installment?price=' . $price . '" target="_blank">
			  <img style="position: relative; height: ' . $custom_html['icon_size'] . ' !important; width: auto !important;margin-top: 0px;top: 2px !important;" src="' . $icon_path . '" alt="Payzy" class="' . $custom_html['icon_class'] . '">  
			</a></div>';
        return $data;
    }
}