<?php
/**
 * Utitlity class for retriieve auth token from PayHere Merchant API
 *
 * @link       https://www.payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 */

/**
 * Base clas for chargin and capture payment classes
 * Contain base urls for auth tokens and API endpoints for live and sandbox environments
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 * @author     Dilshan Jayasanka <dilshan@payhere.lk>
 */
class PayHereToken {


	/**
	 * PayHere Business APP ID.
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      string $app_id.
	 */
	public $app_id;

	/**
	 * PayHere Business APP Secret.
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      string $app_secret.
	 */
	public $app_secret;

	/**
	 * Is Sandbox enabled
	 *
	 * @since    1.0.11
	 * @access   private
	 * @var      boolean $is_sandbox.
	 */
	public $is_sandbox;

	/**
	 * The Uitl class for get gateway config.
	 *
	 * @since    2.0.0
	 * @access   private
	 * @var      WC_Order $gate_utils Utility class for get pathere URL and helper function for the order.
	 */
	public $gateway_util;

	/**
	 * Constructor for token class
	 *
	 * @param string  $app_id           PayHere APP ID.
	 * @param string  $app_secret       PayHere APP Secret.
	 * @param boolean $is_sandbox       Is sandbox.
	 */
	public function __construct( $app_id, $app_secret, $is_sandbox ) {
		$this->app_id       = $app_id;
		$this->app_secret   = $app_secret;
		$this->is_sandbox   = $is_sandbox;
		$this->gateway_util = new GatewayUtilities();
	}

	/**
	 * Return PayHere access token URL
	 *
	 * @return string
	 */
	public function get_payhere_access_token_url() {
		if ( 'yes' === $this->is_sandbox ) {
			return 'https://sandbox.payhere.lk/merchant/v1/oauth/token';
		}
		return 'https://www.payhere.lk/merchant/v1/oauth/token';
	}

	/**
	 * Return PayHere chargin API URL
	 *
	 * @return string
	 */
	public function get_payhere_chargin_api_url() {
		if ( 'yes' === $this->is_sandbox ) {
			return 'https://sandbox.payhere.lk/merchant/v1/payment/charge';
		}
		return 'https://www.payhere.lk/merchant/v1/payment/charge';
	}
	/**
	 * Return PayHere capture API URL
	 *
	 * @return string
	 */
	public function get_payhere_capture_api_url() {
		if ( 'yes' === $this->is_sandbox ) {
			return 'https://sandbox.payhere.lk/merchant/v1/payment/capture';
		}
		return 'https://www.payhere.lk/merchant/v1/payment/capture';
	}

	/**
	 * Return Headers with bearer token
	 *
	 * @return Array of Headers
	 */
	public function get_auth_header_token() {
		/** Reason : PayHere required to send the data with base64_encode */
		// phpcs:ignore
		$bs64 = base64_encode( $this->app_id . ':' . $this->app_secret );
		return array(
			'Authorization' => 'Basic ' . $bs64,
			'Content-Type' => 'application/x-www-form-urlencoded',
		);
	}


	/**
	 * Retrieve the PayHere Auth token.
	 *
	 * @return string JSON encoded PayHere response
	 */
	public function get_authorization_token() {

		$url = $this->get_payhere_access_token_url();

		$headers = $this->get_auth_header_token();

		$fields = array('grant_type' => 'client_credentials' );

		$args = array(
			'method' 	  => 'POST',
			'body'        => $fields,
			'timeout'     => '7',
			'redirection' => '1',
			'httpversion' => '1.0',
			'blocking'    => true,
			'headers'     => $headers,
			'sslverify'   => true,
			'cookies'     => array(),
		);

		$res = wp_remote_post( $url, $args );

		if ( $res instanceof WP_Error ) {
			return false;
		}

		return $res;
	}
}
