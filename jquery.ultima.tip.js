/* globals jQuery, UltimaTip */
'use strict';

if (!window.UltimaTip) {

	// BEGIN: check dependencies

		if (jQuery === undefined) {

			throw new Error('jQuery missing for UltimaTip');
		}

		// feature detection
		if (!jQuery.isPlainObject) {

			throw new Error('jQuery 1.4+ required for UltimaTip');
		}

	// END: check dependencies

	window.UltimaTip = function(target, options) {

		// prevent skipping the constructor
		if (!(this instanceof UltimaTip)) {

			return new UltimaTip(options);
		}

		// force jQuery wrap
		target = jQuery(target).first();

		// private scope
		this._ = {};

		// closure reference
		var self = this;

		// BEGIN: public properties

			this.target 	= target;
			this.bubble 	= null;
			this.message 	= null;

			this.visible 	= false;

			// BEGIN: options

				this.options = {};
				this.options.current = {};

				this.options['default'] = {

					message: '',

					animations: {

						bubble: {

							show: {

								// effect used to show the bubble
								effect: 	'fadeIn', // 'none', 'fadeIn'

								// duration of the above effect
								duration: 	400

							},

							hide: {

								// effect used to hide the bubble
								// undefined: inherit value from show
								effect: 	undefined,

								// duration of the above effect
								// undefined: inherit value from show
								duration: 	undefined

							}

						}

					},

					behavior: {

						// automatically attach hover event to target
						hover: true

					},

					css: {

						bubble: {

							// class added to the bubble element
							className: 	'',

							// anchoring position of the bubble element
							directions: 'bottom right',

							// positioning offset
							offset: {
								x: 0,
								y: 0
							},

							// z-index
							zIndex: 	9100

						},

						message: {

							// class added to the message element
							className: 	''

						}

					},

					callbacks: {

						// before showing the tip
						onTipShowing: 	undefined, // (UltimaTip) : return false to interrupt

						// after tip is fully shown
						onTipShown: 	undefined, // (UltimaTip)

						// before hiding the tip
						onTipHiding: 	undefined, // (UltimaTip) : return false to interrupt

						// after tip is fully hidden
						onTipHidden: 	undefined  // (UltimaTip)

					}

				};

			// END: options

		// END: public properties

		// BEGIN: private properties

			this._.properties = {

				classNames: {
					bubble: 	'UltimaTip-bubble',
					message: 	'UltimaTip-message'
				}

			};

		// END: private properties

		// BEGIN: public methods

			this.hover = function() {

				this.bubble._.methods.reposition();
				this.bubble.show();
			};

			this.remove = function() {

				// remove from collection
				var tipIndex = UltimaTip.getIndex(this.target);
				if (tipIndex > -1) {

					UltimaTip.collection.splice(tipIndex, 1);
				}

				if (this.target instanceof jQuery) {

					this.target.unbind('mouseenter', self._.methods.mouseEnter);
					this.target.unbind('mouseleave', self._.methods.mouseLeave);
				}

				if (this.bubble.dom.element instanceof jQuery) {

					this.bubble.dom.element.remove();
				}
			};

			this.unhover = function() {

				this.bubble.hide();
			};

		// END: public methods

		// BEGIN: private methods

			this._.methods = {

				createBubble: function() {

					var bubble = {

						// BEGIN: public properties

							dom: {

								element: jQuery('<div></div>').hide()

							},

						// END: public properties

						// BEGIN: public methods

							// hide bubble
							hide: function() {

								// callback: on tip hiding
								if (jQuery.isFunction(self.options.current.callbacks.onTipHiding)) {

									if (self.options.current.callbacks.onTipHiding(self) === false) {

										return;
									}
								}

								// determine effect
								var effect = self.options.current.animations.bubble.hide.effect;
								if (effect === undefined) {

									effect = self.options.current.animations.bubble.show.effect;
								}

								// determine duration
								var duration = self.options.current.animations.bubble.hide.duration;
								if (duration === undefined) {

									duration = self.options.current.animations.bubble.show.duration;
								}

								var hasCallback = jQuery.isFunction(self.options.current.callbacks.onTipHidden);

								switch (effect) {

									case 'fadeIn':
									case 'fadeOut':

										this.dom.element.stop(true, true).fadeOut(
											duration,
											function() {

												self.visible = false;

												// callback: on tip hidden
												if (hasCallback) {

													self.options.current.callbacks.onTipHidden(self);
												}
											}
										);

										break;

									default:

										this.dom.element.hide();

										self.visible = false;

										// callback: on tip hidden
										if (hasCallback) {

											self.options.current.callbacks.onTipHidden(self);
										}

										break;

								}
							},

							// show bubble
							show: function() {

								// callback: on tip showing
								if (jQuery.isFunction(self.options.current.callbacks.onTipShowing)) {

									if (self.options.current.callbacks.onTipShowing(self) === false) {

										return;
									}
								}

								var hasCallback = jQuery.isFunction(self.options.current.callbacks.onTipShown);

								switch (self.options.current.animations.bubble.show.effect) {

									case 'fadeIn':
									case 'fadeOut':

										this.dom.element.stop(true, true).fadeIn(
											self.options.current.animations.bubble.show.duration,
											function() {

												self.visible = true;

												// callback: on tip shown
												if (hasCallback) {

													self.options.current.callbacks.onTipShown(self);
												}
											}
										);

										break;

									default:

										this.dom.element.show();

										self.visible = true;

										// callback: on tip shown
										if (hasCallback) {

											self.options.current.callbacks.onTipShown(self);
										}

										break;

								}
							},

						// END: public methods

						_: {

							// BEGIN: private methods

								methods: {

									reposition: function() {

										var pos = self.target.offset();

										if (pos === undefined) { return; }

										var target = {
											height: self.target.outerHeight(),
											left: 	pos.left,
											top: 	pos.top,
											width: 	self.target.outerWidth()
										};

										var tip = {
											height: self.bubble.dom.element.outerHeight(),
											width: 	self.bubble.dom.element.outerWidth()
										};

										var directions = self.options.current.css.bubble.directions.split(' ');
										var left, top;

										for (var i = 0; i < directions.length; i++) {

											switch (directions[i].toLowerCase()) {

												case 'bottom':
													top 	= (target.top + target.height + self.options.current.css.bubble.offset.y);
													break;

												case 'center':
													left 	= (Math.max(0, target.left + (target.width / 2) - (tip.width / 2) + self.options.current.css.bubble.offset.x));
													break;

												case 'left':
													left 	= (target.left - tip.width - self.options.current.css.bubble.offset.x);
													break;

												case 'middle':
													top 	= (target.top + (target.height / 2) - (tip.height / 2) + self.options.current.css.bubble.offset.y);
													break;

												case 'right':
													left 	= (target.left + target.width + self.options.current.css.bubble.offset.x);
													break;

												case 'top':
													top 	= (target.top - tip.height - self.options.current.css.bubble.offset.y);
													break;

											}
										}

										// force horizontal position
										if (left === undefined) {

											left = (Math.max(0, target.left + (target.width / 2) - (tip.width / 2) + self.options.current.css.bubble.offset.x));
										}

										// force vertical position
										if (top === undefined) {

											top = (target.top + (target.height / 2) - (tip.height / 2) + self.options.current.css.bubble.offset.y);
										}

										self.bubble.dom.element.css({
											left: 	left,
											top: 	top
										});
									}

								}

							// END: private methods

						}

					};

					// BEGIN: build element

						// BEGIN: appearance

							// class
							bubble.dom.element.addClass(self._.properties.classNames.bubble);
							bubble.dom.element.addClass(self.options.current.css.bubble.className);

							// BEGIN: inline CSS

								var cssAttr = {};

								if (!self.options.current.css.bubble.className) {

									cssAttr.backgroundColor = '#FFFFFF';
									cssAttr.border 			= '1px solid #808080';
									cssAttr.boxShadow 		= '2px 2px 4px #808080';
									cssAttr.color 			= '#808080';
									cssAttr.fontSize 		= '80%';
									cssAttr.padding 		= '4px';
								}

								jQuery.extend(true, cssAttr, self.options.current.css.bubble);
								jQuery.extend(true, cssAttr, {
									position: 	'absolute',
									zIndex: 	self.options.current.css.bubble.zIndex
								});

								// style
								bubble.dom.element.css(cssAttr);

							// END: inline CSS

						// END: appearance

					// END: build element

					if (self.options.current.behavior.hover === true) {

						self.target.hover(
							self._.methods.mouseEnter,
							self._.methods.mouseLeave
						);

					}

					return bubble;
				},

				createMessage: function() {

					var message = {

						// BEGIN: public properties

							dom: {

								element: jQuery('<div></div>')

							},

						// END: public properties

						// BEGIN: public methods

							hide: function() {

								this.dom.element.hide();
							},

							set: function(content) {

								this.dom.element.html(content);
							},

							show: function() {

								this.dom.element.show();
							},

						// END: public methods

					};

					// BEGIN: build element

						// BEGIN: appearance

							// class
							message.dom.element.addClass(self._.properties.classNames.message);
							message.dom.element.addClass(self.options.current.css.message.className);

							// BEGIN: inline CSS

								// style
								message.dom.element.css(self.options.current.css.message);

							// END: inline CSS

						// END: appearance

					// END: build element

					return message;
				},

				mouseEnter: function() {

					self.bubble._.methods.reposition();
					self.bubble.show();
				},

				mouseLeave: function() {

					self.bubble.hide();
				},

				mergeOptions: function(options1, options2) {

					self._.methods.translateOptions(options2);

					var result = {};
					jQuery.extend(true, result, options1);
					jQuery.extend(true, result, options2);

					return result;
				},

				translateOptions: function(options) {

					var buffer, length, i, result, ref;

					for (var key in options) {

						if (!options.hasOwnProperty(key)) {

							continue;
						}

						if (key.indexOf('->') !== 0) {

							continue;
						}

						buffer = key.replace('->', '');
						buffer = buffer.split('.');
						length = buffer.length;

						result = {};
						ref = result;

						for (i = 0; i < (length - 1); i++) {

							ref[buffer[i]] = {};
							ref = ref[buffer[i]];
						}

						ref[buffer[length - 1]] = options[key];

						delete options[key];
						jQuery.extend(true, options, result);
					}

					return options;
				}

			};

		// END: private methods

		// BEGIN: constructor

			// prepare options
			this.options.current = this._.methods.mergeOptions(this.options['default'], UltimaTip.options);
			this.options.current = this._.methods.mergeOptions(this.options.current, options);

		// END: constructor

		this.bubble = this._.methods.createBubble();

		// build message
		this.message = this._.methods.createMessage();
		this.message.set(this.options.current.message);

		// append message to bubble
		this.bubble.dom.element.append(this.message.dom.element);

		// place bubble in DOM
		jQuery('body').append(this.bubble.dom.element);

		// register as new tip
		UltimaTip.collection.push(this);

	};

	// keep track of the active tips
	UltimaTip.collection = [];

	UltimaTip.options = {};

	// BEGIN: static

		// private scope
		UltimaTip._ = {
			methods: {}
		};

		// BEGIN: private methods

			// returns if the provided data is a dialog options object
			UltimaTip._.methods.isOptions = function(data) {

				if (!jQuery.isPlainObject(data)) {

					return false;
				}

				if (
					(data.message && !jQuery.isPlainObject(data.message)) ||
					(data.css && jQuery.isPlainObject(data.css)) ||
					(data.callbacks && jQuery.isPlainObject(data.callbacks))
				) {

					return true;
				}

				for (var key in data) {

					if (!data.hasOwnProperty(key)) {

						continue;
					}

					if (/^->[a-z]+(\.[a-z]+)?/.test(key)) {

						return true;
					}
				}

				return false;
			};

		// END: private methods

		// BEGIN: public methods

			// removes all tips
			UltimaTip.clear = function() {

				var count = 0;
				var tip;

				while (true) {

					tip = UltimaTip.get(0);

					if (tip !== null) {

						count += 1;
						tip.remove();

					} else {

						break;
					}
				}

				return count;
			};

			// get the tip by either index or target
			UltimaTip.get = function(target) {

				// by index
				if (typeof target === 'number') {

					if (UltimaTip.collection.length > target) {

						return UltimaTip.collection[target];
					}

				// by target
				} else {

					var tipIndex = UltimaTip.getIndex(target);

					if (tipIndex > -1) {

						return UltimaTip.collection[tipIndex];
					}
				}

				return null;
			};

			// get the first collection index of the tip by target
			UltimaTip.getIndex = function(target) {

				if (target instanceof jQuery) {

					target = target[0];
				}

				var i = 0, len = UltimaTip.collection.length;
				for (i; i < len; i++) {

					if (target === UltimaTip.collection[i].target[0]) {

						return i;
					}
				}

				return -1;
			};

			// remove all tips linked to the target
			UltimaTip.remove = function(target) {

				var count = 0;

				var tip = UltimaTip.get(target);

				while (tip !== null) {

					tip.remove();

					count += 1;
					tip = UltimaTip.get(target);
				}

				return count;
			};

		// END: public methods

	// END: static

	// BEGIN: jQuery integration

		// option defaults for all jQuery integrated calls
		jQuery.UltimaTip = {
			options: {}
		};

		jQuery.UltimaTip.hover = function(target, message, options) {
			//                   function(target, message)
			//                   function(target, options)

			if (target === undefined) {

				return null;
			}

			if (arguments.length === 2) {

				// options
				if (UltimaTip._.methods.isOptions(message)) {

					options = message;
					message = undefined;

				// message
				}
			}

			var mergedOptions = {};
			jQuery.extend(true, mergedOptions, jQuery.UltimaTip.options);
			jQuery.extend(true, mergedOptions, options);

			if (message) {

				mergedOptions.message = message;
			}

			var tip = new UltimaTip(target, mergedOptions);
			tip.hover();

			return tip;
		};

		jQuery.UltimaTip.unhover = function(target) {

			return UltimaTip.remove(target);
		};

		jQuery.fn.UltimaTip = function(message, options) {
			//                function(message)
			//                function(options)

			if ((message === undefined) || (message === '')) {

				return UltimaTip.remove(this);
			}

			if (arguments.length === 1) {

				// options
				if (UltimaTip._.methods.isOptions(message)) {

					options = message;
					message = undefined;

				// message
				}
			}

			var mergedOptions = {};
			jQuery.extend(true, mergedOptions, jQuery.UltimaTip.options);
			jQuery.extend(true, mergedOptions, options);

			if (message) {

				mergedOptions.message = message;
			}

			this.each(function() {

				new UltimaTip(this, mergedOptions);
			});

			return this;
		};

		jQuery.fn.hoverTip = function() {

			this.each(function() {

				var tip = UltimaTip.get(this);
				if (tip !== null) {

					tip.hover();
				}
			});

			return this;
		};

		jQuery.fn.unhoverTip = function() {

			this.each(function() {

				var tip = UltimaTip.get(this);
				if (tip !== null) {

					tip.unhover();
				}
			});

			return this;
		};

		jQuery.fn.toggleHoverTip = function() {

			this.each(function() {

				var tip = UltimaTip.get(this);
				if (tip !== null) {

					if (tip.visible) {

						tip.unhover();

					} else {

						tip.hover();
					}
				}
			});

			return this;
		};

	// END: jQuery integration

	UltimaTip.version = '0.4.4';
}