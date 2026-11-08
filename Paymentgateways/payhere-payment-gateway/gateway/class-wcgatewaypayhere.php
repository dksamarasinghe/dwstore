<?php

/**
 * Main File for PayHere Gatewaty
 *
 * @link       https://www.payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 */

/**
 * This call handles all the function for PayHere Gateway integration for Woocommerce
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 * @author     Dilshan Jayasanka <dilshan@payhere.lk>
 */

if (!defined('ABSPATH')) {
	exit;
}

class WCGatewayPayHere extends WC_Payment_Gateway
{



	const SUB_PROCESS_STATUS_NOT_SUBSCRIPTION   = 0;
	const SUB_PROCESS_STATUS_SUBSCRIPTION_OK    = 1;
	const SUB_PROCESS_STATUS_SUBSCRIPTION_ERROR = -1;

	const SUB_PROCESS_ERR_UNKNOWN        = 'Unknown error';
	const SUB_PROCESS_ERR_MULT_SUBS      = 'Too many subscriptions at checkout';
	const SUB_PROCESS_ERR_MIXED_PRODUCTS = 'Order contains mixed products';
	const SUB_PROCESS_ERR_INC_PERIOD     = 'Incompatible subscription billing and trial periods';
	const SUB_PROCESS_ERR_TRIAL_LONG     = "Subscription's trial period is larger than one billing period";
	const SUB_PROCESS_ERR_SYNCED         = 'Synchronized subscriptions are not supported yet';
	const SUB_PROCESS_ERR_INV_PERIOD     = 'Unsupported billing period';
	const SUB_PROCESS_ERR_FREE_TRIAL     = 'Free trials cannot be processed without a sign-up fee';

	const WOO_VERSION_CHECK = '2.0.0';


	/**
	 * PayHere Merchant ID
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      string $merchant_id.
	 */
	public $merchant_id;

	/**
	 * PayHere Merchant Secret
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      string $secret.
	 */
	public $secret;

	/**
	 * PayHere Business App IP
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      string $app_id.
	 */
	public $app_id;

	/**
	 * PayHere Merchan ID
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      string|int $merchant_id.
	 */
	public $app_secret;

	/**
	 * Enable Tokenize Payments
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      string|int $merchant_id.
	 */
	public $enable_tokenizer;

	/**
	 * Page for Redirection  After payment completion
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      int $redirect_page.
	 */
	public $redirect_page;

	/**
	 * Payment Action Sale or Authorize
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      string $payment_action
	 */
	private $payment_action;

	/**
	 * PayHere Merchan ID
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      string|int $merchant_id.
	 */
	public $msg;

	/**
	 * PayHere Merchan ID
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      string|int $gateway_utilities.
	 */
	private $gateway_utilities;
	/**
	 * PayHere Merchan ID
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      boolean.
	 */
	private $onsite_checkout_enabled;

	/**
	 * Static variable to count the number of instances of PayHere Class
	 * 
	 * @since 2.3.6
	 * @access private
	 * @var integer
	 */
	private static $ph_instance_count = 0;

	/**
	 * Instance ID for tracking multiple instances of the PayHere Class.
	 * 
	 * @since 2.3.6
	 * @access private
	 * @var integer
	 */
	private $ph_instance_id;

	/**
	 * Constructor for WC gateway main class.
	 * from the consreuctor set config from the saved settings.
	 * If empty default will set
	 */
	public function __construct()
	{
		$this->id                 = 'payhere';
		$this->method_title       = 'PayHere';
		$this->method_description = 'The eCommerce Payment Service Provider of Sri Lanka';

		// Checkout has fields?
		$this->has_fields        = false;
		$this->gateway_utilities = new GatewayUtilities();

		$this->init_form_fields();
		$this->init_settings();

		self::$ph_instance_count++;
		$this->ph_instance_id = self::$ph_instance_count;

		/**
		 * Add , 'subscription_amount_changes'  to the array for supports subscription Coupons.
		 */
		$supports_array = array('subscriptions', 'subscription_cancellation', 'products');
		$this->supports = $supports_array;

		// Special settigns if gateway is on Test Mode.
		$test_title       = '';
		$test_description = '';

		if ('yes' === $this->settings['test_mode']) {
			$test_title       = '';
			$test_description = '(Sandbox Mode is Active. You will not be charged.)';
		}

		if ('yes' === $this->settings['onsite_checkout']) {
			$this->onsite_checkout_enabled = true;
		} else {
			$this->onsite_checkout_enabled = false;
		}

		// Title as displayed on Frontend.
		$this->title 			= $this->settings['title'] . $test_title;
		$this->icon             = (isset($this->settings['banner_image']) && !empty($this->settings['banner_image'])) ? $this->settings['banner_image'] : '';
		// Description as displayed on Frontend.
		$this->description      = $this->settings['description'] . $test_description;
		$this->merchant_id      = isset($this->settings['merchant_id']) ?  $this->settings['merchant_id'] : $this->settings['mechant_id']; //$this->settings['merchant_id'];
		$this->payment_action   = $this->settings['payment_action'];
		$this->secret           = $this->settings['secret'];
		$this->app_id           = $this->settings['app_id'];
		$this->enable_tokenizer = 'yes' === $this->settings['enable_tokenizer'];
		$this->app_secret       = $this->settings['app_secret'];
		$this->redirect_page    = isset($this->settings['redirect_page']) ?  $this->settings['redirect_page'] : $this->settings['reirect_page']; //$this->settings['redirect_page'];reirect_page

		$this->msg['message'] = '';
		$this->msg['class']   = '';

		// add_action('init', array(&$this, 'check_payhere_response')); // removed

		add_action('woocommerce_update_options_payment_gateways_' . $this->id, array(&$this, 'process_admin_options'));

		if (1 === $this->ph_instance_id) {
			add_action('woocommerce_api_' . strtolower(get_class($this)), array($this, 'check_payhere_response')); 		 // update for woocommerce >2.0.
			add_action('woocommerce_receipt_payhere', array(&$this, 'receipt_page'));
			add_action('woocommerce_thankyou', array(&$this, 'remove_order_from_thankyou'), 10, 1);
		}

		add_filter('the_title', array(&$this, 'order_received_title_fallback'), 10, 2);
		add_filter('woocommerce_thankyou_order_received_title', array(&$this, 'order_received_title'), 10, 2);

		add_filter('woocommerce_thankyou_order_received_text', array($this, 'change_woo_order_received_text'), 10, 2);
	}


