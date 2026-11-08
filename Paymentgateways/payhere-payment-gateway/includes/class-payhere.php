<?php

/** The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      2.0.0
 * @package    PayHere
 * @subpackage PayHere/includes
 * @author     Your Name <dilshan@payhere.lk>
 */

if (!defined('ABSPATH')) {
	exit;
}

class PayHere
{
	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    2.0.0
	 * @access   protected
	 * @var      PayHere_Loader $loader Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    2.0.0
	 * @access   protected
	 * @var      string $PayHere The string used to uniquely identify this plugin.
	 */
	protected $payhere;

	/**
	 * The current version of the plugin.
	 *
	 * @since    2.0.0
	 * @access   protected
	 * @var      string $version The current version of the plugin.
	 */
	protected $version;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    2.0.0
	 */
	public function __construct()
	{
		if (defined('PAYHERE_VERSION')) {
			$this->version = PAYHERE_VERSION;
		} else {
			$this->version = '2.1.0';
		}
		$this->payhere = PAYHERE_TEXT_DOMAIN;

		$this->check_dependencies();
		$this->load_dependencies();
		$this->define_gateway_hooks();
		$this->define_admin_hooks();
		$this->define_public_hooks();
	}

	/**
	 * Check if WooCommerce is active and at the required minimum version, and if it isn't, disable Subscriptions.
	 *
	 * @since 1.0.15
	 */
	public function check_dependencies()
	{
		// Load plugin functions if not available
		if (! function_exists('is_plugin_active')) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		// WooCommerce dependency check (non-multisite)
		if (! is_multisite() && ! is_plugin_active('woocommerce/woocommerce.php')) {
			add_action(
				'admin_notices',
				function () {
					$class   = 'notice notice-error is-dismissible';
					$message = 'PayHere Payment Gateway for WooCommerce is enabled but not effective. It requires WooCommerce in order to work.';
					printf(
						'<div class="%1$s"><p>%2$s</p></div>',
						esc_attr($class),
						esc_html($message)
					);
				}
			);
			return;
		}

		// WooCommerce Subscriptions compatibility
		if (class_exists('WC_Subscriptions')) {
			if (version_compare(WC_Subscriptions::$wc_minimum_supported_version, '3.0', '<')) {
				add_action('admin_notices', ['WC_Subscriptions', 'woocommerce_inactive_notice']);
				return;
			}
		}

		// Core WC gateway class check
		if (! class_exists('WC_Payment_Gateway')) {
			return;
		}
	}



	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - PayHere_Loader. Orchestrates the hooks of the plugin.
	 * - PayHere_i18n. Defines internationalization functionality.
	 * - PayHereAdmin. Defines all hooks for the admin area.
	 * - PayHere_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    2+.0.0
	 * @access   private
	 */
	private function load_dependencies()
	{

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-payhere-loader.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */
		require_once plugin_dir_path(dirname(__FILE__)) . 'admin/class-payhereadmin.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */
		require_once plugin_dir_path(dirname(__FILE__)) . 'public/class-payhere-public.php';

		require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-phcustomerlistoptions.php';

		require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-phcustomerslist.php';
		require_once plugin_dir_path(dirname(__FILE__)) . 'gateway/class-subscriptionrestrictions.php';


		$this->loader = new PayHere_Loader();
	}



	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    2.0.0
	 * @access   private
	 */
	private function define_admin_hooks()
	{

		$plugin_admin = new PayHereAdmin($this->get_payhere(), $this->get_version());


		$this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_styles');
		$this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts');

		$this->loader->add_filter('plugin_action_links', $plugin_admin, 'add_action_links', 10, 2);

		$this->loader->add_action('plugins_loaded', $plugin_admin, 'add_customer_list_menu', 10);
	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    2.0.0
	 * @access   private
	 */
	private function define_public_hooks()
	{

		$plugin_public = new PayHere_Public($this->get_payhere(), $this->get_version());

		$this->loader->add_action('init', $plugin_public, 'saved_card_endpoint');

		$this->loader->add_filter('query_vars', $plugin_public, 'saved_cards_query_vars', 0);
		$this->loader->add_filter('woocommerce_account_menu_items', $plugin_public, 'saved_card_link_my_account');
		$this->loader->add_action('woocommerce_account_saved-cards_endpoint', $plugin_public, 'saved_card_content');

		$this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_styles');
		$this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_scripts');
		$this->loader->add_action('wp_ajax_payhere_remove_card', $plugin_public, 'remove_saved_method');
	}

	/**
	 * Register all of the hooks related to payment gateway functionality of the plugin.
	 *
	 * @since    2.0.0
	 * @access   private
	 */
	private function define_gateway_hooks()
	{

		$plugin_admin 	= new PayHereAdmin($this->get_payhere(), $this->get_version());
		$subscription 	= new SubscriptionRestrictions();

		$this->loader->add_action('plugins_loaded', $plugin_admin, 'init_gateway_files', 0);

		$this->loader->add_filter('woocommerce_payment_gateways', $plugin_admin, 'load_gateway');
		$this->loader->add_filter('woocommerce_register_shop_order_post_statuses', $plugin_admin, 'register_authorized_order_statuses', 0, 1);

		$this->loader->add_filter('wc_order_statuses', $plugin_admin, 'add_authorized_to_order_statuses', 0, 1);

		$this->loader->add_filter('wc_order_is_editable', $plugin_admin, 'allow_authorize_status_edit', 90, 2);

		$this->loader->add_action('wp_ajax_payhere_charge', $plugin_admin, 'add_charge_ajax');
		$this->loader->add_action('wp_ajax_payhere_capture', $plugin_admin, 'add_capture_ajax');
		$this->loader->add_action('add_meta_boxes', $plugin_admin, 'add_order_metabox_to_order', 99, 2);

		$this->loader->add_filter('wcs_view_subscription_actions', $subscription, 'restrict_user_actions', 10, 2);
		$this->loader->add_filter('user_has_cap', $subscription, 'payhere_user_has_capability', 10, 3);
	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    2.0.0
	 */
	public function run()
	{
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @return    string    The name of the plugin.
	 * @since     2.0.0
	 */
	public function get_payhere()
	{
		return $this->payhere;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @return    PayHere_Loader    Orchestrates the hooks of the plugin.
	 * @since     2.0.0
	 */
	public function get_loader()
	{
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @return    string    The version number of the plugin.
	 * @since     2.0.0
	 */
	public function get_version()
	{
		return $this->version;
	}
}
