<?php
if (!defined('ABSPATH')) {
    exit;
}
/*
Plugin Name: Paykoko
Plugin URI: www.paykoko.com
Description: Koko WooCommerce Plugin allows you to accept payments on your Woocommerce store via KOKO accounts and allow installment based payments.
Version: 3.0.4
Author: dInnovation (Pvt) Ltd
Text Domain: Paykoko
Requires PHP: 7.4
*/

if (!class_exists('DarazBnpl_WC')) {
    add_action('plugins_loaded', function () {
        if (class_exists('WC_Payment_Gateway')) {

            class DarazBnpl_WC extends WC_Payment_Gateway
            {
                public $merchant_id;
                public $api_key;
                public $public_key;
                public $private_key;
                public $test_mode;
                public $liveurl;
                public $msg = array();

                public function __construct()
                {
                    $this->id                 = 'darazbnpl';
                    $this->method_title       = 'KokoBNPL';
                    $this->method_description = 'WooCommerce Payment Plugin of Koko BNPL Payment Gateway.';
                    $this->icon               = plugins_url('assets/img/daraz-koko.png', __FILE__);
                    $this->has_fields         = false;
                    $this->supports           = array('products');

                    $this->init_form_fields();
                    $this->init_settings();

                    $this->title       = $this->get_option('title', 'Paykoko');
                    $this->description = $this->get_option('description', 'Pay in 3 interest-free instalments using your Debit / Credit card.');
                    $this->merchant_id = $this->get_option('merchant_id');
                    $this->api_key     = $this->get_option('api_key');
                    $this->public_key  = $this->get_option('public_key');
                    $this->private_key = $this->get_option('private_key');
                    $this->test_mode   = 'yes' === $this->get_option('test_mode');

                    add_action(
                        'woocommerce_api_' . strtolower(get_class($this)),
                        array($this, 'check_darazbnpl_response')
                    );
                    add_action('woocommerce_gateway_icon', array($this, 'modify_gateway_icon_css'), 10, 2);
                    add_action('woocommerce_receipt_' . $this->id, array($this, 'receipt_page'));

                    if (version_compare(WC_VERSION, '2.0.0', '>=')) {
                        add_action(
                            'woocommerce_update_options_payment_gateways_' . $this->id,
                            array($this, 'process_admin_options')
                        );
                    } else {
                        add_action(
                            'woocommerce_update_options_payment_gateways',
                            array($this, 'process_admin_options')
                        );
                    }
                }

                public function modify_gateway_icon_css($icon_html, $payment_gateway_id)
                {
                    if ($payment_gateway_id !== $this->id) {
                        return $icon_html;
                    }
                    $icon_html = preg_replace('/(src){1}/', 'class="ph-logo-style" src', $icon_html);
                    return $icon_html;
                }

                public function init_form_fields()
                {
                    $this->form_fields = array(
                        'enabled' => array(
                            'title'       => __('Enable/Disable', 'woo_darazbnpl'),
                            'type'        => 'checkbox',
                            'label'       => __('Enable DarazBNPL', 'woo_darazbnpl'),
                            'default'     => 'yes',
                            'description' => 'Show in the Payment List as a payment option',
                        ),
                        'title' => array(
                            'title'       => __('Title', 'woo_darazbnpl'),
                            'type'        => 'text',
                            'default'     => __('Koko: Buy Now Pay Later', 'woo_darazbnpl'),
                            'desc_tip'    => true,
                            'description' => __('Title shown to customer at checkout', 'woo_darazbnpl'),
                        ),
                        'description' => array(
                            'title'       => __('Description', 'woo_darazbnpl'),
                            'type'        => 'textarea',
                            'default'     => __('Pay in 3 interest free installments with Koko.', 'woo_darazbnpl'),
                            'desc_tip'    => true,
                            'description' => __('Description shown to customer at checkout', 'woo_darazbnpl'),
                        ),
                        'merchant_id' => array(
                            'title'       => __('Merchant ID', 'woo_darazbnpl'),
                            'type'        => 'text',
                            'desc_tip'    => true,
                            'description' => __('Your Koko Merchant ID'),
                        ),
                        'api_key' => array(
                            'title'       => __('API Key', 'woo_darazbnpl'),
                            'type'        => 'text',
                            'desc_tip'    => true,
                            'description' => __('Your Koko API Key'),
                        ),
                        'public_key' => array(
                            'title'       => __('Public Key', 'woo_darazbnpl'),
                            'type'        => 'textarea',
                            'desc_tip'    => true,
                            'description' => __('Koko public key used to verify callback signatures'),
                        ),
                        'private_key' => array(
                            'title'       => __('Private Key', 'woo_darazbnpl'),
                            'type'        => 'textarea',
                            'desc_tip'    => true,
                            'description' => __('Your private key used to sign order requests'),
                        ),
                        'test_mode' => array(
                            'title'       => __('Sandbox Mode', 'woo_darazbnpl'),
                            'type'        => 'checkbox',
                            'label'       => __('Enable Sandbox Mode', 'woo_darazbnpl'),
                            'default'     => 'yes',
                            'desc_tip'    => true,
                            'description' => __('Use Koko sandbox for testing payments', 'woo_darazbnpl'),
                        ),
                        'debug_mode' => array(
                            'title'       => __('Debug Mode', 'woo_darazbnpl'),
                            'type'        => 'checkbox',
                            'label'       => __('Enable Debug Logging', 'woo_darazbnpl'),
                            'default'     => 'no',
                            'desc_tip'    => true,
                            'description' => __('Write debug info to WooCommerce logs', 'woo_darazbnpl'),
                        ),
                    );
                }

                public function admin_options()
                {
                    echo '<h3>' . esc_html__('DarazBNPL', 'woo_darazbnpl') . '</h3>';
                    echo '<p>' . esc_html__('WooCommerce Payment Plugin of DarazBNPL Payment Gateway.', 'woo_darazbnpl') . '</p>';
                    echo '<table class="form-table">';
                    $this->generate_settings_html();
                    echo '</table>';
                }

                public function payment_fields()
                {
                    if ($this->description) {
                        echo wpautop(wptexturize($this->description));
                    }
                }

                public function is_available()
                {
                    if (!parent::is_available()) return false;
                    if (empty($this->merchant_id) || empty($this->api_key)) return false;
                    if (empty($this->public_key) || empty($this->private_key)) return false;
                    return true;
                }

                public function process_payment($order_id)
                {
                    darazbnpl_log("DarazBNPL: process_payment() for order $order_id");
                    $order = wc_get_order($order_id);
                    if (!$order) {
                        darazbnpl_log("DarazBNPL: Invalid order ID $order_id");
                        wc_add_notice(__('Order not found. Please try again.', 'woo_darazbnpl'), 'error');
                        return array('result' => 'failure');
                    }
                    return array(
                        'result'   => 'success',
                        'redirect' => $order->get_checkout_payment_url(true),
                    );
                }

                public function receipt_page($order_id)
                {
                    darazbnpl_log("DarazBNPL: receipt_page() for order $order_id");
                    echo $this->generate_darazbnpl_form($order_id);
                }

                public function generate_darazbnpl_form($order_id)
                {
                    $order = wc_get_order($order_id);
                    if (!$order) {
                        return '<p>' . __('Invalid order.', 'woo_darazbnpl') . '</p>';
                    }

                    $orderDetails = $order->get_data();

                    $response_url = add_query_arg('wc-api', get_class($this), home_url('/'));
                    $redirect_url = $response_url;
                    $cancel_url   = wc_get_cart_url();

                    $orders_arr  = $order->get_items();
                    $productName = count($orders_arr) > 1
                        ? count($orders_arr) . ' products'
                        : '1 Product';

                    $this->liveurl = $this->test_mode
                        ? 'https://qaapi.paykoko.com/api/merchants/orderCreate'
                        : 'https://prodapi.paykoko.com/api/merchants/orderCreate';

                    $merchant      = $this->merchant_id;
                    $apiKey        = $this->api_key;
                    $amount        = number_format((float) $order->get_total(), 2, '.', '');
                    $currency      = get_woocommerce_currency();
                    $pluginName    = 'woocommerce';
                    $pluginVersion = defined('WC_VERSION') ? WC_VERSION : '1.0';
                    $reference     = $merchant . wp_rand(100000, 999999) . '-' . $order->get_order_number();
                    $firstName     = sanitize_text_field($orderDetails['billing']['first_name']);
                    $lastName      = sanitize_text_field($orderDetails['billing']['last_name']);
                    $email         = sanitize_email($orderDetails['billing']['email']);
                    $mobile        = sanitize_text_field($order->get_billing_phone());

                    $order->update_meta_data('_darazbnpl_reference', $reference);
                    $order->save();

                    $dataString =
                        $merchant .
                        $amount .
                        $currency .
                        $pluginName .
                        $pluginVersion .
                        $redirect_url .
                        $cancel_url .
                        $order_id .
                        $reference .
                        $firstName .
                        $lastName .
                        $email .
                        $productName .
                        $apiKey .
                        $response_url;

                    $normalizedPrivateKey = trim($this->private_key);
                    $normalizedPrivateKey = str_replace(["\r\n", "\r"], "\n", $normalizedPrivateKey);

                    $pkeyid = openssl_get_privatekey($normalizedPrivateKey);
                    if (!$pkeyid) {
                        darazbnpl_log('DarazBNPL: Failed to load private key: ' . openssl_error_string());
                        return '<p>' . __('Payment configuration error. Please contact support.', 'woo_darazbnpl') . '</p>';
                    }

                    if (!openssl_sign($dataString, $signature, $pkeyid, OPENSSL_ALGO_SHA256)) {
                        darazbnpl_log('DarazBNPL: openssl_sign failed: ' . openssl_error_string());
                        return '<p>' . __('Payment signing error. Please contact support.', 'woo_darazbnpl') . '</p>';
                    }

                    $signatureEncoded = base64_encode($signature);

                    if (PHP_MAJOR_VERSION < 8) {
                        openssl_free_key($pkeyid);
                    }

                    darazbnpl_log('DarazBNPL: ---- SIGNATURE DEBUG START ----');
                    darazbnpl_log('DarazBNPL: merchant = '          . $merchant);
                    darazbnpl_log('DarazBNPL: amount = '            . $amount);
                    darazbnpl_log('DarazBNPL: currency = '          . $currency);
                    darazbnpl_log('DarazBNPL: pluginName = '        . $pluginName);
                    darazbnpl_log('DarazBNPL: pluginVersion = '     . $pluginVersion);
                    darazbnpl_log('DarazBNPL: redirect_url = '      . $redirect_url);
                    darazbnpl_log('DarazBNPL: cancel_url = '        . $cancel_url);
                    darazbnpl_log('DarazBNPL: response_url = '      . $response_url);
                    darazbnpl_log('DarazBNPL: order_id = '          . $order_id);
                    darazbnpl_log('DarazBNPL: reference = '         . $reference);
                    darazbnpl_log('DarazBNPL: firstName = '         . $firstName);
                    darazbnpl_log('DarazBNPL: lastName = '          . $lastName);
                    darazbnpl_log('DarazBNPL: email = '             . $email);
                    darazbnpl_log('DarazBNPL: productName = '       . $productName);
                    darazbnpl_log('DarazBNPL: dataString length = ' . strlen($dataString));
                    darazbnpl_log('DarazBNPL: dataString = '        . $dataString);
                    darazbnpl_log('DarazBNPL: signature length = '  . strlen($signatureEncoded));
                    darazbnpl_log('DarazBNPL: sig first 20 = '      . substr($signatureEncoded, 0, 20));
                    darazbnpl_log('DarazBNPL: pk first 30 = '       . substr($normalizedPrivateKey, 0, 30));
                    darazbnpl_log('DarazBNPL: ---- SIGNATURE DEBUG END ----');
                    darazbnpl_log('DarazBNPL: Form built for order ' . $order_id);

                    $darazbnpl_args = array(
                        '_mId'           => $merchant,
                        'api_key'        => $apiKey,
                        '_returnUrl'     => $redirect_url,
                        '_responseUrl'   => $response_url,
                        '_cancelUrl'     => $cancel_url,
                        '_currency'      => $currency,
                        '_amount'        => $amount,
                        '_reference'     => $reference,
                        '_pluginName'    => $pluginName,
                        '_pluginVersion' => $pluginVersion,
                        '_orderId'       => $order_id,
                        '_firstName'     => $firstName,
                        '_lastName'      => $lastName,
                        '_email'         => $email,
                        '_description'   => $productName,
                        '_mobileNo'      => $mobile,
                        'dataString'     => $dataString,
                        'signature'      => $signatureEncoded,
                    );

                    $url_fields = ['_returnUrl', '_responseUrl', '_cancelUrl'];
                    $inputs = array();
                    foreach ($darazbnpl_args as $key => $value) {
                        if (in_array($key, $url_fields, true)) {
                            $inputs[] = "<input type='hidden' name='" . esc_attr($key) . "' value='" . esc_url($value) . "'/>";
                        } else {
                            $inputs[] = "<input type='hidden' name='" . esc_attr($key) . "' value='" . esc_attr($value) . "'/>";
                        }
                    }

                    $autoscript = '<script type="text/javascript">
                        document.addEventListener("DOMContentLoaded", function() {
                            var form = document.getElementById("darazbnpl_payment_form");
                            if (form) { form.submit(); }
                        });
                    </script>';

                    return '
                    <form action="' . esc_url($this->liveurl) . '" method="post" id="darazbnpl_payment_form">
                        ' . implode('', $inputs) . '
                        <input type="submit" class="button-alt" id="submit_darazbnpl_payment_form"
                            value="' . esc_attr__('Pay via Koko', 'woo_darazbnpl') . '" />
                        <a class="button cancel" href="' . esc_url($order->get_cancel_order_url()) . '">
                            ' . esc_html__('Cancel order &amp; restore cart', 'woo_darazbnpl') . '
                        </a>
                        ' . $autoscript . '
                    </form>';
                }

                public function check_darazbnpl_response()
                {
                    try {

                        $raw_body = file_get_contents('php://input');

                        darazbnpl_log('DarazBNPL: ---- RAW REQUEST START ----');
                        darazbnpl_log('DarazBNPL: METHOD = '         . $_SERVER['REQUEST_METHOD']);
                        darazbnpl_log('DarazBNPL: CONTENT_TYPE = '   . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
                        darazbnpl_log('DarazBNPL: _REQUEST count = '  . count($_REQUEST));
                        darazbnpl_log('DarazBNPL: _POST count = '     . count($_POST));
                        darazbnpl_log('DarazBNPL: _REQUEST data = '   . print_r($_REQUEST, true));
                        darazbnpl_log('DarazBNPL: _POST data = '      . print_r($_POST, true));
                        darazbnpl_log('DarazBNPL: RAW BODY length = ' . strlen($raw_body));
                        darazbnpl_log('DarazBNPL: RAW BODY = '        . $raw_body);
                        darazbnpl_log('DarazBNPL: ---- RAW REQUEST END ----');

                        // If Koko sends JSON, parse into $_REQUEST
                        if (!empty($raw_body)) {
                            $content_type = $_SERVER['CONTENT_TYPE'] ?? '';
                            if (stripos($content_type, 'application/json') !== false) {
                                darazbnpl_log('DarazBNPL: JSON body detected — parsing.');
                                $json_data = json_decode($raw_body, true);
                                if (is_array($json_data)) {
                                    darazbnpl_log('DarazBNPL: JSON parsed: ' . print_r($json_data, true));
                                    $_REQUEST = array_merge($_REQUEST, $json_data);
                                    $_POST    = array_merge($_POST,    $json_data);
                                } else {
                                    darazbnpl_log('DarazBNPL: JSON parse FAILED. Raw: ' . $raw_body);
                                }
                            } elseif (empty($_POST)) {
                                darazbnpl_log('DarazBNPL: POST body exists but $_POST empty — parsing manually.');
                                parse_str($raw_body, $parsed);
                                darazbnpl_log('DarazBNPL: Manually parsed: ' . print_r($parsed, true));
                                $_REQUEST = array_merge($_REQUEST, $parsed);
                                $_POST    = array_merge($_POST,    $parsed);
                            }
                        }

                        $safe_request = $_REQUEST;
                        if (isset($safe_request['signature'])) {
                            $safe_request['signature'] = '***masked***';
                        }
                        darazbnpl_log('DarazBNPL: Callback received: ' . print_r($safe_request, true));

                        // -------------------------------------------------------
                        // STEP 1: POST = Koko server (trusted)
                        //         GET  = browser redirect (untrusted)
                        // payment_complete() is ONLY called from POST path
                        // after signature verification, OR from GET path after
                        // orderView API confirms payment (secure outbound check)
                        // -------------------------------------------------------
                        $is_server_post = strtoupper($_SERVER['REQUEST_METHOD']) === 'POST';
                        darazbnpl_log('DarazBNPL: is_server_post=' . ($is_server_post ? 'yes' : 'no'));

                        $order_id_raw = wp_unslash($_REQUEST['orderId'] ?? '');
                        $trn_id_raw   = wp_unslash($_REQUEST['trnId']   ?? '');
                        $status_raw   = wp_unslash($_REQUEST['status']  ?? '');

                        $order_id     = sanitize_text_field($order_id_raw);
                        $status_upper = strtoupper(sanitize_text_field($status_raw));

                        if (empty($order_id)) {
                            darazbnpl_log('DarazBNPL: Empty orderId in callback.');
                            if ($is_server_post) { http_response_code(200); echo 'OK'; exit(); }
                            wp_redirect(wc_get_cart_url());
                            exit();
                        }

                        $order = wc_get_order($order_id);
                        if (!$order) {
                            darazbnpl_log("DarazBNPL: Order not found for ID: $order_id");
                            if ($is_server_post) { http_response_code(200); echo 'OK'; exit(); }
                            wp_redirect(wc_get_cart_url());
                            exit();
                        }

                        darazbnpl_log('DarazBNPL: Order #' . $order->get_id() . ' found. Status=' . $order->get_status());

                        if (in_array($status_upper, ['SUCCESS', 'APPROVED', 'COMPLETED'], true)) {
                            $normalized_status = 'SUCCESS';
                        } elseif (in_array($status_upper, ['CANCELLED', 'CANCELED'], true)) {
                            $normalized_status = 'CANCELLED';
                        } else {
                            $normalized_status = 'FAILED';
                        }

                        darazbnpl_log("DarazBNPL: status_upper=$status_upper normalized=$normalized_status");

                        // -------------------------------------------------------
                        // STEP 2: BROWSER GET path
                        //
                        // Cannot trust URL parameters — anyone can fake them.
                        // Three cases:
                        //   A) Order already processing — server POST got here first
                        //   B) CANCELLED/FAILED — send to cart
                        //   C) SUCCESS but order still pending — verify via
                        //      orderView API (secure outbound call to Koko)
                        //      This handles hosting that blocks inbound POSTs
                        // -------------------------------------------------------
                        if (!$is_server_post) {
                            darazbnpl_log('DarazBNPL: Browser GET redirect. Checking DB status.');

                            $order     = wc_get_order($order_id);
                            $db_status = $order->get_status();
                            darazbnpl_log("DarazBNPL: DB order status = $db_status");

                            if (in_array($db_status, ['processing', 'completed'], true)) {
                                // Case A: server POST already processed it
                                darazbnpl_log('DarazBNPL: Order already processing/completed. Showing thank you page.');
                                wp_redirect($order->get_checkout_order_received_url());

                            } elseif (in_array($normalized_status, ['CANCELLED', 'FAILED'], true)) {
                                // Case B: payment failed or cancelled
                                darazbnpl_log('DarazBNPL: Browser redirect with failed/cancelled status. Sending to cart.');
                                wp_redirect(wc_get_cart_url() . '?success=false');

                            } else {
                                // Case C: SUCCESS in URL but order still pending
                                // Server POST may be blocked by hosting (e.g. liveblog365)
                                // Verify payment via orderView API — outbound call, never blocked
                                darazbnpl_log('DarazBNPL: Browser SUCCESS but order pending. Calling orderView API to verify.');

                                $verified = $this->verify_via_orderview($order_id);

                                if ($verified) {
                                    darazbnpl_log('DarazBNPL: orderView confirmed SUCCESS — marking order paid.');

                                    if (in_array($order->get_status(), ['cancelled', 'failed'], true)) {
                                        $order->update_status('pending', 'Koko orderView confirmed — reopening.');
                                        $order->save();
                                    }

                                    $order->payment_complete(sanitize_text_field($trn_id_raw));
                                    $order->save();

                                    if (!in_array($order->get_status(), ['processing', 'completed'], true)) {
                                        $order->update_status('processing', 'Koko orderView confirmed — forced.');
                                        $order->save();
                                    }

                                    $order->add_order_note(sprintf(
                                        'Koko payment confirmed via orderView API. Transaction ID: %s',
                                        sanitize_text_field($trn_id_raw)
                                    ));

                                    if (WC()->cart) { WC()->cart->empty_cart(); }

                                    darazbnpl_log('DarazBNPL: Order ' . $order_id . ' marked processing via orderView.');
                                    wp_redirect($order->get_checkout_order_received_url());

                                } else {
                                    // orderView did not confirm — leave as pending
                                    // This covers: genuinely failed payment, orderView API error,
                                    // or customer manipulating the URL (fraud attempt)
                                    darazbnpl_log('DarazBNPL: orderView did not confirm payment. Order stays pending.');
                                    wp_redirect($order->get_checkout_order_received_url());
                                }
                            }
                            exit();
                        }

                        // -------------------------------------------------------
                        // STEP 3: SERVER POST path
                        // Verify signature before doing anything
                        // All 4 gates must pass before payment_complete() is called
                        // -------------------------------------------------------
                        darazbnpl_log('DarazBNPL: Server POST received. Starting signature verification.');

                        // Gate 1: signature must be present
                        if (!isset($_REQUEST['signature'])) {
                            darazbnpl_log('DarazBNPL: SECURITY — Server POST missing signature. Rejecting.');
                            $order->add_order_note(sprintf(
                                'Koko server POST received with no signature. Rejected. TrnId: %s Status: %s',
                                sanitize_text_field($trn_id_raw),
                                $status_upper
                            ));
                            http_response_code(200); echo 'OK'; exit();
                        }

                        // Gate 2: signature must decode
                        $sig_decoded = base64_decode(wp_unslash($_REQUEST['signature']), true);
                        if ($sig_decoded === false) {
                            darazbnpl_log('DarazBNPL: SECURITY — base64_decode of signature failed. Rejecting.');
                            http_response_code(200); echo 'OK'; exit();
                        }

                        $verify_dataString = $order_id_raw . $trn_id_raw . $status_raw;
                        darazbnpl_log('DarazBNPL: verify dataString = ' . $verify_dataString);

                        // Gate 3: public key must load
                        $normalizedPublicKey = trim(
                            str_replace(["\r\n", "\r"], "\n", $this->public_key)
                        );
                        darazbnpl_log('DarazBNPL: public key first 50 = ' . substr($normalizedPublicKey, 0, 50));

                        $pubKeyid = openssl_pkey_get_public($normalizedPublicKey);
                        if (!$pubKeyid) {
                            darazbnpl_log('DarazBNPL: SECURITY — Could not load public key: ' . openssl_error_string());
                            $order->add_order_note('Koko server POST rejected: could not load public key. Check plugin settings.');
                            http_response_code(200); echo 'OK'; exit();
                        }

                        // Gate 4: signature must be cryptographically valid
                        $verify_result = openssl_verify(
                            $verify_dataString,
                            $sig_decoded,
                            $pubKeyid,
                            OPENSSL_ALGO_SHA256
                        );

                        if (PHP_MAJOR_VERSION < 8) {
                            openssl_free_key($pubKeyid);
                        }

                        darazbnpl_log("DarazBNPL: Signature verify result = $verify_result (1=valid, 0=invalid, -1=error)");

                        if ($verify_result !== 1) {
                            darazbnpl_log('DarazBNPL: SECURITY — Signature verification FAILED. Rejecting.');
                            $order->add_order_note(sprintf(
                                'Koko server POST REJECTED — signature invalid (result=%d). TrnId: %s Status: %s',
                                $verify_result,
                                sanitize_text_field($trn_id_raw),
                                $status_upper
                            ));
                            http_response_code(200); echo 'OK'; exit();
                        }

                        // -------------------------------------------------------
                        // STEP 4: All gates passed — safe to update order
                        // -------------------------------------------------------
                        darazbnpl_log('DarazBNPL: Signature VERIFIED. Proceeding to update order status.');

                        $current_status = $order->get_status();

                        if (in_array($current_status, ['processing', 'completed'], true)) {
                            darazbnpl_log("DarazBNPL: Order already in terminal state: $current_status. Skipping.");
                            http_response_code(200); echo 'OK'; exit();
                        }

                        if ($normalized_status === 'SUCCESS') {

                            if (in_array($current_status, ['cancelled', 'failed', 'refunded'], true)) {
                                darazbnpl_log("DarazBNPL: Reopening $current_status order before payment_complete.");
                                $order->update_status('pending', 'Koko signed callback received — reopening order.');
                                $order->save();
                            }

                            $order->payment_complete(sanitize_text_field($trn_id_raw));
                            $order->save();

                            if (!in_array($order->get_status(), ['processing', 'completed'], true)) {
                                darazbnpl_log('DarazBNPL: payment_complete did not set processing — forcing.');
                                $order->update_status('processing', 'Koko payment confirmed — forced.');
                                $order->save();
                            }

                            $order->add_order_note(sprintf(
                                'Koko payment confirmed. Signature verified. Transaction ID: %s',
                                sanitize_text_field($trn_id_raw)
                            ));

                            if (WC()->cart) { WC()->cart->empty_cart(); }

                            darazbnpl_log("DarazBNPL: payment_complete() called for order $order_id. Final status=" . $order->get_status());

                        } elseif ($normalized_status === 'CANCELLED') {

                            $order->update_status('cancelled', 'Koko payment cancelled by customer.');
                            $order->add_order_note('Koko signed callback: payment cancelled by customer.');
                            darazbnpl_log("DarazBNPL: Order $order_id cancelled.");

                        } else {

                            $order->update_status('failed', 'Koko payment failed.');
                            $order->add_order_note(sprintf(
                                'Koko signed callback: payment failed. Status: %s. TrnId: %s',
                                $status_upper,
                                sanitize_text_field($trn_id_raw)
                            ));
                            darazbnpl_log("DarazBNPL: Order $order_id failed. Status=$status_upper");

                        }

                        http_response_code(200);
                        echo 'OK';
                        exit();

                    } catch (Exception $e) {

                        darazbnpl_log('DarazBNPL: ---- EXCEPTION CAUGHT ----');
                        darazbnpl_log('DarazBNPL: Exception message = ' . $e->getMessage());
                        darazbnpl_log('DarazBNPL: Exception file    = ' . $e->getFile());
                        darazbnpl_log('DarazBNPL: Exception line    = ' . $e->getLine());
                        darazbnpl_log('DarazBNPL: Stack trace       = ' . $e->getTraceAsString());
                        darazbnpl_log('DarazBNPL: ---- EXCEPTION END ----');

                        if (isset($order) && $order) {
                            $order->add_order_note('DarazBNPL exception: ' . $e->getMessage() . ' on line ' . $e->getLine());
                        }

                        if (isset($is_server_post) && $is_server_post) {
                            http_response_code(200); echo 'OK'; exit();
                        }

                        wp_redirect(wc_get_cart_url());
                        exit();

                    } catch (Error $e) {

                        darazbnpl_log('DarazBNPL: ---- PHP ERROR CAUGHT ----');
                        darazbnpl_log('DarazBNPL: Error message = ' . $e->getMessage());
                        darazbnpl_log('DarazBNPL: Error file    = ' . $e->getFile());
                        darazbnpl_log('DarazBNPL: Error line    = ' . $e->getLine());
                        darazbnpl_log('DarazBNPL: Stack trace   = ' . $e->getTraceAsString());
                        darazbnpl_log('DarazBNPL: ---- PHP ERROR END ----');

                        if (isset($order) && $order) {
                            $order->add_order_note('DarazBNPL PHP error: ' . $e->getMessage() . ' on line ' . $e->getLine());
                        }

                        if (isset($is_server_post) && $is_server_post) {
                            http_response_code(200); echo 'OK'; exit();
                        }

                        wp_redirect(wc_get_cart_url());
                        exit();
                    }
                }

                // -------------------------------------------------------
                // orderView API verification
                //
                // Called from the browser GET path when the order is still
                // pending after a SUCCESS redirect. Makes an outbound call
                // from your server to Koko to confirm the payment.
                //
                // Outbound calls are never blocked by hosting firewalls.
                // Only inbound POSTs get blocked (liveblog365 issue).
                //
                // Returns true if Koko confirms payment as SUCCESS.
                // Returns false if payment not confirmed or any error occurs.
                // -------------------------------------------------------
                private function verify_via_orderview($order_id)
                {
                    darazbnpl_log("DarazBNPL: orderView API call for order $order_id");

                    $api_url = $this->test_mode
                        ? 'https://qaapi.paykoko.com/api/merchants/orderView'
                        : 'https://prodapi.paykoko.com/api/merchants/orderView';

                    $merchant      = $this->merchant_id;
                    $apiKey        = $this->api_key;
                    $pluginName    = 'woocommerce';
                    $pluginVersion = defined('WC_VERSION') ? WC_VERSION : '1.0';

                    // orderView dataString: mId + pluginName + pluginVersion + orderId + apiKey
                    $dataString = $merchant . $pluginName . $pluginVersion . $order_id . $apiKey;
                    darazbnpl_log('DarazBNPL: orderView dataString = ' . $dataString);

                    $normalizedPrivateKey = trim(str_replace(["\r\n", "\r"], "\n", $this->private_key));
                    $pkeyid = openssl_get_privatekey($normalizedPrivateKey);
                    if (!$pkeyid) {
                        darazbnpl_log('DarazBNPL: orderView — failed to load private key: ' . openssl_error_string());
                        return false;
                    }

                    if (!openssl_sign($dataString, $signature, $pkeyid, OPENSSL_ALGO_SHA256)) {
                        darazbnpl_log('DarazBNPL: orderView — openssl_sign failed: ' . openssl_error_string());
                        return false;
                    }

                    if (PHP_MAJOR_VERSION < 8) { openssl_free_key($pkeyid); }

                    $response = wp_remote_post($api_url, array(
                        'timeout' => 15,
                        'body'    => array(
                            '_mId'           => $merchant,
                            'api_key'        => $apiKey,
                            '_orderId'       => $order_id,
                            '_pluginName'    => $pluginName,
                            '_pluginVersion' => $pluginVersion,
                            'signature'      => base64_encode($signature),
                        ),
                    ));

                    if (is_wp_error($response)) {
                        darazbnpl_log('DarazBNPL: orderView — HTTP error: ' . $response->get_error_message());
                        return false;
                    }

                    $http_code = wp_remote_retrieve_response_code($response);
                    $body      = wp_remote_retrieve_body($response);
                    darazbnpl_log("DarazBNPL: orderView — HTTP $http_code response: $body");

                    $data = json_decode($body, true);

                    // Response must have content key with status inside
                    if (!isset($data['content']['status'])) {
                        darazbnpl_log('DarazBNPL: orderView — no status in response. Cannot confirm payment.');
                        return false;
                    }

                    // Cross check order ID matches what Koko returned
                    if (isset($data['content']['orderId']) &&
                        (string) $data['content']['orderId'] !== (string) $order_id) {
                        darazbnpl_log('DarazBNPL: orderView — order ID mismatch. Koko returned: ' . $data['content']['orderId']);
                        return false;
                    }

                    $koko_status = strtoupper($data['content']['status']);
                    darazbnpl_log("DarazBNPL: orderView — Koko status = $koko_status");

                    return in_array($koko_status, ['SUCCESS', 'APPROVED', 'COMPLETED'], true);
                }

            }

            function woocommerce_add_gateway_darazbnpl_gateway($methods)
            {
                $methods[] = 'DarazBnpl_WC';
                return $methods;
            }
            add_filter('woocommerce_payment_gateways', 'woocommerce_add_gateway_darazbnpl_gateway');

        }
    }, 5);
}

if (!function_exists('darazbnpl_add_action_plugin')) :
    function darazbnpl_add_action_plugin($actions, $plugin_file)
    {
        static $plugin;
        if (!isset($plugin)) {
            $plugin = plugin_basename(__FILE__);
        }
        if ($plugin === $plugin_file) {
            $settings = array(
                'settings' => '<a href="admin.php?page=wc-settings&tab=checkout&section=darazbnpl">'
                    . __('Settings') . '</a>',
            );
            $actions = array_merge($settings, $actions);
        }
        return $actions;
    }
endif;
add_filter('plugin_action_links', 'darazbnpl_add_action_plugin', 10, 2);

if (!function_exists('price_below_text_func')) {
    include_once __DIR__ . '/product_display.php';
}

add_action('plugins_loaded', function () {
    if (class_exists('Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry')) {
        add_action(
            'woocommerce_blocks_payment_method_type_registration',
            function (\Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry $registry) {
                require_once plugin_dir_path(__FILE__) . 'includes/class-darazbnpl-blocks-payment-method.php';
                if (class_exists('\Automattic\WooCommerce\Blocks\Payments\DarazBnpl_Blocks_Payment_Method')) {
                    $registry->register(new \Automattic\WooCommerce\Blocks\Payments\DarazBnpl_Blocks_Payment_Method());
                }
            }
        );
    }
});

add_action('init', function () {
    if (function_exists('register_block_type')) {
        wp_register_script(
            'darazbnpl-blocks',
            plugins_url('assets/js/darazbnpl-blocks.js', __FILE__),
            ['wp-element', 'wp-i18n', 'wc-blocks-registry'],
            '1.0.3',
            true
        );

        $darazbnpl_settings = get_option('woocommerce_darazbnpl_settings', array());
        wp_localize_script('darazbnpl-blocks', 'darazbnplData', array(
            'pluginUrl'   => plugins_url('', __FILE__) . '/',
            'logoUrl'     => plugins_url('assets/img/daraz-koko.png', __FILE__),
            'isAvailable' => true,
            'title'       => isset($darazbnpl_settings['title']) ? $darazbnpl_settings['title'] : 'KokoBNPL',
            'description' => isset($darazbnpl_settings['description']) ? $darazbnpl_settings['description'] : 'Pay in 3 interest-free instalments.',
        ));
    }
});

add_action('wp_enqueue_scripts', function () {
    if (is_checkout() && wp_script_is('darazbnpl-blocks', 'registered')) {
        wp_enqueue_script('darazbnpl-blocks');
    }
});

if (!function_exists('darazbnpl_log')) :
    function darazbnpl_log($message)
    {
        $settings      = get_option('woocommerce_darazbnpl_settings', array());
        $debug_enabled = isset($settings['debug_mode']) ? $settings['debug_mode'] : 'no';

        if ($debug_enabled === 'yes') {
            if (function_exists('wc_get_logger')) {
                wc_get_logger()->debug($message, array('source' => 'darazbnpl'));
            } else {
                error_log($message);
            }
        }
    }
endif;