	/**
	 * HTML content for custom type in Gateway form fields
	 *
	 * @description Returns HTML template for custom settings type info_box
	 *
	 * @param string $key Settings API Key from Gateway settings.
	 * @param array  $data Settings for key value.
	 * @return HTML template
	 */
	public function generate_info_box_html($key, $data)
	{
		return $this->gateway_utilities->generate_info_box_html($data);
	}
	/**
	 * HTML content for custom type in Gateway form fields
	 *
	 * @description Returns HTML template for custom settings type info_box
	 *
	 * @param string $key Settings API Key from Gateway settings.
	 * @param array  $data Settings for key value.
	 * @return HTML template
	 */
	public function generate_image_selection_html($key, $data)
	{
		return $this->gateway_utilities->generate_image_selection_html($key, $data);
	}

	/**
	 * Initialise Settings Form Fields - Settings for PayHere Gateway.
	 */
	public function init_form_fields()
	{
		$this->form_fields = $this->gateway_utilities->get_form_fields();
	}

	/**
	 * Modify Payment Gateway Icon element css class.
	 *
	 * @param string $icon_html          HTML content of the img tag.
	 * @param string $payment_gateway_id ID of the Payment Gateway. In our plugin "payhere".
	 * @return string|string[]|null
	 */
	public function modify_gateway_icon_css($icon_html, $payment_gateway_id)
	{
		if ($payment_gateway_id !== $this->id) {
			return $icon_html;
		}

		$new_css   = 'class="ph-logo-style" src';
		$icon_html = preg_replace('/(src)/', $new_css, $icon_html);

		return $icon_html;
	}

	/**
	 * Generate the Receipt Page.
	 *
	 * @param string|int $order_id WC Order id.
	 **/
	public function receipt_page($order_id)
	{
		if ($this->onsite_checkout_enabled) {
			printf(
				'<p><strong>%s</strong></br>%s</p>',
				esc_html(__('Thank you for your order.', 'payhere-payment-gateway')),
				esc_html(__('Click the below button to checkout with PayHere.', 'payhere-payment-gateway'))
			);
		} else {
			printf(
				'<p><strong>%s</strong><br/>%s</p>',
				esc_html(__('Thank you for your order.', 'payhere-payment-gateway')),
				esc_html(__('The payment page will open soon.', 'payhere-payment-gateway'))
			);
		}
		$this->generate_payhere_form_escaped($order_id);
	}

