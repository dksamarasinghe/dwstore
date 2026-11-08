<?php
use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;
final class WC_Payzy_Gateway_Blocks extends AbstractPaymentMethodType
{
    private $gateway;
    protected $name = 'payzy';
    public function initialize()
    {
        $this->settings = get_option('woocommerce_payzy_settings', []);
        $this->gateway = new WC_Payzy_Gateway();
    }
    public function is_active()
    {
        return $this->gateway->is_available();
    }
    public function get_payment_method_script_handles()
    {
        wp_register_script(
            'payzy-blocks-integration',
            plugin_dir_url(__FILE__) . 'checkout.js',
            [
                'wc-blocks-registry',
                'wc-settings',
                'wp-element',
                'wp-html-entities',
                'wp-i18n',
            ],
            null,
            true
        );
        if (function_exists('wp_set_script_translations')) {
            wp_set_script_translations('payzy-blocks-integration');

        }
        return ['payzy-blocks-integration'];
    }
    public function get_payment_method_data()
    {
        return [
            'title' => $this->gateway->title,
            'description' => $this->gateway->description,
            'icon' => 'https://res.cloudinary.com/dhijkqc0i/image/upload/v1688709707/logo_azfw8r.png'
        ];
    }
}
?>