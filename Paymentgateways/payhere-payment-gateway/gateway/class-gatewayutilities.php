<?php

/**
 * Utitlity class file for admin and frontend helper functions
 *
 * @link       https://www.payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 */

/**
 *
 * Return plugins admin fileds, page list for redirection
 * Hash Verification function pre and post transaction
 * Return PayHere API Urls sandbox and live
 * Logging
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 * @author     Dilshan Jayasanka <dilshan@payhere.lk>
 */
class GatewayUtilities
{

	/**
	 * Function for return PayHere form fields
	 *
	 * @description  Return the Array of form fields for PayHere configuration
	 *
	 * @return Array Response form fields.
	 */
	public function get_form_fields()
	{
		return array(
			'seperator'         => array(
				'title'       => __('General Settings', 'payhere-payment-gateway'),
				'description' => '',
				'type'        => 'title',
			),
			// Activate the Gateway.
			'enabled'           => array(
				'title'       => __('Enable/Disable', 'payhere-payment-gateway'),
				'type'        => 'checkbox',
				'label'       => __('Enable PayHere', 'payhere-payment-gateway'),
				'default'     => 'yes',
				'description' => 'Show in the Payment List as a payment option',
				'desc_tip'    => true,
			),
			// Title as displayed on Frontend.
			'title'             => array(
				'title'       => __('Title', 'payhere-payment-gateway'),
				'type'        => 'text',
				'default'     => __('PayHere', 'payhere-payment-gateway'),
				'description' => __('This controls the title which the user sees during checkout.', 'payhere-payment-gateway'),
				'desc_tip'    => true,
			),
			// Description as displayed on Frontend.
			'description'       => array(
				'title'       => __('Description:', 'payhere-payment-gateway'),
				'type'        => 'textarea',
				'default'     => __('Pay by Visa, MasterCard, AMEX, eZcash, mCash or Internet Banking via PayHere.', 'payhere-payment-gateway'),
				'description' => __('This controls the description which the user sees during checkout.', 'payhere-payment-gateway'),
				'desc_tip'    => true,
			),
			// LIVE Key-ID.
			'merchant_id'        => array(
				'title'       => __('Merchant ID', 'payhere-payment-gateway'),
				'type'        => 'text',
				'description' => __('Your PayHere Merchant ID', 'payhere-payment-gateway'),
				'desc_tip'    => true,
			),
			// LIVE Key-Secret.
			'secret'            => array(
				'title'       => __('Secret Key', 'payhere-payment-gateway'),
				'type'        => 'text',
				'description' => __('Secret word you set in your PayHere Account', 'payhere-payment-gateway'),
				'desc_tip'    => true,
			),
			// Mode of Transaction.
			'test_mode'         => array(
				'title'       => __('Sandbox Mode', 'payhere-payment-gateway'),
				'type'        => 'checkbox',
				'label'       => __('Enable Sandbox Mode', 'payhere-payment-gateway'),
				'default'     => 'yes',
				'description' => __('PayHere sandbox can be used to test payments', 'payhere-payment-gateway'),
				'desc_tip'    => true,
			),
			// Onsite checkout.
			'onsite_checkout'   => array(
				'title'       => __('Onsite Checkout', 'payhere-payment-gateway'),
				'type'        => 'checkbox',
				'label'       => __('Enable On-site Checkout', 'payhere-payment-gateway'),
				'default'     => 'no',
				'description' => __('Enable to let customers checkout with PayHere without leaving your site', 'payhere-payment-gateway'),
				'desc_tip'    => true,
			),
			// Banner Image.
			'banner_image'   => array(
				'title'       => __('Gateway Image', 'payhere-payment-gateway'),
				'type'        => 'image_selection',
				'label'       => __('Upload Gateway Image', 'payhere-payment-gateway'),
				'default'     => esc_url(PAYHERE_PLUGIN_URL . 'public/images/payhere_long_banner.png'),
				'desc_tip'    => true,
			),
			// Page for Redirecting after Transaction.
			'redirect_page'      => array(
				'title'       => __('Return Page', 'payhere-payment-gateway'),
				'type'        => 'select',
				'options'     => $this->payhere_get_pages('Select Page'),
				'description' => __('Page to redirect the customer after payment', 'payhere-payment-gateway'),
				'desc_tip'    => true,
			),
			'payment_action'    => array(
				'title'       => __('Payment Action', 'payhere-payment-gateway'),
				'type'        => 'select',
				'class'       => 'wc-enhanced-select',
				'description' => __('Choose whether you wish to capture funds immediately or authorize payment and capture later.<br/><br/>To setup Authorize mode with your PayHere Live Account, contact PayHere Support on <a href="tel:+94115339339">+94 115 339 339</a> on email <a href="mailto:support@payhere.lk">support@payhere.lk</a>. Our team will be of assistance.', 'payhere-payment-gateway'),
				'default'     => 'sale',
				'desc_tip'    => false,
				'options'     => array(
					'sale'          => __('Sale', 'payhere-payment-gateway'),
					'authorization' => __('Authorize', 'payhere-payment-gateway'),
				),
			),
			'seperator_2'       => array(
				'title'       => __('Recurring Payments', 'payhere-payment-gateway'),
				'description' => __('You will only need below credentials if you have subscriptions or Charging API available.', 'payhere-payment-gateway'),
				'type'        => 'title',
			),
			// Business App ID.
			'enable_tokenizer'  => array(
				'title'       => __('Enable Tokenizer', 'payhere-payment-gateway'),
				'type'        => 'checkbox',
				'description' => __('If Enabled, Customers can pay with their saved cards.', 'payhere-payment-gateway'),
				'desc_tip'    => false,
			), // Business App ID.
			'app_id'            => array(
				'title'       => __('App ID', 'payhere-payment-gateway'),
				'type'        => 'text',
				'description' => __('Your PayHere Business App ID', 'payhere-payment-gateway'),
				'desc_tip'    => false,
			), // Business App Secret.
			'app_secret'        => array(
				'title'       => __('App Secret', 'payhere-payment-gateway'),
				'type'        => 'text',
				'description' => __('Your PayHere Business App Secret.', 'payhere-payment-gateway'),
				'desc_tip'    => true,
			),
			'subscription_warn' => array(
				'title'       => __('ⓘ Important!!', 'payhere-payment-gateway'),
				'type'        => 'info_box',
				'box_type'    => 'info',
				'description' => __("PayHere doesn't support Renewals,Switching and Synchronisation for Subscriptions.Please do not enable above features in Woocommerce Subscription Plugin settings if the plugin installed and active.", 'payhere-payment-gateway'),
				'desc_tip'    => true,
			),
		);
	}

