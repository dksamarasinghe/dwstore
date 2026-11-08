<?php
/**
 * The backend functions for updating order and user
 *
 * @link       https://www.payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/admin
 */

/**
 * The backend function for updating and order and user meta fields
 *
 * @package    PayHere
 * @subpackage PayHere/admin
 * @author     Dilshan Jayasanka <dilshan@payhere.lk>
 */
class PayHereOrderUtilities {

	/**
	 * The Woocommerce Order object.
	 *
	 * @since    2.0.0
	 * @access   private
	 * @var      WC_Order $order Currnet order.
	 */
	private $order;

	/**
	 * The Woocommerce Order object.
	 *
	 * @since    2.0.0
	 * @access   private
	 * @var      WC_Order $is_subscription Is the Order has subscription item.
	 */
	private $is_subscription;

	/**
	 * The Uitl class for manage the order.
	 *
	 * @since    2.0.0
	 * @access   private
	 * @var      WC_Order $gate_utils Utility class for get pathere URL and helper function for the order.
	 */
	private $gate_utils;

	/**
	 * Constructor for initialize the utility class
	 *
	 * @param WC_Order $order            Order object.
	 * @param boolean  $is_subscription  Is an subscription order.
	 */
	public function __construct( WC_Order $order, $is_subscription ) {
		$this->order           = $order;
		$this->is_subscription = $is_subscription;
		$this->gate_utils      = new GatewayUtilities();
	}

	/**
	 * Function for update PayHere saved card tokn in user meta.
	 *
	 * @param Array $post Global Post or associate array of data.
	 */
	public function update_user_token( $post ) {
		update_user_meta( $this->order->get_customer_id(), 'payhere_customer_token', sanitize_text_field( $post['customer_token'] ) );

		$card_data = array(
			'card_holder_name' => sanitize_text_field( $post['card_holder_name'] ),
			'card_no'          => sanitize_text_field( $post['card_no'] ),
			'card_expiry'      => sanitize_text_field( $post['card_expiry'] ),
			'saved_date'       => time(),
			'method'           => sanitize_text_field( $post['method'] ),
		);
		update_user_meta( $this->order->get_customer_id(), 'payhere_customer_data', wp_json_encode( $card_data ) );
		$this->gate_utils->payhere_log( 'TOKEN', $this->order->get_customer_id() . ' : ' . sanitize_text_field( $post['customer_token'] ) );
	}

	/**
	 * Function for update the ordr as Authorize by PayHere status.
	 *
	 * @param Array $post Global Post or associate array of data.
	 */
	public function authorize_order( $post ) {
		if ( 'pending' === $this->order->get_status() || 'failed' === $this->order->get_status() ) {

			$currency            = sanitize_text_field( $post['payhere_currency'] );
			$payhere_amount      = sanitize_text_field( $post['payhere_amount'] );
			$authorization_token = sanitize_text_field( $post['authorization_token'] );
			$status_message      = sanitize_text_field( $post['status_message'] );

			$this->order->add_order_note( 'Order amount : ' . $currency . ' ' . $payhere_amount . '  Authorized By PayHere' );
			$this->order->add_order_note( $status_message );

			$this->order->add_meta_data( 'payhere_auth_token', $authorization_token );
			$this->order->add_meta_data( 'payhere_auth_amount', $payhere_amount );
			$this->order->update_status( 'phauthorized' );
			$this->order->save();
		}
	}


	/**
	 * Function for update the ordr as complete of fail by PayHere status and clear the cart.
	 *
	 * @param Array $post Global Post or associate array of data.
	 */
	public function update_order( $post ) {
		global $woocommerce;
		if ( 'processing' === $this->order->get_status() ) {
			$this->order->add_order_note( 'PayHere Payment ID: ' . sanitize_text_field( $post['payment_id'] ) );
		} else {
			$payment_id      = sanitize_text_field( $post['payment_id'] );
			$this->order->payment_complete();
			$this->order->add_order_note( 'PayHere payment successful.<br/>PayHere Payment ID: ' . $payment_id );

			if ($post['captured_amount'] != $post['payhere_amount']){
				
				$discount_amount = $post['payhere_amount'] - $post['captured_amount'];
        
				$item = new WC_Order_Item_Fee();
				$item->set_name(__('PayHere Payment Gateway Discount', 'payhere-payment-gateway'));
				$item->set_amount(-$discount_amount); 
				$item->set_total(-$discount_amount); 
				$this->order->add_item($item);
				$this->order->set_total($this->order->get_total() - $discount_amount);
				$this->order->save();
			}

			if ( $this->is_subscription ) {
				$subscription_id = sanitize_text_field( $post['subscription_id'] ); //moved to is_subscription block from version 2.3.7
				$this->order->add_order_note( 'PayHere Subscription ID: ' . $subscription_id );
				$this->order->update_meta_data( '_payhere_subscription_id', $subscription_id );
				$this->order->save();
			}
			$woocommerce->cart->empty_cart();
		}

		if ( $this->is_subscription ) {
			WC_Subscriptions_Manager::process_subscription_payments_on_order( $this->order );
		}
	}

	/**
	 * Function for redirect user.
	 *
	 * @description not sure will use anymore
	 */
	public function redirect_user() {
		if ( '' === $this->redirect_page || 0 === $this->redirect_page ) {
			$redirect_url = get_permalink( get_option( 'woocommerce_myaccount_page_id' ) );
		} else {
			$redirect_url = get_permalink( $this->redirect_page );
		}
		wp_safe_redirect( $redirect_url );
	}
}
