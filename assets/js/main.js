(function ($) {
	'use strict';
	

	// Debug outline mode en appuyant sur ESC
	document.addEventListener('keyup', function(e){
		if(e.code === 'Escape') body.classList.toggle('debug');
	});


	// ajouter livereload seulement si je suis en local
	const body = document.body;
	if(window.location.href.indexOf('.local') > -1 || window.location.href.indexOf('localhost')) {
		const script = document.createElement('script');
		script.setAttribute('src', 'http://localhost:35729/livereload.js');
		body.append(script);
	}

	// Permet de déplacer les input range pour que leur poignée soit toujours centrée dans le output
	function changeValueFactor(t) {
		const val = (t.value - t.getAttribute('min')) / (t.getAttribute('max') - t.getAttribute('min'));
		t.style.setProperty('--value', val);
	}

	// Générer toutes les propriétés relatives au champ utilisé
	function getItemProps(item) {
		const t = item.closest('li');
		t.field = t.querySelector('input, select');
		t.name = t.field.getAttribute('name');
		t.auto = t.querySelector('input[checked]');
		t.preset = t.field.value;
		t.isRange = t.field.matches('[type="range"]');
		t.step = (t.isRange) ? t.field.getAttribute('step') : 1;
		t.val = (t.auto && t.auto.checked) ? t.auto.getAttribute('value') : t.preset;
		t.parent_section = t.closest('article');
		t.interactive_model = t.parent_section.querySelectorAll('.interactive-model');
		t.target = (t.closest('.targetable-controls')) ? t.interactive_model[0].children : t.interactive_model;

		if(t.field.matches('[type="checkbox"]:not(:checked)')) {
			t.val = t.field.value;
		}
		if(t.field.matches('[min="-360"][max="360"]')) {
			t.val += 'deg';
		}
		else if(t.field.matches('[min="0"][max="5000"]')) {
			t.val += 'ms';
		}
		else if(!isNaN(t.val) && Number.isInteger(parseFloat(t.step)) && t.querySelector('input') && parseInt(t.querySelector('input').getAttribute('max')) > 10) {
			t.val += 'px';
		}

		return t;
	}

	// Générer les valeurs par défaut au chargement
	function setDefault(item, set_model = true) {
		const t = getItemProps(item);

		if(!t.querySelector('output')) {
			const output = document.createElement('output');
			output.setAttribute('for', t.name);
			t.querySelector('div').prepend(output);
		}
		[...t.querySelectorAll('input')].forEach((field) => {
			field.value = field.getAttribute('value');
		});
		t.querySelector('output').innerHTML = t.val;


		if (set_model === true) {
			[...t.target].forEach((element) => {
				element.style.setProperty('--' + t.name, t.val);
			});
		}
	}

	// Déplacer les range pour centrer leur poignée dans le output
	[...document.querySelectorAll('.model-controls input[type="range"]')].forEach((input) => {
		changeValueFactor(input);
	});


	// Appliquer les valeurs par défaut au chargement
	const controlItems = document.querySelectorAll('.model-controls li');
	controlItems.forEach((el) => {
		if (el.querySelector('select, input')) {
			setDefault(el);
		}
	});

	// Modifier les propriétés des items au changement de valeur des champs
	document.querySelectorAll('input, select').forEach((item) => {
		item.addEventListener('input', function(e){
			if(e.target.matches('[type="range"],[type="text"]') && e.target.closest('li').querySelector('input[type="checkbox"]')) {
				e.target.closest('li').querySelector('input[type="checkbox"]').checked = false;
			}
			const t = getItemProps(e.target);
			const output = t.querySelector('output');

			output.innerHTML = t.val;


			if (t.closest('.targeted')) {
				[...t.target].forEach((element) => {
					if(element.matches('.selected')) {
						element.style.setProperty('--'+t.name, t.val);
					}
				});
			} else {
				[...t.target].forEach((element) => {
					element.style.setProperty('--'+t.name, t.val);
				});
			}
		});
	});

	// Déplacer les range au centre du output lorsqu'on le modifie
	document.querySelectorAll('input[type="range"]').forEach((item) => {
		item.addEventListener('mouseup', function(e){
			changeValueFactor(item);
		});

		item.addEventListener('keyup', function(e){
			changeValueFactor(item);
		});
	});

	// Gérer la sélection des enfants du modèle et la modification de leur propriétés
	const selectableItems = document.querySelector('.selectable-items');
	if(selectableItems) {
		document.querySelector('.selectable-items').addEventListener('click', function(e) {
			if(e.target.closest('p')) {
				const t = e.target;
				const parent_section = t.closest('article');
				const model_controls = parent_section.querySelector('.model-controls');
				const targeted_controls = model_controls.querySelector('.targetable-controls');
				const style_string = t.getAttribute('style');

				const controlItems = targeted_controls.querySelectorAll('li');
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
						const target_input = targeted_controls.querySelector('[name="'+name+'"]');
						const refInputType = (target_input.tagName === 'INPUT') ? target_input.getAttribute('type') : null;
						const target_output = target_input.closest('li').querySelector('output');
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
})();
