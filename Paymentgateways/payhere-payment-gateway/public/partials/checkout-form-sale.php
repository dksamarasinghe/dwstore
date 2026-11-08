<?php
/**
 * Template for generating PayHere hidden checkout form
 *
 * @link       https://payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/public
 */

if (!defined('ABSPATH')) {
    exit;
}

if ( ! $onsite_checkout_enabled ) {
	?>
	<form action="<?php echo esc_url( $payment_url ); ?>" method="post" id="payhere_payment_form">
		<?php
		foreach ( $payhere_args as $payhere_key => $payhere_value ) {
			?>
			<input type="hidden" value="<?php echo esc_html( $payhere_value ); ?>" name="<?php echo esc_html( $payhere_key ); ?>" />
			<?php
		}
		?>
	</form>
	<?php
}
?>

<div class="pay-button-wrapper">
	<?php
	if ( ! empty( $customer_token ) && ! isset( $payhere_args['recurrence'] ) && $enable_token ) {
		$payhere_masked_card = substr( $card_info->card_no, -8 );
		?>
		<button type="button" class="payhere-button" id="show_payhere_charge_now"
				onclick="payhere_chage_call(<?php echo esc_html( $order->get_id() ); ?>)">
			<?php echo esc_html( "Pay with $payhere_masked_card" ); ?>
		</button>
		<?php
		if ( isset( $card_info->card_holder_name ) && false ) {
			?>
			<p><?php echo esc_html( $card_info->card_holder_name ); ?></p>
			<p><?php echo esc_html( $card_info->card_no ); ?></p>
			<p><?php echo esc_html( $card_info->card_expiry ); ?></p>
			<p><?php echo esc_html( $card_info->method ); ?></p>
			<?php
		}
		?>
		<?php
	}
	if ( ! is_user_logged_in() ) {
		?>
		<a class="payhere-button-alt" target="_blank" href="<?php echo esc_url( site_url( '/my-account/' ) ); ?>">
			<?php esc_html_e( 'Login to Continue', 'payhere-payment-gateway' ); ?>
		</a>
		<?php
	}
	?>
	<br/>

	<button type="button" class="payhere-button" id="show_payhere_payment_onsite" onclick="payhere_submit_trigger()">
		<?php esc_html_e( 'Pay via Payhere', 'payhere-payment-gateway' ); ?>
	</button>
	<?php
	if ( $save_card_active && ! isset( $payhere_args['recurrence'] ) ) {
		?>
		<label class="checkbox">
			<input type="checkbox" value="1" id="save-card" checked>
			Save Card
		</label>
		<?php
	}
	?>
</div>

<div class="payhere-overlay" style="display: none">
	<div class="payhere-content">
		<img style="display: none" alt="Processing..." src="<?php echo esc_url( plugins_url( 'images/check.svg', __DIR__ ) ); ?>"/>
		<h3>Processing...</h3>
		<p>Please Wait.</p>
	</div>
</div>
