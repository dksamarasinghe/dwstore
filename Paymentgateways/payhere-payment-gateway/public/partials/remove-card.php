<?php

/**
 * Template for My Account Saved card display and Remove card action
 *
 * This file is used to markup the public-facing aspects of the plugin.
 *
 * @link       https://payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/public/partials
 */

	if (!defined('ABSPATH')) {
		exit;
	}

?>
<div class="payhere-card-container">
	<h4>Saved Payment Methods.</h4>
	<p><small>Payment Methods Saved through PayHere Payment Gateway.</small></p>

	<div class="payhere-saved-card-wrapper">
		<div class="payhere-method-icon">
			<img src="<?php echo esc_url(plugins_url('images/' . strtolower($card_info->method) . '.png', __DIR__)); ?>" alt="Card Image" />
		</div>
		<div class="payhere-method-info">
			<p><?php echo esc_html(substr($card_info->card_no, -8)); ?></p>
			<p>Saved on : <?php echo esc_html(gmdate('l jS F Y', $card_info->saved_date)); ?></p>
			<button type='button' class='button' style='margin-bottom: 15px;' id="payhere-method-remove-btn">Remove Card</button>
		</div>
	</div>
</div>