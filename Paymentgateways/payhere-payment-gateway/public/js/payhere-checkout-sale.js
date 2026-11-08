/**
 * The js content for PayHere onetime payment process.
 *
 * @link       https://payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/public
 * 
 * This script enables the PayHere onetime feature, sending transaction data to PayHere for processing.
 * For more information on data handling, refer to:
 * - Terms of Service: https://www.payhere.lk/legal
 * - Privacy Policy: https://www.payhere.lk/privacy
 */

var scr   = document.createElement( 'script' ),
	head  = document.head || document.getElementsByTagName( 'head' )[0];
scr.src   = 'https://www.payhere.lk/lib/payhere-2.0.js';
scr.async = false;
scr.id    = 'payhere_js';
scr.defer = false;

head.insertBefore( scr, head.firstChild );

let hash                     = payhere_config.payhere_args.hash;
let on_site_checkout_enabled = payhere_config.onsite_enabled;


function payhere_chage_call(orderId) {
	jQuery( ".payhere-overlay" ).find( 'h3' ).html( 'Processing' ).css( {color: '#fff'} );
	jQuery( '.payhere-overlay' ).show();
	jQuery.ajax(
		{
			url: payhere_config.admin_ajax,
			type: 'POST',
			dataType: 'JSON',
			data: {
				action: 'payhere_charge',
				nonce: payhere_config.charge_nonce,
				order_id: orderId
			},
			success: function (data) {
				if (data.type == 'OK') {

					jQuery( ".payhere-overlay" ).find( 'img' ).show();
					jQuery( ".payhere-overlay" ).find( 'h3' ).html( data.message ).css( {color: '#36d004'} );
					jQuery( ".payhere-overlay" ).find( 'p' ).html( 'Redirecting...' );
					setTimeout(
						function () {
							window.location = payhere_config.payhere_args.return_url;
						},
						3500
					);
				} else {
					jQuery( ".payhere-overlay" ).find( 'h3' ).html( data.message ).css( {color: '#d00404'} );
					setTimeout(
						function () {
							jQuery( ".payhere-overlay" ).hide();
						},
						3000
					);
				}
			}
		}
	);
}

var payhere_js = document.querySelector( '#payhere_js' );
payhere_js.addEventListener(
	'load',
	function () {
		payhere.onCompleted = function onCompleted(orderId) {
			window.location = payhere_config.payhere_args.return_url;
		};
		payhere.onError = function onError(error) {
			alert( "An error occurred while making the payment. Error: " + error );
		};

		if (payhere_config.save_card_active) {
			payhere_submit_trigger();
		}
	}
);

function payhere_submit_trigger() {
	let preapproval = jQuery( "#save-card" ).is( ":checked" );
	if (on_site_checkout_enabled) {
		let payment        = payhere_config.payhere_obj;
		payment.preapprove = preapproval ? true : false;
		payhere.startPayment( payment );
	} else {
		if (preapproval) {
			jQuery( "input[name='preapprove']" ).val( true );
			jQuery( "#payhere_payment_form" ).attr( {action: payhere_config.url_preapprove} );

		} else {
			jQuery( "input[name='preapprove']" ).val( false );
			let url = jQuery( "input[name='cancel_url']" ).val();
			jQuery( "input[name='return_url']" ).val( url );
			jQuery( "#payhere_payment_form" ).attr( {action: payhere_config.url_payment} );
		}
		jQuery( "#payhere_payment_form" ).trigger( 'submit' );
	}
}
