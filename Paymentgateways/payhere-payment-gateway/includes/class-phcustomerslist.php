<?php
/**
 * Listing the card on file customer list
 *
 * @link       https://www.payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 */

if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . 'wp-admin/includes/screen.php';
	require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * Extemnded class for showing the table for customers has saved card with payehre.
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 * @author     Dilshan Jayasanka <dilshan@payhere.lk>
 */
class PHCustomersList extends WP_List_Table {


	/** Class constructor. */
	public function __construct() {
		parent::__construct(
			array(
				'singular' => __( 'Customer', 'payhere-payment-gateway' ), // singular name of the listed records.
				'plural'   => __( 'Customers', 'payhere-payment-gateway' ), // plural name of the listed records.
				'ajax'     => false, // does this table support ajax?
			)
		);
	}

	/**
	 * Retrieve customers data from the database.
	 *
	 * @param int $per_page Pageination limit.
	 * @param int $page_number Current page number in the pagination.
	 *
	 * @return mixed
	 */
	public static function get_customers( $per_page = 5, $page_number = 1 ) {
		global $wpdb;
		$db_p = $wpdb->prefix;

		$parameters = array();

		//removed postada (acessing all get parameters) v 2.3.8 beta

		$_s_get_data 		= sanitize_text_field(filter_input(INPUT_GET, 's', FILTER_SANITIZE_SPECIAL_CHARS));
		$_p_get_data 		= sanitize_text_field(filter_input(INPUT_GET, 'p', FILTER_SANITIZE_SPECIAL_CHARS));
		$_orderby_get_data 	= sanitize_text_field(filter_input(INPUT_GET, 'orderby', FILTER_SANITIZE_SPECIAL_CHARS));
		$_order_get_data 	= sanitize_text_field(filter_input(INPUT_GET, 'order', FILTER_SANITIZE_SPECIAL_CHARS));

		$sql = "SELECT meta_key,meta_value,{$db_p}wc_customer_lookup.* FROM {$db_p}wc_customer_lookup
        LEFT JOIN {$db_p}usermeta ON {$db_p}wc_customer_lookup.user_id = {$db_p}usermeta.user_id AND {$db_p}usermeta.meta_key = 'payhere_customer_data'";

		if ( isset( $_s_get_data ) && ! empty( $_s_get_data ) ) {
			$search_text  = sanitize_text_field( $_s_get_data );
			$sql         .= " WHERE (first_name LIKE '%s' OR last_name LIKE '%s' )";
			$parameters[] = '%' . $wpdb->esc_like( $search_text ) . '%';
			$parameters[] = '%' . $wpdb->esc_like( $search_text ) . '%';
		}

		$sql .= ' WHERE NOT ISNULL(meta_value) ';
		$sql .= ' ORDER BY %s %s';

		$sql .= " LIMIT $per_page";
		$sql .= ' OFFSET ' . ( $page_number - 1 ) * $per_page;

		$parameters[] = ! empty( $_orderby_get_data ) ? esc_sql( sanitize_text_field( $_orderby_get_data ) ) : ( $db_p . 'usermeta.user_id' );
		$parameters[] = ! empty( $_order_get_data ) ? esc_sql( sanitize_text_field( $_order_get_data ) ) : 'DESC';

		$cache_key = 'customer_data';

		$data = wp_cache_get( $cache_key );
		if ( false === $data ) {
			// https://github.com/WordPress/WordPress-Coding-Standards/issues/508.
			// phpcs:ignore
			$data = $wpdb->get_results( $wpdb->prepare( $sql, $parameters ), 'ARRAY_A' );

			wp_cache_set( $cache_key, $data );
		}

		return $data;
	}


	/**
	 * Delete a customer record.
	 *
	 * @unused - not available in frontend. tb used in future.
	 *
	 * @param int $id customer ID.
	 */
	public static function delete_customer( $id ) {
		// Todo.
	}

	/**
	 * Returns the count of records in the database.
	 *
	 * @return null|string
	 */
	public static function record_count() {
		global $wpdb;
		$db_p = $wpdb->prefix;

		$sql = "SELECT COUNT({$db_p}wc_customer_lookup.customer_id) FROM {$db_p}wc_customer_lookup
LEFT JOIN {$db_p}usermeta ON {$db_p}wc_customer_lookup.user_id = {$db_p}usermeta.user_id AND {$db_p}usermeta.meta_key = %s  WHERE NOT ISNULL(meta_value) ";

		$cache_key = 'customer_data_count';

		$data_count = wp_cache_get( $cache_key );
		if ( false === $data_count ) {
			// https://github.com/WordPress/WordPress-Coding-Standards/issues/508.
			// phpcs:ignore
			$data_count = $wpdb->get_var( $wpdb->prepare( $sql, 'payhere_customer_data' ) );

			wp_cache_set( $cache_key, $data_count );
		}

		return $data_count;
	}