	/**
	 * Generate button link
	 *
	 * @param string|int $_order_id WC Order id.
	 *
	 * @return string|string[]|null Validated html
	 **/
	private function generate_payhere_form_escaped($_order_id)
	{
		global $woocommerce;
		$order_id = sanitize_text_field($_order_id);
		$order    = wc_get_order($order_id); //Replaced [new WC_Order] with [wc_get_order] from version 2.3.7

		$redirect_url = $order->get_checkout_order_received_url();

		$notify_url = add_query_arg('wc-api', get_class($this), $redirect_url);

		$product_info = "Order $order_id";

		$effective_merchant_id     = apply_filters('payhere_filter_merchant_id', $this->merchant_id);
		$effective_merchant_secret = apply_filters('payhere_filter_merchant_secret', $this->secret, $order_id, $effective_merchant_id);
		$effective_test_mode       = apply_filters('payhere_filter_test_mode', $this->settings['test_mode'], $effective_merchant_id);

		$payhere_args = array(
			'merchant_id'        => $effective_merchant_id,
			'return_url'         => $redirect_url,
			'cancel_url'         => $redirect_url,
			'notify_url'         => $notify_url,

			'first_name'         => $order->get_billing_first_name(),
			'last_name'          => $order->get_billing_last_name(),
			'email'              => $order->get_billing_email(),
			'phone'              => $order->get_billing_phone(),
			'address'            => $order->get_billing_address_1() . (
				('' !== $order->get_billing_address_2()) ? ', ' . $order->get_billing_address_2() : ''
			),
			'address1'           => $order->get_billing_address_1(),
			'address2'           => $order->get_billing_address_2(),
			'city'               => $order->get_billing_city(),
			'state'              => $order->get_billing_state(),
			'country'            => $order->get_billing_country(),

			'order_id'           => $order_id,
			'items'              => $product_info,
			'currency'           => get_woocommerce_currency(),
			'amount'             => number_format(str_replace(',', '', $order->get_total()), 2, '.', ''),

			'delivery_firstname' => $order->get_shipping_first_name(),
			'delivery_lastname'  => $order->get_shipping_last_name(),
			'delivery_address'   => $order->get_shipping_address_1() . (($order->get_shipping_address_2() !== null) ? ', ' . $order->get_shipping_address_2() : ''),
			'delivery_zip'       => $order->get_shipping_postcode(),
			'delivery_city'      => $order->get_shipping_city(),
			'delivery_country'   => $order->get_shipping_country(),

			'platform'           => 'woocommerce',
		);

		$this->gateway_utilities->get_line_items($payhere_args, $order);

		if (apply_filters('payhere_filter_hash_verification_required', true, $order_id, $effective_merchant_id)) {

			/* Frontend Hash */

			$payhere_args['hash'] = $this->gateway_utilities->generate_frontend_hash(
				$effective_merchant_id,
				$effective_merchant_secret,
				$order_id,
				$payhere_args['amount'],
				$payhere_args['currency']
			);
		}

		// Start  Process as recurring payment.
		$subscription_process_status = null;
		$subscription_err            = null;
		$this->process_as_subscription_if_needed(
			$payhere_args,
			$subscription_process_status,
			$subscription_err,
			$order,
			$effective_merchant_secret
		);

		if (self::SUB_PROCESS_STATUS_SUBSCRIPTION_ERROR === $subscription_process_status) {

			$target_err_text = self::SUB_PROCESS_ERR_UNKNOWN;

			if (! empty($subscription_err)) {
				$target_err_text = $subscription_err;
			}

			echo sprintf(
				'<ul class="woocommerce-error" role="alert"><li><b>%s</b><br>%s</li></ul>',
				esc_html__('Cannot Process Payment', 'payhere-payment-gateway'),
				esc_html($target_err_text)
			);

			return;
		}

		// End  Process as recurring payment.

		$payment_obj = array();

		foreach ($payhere_args as $key => $value) {
			$payment_obj[$key] = $value;
		}

		if ('yes' === $effective_test_mode) {
			$payment_obj['sandbox'] = true;
		} else {
			$payment_obj['sandbox'] = false;
		}

		$can_use_charging_api = false;
		$effective_app_id     = apply_filters('payhere_filter_app_id', $this->app_id, $effective_merchant_id);
		$effective_app_secret = apply_filters('payhere_filter_app_secret', $this->app_secret, $effective_merchant_id);
		$enable_token         = $this->enable_tokenizer;
		if (!empty($effective_app_id) && !empty($effective_app_secret)) {
			$can_use_charging_api = true;
		}

		if (isset($payhere_args['recurrence'])) {
			$can_use_charging_api = false;
		}

		$payhere_args['preapprove'] = false;

		// For From Submit.
		$onsite_checkout_enabled = $this->onsite_checkout_enabled;

		$payhere_args_array = array();
		foreach ($payhere_args as $key => $value) {
			$payhere_args_array[] = "<input type='hidden' name='$key' value='$value'/>";
		}

		$payment_url     = $this->gateway_utilities->get_payhere_checkout_url($effective_test_mode);
		$pre_approve_url = $this->gateway_utilities->get_payhere_preapprove_url($effective_test_mode);
		$authorize_url   = $this->gateway_utilities->get_payhere_authorize_url($effective_test_mode);

		// Frontend Template Data.
		$customer_token   = '';
		$save_card_active = false;
		$customer_token   = get_user_meta(get_current_user_id(), 'payhere_customer_token', true);
		$_card_info       = get_user_meta(get_current_user_id(), 'payhere_customer_data', true);
		$card_info        = json_decode($_card_info);
		if (empty($customer_token) && is_user_logged_in() && $enable_token && $can_use_charging_api) {
			$save_card_active = true;
		}

		$payhere_js_data = array(
			'admin_ajax'       => admin_url('admin-ajax.php'),
			'charge_nonce'     => wp_create_nonce('payhere_charge_' . $order_id),
			'payment_action'   => $this->payment_action,
			'onsite_enabled'   => $onsite_checkout_enabled,
			'payhere_args'     => $payhere_args,
			'payhere_obj'      => $payment_obj,
			'url_preapprove'   => $pre_approve_url,
			'url_payment'      => $payment_url,
			'url_authorize'    => $authorize_url,
			'save_card_active' => !$save_card_active && empty($customer_token),
		);

		if ('authorization' === $this->payment_action && !isset($payhere_js_data['payhere_args']['recurrence'])) {
			if ($payhere_js_data['onsite_enabled']) {
				$payhere_js_data['payhere_args']['authorize'] = true;
				$payhere_js_data['payhere_obj']['authorize']  = true;
			}
			wp_enqueue_script('payhere-checkout', plugins_url('public/js/payhere-checkout-auth.js', __DIR__), array('jquery'), PAYHERE_VERSION, false);
			wp_localize_script('payhere-checkout', 'payhere_config', $payhere_js_data);

			include plugin_dir_path(dirname(__FILE__)) . 'public/partials/checkout-form-auth.php';
		} else {
			wp_enqueue_script('payhere-checkout', plugins_url('public/js/payhere-checkout-sale.js', __DIR__), array('jquery'), PAYHERE_VERSION, false);
			wp_localize_script('payhere-checkout', 'payhere_config', $payhere_js_data);
			include plugin_dir_path(dirname(__FILE__)) . 'public/partials/checkout-form-sale.php';
		}
	}

