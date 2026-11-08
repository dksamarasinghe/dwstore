<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://www.payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    PayHere
 * @subpackage PayHere/admin
 * @author     Dilshan Jayasanka <dilshan@payhere.lk>
 */
class PayHereAdmin
{

	/**
	 * The ID of this plugin.
	 *
	 * @since    2.0.0
	 * @access   private
	 * @var      string $pay_here The ID of this plugin.
	 */
	private $pay_here;

	/**
	 * Text for Custom post type
	 *
	 * @since    2.0.0
	 * @access   private
	 * @var      string $authorizedby_pay_here Singular and Plural word.
	 */
	private $authorizedby_pay_here = 'Authorized by PayHere';

	/**
	 * The version of this plugin.
	 *
	 * @since    2.0.0
	 * @access   private
	 * @var      string $version The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @param string $pay_here The name of this plugin.
	 * @param string $version The version of this plugin.
	 * @since    2.0.0
	 */
	public function __construct($pay_here, $version)
	{

		$this->pay_here = $pay_here;
		$this->version  = $version;
	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    2.0.0
	 */
	public function enqueue_styles()
	{

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in PayHere_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The PayHere_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style($this->pay_here, plugin_dir_url(__FILE__) . 'css/payhere-ipg-admin.css', array(), $this->version, 'all');
		wp_enqueue_style($this->pay_here, plugin_dir_url(__FILE__) . 'css/payhere-customer-list-settings.css', array(), $this->version, 'all');
	}


	/**
	 * Function for show settings link in plugins list
	 *
	 * @description  Add settings link under plugin name in the plugins list
	 *
	 * @param Array $actions list of actions previusly added.
	 * @param string $plugin_file name of plugin index file name.
	 * @return string Html contnet for anchor tag
	 */
	public function add_action_links($actions, $plugin_file)
	{
		$plugin = plugin_basename(plugin_dir_path(__FILE__));
		if ((explode('/', $plugin)[0]) === (explode('/', $plugin_file)[0])) {
			$settings = array('settings' => sprintf('<a href="admin.php?page=wc-settings&tab=checkout&section=wc_gateway_payhere">%s</a>', 'Settings'));
			$actions  = array_merge($settings, $actions);
		}

		return $actions;
	}


	/**
	 * Function for init gateway files
	 *
	 * @description  Load the PayHere Gateway class files
	 */
	public function init_gateway_files()
	{
		if (! function_exists('is_plugin_active')) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		if (is_plugin_active('woocommerce/woocommerce.php')) {

			$base_path = plugin_dir_path(dirname(__FILE__));

			require_once $base_path . 'gateway/class-gatewayutilities.php';
			require_once $base_path . 'gateway/class-payhereorderutilities.php';
			require_once $base_path . 'gateway/class-payheretoken.php';
			require_once $base_path . 'gateway/class-payherecapturepayment.php';
			require_once $base_path . 'gateway/class-chargepayment.php';
			require_once $base_path . 'gateway/class-wcgatewaypayhere.php';

			require_once $base_path . 'admin/class-payhere-custom-admin-settings-type.php';
		}
	}


	/**
	 * Ajax charge PayHere payment
	 */
	public function add_charge_ajax()
	{
		$gate_way = new WCGatewayPayHere();
		$gate_way->charge_payment();
	}
	/**
	 * Ajax capture authorized PayHere payment
	 */
	public function add_capture_ajax()
	{
		$gate_way = new WCGatewayPayHere();
		$gate_way->capture_payment();
	}

	/**
	 * Load the PayHere Gateway to Woocommerce Gateway list.
	 *
	 * @param string $methods Array of active payment gateways.
	 * @return Returns the list of Payment Gateways.
	 */
	public function load_gateway($methods)
	{
		$methods[] = 'WCGatewayPayHere';
		return $methods;
	}

	/**
	 * Load the customer list table options
	 */
	public function add_customer_list_menu()
	{
		PHCustomerListOptions::get_instance();
	}

	/**
	 * Register Authorized By PayHere in WordPress Post Status Registry
	 */
	public function register_authorized_order_status()
	{
		register_post_status(
			'wc-payhere-authorized',
			array(
				'label'                     => 'Authorized by PayHere',
				'public'                    => true,
				'exclude_from_search'       => false,
				'show_in_admin_all_list'    => true,
				'show_in_admin_status_list' => true,
				/* translators: 1: count of the hold on cards. */
				'label_count'               => _n_noop('Authorized by PayHere (%s)', 'Authorized by PayHere (%s)', 'payhere-payment-gateway'),
			)
		);
	}

	/**
	 * Return Authorized By PayHere from WordPress Post Status Registry
	 *
	 * @param string $order_statuses Array of active woocommerce order statuses.
	 * @return List of Order Status
	 */
	public function register_authorized_order_statuses($order_statuses)
	{
		$order_statuses['wc-phauthorized'] = array(
			'label'                     => 'Authorized by PayHere',
			'public'                    => true,
			'exclude_from_search'       => false,
			'show_in_admin_all_list'    => true,
			'show_in_admin_status_list' => true,
			/* translators: 1: count of the hold on cards. */
			'label_count'               => _n_noop('Authorized by PayHere (%s)', 'Authorized by PayHere (%s)', 'payhere-payment-gateway'),
		);
		return $order_statuses;
	}

	/**
	 * Add Authorized By PayHere to Woocommerce Order Status List
	 *
	 * @param array $order_statuses Array of active woocommerce order statuses.
	 * @return List of Order Status
	 */
	public function add_authorized_to_order_statuses($order_statuses)
	{

		$new_order_statuses = array();
		foreach ($order_statuses as $key => $status) {
			$new_order_statuses[$key] = $status;
			if ('wc-processing' === $key) {
				$new_order_statuses['wc-phauthorized'] = $this->authorizedby_pay_here;
			}
		}

		return $new_order_statuses;
	}

	/**
	 * Allow custom order status to edit order
	 *
	 * @param string $status string for type of order status.
	 * @param WC_Order $order WC_Order of the currenet order.
	 */
	public function allow_authorize_status_edit($status, $order)
	{
		if (! $status && 'phauthorized' === $order->get_status()) {
			return true;
		}
		return $status;
	}

	/**
	 * Add Capture button to Woocommerce single order view
	 */
	public function add_order_metabox_to_order(string $post_type, $post)
	{

		if (! in_array($post_type, ['shop_order', 'woocommerce_page_wc-orders'], true)) {
			return;
		}

		if ($post instanceof \WC_Order) {
			$order = $post;
		} elseif ($post instanceof \WP_Post) {
			$order = wc_get_order($post->ID);
		} else {
			return;
		}

		if (! $order) {
			return;
		}

		if ('payhere' !== $order->get_payment_method()) {
			return;
		}

		add_meta_box(
			'payhere-payment-gateway',
			'<span style="display:flex;align-items:center;">
            <img src="' . esc_url(PAYHERE_PLUGIN_URL . 'admin/images/favicon.png') . '" height="18" style="margin-right:6px;" />
            <span>' . esc_html__('PayHere Payments', 'payhere') . '</span>
        </span>',
			[$this, 'payhere_order_auth_capture_content'],
			$post_type,
			'normal',
			'high'
		);
	}


	/**
	 * Include capture modal content
	 */
	public function payhere_order_auth_capture_content($post)
	{
		$payhere_order = null;

		if ($post instanceof \WC_Order) {
			$payhere_order = $post;
		}
		elseif ($post instanceof \WP_Post) {
			$payhere_order = wc_get_order($post->ID);
		}
		elseif (is_numeric($post)) {
			$payhere_order = wc_get_order((int) $post);
		}
		elseif (is_string($post) && ctype_digit($post)) {
			$payhere_order = wc_get_order((int) $post);
		}

		if (! $payhere_order instanceof \WC_Order) {
			return;
		}

		require plugin_dir_path(dirname(__FILE__)) . 'admin/partials/order-auth-payment.php';
	}




	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    2.0.0
	 */
	public function enqueue_scripts()
	{

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in PayHere_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The PayHere_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script($this->pay_here, plugin_dir_url(__FILE__) . 'js/payhere-ipg-admin.js', array('jquery'), $this->version, false);
	}
}