	/** Text displayed when no customer data is available */
	public function no_items() {
		esc_html_e( 'No customers avaliable.', 'payhere-payment-gateway' );
	}

	/** Returns the view template. Currnetly no template */
	protected function get_views() {
		return array();
	}

	/**
	 * Render a column when no column specific method exist.
	 *
	 * @param array  $item Current item in the loop.
	 * @param string $column_name Current loop column name.
	 *
	 * @return mixed
	 */
	public function column_default( $item, $column_name ) {
		$value = '';
		switch ( $column_name ) {
			case 'first_name':
				$value = $this->get_name( $item );
				break;
			case 'user_id':
			case 'email':
			case 'username':
				$value = $item[ $column_name ];
				break;
			case 'date_registered':
				$value = $item[ $column_name ] ? gmdate( 'F j, Y, g:i a', strtotime( $item[ $column_name ] ) ) : '';
				break;
			case 'saved_date':
				$customer_data = json_decode( $item['meta_value'] );
				$value         = isset( $customer_data->saved_date ) ? gmdate( 'F j, Y, g:i a', $customer_data->saved_date ) : '-';
				break;
			case 'method':
				$value = $this->get_method( $item );
				break;
			case 'card_no':
				$customer_data = json_decode( $item['meta_value'] );
				$value         = isset( $customer_data->card_no ) ? substr( $customer_data->card_no, 5 ) : '';
				break;
			default:
				$value = wp_json_encode( $item ); // Show the whole array for troubleshooting purposes.
				break;
		}

		return $value;
	}

	/**
	 * Returns the names for the special column keys
	 *
	 * @param array $item an row of DB data.
	 *
	 * @return string
	 */
	private function get_name( $item ) {
		$name = $item['first_name'] . ' ' . $item['last_name'];
		if ( isset( $item['user_id'] ) && ! empty( $item['user_id'] ) ) {
			return "<a href='" . site_url( 'wp-admin/user-edit.php?user_id=' ) . $item['user_id'] . "'>$name</a>";
		} else {
			return $name;
		}
	}
	/**
	 * Returns the formated value for the special column keys
	 *
	 * @param array $item an row of DB data.
	 *
	 * @return string
	 */
	private function get_method( $item ) {
		$customer_data = json_decode( $item['meta_value'] );
		if ( isset( $customer_data->method ) ) {
			$class = 'VISA' === $customer_data->method || 'TEST' === $customer_data->method ? 'visa-card' : 'master-card';
			return '<span class="disply-card ' . $class . '"></span>';
		} else {
			return '';
		}
	}


	/**
	 * Method for name column
	 *
	 * @param array $item an array of DB data.
	 *
	 * @return string
	 */
	public function column_name( $item ) {
		return '<strong>' . esc_html( $item['username'] ) . '</strong>';
	}


	/**
	 *  Associative array of columns.
	 *
	 * @return array
	 */
	public function get_columns() {
		return array(
			'user_id'         => __( 'ID', 'payhere-payment-gateway' ),
			'first_name'      => __( 'Name', 'payhere-payment-gateway' ),
			'username'        => __( 'Username', 'payhere-payment-gateway' ),
			'email'           => __( 'E-mail', 'payhere-payment-gateway' ),
			'date_registered' => __( 'Sign Up Date', 'payhere-payment-gateway' ),
			'saved_date'      => __( 'Card Saved Date', 'payhere-payment-gateway' ),
			'method'          => __( 'Method', 'payhere-payment-gateway' ),
			'card_no'         => __( 'Card', 'payhere-payment-gateway' ),
		);
	}


	/**
	 * Columns to make sortable.
	 *
	 * @return array
	 */
	public function get_sortable_columns() {
		return array(
			'first_name'      => array( 'first_name', false ),
			'username'        => array( 'username', false ),
			'date_registered' => array( 'date_registered', false ),
		);
	}

	/**
	 * Returns an associative array containing the bulk action
	 *
	 * @disabled - customers cannot be deleted from our table
	 *
	 * @return array
	 */
	public function get_bulk_actions() {
		return array();
	}


	/**
	 * Handles data query and filter, sorting, and pagination.
	 */
	public function prepare_items() {
		$this->_column_headers = $this->get_column_info();

		$per_page     = $this->get_items_per_page( 'customers_per_page', 10 );
		$current_page = $this->get_pagenum();
		$total_items  = self::record_count();

		$this->set_pagination_args(
			array(
				'total_items' => $total_items, // WE have to calculate the total number of items.
				'per_page'    => $per_page, // WE have to determine how many items to show on a page.
			)
		);

		$this->items = self::get_customers( $per_page, $current_page );
	}
}
