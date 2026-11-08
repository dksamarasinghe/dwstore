<?php
/**
 * Utitlity class for restrict Woocommerce subscription plugin features
 *
 * @link       https://www.payhere.lk
 * @since      2.0.0
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 */

/**
 * Disable Subsctions for Woocommerce plugin  features like
 * resubscribe, eractivate,suspend
 *
 * @package    PayHere
 * @subpackage PayHere/gateway
 * @author     Dilshan Jayasanka <dilshan@payhere.lk>
 */
class SubscriptionRestrictions {

	/**
	 * Restrict resubscribe, reactivate, suspend subscription with PayHere subscriptions.
	 *
	 * @param string   $action_link  All the actions associate with subscription.
	 * @param WC_ORder $subscription Current subscription object.
	 * @return Array allowed actions.
	 */
	public function restrict_user_actions( $action_link, $subscription ) {
		if ( 'payhere' === $subscription->get_payment_method() ) {
			unset( $action_link['resubscribe'] );
			unset( $action_link['reactivate'] );
			unset( $action_link['suspend'] );
		}
		return $action_link;
	}

	/**
	 * Restrict renew subscription with PayHere subscriptions.
	 *
	 * @param boolean[] $allcaps Array of key/value pairs where keys represent a capability name and boolean values represent whether the user has that capability.
	 * @param string[]  $caps Required primitive capabilities for the requested capability.
	 * @param array     $args ments that accompany the requested capability check.
	 * @return Array allowed actions
	 */
	public function payhere_user_has_capability( $allcaps, $caps, $args ) {
		if ( isset( $caps[0] ) && 'toggle_shop_subscription_auto_renewal' === $caps[0] ) {
			$user_id      = $args[1];
			$subscription = wcs_get_subscription( $args[2] );

			if ( $subscription && $user_id === $subscription->get_user_id() ) {
				$allcaps['toggle_shop_subscription_auto_renewal'] = false;
			} else {
				unset( $allcaps['toggle_shop_subscription_auto_renewal'] );
			}
		}

		return $allcaps;
	}
}