	/**
	 * Function for submit charge.
	 *
	 * @description  Call PayHere Merchant API for charge payment from saved card.
	 *
	 * @param string $title Title of the page.
	 * @param string $indent If the Page Title should indent when showing in the list.
	 * @return Array Page list.
	 */
	public function payhere_get_pages($title = false, $indent = true)
	{
		$wp_pages  = get_pages('sort_column=menu_order');
		$page_list = array();
		if ($title) {
			$page_list[] = esc_html($title);
		}
		foreach ($wp_pages as $page) {
			$prefix = '';
			// show indented child pages?
			if ($indent) {
				$has_parent = $page->post_parent;
				while ($has_parent) {
					$prefix    .= ' - ';
					$next_page  = get_post($has_parent);
					$has_parent = $next_page->post_parent;
				}
			}
			// add to page list array array.
			$page_list[$page->ID] = $prefix . $page->post_title;
		}
		return $page_list;
	}

	/**
	 * Generate Title HTML.
	 *
	 * @param array $data Field data.
	 * @return string
	 * @since  1.0.0
	 */
	public function generate_info_box_html($data)
	{
		$type = $data['box_type'];
		ob_start();
		$class = '';
		if ('info' === $type) {
			$class = 'alert alert-danger';
		}
?>
		<tr>
			<td colspan="2">
				<div class="<?php echo esc_attr($class); ?>">
					<h3 class="wc-settings-sub-title "><?php echo esc_html($data['title']); ?></h3>
					<?php echo esc_html($data['description']); ?>
				</div>
			</td>
		</tr>
<?php

		return ob_get_clean();
	}


