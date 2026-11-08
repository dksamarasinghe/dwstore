<?php
/**
 * Handle Merchant API call for authentication and capture call
 *
 * @link       https://www.payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 */

/**
 * Call the PayHere Merchant API for capture hold on card payments
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 * @author     Dilshan Jayasanka <dilshan@payhere.lk>
 */
class PayHereCapturePayment extends PayHereToken {


	/**
	 * Caputure payment for Authorized Payments
	 *
	 * @param string $token           payhere auth token.
	 * @param string $authorize_token payment authorize token.
	 * @param int    $order_id        woocommerce order id.
	 * @param double $amount          amount to capture.
	 */
	private function submit_capture_payment( $token, $authorize_token, $order_id, $amount ) {
		$_token           = sanitize_text_field( $token );
		$_authorize_token = sanitize_text_field( $authorize_token );
		$_order_id        = sanitize_text_field( $order_id );
		$_amount          = sanitize_text_field( $amount );
		$this->gateway_util->payhere_log( 'CAPTURE', array( $_token, $_authorize_token, $_order_id, $_amount ) );
		$url = $this->get_payhere_capture_api_url();

		$this->gateway_util->payhere_log( 'CAPTURE', $url );

		$fields = array(
			'deduction_details'   => 'Capture Payment for Order : #' . $_order_id,
			'amount'              => $_amount,
			'authorization_token' => $_authorize_token,
		);

		$args = array(
			'body'        => wp_json_encode( $fields ),
			'timeout'     => '10',
			'redirection' => '1',
			'httpversion' => '2.0',
			'blocking'    => true,
			'headers'     => array(
				'Authorization' => 'Bearer ' . $_token,
				'Content-Type'  => 'application/json',
			),
			'cookies'     => array(),
			'data_format' => 'body',
		);

		$this->gateway_util->payhere_log( 'chargin_ARGS', $args );

		$res = wp_remote_post( $url, $args );

		if ( $res instanceof WP_Error ) {
			return false;
		}

		return $res['body'];

	}


	/**
	 * Capture the Paymmet form previously holded amount.
	 *
	 * @param WC_Order $order  Order for capture payment.
	 * @param string   $token  PayHere payment authorize token.
	 * @param float    $amount Amount to  capture.
	 * @return array   Status array message with type and message.
	 */
	public function capture_payment_payhere( WC_Order $order, $token, $amount ) {
		$json    = array();
		$_token  = sanitize_text_field( $token );
		$_amount = sanitize_text_field( $amount );
		$_auth_token_data = $this->get_authorization_token();
		$this->gateway_util->payhere_log( 'authorization_token', $_auth_token_data );
		$auth_token_data = json_decode( $_auth_token_data['body'] );

		if ( isset( $auth_token_data->access_token ) && ! empty( $auth_token_data->access_token ) ) {

			$this->gateway_util->payhere_log( 'INFO', 'Trying to capture' );
			$_capture_response = $this->submit_capture_payment( $auth_token_data->access_token, $_token, $order->get_id(), $_amount );
			$this->gateway_util->payhere_log( 'capture_response', $_capture_response );
			$capture_response = json_decode( $_capture_response );

			if ( '1' === strval($capture_response->status )) {
				if ( '2' === strval($capture_response->data->status_code )) {
					$order->set_status( 'processing' );
					$order->payment_complete( sanitize_text_field( $capture_response->data->payment_id ) );
					$order->add_meta_data( 'payhere_acpture_date', gmdate( "g:ia \n l jS F Y" ) );
					$order->add_meta_data( 'payhere_acpture_amount', sanitize_text_field( $capture_response->data->captured_amount ) );
					$order->add_order_note( sanitize_text_field( $capture_response->msg ) );
					$order->add_order_note( sanitize_text_field( $capture_response->data->status_message ) );
					$order->save();

					$json['type']    = 'OK';
					$json['message'] = 'Payment Captured Successfully.';
				} else {
					$json['type']    = 'ERR';
					$json['message'] = 'Payment Un-Successful. Code : ' . esc_html( $capture_response->data->status_code );
				}
			} else {
				$json['type']    = 'ERR';
				$_msg            = isset( $capture_response->msg ) ? $capture_response->msg : $capture_response->error_description;
				$json['message'] = 'Can\'t make the payment. Payment Capture Request Failed.<br/>' . esc_html( $_msg );
			}
		} else {
			$json['type']    = 'ERR';
			$json['message'] = 'Can\'t make the payment. Can\'t Generate the Authorization Tokens.';
		}

		return $json;
	}
}