	/**
	 * Modify the PayHere Arguments and notify whether - not modified
	 *
	 * @param array    $payhere_args PayHere Payment Parameters - pass as reference.
	 * @param int      $process_status Constant containing a 'SUB_PROCESS_STATUS_' - pass as reference.
	 * @param string   $subscription_err Error occured (optional) - pass as reference.
	 * @param WC_Order $order WooCommerce Order Object.
	 * @param string   $effective_merchant_secret PayHere Merchant Secret.
	 */
	private function process_as_subscription_if_needed(&$payhere_args, &$process_status, &$subscription_err, $order, $effective_merchant_secret)
	{
		$is_yith_enabled = class_exists('YITH_WC_Subscription');
		$is_yith_subscription = false;

		if (!(class_exists('WC_Subscriptions') || class_exists('YITH_WC_Subscription'))) {
			$process_status = self::SUB_PROCESS_STATUS_NOT_SUBSCRIPTION;
			return;
		}

		if ($is_yith_enabled) {

			$is_yith_subscription = ywsbs_is_an_order_with_subscription($order);

			if ($is_yith_subscription) {

				$subscriptions = $order->get_meta('subscriptions');

				$items = $order->get_items();

				if (1 < count($items)) {
					$subscription_err = self::SUB_PROCESS_ERR_MIXED_PRODUCTS;
					$process_status = self::SUB_PROCESS_STATUS_SUBSCRIPTION_ERROR;
					return;
				}

				if (!empty($subscriptions) && is_array($subscriptions) && isset($subscriptions[0])) {
					$sub_data = ywsbs_get_subscription($subscriptions[0]);
				} else {
					$subscription_err = self::SUB_PROCESS_ERR_MIXED_PRODUCTS;
					$process_status = self::SUB_PROCESS_STATUS_SUBSCRIPTION_ERROR;
					return;
				}

				$yw_sub_reccurance = $sub_data->price_time_option;
				$yw_sub_duration = $sub_data->max_length;
				$yw_sub_interval_val = $sub_data->price_is_per;

				switch ($yw_sub_reccurance) {
					case 'days':
						$yw_sub_reccurance = 'Day';
						break;
					case 'weeks':
						$yw_sub_reccurance = 'Week';
						break;
					case 'months':
						$yw_sub_reccurance = 'Month';
						break;
					case 'years':
						$yw_sub_reccurance = 'Year';
						break;
					default:
						$subscription_err = self::SUB_PROCESS_ERR_INV_PERIOD;
						return;
				}

				if (null == $yw_sub_duration) {
					$yw_sub_duration = 'Forever';
				} else {
					$yw_sub_duration = $yw_sub_duration . ' ' . ucfirst($yw_sub_reccurance);
				}

				$recurrence = $yw_sub_interval_val . ' ' . ucfirst($yw_sub_reccurance);

				$duration   = $yw_sub_duration;

				$amount = $sub_data->order_total;

				//$payhere_args['startup_fee'] = $startup_fee;
				$payhere_args['recurrence']  = $recurrence;
				$payhere_args['duration']    = $duration;
				$payhere_args['amount']      = str_replace(',', '', $amount);



				$process_status = self::SUB_PROCESS_STATUS_SUBSCRIPTION_OK;
			}
		} else if (class_exists('WC_Subscriptions')) {

			if (!wcs_order_contains_subscription($order)) {
				$process_status = self::SUB_PROCESS_STATUS_NOT_SUBSCRIPTION;
				return;
			}

			$subscriptions     = wcs_get_subscriptions_for_order($order);

			$supported_periods = array('day', 'week', 'year', 'month');

			if (count($subscriptions) > 1) {
				$process_status = self::SUB_PROCESS_ERR_MULT_SUBS;
				return;
			}

			// We only support one subscription per order.
			$subscription = $subscriptions[array_keys($subscriptions)[0]];

			$sub_price_per_period = $subscription->get_total();
			$sub_sign_up_fee      = $subscription->get_sign_up_fee();
			$sub_billing_period   = $subscription->get_billing_period();
			$sub_billing_interval = $subscription->get_billing_interval();
			$sub_trial_period     = $subscription->get_trial_period();
			$sub_billing_length   = '';
			$sub_trial_length     = '';


			// Determine billing length.
			$start_timestamp        = $subscription->get_time('date_created');
			$trial_end_timestamp    = $subscription->get_time('trial_end');
			$next_payment_timestamp = $subscription->get_time('next_payment');
			$is_synced_subscription = WC_Subscriptions_Synchroniser::subscription_contains_synced_product($subscription->get_id());

			if ($is_synced_subscription) {
				$length_from_timestamp = $next_payment_timestamp;
			} elseif ($trial_end_timestamp > 0) {
				$length_from_timestamp = $trial_end_timestamp;
			} else {
				$length_from_timestamp = $start_timestamp;
			}

			$sub_billing_length = wcs_estimate_periods_between($length_from_timestamp, $subscription->get_time('end'), $sub_billing_period);
			$sub_trial_length   = wcs_estimate_periods_between($start_timestamp, $length_from_timestamp, $sub_trial_period);

			// Guard Errors.
			$order_product_types = array();
			foreach ($order->get_items() as $item) {
				$product_type                         = WC_Product_Factory::get_product_type($item['product_id']);
				$order_product_types[$product_type] = true;
			}
			$order_product_types = array_keys($order_product_types);
			if (count($order_product_types) > 1 && array_search('subscription', $order_product_types, true) !== false) {
				$subscription_err = self::SUB_PROCESS_ERR_MIXED_PRODUCTS;
				$process_status = self::SUB_PROCESS_STATUS_SUBSCRIPTION_ERROR;
				return;
			}

			if ($sub_trial_length > 0 && $sub_billing_period !== $sub_trial_period) {
				$subscription_err = self::SUB_PROCESS_ERR_INC_PERIOD;
				$process_status = self::SUB_PROCESS_STATUS_SUBSCRIPTION_ERROR;
				return;
			}

			if ($sub_trial_length > 0 && 1 !== $sub_trial_length) {
				$subscription_err = self::SUB_PROCESS_ERR_TRIAL_LONG;
				$process_status = self::SUB_PROCESS_STATUS_SUBSCRIPTION_ERROR;
				return;
			}

			if ($is_synced_subscription) {
				$subscription_err = self::SUB_PROCESS_ERR_SYNCED;
				$process_status = self::SUB_PROCESS_STATUS_SUBSCRIPTION_ERROR;
				return;
			}

			if (array_search(strtolower($sub_billing_period), $supported_periods, true) === false) {
				$subscription_err = self::SUB_PROCESS_ERR_INV_PERIOD;
				$process_status = self::SUB_PROCESS_STATUS_SUBSCRIPTION_ERROR;
				return;
			}

			if ($sub_trial_length > 0 && 0 === $sub_sign_up_fee) {
				$subscription_err = self::SUB_PROCESS_ERR_FREE_TRIAL;
				$process_status = self::SUB_PROCESS_STATUS_SUBSCRIPTION_ERROR;
				return;
			}

			// Modify PayHere Args.

			$startup_fee = $sub_sign_up_fee;

			$recurrence = $sub_billing_interval . ' ' . ucfirst($sub_billing_period);
			$duration   = $sub_billing_length . ' ' . ucfirst($sub_billing_period);

			// Handle Forever Billing Periods.

			if (0 === $sub_billing_length) {
				$duration = 'Forever';
			}

			$amount = $sub_price_per_period;
			$payhere_args['startup_fee'] = $startup_fee;
			$payhere_args['recurrence']  = $recurrence;
			$payhere_args['duration']    = $duration;
			$payhere_args['amount']      = str_replace(',', '', $amount);

			if (isset($payhere_args['hash'])) {
				$payhere_args['hash'] = $this->gateway_utilities->generate_frontend_hash(
					$payhere_args['merchant_id'],
					$effective_merchant_secret,
					$order->get_id(),
					number_format(doubleval($payhere_args['amount']) + doubleval($startup_fee), 2, '.', ''),
					$payhere_args['currency']
				);
			}

			$process_status = self::SUB_PROCESS_STATUS_SUBSCRIPTION_OK;
		} else {
			$process_status = self::SUB_PROCESS_STATUS_NOT_SUBSCRIPTION;
			return;
		}
	}

