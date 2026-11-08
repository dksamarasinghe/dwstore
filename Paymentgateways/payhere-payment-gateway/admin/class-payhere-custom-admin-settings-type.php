<?php

/**
 * The custom image selection for Woocommerce admin settings.
 *
 * @link       https://www.payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/admin
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * The support to add custom input type (Image selection) for PayHere gateway.
 *
 * Defines the main filter and other helper functions
 *
 * @package    PayHere
 * @subpackage PayHere/admin
 * @author     Dilshan Jayasanka <dilshan@payhere.lk>
 */


class PayHereImageSelectionAdminSetting extends WC_Settings_API
{

    /**
     * The ID of this plugin.
     *
     * @since    2.0.0
     * @access   private
     * @var      string $pay_here The ID of this plugin.
     */
    private $pay_here;

    /**
     * The version of this plugin.
     *
     * @since    2.0.0
     * @access   private
     * @var      string $version The current version of this plugin.
     */
    private $version;

    /**
     * Custom input type
     *
     * @since    2.0.0
     * @access   private
     * @var      string $type   Type of the definition for input type.
     */
    private $type = 'image_selection';

    /**
     * PayHereWCGateway class type
     *
     * @since    2.0.0
     * @access   private
     * @var      string $type   Type of the definition for input type.
     */
    private $payhere_base;

    /**
     * Initialize the class and set its properties.
     *
     * @param string $pay_here The name of this plugin.
     * @param string $version The version of this plugin.
     * @since    2.0.0
     */
    public function __construct()
    {
        $this->payhere_base = new WCGatewayPayHere;
        $this->pay_here = PAYHERE_TEXT_DOMAIN;
        $this->version  = PAYHERE_VERSION;
        $this->id=$this->payhere_base->id;
    }

    /**
     * Register the stylesheets for the admin area.
     *
     * @since    2.0.0
     */
    public function enqueue_styles()
    {

        /**
         * This function is provided for demonstration purposes only.
         *
         * An instance of this class should be passed to the run() function
         * defined in PayHere_Loader as all of the hooks are defined
         * in that particular class.
         *
         * The PayHere_Loader will then create the relationship
         * between the defined hooks and the functions defined in this
         * class.
         */

        wp_enqueue_style($this->pay_here, plugin_dir_url(__FILE__) . 'css/payhere-ipg-admin.css', array(), $this->version, 'all');
        wp_enqueue_style($this->pay_here, plugin_dir_url(__FILE__) . 'css/payhere-customer-list-settings.css', array(), $this->version, 'all');
    }


    public function register_custom_filter()
    {
        add_filter("woocommerce_generate_{$this->type}_html", [$this, 'generate_html'], 10, 2);
    }

    /**
     * Generate the html template for the admin view.
     *
     */
    public function generate_html($key, $data)
    {
        $field_key = $this->get_field_key($key);
        $defaults  = array(
            'title'             => '',
            'disabled'          => false,
            'class'             => '',
            'css'               => '',
            'placeholder'       => '',
            'type'              => 'text',
            'desc_tip'          => false,
            'description'       => '',
            'custom_attributes' => array(),
        );

        $data = wp_parse_args($data, $defaults);

        $value = $this->get_option($key);
        // if(empty($value)){
        //     $value = esc_url(plugin_dir_url(__FILE__) . 'public/images/payhere_long_banner.png'); 
        // }
        ob_start();
?>
        <tr valign="top">
            <th scope="row" class="titledesc">
                <label for="<?php echo esc_attr($field_key); ?>">
                    <?php echo wp_kses_post($data['title']); ?> <?php echo esc_attr($this->get_tooltip_html($data)); // WPCS: XSS ok. 
                                                                ?>
                </label>
            </th>
            <td class="forminp forminp-<?php echo esc_attr($data['type']) ?>" id="image-selection-wrapper">
                <input type="text" name="<?php echo esc_attr($field_key); ?>" id="<?php echo esc_attr($field_key); ?>" value="<?php echo esc_attr($value) ?>">
                <img src="<?php echo !empty(esc_url($value)) ? esc_url($value) : ''; ?>" style="display: block; width:400px">
                <p class="controls">
                    <button class="button-primary add-media" type="button">
                        <?php esc_html_e('Add Logo', 'payhere-payment-gateway'); ?>
                    </button>
                    <button class="button-secondary remove-media" type="button">
                        <?php esc_html_e('Remove Logo', 'payhere-payment-gateway'); ?>
                    </button>
                    <button class="button-secondary set-default" type="button">
                        <?php esc_html_e('Set Default', 'payhere-payment-gateway');?>
                    </button>
                </p>
            </td>
        </tr>
<?php

        return ob_get_clean();
    }


    /**
     * Register the JavaScript for the admin area.
     *
     * @since    2.0.0
     */
    public function enqueue_scripts()
    {

        /**
         * This function is provided for demonstration purposes only.
         *
         * An instance of this class should be passed to the run() function
         * defined in PayHere_Loader as all of the hooks are defined
         * in that particular class.
         *
         * The PayHere_Loader will then create the relationship
         * between the defined hooks and the functions defined in this
         * class.
         */

        wp_enqueue_media();
        wp_enqueue_script($this->pay_here . '-image-section', plugin_dir_url(__FILE__) . 'js/payhere-ipg-admin-image-selection.js', array('jquery'), $this->version, false);
        wp_localize_script($this->pay_here . '-image-section', 'payhereData', array(
            'ph_banner_url' => esc_url(PAYHERE_PLUGIN_URL . 'public/images/payhere_long_banner.png')
        ));
    }
}
