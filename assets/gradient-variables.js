/**
 * NoviFix: color variables for gradient color stops in the Elementor editor (Editor V4).
 *
 * Elementor's gradient control has no variable picker. This adds a small button next to the
 * "Color" field of the gradient box. It opens a list of the kit's color variables and writes
 * the chosen color value into the field, the same way as typing it by hand.
 */
( function () {
	'use strict';

	var config = window.novifixGradient || { colors: [], i18n: {} };
	var t = config.i18n || {};
	var BUTTON_CLASS = 'novifix-gv-button';
	var PANEL_CLASS = 'novifix-gv-panel';
	var openPanel = null;

	var ICON = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A4.6 4.6 0 0 0 22 10.8C22 5.9 17.5 2 12 2Zm-5.5 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/></svg>';

	// The gradient box only keeps plain color values reliably (a var() is lost when the other stop is edited),
	// so the stop gets the variable's current color value.
	function valueFor( color ) {
		return color.value;
	}

	// Insert the value like typing, so the gradient box updates its own copy of the stops too.
	function setInputValue( input, value ) {
		input.focus();
		input.select();
		var typed = false;
		try {
			typed = document.execCommand( 'insertText', false, value );
		} catch ( e ) {
			typed = false;
		}
		if ( ! typed || input.value !== value ) {
			var setter = Object.getOwnPropertyDescriptor( window.HTMLInputElement.prototype, 'value' ).set;
			setter.call( input, value );
			input.dispatchEvent( new Event( 'input', { bubbles: true } ) );
		}
	}

	// A color field belongs to a gradient box when its popover also holds the gradient slider (two or more range thumbs).
	function isGradientColorField( field ) {
		var paper = field.closest( '.MuiPopover-paper' );
		return !! paper && paper.querySelectorAll( '.MuiSlider-thumb input[type="range"]' ).length >= 2;
	}

	function closePanel() {
		if ( openPanel ) {
			openPanel.remove();
			openPanel = null;
		}
	}

	function buildPanel( input, button ) {
		closePanel();

		var paper = button.closest( '.MuiPopover-paper' ) || document.body;
		var panel = document.createElement( 'div' );
		panel.className = PANEL_CLASS;
		panel.setAttribute( 'role', 'dialog' );
		panel.innerHTML =
			'<div class="novifix-gv-head"><span>' + ICON + ' ' + ( t.title || 'Variables' ) + '</span>' +
			'<button type="button" class="novifix-gv-close" aria-label="' + ( t.close || 'Close' ) + '">&times;</button></div>' +
			'<div class="novifix-gv-search"><input type="search" placeholder="' + ( t.search || 'Search' ) + '"></div>' +
			'<ul class="novifix-gv-list"></ul>';

		var list = panel.querySelector( '.novifix-gv-list' );
		var search = panel.querySelector( 'input' );
		var current = ( input.value || '' ).toLowerCase();

		function render( term ) {
			list.innerHTML = '';
			var items = ( config.colors || [] ).filter( function ( c ) {
				return ! term || c.label.toLowerCase().indexOf( term ) !== -1 || c.value.toLowerCase().indexOf( term ) !== -1;
			} );
			if ( ! items.length ) {
				list.innerHTML = '<li class="novifix-gv-empty">' + ( t.empty || 'No color variables found.' ) + '</li>';
				return;
			}
			items.forEach( function ( c ) {
				var li = document.createElement( 'li' );
				var btn = document.createElement( 'button' );
				btn.type = 'button';
				btn.className = 'novifix-gv-item';
				if ( current === c.value.toLowerCase() ) {
					btn.classList.add( 'is-active' );
				}
				btn.innerHTML = '<span class="novifix-gv-swatch"></span><span class="novifix-gv-name"></span><span class="novifix-gv-hex"></span>';
				btn.querySelector( '.novifix-gv-swatch' ).style.background = c.value;
				btn.querySelector( '.novifix-gv-name' ).textContent = c.label;
				btn.querySelector( '.novifix-gv-hex' ).textContent = c.value;
				btn.addEventListener( 'click', function () {
					setInputValue( input, valueFor( c ) );
					closePanel();
				} );
				li.appendChild( btn );
				list.appendChild( li );
			} );
		}

		render( '' );
		search.addEventListener( 'input', function () {
			render( search.value.trim().toLowerCase() );
		} );
		panel.querySelector( '.novifix-gv-close' ).addEventListener( 'click', closePanel );
		panel.addEventListener( 'keydown', function ( e ) {
			if ( 'Escape' === e.key ) {
				e.stopPropagation();
				closePanel();
				button.focus();
			}
		} );

		paper.appendChild( panel );

		// Place the list next to the button, inside the visible window.
		var r = button.getBoundingClientRect();
		var w = panel.offsetWidth;
		var h = panel.offsetHeight;
		var popover = ( button.closest( '.MuiPopover-paper' ) || button ).getBoundingClientRect();
		var left = Math.min( Math.max( 8, popover.left ), window.innerWidth - w - 8 );
		var top = r.bottom + 6;
		if ( top + h > window.innerHeight - 8 ) {
			top = Math.max( 8, r.top - h - 6 );
		}
		panel.style.left = left + 'px';
		panel.style.top = top + 'px';

		openPanel = panel;
		search.focus();
	}

	function enhance( field ) {
		if ( field.dataset.novifix || ! isGradientColorField( field ) ) {
			return;
		}
		var input = field.querySelector( 'input[type="text"]' );
		var row = field.parentElement;
		var label = row && row.querySelector( '.MuiTypography-caption' );
		if ( ! input || ! label ) {
			return;
		}
		field.dataset.novifix = '1';

		var button = document.createElement( 'button' );
		button.type = 'button';
		button.className = BUTTON_CLASS;
		button.title = t.open || 'Choose a color variable';
		button.setAttribute( 'aria-label', button.title );
		button.innerHTML = ICON;
		button.addEventListener( 'click', function ( e ) {
			e.preventDefault();
			e.stopPropagation();
			if ( openPanel ) {
				closePanel();
				return;
			}
			buildPanel( field.querySelector( 'input[type="text"]' ) || input, button );
		} );

		row.classList.add( 'novifix-gv-row' );
		row.insertBefore( button, label.nextSibling );
	}

	function scan( root ) {
		( root.querySelectorAll ? root : document ).querySelectorAll( '.MuiPopover-paper .MuiColorField-root' ).forEach( enhance );
	}

	new MutationObserver( function ( mutations ) {
		var found = false;
		for ( var i = 0; i < mutations.length && ! found; i++ ) {
			if ( mutations[ i ].addedNodes.length ) {
				found = true;
			}
		}
		if ( found ) {
			scan( document );
		}
		if ( openPanel && ! document.body.contains( openPanel ) ) {
			openPanel = null;
		}
	} ).observe( document.body, { childList: true, subtree: true } );

	document.addEventListener( 'mousedown', function ( e ) {
		if ( openPanel && ! openPanel.contains( e.target ) && ! e.target.closest( '.' + BUTTON_CLASS ) ) {
			closePanel();
		}
	}, true );

	scan( document );
}() );
