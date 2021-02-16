
document.addEventListener('keyup', function(e){
	if(e.code === 'Escape') body.classList.toggle('debug');
});

(function ($) {
	'use strict';
	
	const body = document.body;
	
	const ready = function () {
		// ajouter livereload seulement si je suis en local
		if(window.location.href.indexOf('.local') > -1 || window.location.href.indexOf('localhost')) {
			const script = document.createElement('script');
			script.setAttribute('src', 'http://localhost:35729/livereload.js');
			body.append(script);
		}

		function changeValueFactor(t) {
			const value = (t.value - t.getAttribute('min')) / (t.getAttribute('max') - t.getAttribute('min'));
			t.style.setProperty('--value', value);
		}

		function setDefault(item, set_model = true) {
			const t = item;
			const field = t.querySelector('input, select');
			const name = field.getAttribute('name');
			const auto = t.querySelector('input[checked]');
			const preset = (field.tagName == 'INPUT') ? field.getAttribute('value') : field.querySelector('option').textContent;
			const step = (t.querySelector('input[type="range"]')) ? t.querySelector('input[type="range"]').getAttribute('step') : 1;
			let value = (auto) ? auto.getAttribute('value') : preset;
			const parent_section = t.closest('article');
			const interactive_model = parent_section.querySelectorAll('.interactive-model');
			const target = (t.closest('.targetable-controls')) ? interactive_model[0].children : interactive_model;

			const property = t.querySelector('input, select').getAttribute('name');

			if(field.matches('[min="-360"][max="360"]')) {
				value += 'deg';
			}
			else if(field.matches('[min="0"][max="5000"]')) {
				value += 'ms';
			}
			else if(!isNaN(value) && Number.isInteger(parseFloat(step)) && parseInt(t.querySelector('input').getAttribute('max')) > 10) {
				value += 'px';
			}

			if(!t.querySelector('output')) {
				const output = document.createElement('output');
				output.setAttribute('for', name);
				t.querySelector('div').prepend(output);
			}
			[...t.querySelectorAll('input')].forEach((field) => {
				field.value = field.getAttribute('value');
			});
			t.querySelector('output').innerHTML = value;

			if (set_model == true) {
				[...target].forEach((element) => {
					element.style.setProperty('--'+property, value);
				});
			}
		}

		[...document.querySelectorAll('.model-controls input[type="range"]')].forEach((input) => {
			changeValueFactor(input);
		});

		const controlItems = document.querySelectorAll('.model-controls li');

		controlItems.forEach((el) => {
			if (el.querySelector('select, input')) {
				setDefault(el);
			}
		});

		document.querySelectorAll('input, select').forEach((item) => {
			item.addEventListener('input', function(e){
				const t = e.target;
				let value = (t.getAttribute('type') == 'range') ? this.valueAsNumber : this.value;
				const output = t.closest('li').querySelector('output');
				const property = t.getAttribute('name');
				const step = (t.getAttribute('type') == 'range') ? t.getAttribute('step') : 1;
				const parent_section = t.closest('article');
				const interactive_model = parent_section.querySelectorAll('.interactive-model');
				const target = (t.closest('.targetable-controls')) ? interactive_model[0].children : interactive_model;
				if(t.matches('[type="range"],[type="text"]') && t.closest('li').querySelector('input[type="checkbox"]')) {
					t.closest('li').querySelector('input[type="checkbox"]').checked = false;
				}

				if(t.matches('[type="checkbox"]:not(:checked)')) {
					value = t.closest('li').querySelector('input[type="range"]').value;
				}

				if(t.matches('[min="-360"][max="360"]')) {
					value += 'deg';
				}
				else if(t.matches('[min="0"][max="5000"]')) {
					value += 'ms';
				}
				else if(!isNaN(value) && Number.isInteger(parseFloat(step)) && parseFloat(step) >= 10) {
					value += 'px';
				}

				output.innerHTML = value;

					if (t.closest('.targeted')) {
						[...target].forEach((element) => {
							if(element.matches('.selected')) {
								element.style.setProperty('--'+property, value);
							}
						});
					} else {
						[...target].forEach((element) => {
							element.style.setProperty('--'+property, value);
						});
					}
			});
		});

		document.querySelectorAll('input[type="range"]').forEach((item) => {
			item.addEventListener('mouseup', function(e){
				changeValueFactor(item);
			});

			item.addEventListener('keyup', function(e){
				changeValueFactor(item);
			});
		});

		const selectableItems = document.querySelector('.selectable-items');
		if(selectableItems) {
			document.querySelector('.selectable-items').addEventListener('click', function(e) {
				if(e.target.closest('p')) {
					const t = e.target;
					const parent_section = t.closest('article');
					const model_controls = parent_section.querySelector('.model-controls');
					const targeted_controls = model_controls.querySelector('.targetable-controls');
					const style_string = t.getAttribute('style') + t.closest('.interactive-model').getAttribute('style');
					// var styles = style_string.slice(0, style_string.length - 1).split(';').map(x => x.split(':'))

					const controlItems = targeted_controls.querySelectorAll('li');
					// $('li:has(input)', targeted_controls).each(function() {
					controlItems.forEach((el) => {
						if(el.querySelector('input')) {
							setDefault(el, false);
						}
					});

					if (style_string !== undefined && style_string != '') {
						const parts = style_string.split(";");

						for (let i = 0; i < parts.length - 1; i += 1) {
							const subParts = parts[i].split(':');
							const name = subParts[0].replace('--', '').replace(' ', '');
							const value = subParts[1];
							const target_input = targeted_controls.querySelector('input[name="' + name + '"]');
							const refInputType = (target_input) ? target_input.getAttribute('type') : null;
							const target_output = targeted_controls.querySelector('input[name="' + name + '"]');
							if (refInputType == 'radio' || refInputType == 'checkbox') {
								targeted_controls.querySelector('input[name="' + name + '"][value = "' + value + '"]').checked = true;
							}

							else if (refInputType == 'range' || refInputType == 'text') {
								targeted_controls.querySelector('input[name="' + name + '"]').value = value;
							}

							else if (target_output) {
								target_output.innerHTML = value;
							}
						}
					}

					if(!event.shiftKey == 1 && t.closest('.interactive-model').querySelector('.selected')) {
						[...t.closest('.interactive-model').querySelectorAll('.selected')].forEach((element) => {
							element.classList.remove('selected');
						});
					}

					if(t.matches('.selected')) {
						targeted_controls.classList.remove('targeted');
					} else {
						targeted_controls.classList.add('targeted');
					}

					t.classList.toggle('selected');
				}
			});
		}
	}

	ready();

})();
