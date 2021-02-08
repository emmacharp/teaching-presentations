$(document).keyup(function(e) {
	if(e.keyCode === 27) $('body').toggleClass('debug');
});


(function ($) {
	'use strict';
	var ready = function () {
		// ajouter livereload seulement si je suis en local
		if (window.location.href.indexOf(".local") > -1 || window.location.href.indexOf("localhost") > -1) {
			$('body').append('<script src="http://localhost:35729/livereload.js"></script>');
		}

		function ChangeValueFactor(t) {
			var value = (t.val() - t.attr('min')) / (t.attr('max') - t.attr('min'));
			t.css('--value', value);
		}

		function setDefault(item, set_model = true) {
			var t = item;
			var name = t.find('input, select').attr('name');
			var auto = t.find('input[checked]');
			var preset = t.find('input').first().attr('value') || t.find('select').find('option').first().text();
			var step = (t.find('input[type="range"]')) ? t.find('input[type="range"]').attr('step') : 1;
			var value = (auto.length != 0) ? auto.attr('value') : preset;
			var parent_section = t.parents('article');
			var interactive_model = parent_section.find('.interactive-model');
			var target = (t.parents('.targetable-controls').length) ? interactive_model.children() : interactive_model;

			var property = t.find('input, select').attr('name');

			if(t.find('input').is('[min="-360"][max="360"]')) {
				value += 'deg';
			}
			else if(t.find('input').is('[min="0"][max="5000"]')) {
				value += 'ms';
			}
			else if(!isNaN(value) && Number.isInteger(parseFloat(step)) && parseInt(t.find('input').attr('max')) > 10) {
				value += 'px';
			}

			if(t.find('output').length == 0) {
				t.find('div').prepend('<output for="'+name+'"></output>');
			}
			t.find('input').each(function(){
				$(this).val($(this).attr('value'));
			});
			t.find('output').html(value + ';');

			if (set_model == true) {
				target.css('--'+property, value);
			}
		}

		$('.model-controls input[type="range"]').each(function() {
			ChangeValueFactor($(this));
		});

		$('.model-controls li:has(input, select)').each(function() {
			setDefault($(this));
		});

		$('input, select').on('input', function(){
			var t = $(this);
			var value = (t.attr('type') == 'range') ? this.valueAsNumber : this.value;
			var output = t.parents('li').find('output');
			var property = t.attr('name');
			var step = (t.attr('type') == 'range') ? t.attr('step') : 1;
			var parent_section = t.parents('article');
			var interactive_model = parent_section.find('.interactive-model');
			var target = (t.parents('.targetable-controls').length) ? interactive_model.children() : interactive_model;
			if(t.is('[type="range"],[type="text"]')) {
				t.parents('li').find('input[type="checkbox"]').prop('checked', false);
			}

			if(t.is('[type="checkbox"]:not(:checked)')) {
				value = t.parents('li').find('input[type="range"]').val();
			}

			if(t.is('[min="-360"][max="360"]')) {
				value += 'deg';
			}
			else if(t.is('[min="0"][max="5000"]')) {
				value += 'ms';
			}
			else if(!isNaN(value) && Number.isInteger(parseFloat(step)) && parseFloat(step) >= 10) {
				value += 'px';
			}

			output.html(value + ';');

			if (t.parents('details').is('.targeted')) {
				target.filter('.selected').css('--'+property, value);
			} else {
				target.css('--'+property, value);
			}

		});

		$('input[type="range"]').on('mouseup keyup', function () {
			ChangeValueFactor($(this));
		});

		$('input, summary', '.model-controls').on('focus', function(){
			$(this).parentsUntil('.model-controls').addClass('is-focused');
			$(this).parents('.model-controls').addClass('is-in-use');
		});

		$('input, summary', '.model-controls').on('blur', function(){
			$(this).parentsUntil('.model-controls').removeClass('is-focused');
			$(this).parents('.model-controls').removeClass('is-in-use');
		});

		$('.selectable-items').on('click', 'p', function(){
			var t = $(this);
			var parent_section = t.parents('article');
			var model_controls = parent_section.find('.model-controls');
			var targeted_controls = model_controls.find('.targetable-controls')
			var style_string = t.attr('style') + t.parents('.interactive-model').attr('style');
			// var styles = style_string.slice(0, style_string.length - 1).split(';').map(x => x.split(':'))

			$('li:has(input)', targeted_controls).each(function() {
				setDefault($(this), false);
			});

			if (style_string !== undefined && style_string != '') {
				var parts = style_string.split(";");

				for (var i=0;i<parts.length - 1;i++) {
					var subParts = parts[i].split(':');
					var name = subParts[0].replace('--', '').replace(' ', '');
					var value = subParts[1];
					var target_input = targeted_controls.find('input[name="' + name + '"]');
					var refInputType = target_input.attr('type');

					if (refInputType == 'radio' || refInputType == 'checkbox') {
						targeted_controls.find('input[name="' + name + '"][value = "' + value + '"]').prop('checked', true);
					}

					else if (refInputType == 'range' || refInputType == 'text') {
						targeted_controls.find('input[name="' + name + '"]').first().val(value);
					}

					targeted_controls.find('output[for="' + name + '"]').text(value);
				}
			}

			if(!event.shiftKey == 1) {
				t.siblings().removeClass('selected');
			}

			if(t.is('.selected') && t.siblings('.selected').length == 0) {
				targeted_controls.removeClass('targeted');
			} else {
				targeted_controls.addClass('targeted');
			}

			t.toggleClass('selected');

		});
	}

	$(ready);

})(jQuery);