	/**
	 * Modify the title of Order received page to replce allways showed "Order Received" title.
	 *
	 * @param array $title Current title.
	 * @param int   $id WC Order id.
	 * @return Array retuns the apprpriate title for the order status.
	 */
	public function order_received_title($title, $id)
	{
		if (! is_order_received_page()) {
			return $title;
		}

		global $wp;

		// No nonce is available on thank you page URL.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$key = isset($_GET['key']) ? wc_clean(wp_unslash($_GET['key'])) : '';

		$order_id = isset($wp->query_vars['order-received'])
			? absint($wp->query_vars['order-received'])
			: 0;

		$order_id  = apply_filters('payhere_woocommerce_thankyou_order_id', $order_id);
		$order_key = apply_filters('payhere_woocommerce_thankyou_order_key', $key);

		if ($order_id <= 0 || empty($order_key)) {
			return $title;
		}

		$order = wc_get_order($order_id);

		if (! $order instanceof WC_Order) {
			return $title;
		}

		if ($order->get_order_key() !== $order_key) {
			return $title;
		}

		if ($order->get_payment_method() !== $this->id) {
			return $title;
		}

		if (in_array($order->get_status(), array('completed', 'on-hold', 'processing', 'phauthorized'), true)) {
			return __('Order received', 'payhere-payment-gateway');
		}

		return __('Payment pending', 'payhere-payment-gateway');
	}

	/**
	 * Modify the title of Order received page to replce allways showed "Order Received" title fallback.
	 *
	 * @param array $title Current title.
	 * @param int   $id WC Order id.
	 * @return Array retuns the apprpriate title for the order status.
	 */

	public function order_received_title_fallback($title, $id)
	{
		if (is_order_received_page() && get_the_ID() === $id) {
			global $wp;

			// There will be no nounce when the request is send.
			// phpcs:ignore
			$key = empty($_GET['key']) ? '' : wc_clean($_GET['key']);

			$order_id  = apply_filters('payhere_woocommerce_thankyou_order_id', absint($wp->query_vars['order-received']));
			$order_key = apply_filters('payhere_woocommerce_thankyou_order_key', $key);

			if ($order_id > 0) {
				$order = wc_get_order($order_id);
				if ($order->get_order_key() !== $order_key) {
					$order = false;
				}
			}

			if ($order instanceof WC_Order && $order->get_payment_method() === $this->id) {
				if ('completed' === $order->get_status() || 'on-hold' === $order->get_status() || 'processing' === $order->get_status()) {
					$title = 'Order received';
				} else {
					$title = 'Payment pending';
				}
			}
		}
		return $title;
	}

	/**
	 * Modify the content of Order received page to display Gateway Error meesage.
	 *
	 * @param int $order_id WC Order id.
	 */
	public function remove_order_from_thankyou($order_id)
	{
		$order = wc_get_order(wc_sanitize_order_id(wp_unslash($order_id)));

		if (!$order instanceof WC_Order) {
			return;
		}

		if ($order->get_payment_method() !== $this->id) {
			return;
		}

		$status  = $order->get_status();
		$message = $order->get_meta('payhere_gateway_message', true);

		// SUCCESS ORDER
		if (in_array($status, array('completed', 'processing', 'on-hold', 'phauthorized'), true)) {
?>
			<div>
				<a href="<?php echo esc_url(site_url()); ?>" class="ph-btn gray">
					<?php echo esc_html__('Return to shop', 'payhere-payment-gateway-beta'); ?>
				</a>
			</div>
		<?php
			return;
		}

		// FAILED / UNPAID ORDER
		if (in_array($status, array('failed', 'pending', 'cancelled'), true)) {
		?>
			<p style="margin:10px 0">
				<?php echo esc_html($message ? $message : 'Payment not complete. Please try again.'); ?>
			</p>

			<div>
				<?php
				if ($order->needs_payment()) {
					printf(
						'<a class="ph-btn blue" href="%s">%s</a>',
						esc_url($order->get_checkout_payment_url()),
						esc_html__('Try Again', 'payhere-payment-gateway-beta')
					);
				}
				?>

				<a href="<?php echo esc_url(site_url()); ?>" class="ph-btn gray">
					<?php echo esc_html__('Return to shop', 'payhere-payment-gateway-beta'); ?>
				</a>
			</div>
<?php
		}
	}