	/**
	 * Generate Image selection HTML.
	 *
	 * @param array $data Field data.
	 * @return string
	 * @since  5.0.0
	 */
	public function generate_image_selection_html($key, $data)
	{
		$imageSelection = new PayHereImageSelectionAdminSetting();
		$imageSelection->enqueue_scripts();
		return $imageSelection->generate_html($key, $data);
	}
	/**
	 * Generate the HASH value for verify PayHere notify_url call.
	 *
	 * @param string $merchant_id Merchant ID.
	 * @param string $secret Merchant Secret.
	 * @param string $order_id Order ID.
	 * @param string $amount PayHere amount.
	 * @param string $currency PayHere Currency.
	 * @param string $status_code PayHere Status code.
	 * @return string Hashed Secret
	 * @since  1.0.0
	 */
	public function generate_verify_hash($merchant_id, $secret, $order_id, $amount, $currency, $status_code)
	{
		$hash  = sanitize_text_field($merchant_id);
		$hash .= sanitize_text_field($order_id);
		$hash .= sanitize_text_field($amount);
		$hash .= sanitize_text_field($currency);
		$hash .= sanitize_text_field($status_code);
		$hash .= strtoupper(md5(sanitize_text_field($secret)));
		return strtoupper(md5(sanitize_text_field($hash)));
	}

	/**
	 * Generate the HASH value for generate form when initiating PayHere Gateway.
	 *
	 * @param string $merchant_id Merchant ID.
	 * @param string $secret Merchant Secret.
	 * @param string $order_id Order ID.
	 * @param string $amount PayHere amount.
	 * @param string $currency PayHere Currency.
	 * @return string Hashed Secret.
	 * @since  1.0.0
	 */
	public function generate_frontend_hash($merchant_id, $secret, $order_id, $amount, $currency)
	{
		$hash  = sanitize_text_field($merchant_id);
		$hash .= sanitize_text_field($order_id);
		$hash .= sanitize_text_field($amount);
		$hash .= sanitize_text_field($currency);
		$hash .= strtoupper(md5(sanitize_text_field($secret)));
		return strtoupper(md5(sanitize_text_field($hash)));
	}

	/**
	 * Verify the HASH from post parameter of Payhere Notify call.
	 *
	 * @param string   $secret Merchant Secret.
	 * @param WC_Order $order Merchant Secret.
	 * @return boolean if the PayHeere Hash match with the generated Hash
	 * @since  1.0.0
	 */
	public function verify_hash($secret, WC_Order $order)
	{
		$verified = false;

		$order_id         = sanitize_text_field(filter_input(INPUT_POST, 'order_id', FILTER_SANITIZE_SPECIAL_CHARS)); //changed from [payhere_amount] to [order_id] from version 2.3.7
		$merchant_id      = sanitize_text_field(filter_input(INPUT_POST, 'merchant_id', FILTER_SANITIZE_SPECIAL_CHARS));
		$payhere_amount   = sanitize_text_field(filter_input(INPUT_POST, 'payhere_amount', FILTER_SANITIZE_SPECIAL_CHARS));
		$md5sig           = sanitize_text_field(filter_input(INPUT_POST, 'md5sig', FILTER_SANITIZE_SPECIAL_CHARS));
		$payhere_currency = sanitize_text_field(filter_input(INPUT_POST, 'payhere_currency', FILTER_SANITIZE_SPECIAL_CHARS));
		$status_code      = sanitize_text_field(filter_input(INPUT_POST, 'status_code', FILTER_SANITIZE_SPECIAL_CHARS));

		$verification_required = apply_filters('payhere_filter_verification_required', true, $order_id, $merchant_id);
		if ($verification_required) {
			$effective_merchant_secret = apply_filters('payhere_filter_merchant_secret', $secret, $order_id, $merchant_id);
			// Never authenticate a notification without a configured signing secret.
			if (is_string($effective_merchant_secret) && '' !== trim(sanitize_text_field($effective_merchant_secret))) {
				$amount  = str_replace(',', '', $payhere_amount);
				$md5hash = $this->generate_verify_hash($merchant_id, $effective_merchant_secret, $order_id, number_format($amount, 2, '.', ''), $payhere_currency, $status_code);
				$verified = hash_equals($md5hash, $md5sig);
			}
		}
		return $verified;
	}

