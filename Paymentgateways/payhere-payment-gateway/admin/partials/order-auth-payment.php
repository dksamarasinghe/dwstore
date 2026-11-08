<?php

/**
 * Admin view of capture payment.
 * order-auth-payment.php
 *
 * @link       https://payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/admin
 */

if (!defined('ABSPATH')) {
	exit;
}

/** @var WC_Order $payhere_order */

$payhere_authorize_token  = $payhere_order->get_meta('payhere_auth_token', true) ? $payhere_order->get_meta('payhere_auth_token', true) : '';
$payhere_authorize_amount = $payhere_order->get_meta('payhere_auth_amount', true) ? $payhere_order->get_meta('payhere_auth_amount', true) : '';
$payhere_acpture_amount   = $payhere_order->get_meta('payhere_acpture_amount', true) ? $payhere_order->get_meta('payhere_auth_amount', true) : '';
$payhere_capture_date     = $payhere_order->get_meta('payhere_acpture_date', true) ? $payhere_order->get_meta('payhere_acpture_date', true) : '';
add_thickbox();

wp_enqueue_script('payhere-capture', plugins_url('js/payhere-admin-capture.js', __DIR__), array('jquery'), PAYHERE_VERSION, true);
wp_localize_script(
	'payhere-capture',
	'payhere_capture_data',
	array(
		'admin_ajax'       => admin_url('admin-ajax.php'),
		'nonce'            => wp_create_nonce('payhere_capture_' . $payhere_order->get_id()),
		'authorize_amount' => $payhere_authorize_amount,
		'order_id'         => $payhere_order->get_id(),
	)
);

$payhere_order_amount = $payhere_order->get_total();
if ('' !== $payhere_authorize_token && in_array($payhere_order->get_status(), array('phauthorized', 'processing'), true)) {
	if ('phauthorized' === $payhere_order->get_status()) {
?>
		<div class="payhere-data-wrapper">
			<div class="payhere-data-row">
				<div>Payment Status :</div>
				<div><?php echo '' !== $payhere_authorize_token ? esc_html(__('Authorised', 'payhere-payment-gateway')) : ''; ?></div>
			</div>
			<div class="payhere-data-row">
				<div>Authorized Amount :</div>
				<div><?php echo esc_html($payhere_authorize_amount); ?></div>
			</div>
			<div class="payhere-data-row">
				<div></div>
				<div>
					<div class="payhere-capture-initiater">
						<a href="#TB_inline?width=600&height=250&inlineId=payhere-capture-window&modal=true"
							title="PayHere Capture Payment" class="thickbox">Capture Payment</a>
					</div>
				</div>
			</div>
		</div>
		<div id="payhere-capture-window" style="display:none;">
			<div class="payhere-modal-header">PayHere Capture Payment</div>
			<div class="capture-window">
				<p>Processed by Payhere Payment Gateway</p>
				<p class="text-warning">You can only capture once with PayHere.</p>
				<div class="payhere-data-row">
					<div>Amount to capture</div>
					<div>
						<div class="input-wrapper"><span><?php echo esc_html($payhere_order->get_currency()); ?></span><input
								id="payhere-capture-amount" type="number"
								max="<?php echo esc_attr($payhere_authorize_amount); ?>"
								value="<?php echo esc_attr($payhere_order_amount >= $payhere_authorize_amount ? $payhere_authorize_amount : $payhere_order_amount); ?>" />
						</div>
						<span id="info-div"></span>
					</div>
				</div>
				<div class="payhere-data-row">
					<div></div>
					<div>
						<button class="capture-button" id="payhere_capture_initiator"><img alt="loading gif"
								src="<?php echo esc_url(plugins_url('images/ajax-loader.gif', __DIR__)); ?>"
								style="vertical-align: middle;margin-right: 3px;display: none" height="20" /><span>Capture Payment</span>
						</button>
						<button class="button button-default" id="cancel-button" onclick="tb_remove()">Cancel</button>
					</div>
				</div>
			</div>
		</div>
	<?php
	} else {
	?>
		<div class="payhere-data-wrapper">
			<div class="payhere-data-row">
				<div>Payment Status :</div>
				<div>
					<?php
					switch ($payhere_order->get_status()) {
						case 'processing':
						case 'completed':
							echo 'Payment Complete';
							break;
						case 'pending':
							echo 'Payment Pending';
							break;
						default:
							echo esc_html(ucfirst($payhere_order->get_status()));
							break;
					}
					?>
				</div>
			</div>
			<div class="payhere-data-row">
				<div>Payment Captured on :</div>
				<div><?php echo esc_html($payhere_capture_date); ?></div>
			</div>
			<div class="payhere-data-row">
				<div>Payment Captured Amount :</div>
				<div><?php echo esc_html($payhere_acpture_amount); ?></div>
			</div>
		</div>
	<?php

	}
} else {
	?>
	<div class="payhere-data-wrapper">
		<div class="payhere-data-row">
			<div>Payment Status :</div>
			<div>
				<?php
				switch ($payhere_order->get_status()) {
					case 'processing':
					case 'completed':
						echo 'Payment Complete';
						break;
					case 'pending':
						echo 'Payment Pending';
						break;
					default:
						echo esc_html(ucfirst($payhere_order->get_status()));
						break;
				}
				?>
			</div>
		</div>
	</div>
<?php
}