	/**
	 * Process the payment and return the result with rediredt URL.
	 *
	 * @param int $order_id WC Order id.
	 **/
	public function process_payment($order_id)
	{
		$order = wc_get_order($order_id); //Replaced [new WC_Order] with [wc_get_order] from version 2.3.7

		$checkout_payment_url = $order->get_checkout_payment_url(true);

		$wc_code_version = WC()->version;

		if (version_compare($wc_code_version, '2.1', '>=')) {
			return array(
				'result' => 'success',
				'redirect' => add_query_arg('key', $order->get_order_key(), $order->get_checkout_payment_url(true))
			);
		} else {
			return array(
				'result'   => 'success',
				'redirect' => add_query_arg(
					'order',
					$order->get_id(),
					add_query_arg(
						'key',
						$order->get_order_key(),
						$checkout_payment_url
					)
				),
			);
		}
	}


	/**
	 * Check for valid gateway server callback.
	 **/
	public function check_payhere_response()
	{
		global $woocommerce;

		// Redirect if access url directly.
		if (isset($_SERVER['REQUEST_METHOD']) && 'POST' !== $_SERVER['REQUEST_METHOD']) {
			if ('' === $this->redirect_page || 0 === $this->redirect_page) {
				$redirect_url = get_permalink(get_option('woocommerce_myaccount_page_id'));
			} else {
				$redirect_url = get_permalink($this->redirect_page);
			}
			wp_safe_redirect($redirect_url);
			return false;
		}

		$is_subscription  = !empty(sanitize_text_field(filter_input(INPUT_POST, 'subscription_id', FILTER_SANITIZE_SPECIAL_CHARS)));
		$is_authorization = !empty(sanitize_text_field(filter_input(INPUT_POST, 'authorization_token', FILTER_SANITIZE_SPECIAL_CHARS)));
		$is_tokenized 	  = !empty(sanitize_text_field(filter_input(INPUT_POST, 'customer_token', FILTER_SANITIZE_SPECIAL_CHARS)));

		// $post_data = filter_input_array(INPUT_POST, FILTER_DEFAULT);
		// $this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', $post_data);

		$_order_id        = sanitize_text_field(filter_input(INPUT_POST, 'order_id', FILTER_SANITIZE_SPECIAL_CHARS));
		$status_code      = sanitize_text_field(filter_input(INPUT_POST, 'status_code', FILTER_SANITIZE_SPECIAL_CHARS));
		$status_message   = sanitize_text_field(filter_input(INPUT_POST, 'status_message', FILTER_SANITIZE_SPECIAL_CHARS));
		$payment_id       = sanitize_text_field(filter_input(INPUT_POST, 'payment_id', FILTER_SANITIZE_SPECIAL_CHARS));
		$payhere_amount   = sanitize_text_field(filter_input(INPUT_POST, 'payhere_amount', FILTER_SANITIZE_SPECIAL_CHARS));
		$payhere_currency = sanitize_text_field(filter_input(INPUT_POST, 'payhere_currency', FILTER_SANITIZE_SPECIAL_CHARS));



		if (!isset($_order_id) || (!isset($payment_id) && !$is_authorization)) {
			$this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', 'Order id Not Found.');
			return false;
		}

		$order_id = sanitize_text_field(wp_unslash($_order_id));

		if (empty($order_id)) {
			$this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', 'Order id Not Found after sanitize');
			return false;
		}
		try {
			$order  = wc_get_order($order_id); //Replaced [new WC_Order] with [wc_get_order] from version 2.3.7
			if (!$order instanceof WC_Order) {
				$this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', 'Invalid order.');
				return false;
			}

			$status = sanitize_text_field(wp_unslash(isset($status_code) ? $status_code : '-2'));

			$verified      = $this->gateway_utilities->verify_hash($this->secret, $order);
			$order_amount  = $order->get_total();
			$order_currncy = $order->get_currency();

			if (('completed' !== $order->get_status() && !$is_subscription) || ($is_subscription)) {

				$payhereAmount = number_format((float) $payhere_amount, 2, '.', '');
				$orderAmount   = number_format((float) $order_amount, 2, '.', '');

				$payhereCurrency = strtoupper(trim($payhere_currency));
				$orderCurrency   = strtoupper(trim($order_currncy));

				// Validate response integrity
				$hasError =
					!$verified ||
					$payhereAmount !== $orderAmount ||
					$payhereCurrency !== $orderCurrency;

				if ($hasError) {
					$this->msg['class']   = 'error';
					$this->msg['message'] = 'Security Error. Illegal access detected.';
					$order->add_order_note('Checksum ERROR: ' . wp_json_encode($post_data));
					$this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', 'Illegal HASH paramter');
					return false;
				}

				$status     = strtolower($status);
				$order_util = new PayHereOrderUtilities($order, $is_subscription);

				$order->add_meta_data('payhere_gateway_message', sanitize_text_field($status_message), true);

				if ('2' === $status) {

					if ($is_tokenized) {
						$tokenized_data = [
							'customer_token' 	=> sanitize_text_field(filter_input(INPUT_POST, 'customer_token', FILTER_SANITIZE_SPECIAL_CHARS)),
							'card_holder_name'	=> sanitize_text_field(filter_input(INPUT_POST, 'card_holder_name', FILTER_SANITIZE_SPECIAL_CHARS)),
							'card_no'			=> sanitize_text_field(filter_input(INPUT_POST, 'card_no', FILTER_SANITIZE_SPECIAL_CHARS)),
							'card_expiry'		=> sanitize_text_field(filter_input(INPUT_POST, 'card_expiry', FILTER_SANITIZE_SPECIAL_CHARS)),
							'method'			=> sanitize_text_field(filter_input(INPUT_POST, 'method', FILTER_SANITIZE_SPECIAL_CHARS))
						];
						$order_util->update_user_token($tokenized_data);
					}

					$post_data = [
						'payment_id'		=> sanitize_text_field($payment_id),
						'payhere_amount' 	=> sanitize_text_field(filter_input(INPUT_POST, 'payhere_amount', FILTER_SANITIZE_SPECIAL_CHARS)),
						'captured_amount'	=> sanitize_text_field(filter_input(INPUT_POST, 'captured_amount', FILTER_SANITIZE_SPECIAL_CHARS))
					];

					if ($is_subscription) {
						$post_data['subscription_id'] = sanitize_text_field(filter_input(INPUT_POST, 'subscription_id', FILTER_SANITIZE_SPECIAL_CHARS));
					}

					$this->msg['message'] = 'Thank you for shopping with us. Your account has been charged and your transaction is successful.';
					$this->msg['class']   = 'woocommerce-message';
					$order_util->update_order($post_data);
					$this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', 'Order Updated : Successfull');
				} elseif ('3' === $status) {

					//added this block from version 2.3.7 to manage authorized orders.

					$post_data = [
						'payhere_currency'		=> sanitize_text_field(filter_input(INPUT_POST, 'payhere_currency', FILTER_SANITIZE_SPECIAL_CHARS)),
						'payhere_amount'		=> sanitize_text_field($payhere_amount),
						'authorization_token'	=> sanitize_text_field(filter_input(INPUT_POST, 'authorization_token', FILTER_SANITIZE_SPECIAL_CHARS)),
						'status_message'		=> sanitize_text_field($status_message)
					];

					$order_util->authorize_order($post_data);
					$this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', 'Order Updated : Autorizarion : ' . $status);
				} elseif ('0' === $status) {

					$this->msg['message'] = 'Thank you for shopping with us. Right now your payment status is pending. We will keep you posted regarding the status of your order through eMail';
					$this->msg['class']   = 'woocommerce-info';
					$order->add_order_note('PayHere payment status is pending<br/>PayHere Payment ID: ' . sanitize_text_field($payment_id));
					$order->update_status('on-hold');
					$woocommerce->cart->empty_cart();

					$this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', 'Order Updated : Pending');
					if ($is_subscription) {
						WC_Subscriptions_Manager::process_subscription_payment_failure_on_order($order);
						$this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', 'Order Updated Subscription : Successfull');
					}
				} elseif ('-2' === $status) {

					$order->update_status('failed');
					$order->add_order_note(sanitize_text_field($status_message));
					$this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', 'Order Updated : Failed');
				} else {

					$this->msg['class']   = 'woocommerce-error';
					$this->msg['message'] = 'Thank you for shopping with us. However, the transaction has been declined.';
					$order->add_order_note('Transaction ERROR. Status Code: ' . $status);
					$this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', 'Order Updated : Failed : ' . $status);
				}

				if ($is_subscription) {
					$message_type       = sanitize_text_field(filter_input(INPUT_POST, 'message_type', FILTER_SANITIZE_SPECIAL_CHARS));
					$item_rec_status    = sanitize_text_field(filter_input(INPUT_POST, 'item_rec_status', FILTER_SANITIZE_SPECIAL_CHARS));
					$item_rec_date_next = sanitize_text_field(filter_input(INPUT_POST, 'item_rec_date_next', FILTER_SANITIZE_SPECIAL_CHARS));

					$order->add_order_note(
						sprintf(
							'Subscription Message = %s, Subscription Status = %s, Next Recurring Date %s',
							sanitize_text_field($message_type),
							sanitize_text_field($item_rec_status),
							sanitize_text_field($item_rec_date_next)
						)
					);
				}
			}
		} catch (Exception $e) {
			$this->gateway_utilities->payhere_log('PAYHERE_RESPONSE', 'ERROR : ' . $e->getMessage());
		}
	}


