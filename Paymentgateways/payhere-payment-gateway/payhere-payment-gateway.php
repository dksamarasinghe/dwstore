<?php

/**
 * The plugin bootstrap file
 *
 * @wordpress-plugin
 * Plugin Name:       PayHere Payment Gateway
 * Plugin URI:        https://www.payhere.lk
 * Description:       PayHere Payment Gateway allows you to accept payment on your Woocommerce store via Visa, MasterCard, AMEX, eZcash, mCash & Internet banking services.
 * Version:           2.4.6
 * Author:            PayHere (Private) Limited
 * Author URI:        https://www.payhere.lk
 * Text Domain:       payhere-payment-gateway
 * Domain Path:       /languages
 * License: 		  GPLv2 or later
 * License URI: 	  https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package    PayHere
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 2.0.0 and use SemVer - https://semver.org
 */
define('PAYHERE_VERSION', '2.4.6');
/**
 * Currently plugin text domain.
 * Start at version 2.0.0 and use SemVer - https://semver.org
 */
define('PAYHERE_TEXT_DOMAIN', 'payhere-payment-gateway');

/**
 * Current plugin directory
 * Start at version 2.4.0
 */
define( 'PAYHERE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-payhere-activator.php
 */
function payhere_activate()
{
	require_once plugin_dir_path(__FILE__) . 'includes/class-payhere-activator.php';
	PayHere_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-payhere-deactivator.php
 */
function payhere_deactivate()
{
	require_once plugin_dir_path(__FILE__) . 'includes/class-payhere-deactivator.php';
	PayHere_Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'payhere_activate');
register_deactivation_hook(__FILE__, 'payhere_deactivate');

/**
 * Add function to remove old transaction logs. 
 * This will remove in 2.3.5 update.
 */
function payhere_check_upgrade()
{
	try {
		$installed_ver = get_option("payhere_db_version");
		if ($installed_ver != PAYHERE_VERSION) {

			$uploads  = wp_upload_dir(null, false);
			$logs_dir = $uploads['basedir'] . '/payhere-logs';

			if (is_dir($logs_dir)) {
				$files = glob($logs_dir . '/*'); 
				foreach ($files as $file) {
					if (is_file($file)) {
						wp_delete_file($file);
					}
				}
			}

			update_option("payhere_db_version", PAYHERE_VERSION);
		}
	} catch (\Throwable $th) {
	}
}
add_action('plugins_loaded', 'payhere_check_upgrade');


/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path(__FILE__) . 'includes/class-payhere.php';

// Include the PayHere Block loadder
require plugin_dir_path(__FILE__) . 'block/class-payhere-block-loader.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    2.0.0
 */
function payhere_run()
{
	$plugin = new PayHere();
	$plugin->run();
}
payhere_run();
