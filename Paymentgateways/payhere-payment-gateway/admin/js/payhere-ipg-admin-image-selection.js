/**
 * The js content for WP admin.
 *
 * @link       https://payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/public
 */

(function ($) {
	'use strict';

	let input = $("#image-selection-wrapper input");
	let image = $("#image-selection-wrapper img");
	let add_btn = $('#image-selection-wrapper .add-media');
	let remove_btn = $('#image-selection-wrapper .remove-media');
	let default_btn =$('#image-selection-wrapper .set-default');
	var frame;


	add_btn.on('click', function () {
		// If the media frame already exists, reopen it.
		if (frame) {
			frame.open();
			return;
		}

		// Create a new media frame
		frame = wp.media({
			title: 'Select or Upload Media for the PayHere banner',
			button: {
				text: 'Use this media'
			},
			multiple: false  // Set to true to allow multiple files to be selected
		});



		frame.on('select', function () {

			// Get media attachment details from the frame state
			var attachment = frame.state().get('selection').first().toJSON();

			// Send the attachment URL to our custom image input field.
			image.attr('src', attachment.url);

			// Send the attachment id to our hidden input
			input.val(attachment.url);
		});

		// Finally, open the modal on click
		frame.open();
	});


	remove_btn.on('click', function () {
		image.attr('src', '');
		input.val('');
	});

	default_btn.on('click', function () {
        image.attr('src', payhereData.ph_banner_url);
        input.val(payhereData.ph_banner_url);
    });

})(jQuery);