	/**
	 * Charge via PayHere Charging API
	 */
	public function charge_payment()
	{
		$order_id = absint(filter_input(INPUT_POST, 'order_id', FILTER_SANITIZE_NUMBER_INT));
		if (
			'POST' !== ($_SERVER['REQUEST_METHOD'] ?? '') || !is_user_logged_in() ||
			!check_ajax_referer('payhere_charge_' . $order_id, 'nonce', false)
		) {
			wp_send_json(array('type' => 'ERR', 'message' => 'Payment request could not be verified.'));
		}

		$order = wc_get_order($order_id);
		if (
			!$order instanceof WC_Order || (int) $order->get_customer_id() !== get_current_user_id() ||
			'payhere' !== $order->get_payment_method() || !$order->needs_payment()
		) {
			wp_send_json(array('type' => 'ERR', 'message' => 'This order is not available for payment.'));
		}

		$customer_token = get_user_meta(get_current_user_id(), 'payhere_customer_token', true);
		if (empty($customer_token)) {
			wp_send_json(array('type' => 'ERR', 'message' => 'No saved card is available.'));
		}

		// The unique option prevents concurrent charges, including across PHP workers.
		$lock_key = 'payhere_charge_lock_' . $order_id;
		if (!add_option($lock_key, '1', '', false)) {
			wp_send_json(array('type' => 'ERR', 'message' => 'A payment is already in progress or awaiting confirmation. Please contact the store before retrying.'));
		}

		try {
			// Re-read after acquiring the lock in case another request just paid the order.
			$order = wc_get_order($order_id);
			if (
				!$order instanceof WC_Order || (int) $order->get_customer_id() !== get_current_user_id() ||
				'payhere' !== $order->get_payment_method() || !$order->needs_payment()
			) {
				delete_option($lock_key);
				wp_send_json(array('type' => 'ERR', 'message' => 'This order is not available for payment.'));
			}

			$effective_merchant_id = apply_filters('payhere_filter_merchant_id', $this->merchant_id);
			$effective_test_mode = apply_filters('payhere_filter_test_mode', $this->settings['test_mode'], $effective_merchant_id);
			$effective_app_id = apply_filters('payhere_filter_app_id', $this->app_id, $effective_merchant_id);
			$effective_app_secret = apply_filters('payhere_filter_app_secret', $this->app_secret, $effective_merchant_id);
			$charge_payment = new ChargePayment($effective_app_id, $effective_app_secret, $effective_test_mode);
			$json = $charge_payment->charge_payment($order, $customer_token);

			// Keep successful or uncertain attempts locked; only a definite failure permits retry.
			if (!empty($json['retry_safe'])) {
				delete_option($lock_key);
			}
			unset($json['retry_safe']);
		} catch (Throwable $error) {
			$json = array('type' => 'ERR', 'message' => 'The payment result could not be confirmed. Please contact the store before retrying.');
		}

		wp_send_json($json);
	}

