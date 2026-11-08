<?php

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;


/**
 * PayHere Payment Gateway Blocks integration
 *
 * @since 1.0.0
 */
final class WC_PayHere_Blocks extends AbstractPaymentMethodType
{

    /**
     * The gateway instance.
     *
     * @var WCGatewayPayHere
     */
    private $gateway;

    /**
     * Payment method name/id/slug.
     *
     * @var string
     */
    protected $name = 'payhere';

    /**
     * Initializes the payment method type.
     */
    public function initialize()
    {
        $this->settings = get_option('woocommerce_payhere_settings', []);
        // $gateways       = WC()->payment_gateways->payment_gateways();
        $this->gateway  = new WCGatewayPayHere;
    }

    /**
     * Returns if this payment method should be active. If false, the scripts will not be enqueued.
     *
     * @return boolean
     */
    public function is_active()
    {
        return $this->gateway->is_available();
    }

    /**
     * Returns an array of scripts/handles to be registered for this payment method.
     *
     * @return array
     */
    public function get_payment_method_script_handles()
    {

        $script_path = plugins_url('public/js/payhere-block.js', __DIR__);
        $dependancies = [
            'react',
            'wp-blocks',
            'wp-element',
            'wp-components',
            'wc-blocks-registry',
            'wc-settings',
            'wp-html-entities',
            'wp-i18n',
        ];
        wp_register_script(
            'wc-payhere-blocks-integration',
            $script_path,
            $dependancies,
            '1.0.0',
            true
        );

        return ['wc-payhere-blocks-integration'];
    }


    /**
     * Returns an array of key=>value pairs of data made available to the payment methods script.
     *
     * @return array
     */
    public function get_payment_method_data()
    {
        return [
            'title'         => $this->gateway->title,
            'description'   => $this->gateway->description,
            'icon'         => $this->gateway->icon,
            'supports'      => array_filter($this->gateway->supports, [$this->gateway, 'supports'])
        ];
    }
}
