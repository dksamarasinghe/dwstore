<?php
/**
 * Options for the customer list table list template
 *
 * @link       https://www.payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 */

/**
 * Options for the customer list table list template
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 * @author     Dilshan Jayasanka <dilshan@payhere.lk>
 */

if (!defined('ABSPATH')) {
    exit;
}

class PHCustomerListOptions {


	/**
	 * Class instance of the slef to load in singleton way.
	 *
	 * @var Class instance.
	 */
	public static $instance;

	/**
	 * Class instance of the WP CustomrList Class.
	 *
	 * @var Customer WP_List_Table object.
	 */
	public $customers_obj;

	/**
	 * Class constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'plugin_menu' ), 20 );
	}

	/**
	 * PayHere plugin menu added hook to wp admin menus.
	 */
	public function plugin_menu() {
		$hook = add_submenu_page(
			'woocommerce',
			'Customer Cards on File',
			'Cards on File',
			'manage_options',
			'payhere_list_customer_list',
			array( $this, 'plugin_settings_page' )
		);

		add_action( "load-$hook", array( $this, 'screen_option' ) );
	}


	/**
	 * Plugin settings page
	 */
	public function plugin_settings_page() {        ?>
			<div class="wrap">
				<h2>Saved Payment Methods with PayHere </h2>
				<div id="poststuff">
					<div id="post-body" class="metabox-holder">
						<div id="post-body-content">
							<div class="meta-box-sortables ui-sortable">
								<form method="post" action="<?php echo esc_url( admin_url( 'admin.php' ) . '?page=payhere_list_customer_list' ); ?>">
									<?php
									$this->customers_obj->prepare_items();
									$this->customers_obj->views();
									$this->customers_obj->search_box( 'Search', 'search-name' );
									$this->customers_obj->display();
									?>
								</form>
							</div>
						</div>
					</div>
					<br class="clear">
				</div>
			</div>
		<?php
	}

	/**
	 * Screen options
	 */
	public function screen_option() {
		$option = 'per_page';
		$args   = array(
			'label'   => 'Customers',
			'default' => 10,
			'option'  => 'customers_per_page',
		);

		add_screen_option( $option, $args );

		$this->customers_obj = new PHCustomersList();
	}


	/** Singleton instance */
	public static function get_instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}