	/**
	 * Capture the payment via PayHere Capture API
	 */
	public function capture_payment()
	{
		$json = array();

		$order_id = wc_sanitize_order_id(
			filter_input(INPUT_POST, 'order_id', FILTER_SANITIZE_SPECIAL_CHARS)
		);

		if (
			'POST' !== ($_SERVER['REQUEST_METHOD'] ?? '') || !current_user_can('edit_shop_orders') ||
			!check_ajax_referer('payhere_capture_' . $order_id, 'nonce', false)
		) {
			wp_send_json(array('type' => 'ERR', 'message' => 'You are not allowed to capture this payment.'));
		}

		$payhere_authorize_amount = (float) filter_input(
			INPUT_POST,
			'authorize_amount',
			FILTER_SANITIZE_NUMBER_FLOAT,
			FILTER_FLAG_ALLOW_FRACTION
		);

		if (empty($order_id)) {
			echo wp_json_encode(
				array(
					'type'    => 'ERR',
					'message' => 'Can\'t make the payment. Server Error.',
				)
			);
			exit();
		}

		$order = wc_get_order($order_id);

		if (!$order instanceof WC_Order) {
			echo wp_json_encode(
				array(
					'type'    => 'ERR',
					'message' => 'Invalid order.',
				)
			);
			exit();
		}

		if (
			'payhere' !== $order->get_payment_method() || !$order->has_status('phauthorized') ||
			empty($order->get_meta('payhere_auth_token', true))
		) {
			wp_send_json(array('type' => 'ERR', 'message' => 'This order is not available for capture.'));
		}

		$is_test_mode = $this->settings['test_mode'];

		$effective_merchant_id = apply_filters('payhere_filter_merchant_id', $this->merchant_id);
		$effective_test_mode   = apply_filters('payhere_filter_test_mode', $is_test_mode, $effective_merchant_id);
		$effective_app_id      = apply_filters('payhere_filter_app_id', $this->app_id, $effective_merchant_id);
		$effective_app_secret  = apply_filters('payhere_filter_app_secret', $this->app_secret, $effective_merchant_id);

		$payhere_authorize_token = $order->get_meta('payhere_auth_token', true);

		if ($payhere_authorize_amount <= 0) {
			$payhere_authorize_amount = (float) $order->get_meta('payhere_auth_amount', true);
		}

		$capture = new PayHereCapturePayment(
			$effective_app_id,
			$effective_app_secret,
			$effective_test_mode
		);

		$json = $capture->capture_payment_payhere(
			$order,
			$payhere_authorize_token,
			$payhere_authorize_amount
		);

		$this->gateway_utilities->payhere_log('CHARGE', $json);

		echo wp_json_encode($json);

		exit();
	}

	/**
	 * Modify the WooCommerce order received page title for payment peding orders
	 *
	 * @param array $title Current title.
	 * @param int   $id WC Order id.
	 * @return Array retuns the apprpriate title for the order status.
	 */
	public function change_woo_order_received_text($title, $order)
	{
		if (is_order_received_page()) {
			global $wp;

			// There will be no nounce when the request is send.
			// phpcs:ignore
			$key = empty($_GET['key']) ? '' : wc_clean($_GET['key']);

			$order_id  = apply_filters('payhere_woocommerce_thankyou_order_id', absint($wp->query_vars['order-received']));
			$order_key = apply_filters('payhere_woocommerce_thankyou_order_key', $key);


			if ($order_id > 0) {
				$order = wc_get_order($order_id);
				if ($order->get_order_key() !== $order_key) {
					$order = false;
				}
			}

			if ($order instanceof WC_Order && $order->get_payment_method() === $this->id) {
				if ($order->get_status() === 'pending') {
					$title = 'Payment was not completed. Please try your purchase again.';
				}
			}
		}

		return $title;
	}
}
