<?php

namespace Automattic\WooCommerce\Blocks\Payments;

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( '\Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType' ) ) {
    return;
}

final class DarazBnpl_Blocks_Payment_Method extends AbstractPaymentMethodType {

    protected $name = 'darazbnpl';

    public function initialize() {
        $this->settings = get_option( 'woocommerce_darazbnpl_settings', [] );
    }

    /**
     * Return the script handles to be enqueued for the payment method.
     */
    public function get_payment_method_script_handles() {
        
        wp_enqueue_style(
            'darazbnpl-blocks-style',
            plugins_url( '../assets/css/darazbnpl-blocks.css', __FILE__ ),
            [],
            '1.0.0'
        );

        return [ 'darazbnpl-blocks' ];
    }

    /**
     * Return data to pass to the front end for the payment method.
     */
    public function get_payment_method_data() {

        return [
            'title'       => $this->settings['title'] ?? 'KokoBNPL',
            'description' => $this->settings['description'] ?? 'Pay in 3 interest-free instalments using your Debit / Credit card.',
            'supports'    => [ 'products' ],
            'icons'       => [
                'src' => plugins_url( '../assets/img/daraz-koko.png', __FILE__ ),
                'alt' => 'KokoBNPL',
            ],
        ];
    }

    /**
     * Determine if this payment method is active.
     */
    public function is_active() {
        $enabled = isset($this->settings['enabled']) ? $this->settings['enabled'] : 'no';
        $has_merchant_id = !empty($this->settings['merchant_id']);
        $has_api_key = !empty($this->settings['api_key']);
        $has_keys = !empty($this->settings['public_key']) && !empty($this->settings['private_key']);
        return $enabled === 'yes' && $has_merchant_id && $has_api_key && $has_keys;
    }

    /**
     * Return the unique name/slug of the payment method.
     */
    public function get_name() {
        return 'darazbnpl';
    }
}