	/**
	 * Return PayHere checkout URL.
	 *
	 * @param string $is_test_mode Is test mode enabled.
	 * @return string URL for the PayHere Checkout endpoint
	 */
	public function get_payhere_checkout_url($is_test_mode)
	{
		if ('yes' === $is_test_mode) {
			return 'https://sandbox.payhere.lk/pay/checkout';
		}
		return 'https://www.payhere.lk/pay/checkout';
	}
	/**
	 * Modify the PayHere object with line items, argumants passed as reference, no need to return.
	 *
	 * @param Array    $payhere_args PayHere Gateway object.
	 * @param WC_Order $order        WC Order Object.
	 */
	public function get_line_items(&$payhere_args, $order)
	{
		$products    = array();
		$i           = 1;
		$order_items = $order->get_items();
		foreach ($order_items as $item) {
			$products[]                          = $item['name'];
			$payhere_args['item_name_' . $i]   = $item['name'];
			$payhere_args['item_number_' . $i] = $item['product_id'];
			$payhere_args['amount_' . $i]      = $item['line_total'] / $item['qty'];
			$payhere_args['quantity_' . $i]    = $item['qty'];
			$payhere_args['tax_' . $i]         = $item['line_tax'];
			if ($i >= 10) {
				break;
			}
			$i++;
		}
		if (count($order_items) > 10) {
			$products[] = (count($order_items) - 10) . ' more item(s)';
		}

		// $payhere_args['items'] = implode( ', ', $products );
		$payhere_args['items'] = apply_filters('payhere_filter_items', $payhere_args['items'], $order->get_id());
	}

	/**
	 * Return PayHere preapprove URL
	 *
	 * @param string $is_test_mode Is test mode enabled.
	 * @return string URL for the PayHere Pre-Approve endpoint
	 */
	public function get_payhere_preapprove_url($is_test_mode)
	{
		if ('yes' === $is_test_mode) {
			return 'https://sandbox.payhere.lk/pay/preapprove';
		}
		return 'https://www.payhere.lk/pay/preapprove';
	}
	/**
	 * Return PayHere Autgorize URL
	 *
	 * @param string $is_test_mode Is test mode enabled.
	 * @return string URL for the PayHere Authorize endpoint.
	 */
	public function get_payhere_authorize_url($is_test_mode)
	{
		if ('yes' === $is_test_mode) {
			return 'https://sandbox.payhere.lk/pay/authorize';
		}
		return 'https://www.payhere.lk/pay/authorize';
	}


	/**
	 * Return amount in PayHere support format
	 *
	 * @param float $amount Order amount.
	 * @return string formatted string of the amount.
	 */
	public function price_format($amount)
	{
		return number_format(str_replace(',', '', $amount), 2, '.', '');
	}

	/**
	 * Log events. 
	 * ! This function will remove in future release.
	 *
	 * @description File locate in wp-contents/uploads/payhere-logs folder with date sufix.
	 *
	 * @param string       $type Type description of the data.
	 * @param Array|string $data Dataneed to be logged.
	 */
	public function payhere_log($type, $data)
	{

		return false;
	}
}
