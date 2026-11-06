=== NoviFix ===
Contributors: novissium
Tags: elementor, gradient, color variables, editor
Requires at least: 6.5
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Small fixes for the Elementor editor. Use your global color variables in background gradients.

== Description ==

In the Elementor editor (Editor V4), the color stops of a background gradient only offer a manual color picker. Your global color variables are missing there.

NoviFix adds a small button next to the "Color" field of the gradient. It opens a list of your color variables with name, swatch and value. Click one, and the color stop gets that color. No more looking up hex values.

* The list always shows the variables of your active kit.
* The color stop stores the color value. If you change a variable later, existing gradients keep their color.
* NoviFix does not change Elementor. It only adds the button in the editor and loads nothing on your site's frontend.

This is a temporary fix. Once Elementor offers variables in gradient controls itself, you can remove NoviFix.

NoviFix is not affiliated with or endorsed by Elementor.

== Changelog ==

= 1.0.0 =
* Color variables for background gradient color stops.
