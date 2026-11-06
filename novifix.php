<?php
/**
 * Plugin Name:       NoviFix
 * Plugin URI:        https://www.novissium.com/
 * Description:       Small fixes for the Elementor editor. Adds your global color variables to the color stops of background gradients.
 * Version:           1.0.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Requires Plugins:  elementor
 * Author:            Novissium
 * Author URI:        https://www.novissium.com/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       novifix
 */

defined( 'ABSPATH' ) || exit;

define( 'NOVIFIX_VERSION', '1.0.0' );
define( 'NOVIFIX_URL', plugin_dir_url( __FILE__ ) );

/**
 * Returns the color variables of the active Elementor kit, sorted like in the Variables Manager.
 *
 * @return array<int, array{label: string, value: string}>
 */
function novifix_color_variables() {
	if ( ! class_exists( '\Elementor\Plugin' ) || empty( \Elementor\Plugin::$instance->kits_manager ) ) {
		return array();
	}

	$kit_id = \Elementor\Plugin::$instance->kits_manager->get_active_id();
	$raw    = $kit_id ? get_post_meta( $kit_id, '_elementor_global_variables', true ) : '';
	$data   = is_string( $raw ) ? json_decode( $raw, true ) : $raw;

	if ( empty( $data['data'] ) || ! is_array( $data['data'] ) ) {
		return array();
	}

	$colors = array();
	foreach ( $data['data'] as $variable ) {
		if ( ! is_array( $variable ) || ( $variable['type'] ?? '' ) !== 'global-color-variable' || ! empty( $variable['deleted'] ) ) {
			continue;
		}
		$value = $variable['value']['value'] ?? ( is_string( $variable['value'] ?? null ) ? $variable['value'] : '' );
		if ( '' === $value || empty( $variable['label'] ) ) {
			continue;
		}
		$colors[] = array(
			'label' => (string) $variable['label'],
			'value' => (string) $value,
			'order' => (int) ( $variable['order'] ?? 0 ),
		);
	}

	usort(
		$colors,
		static function ( $a, $b ) {
			return $a['order'] <=> $b['order'];
		}
	);

	return array_map(
		static function ( $c ) {
			return array(
				'label' => $c['label'],
				'value' => $c['value'],
			);
		},
		$colors
	);
}

/**
 * Loads the gradient helper in the Elementor editor only.
 */
function novifix_enqueue_editor() {
	wp_enqueue_style( 'novifix-gradient-variables', NOVIFIX_URL . 'assets/gradient-variables.css', array(), NOVIFIX_VERSION );
	wp_enqueue_script( 'novifix-gradient-variables', NOVIFIX_URL . 'assets/gradient-variables.js', array(), NOVIFIX_VERSION, true );
	wp_localize_script(
		'novifix-gradient-variables',
		'novifixGradient',
		array(
			'colors' => novifix_color_variables(),
			'i18n'   => array(
				'title'  => __( 'Variables', 'novifix' ),
				'search' => __( 'Search', 'novifix' ),
				'empty'  => __( 'No color variables found.', 'novifix' ),
				'open'   => __( 'Choose a color variable', 'novifix' ),
				'close'  => __( 'Close', 'novifix' ),
			),
		)
	);
}
add_action( 'elementor/editor/after_enqueue_scripts', 'novifix_enqueue_editor' );
