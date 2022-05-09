const TRANSLATE_TEXT_URL = 'https://libretranslate.com/translate';
const TRANSLATE_FILE_URL = 'https://libretranslate.com/translate_file';
const LANGUAGES_URL = 'https://libretranslate.de/languages';

$(document).ready(async function () {
	const { languages, languageEs } = await loadAPIsBeforeRender();

	const {
		selectFromE,
		selectToE,
		translateFileTabE,
		translateTextTabE,
		downloadFileButtonE,
		translateFileButtonE,
	} = render({
		languageEs,
	});

	// Handle on click translate text button
	$('#button-change-text-tab').on('click', () => {
		$('#button-change-text-tab').removeClass('btn-flat');
		$('#button-change-file-tab').addClass('btn-flat');
		translateTextTabE.show();
		translateFileTabE.hide();
	});

	// Handle on click translate files button
	$('#button-change-file-tab').on('click', () => {
		$('#button-change-text-tab').addClass('btn-flat');
		$('#button-change-file-tab').removeClass('btn-flat');
		translateTextTabE.hide();
		translateFileTabE.show();
	});

	// Call translate API
	function translate(text) {
		fetch(TRANSLATE_TEXT_URL, {
			method: 'POST',
			body: JSON.stringify({
				q: text,
				source: selectFromE.val(),
				target: selectToE.val(),
			}),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((data) => {
				// After call API success
				$('#textarea-to').val(data.json().translatedText);
			})
			.catch(() => {
				$('#textarea-to').val(
					'Fetch data error. Please check API server status',
				);
			});
	}

	let jobId;
	const textareaFromE = $('#textarea-from');
	function startTranslateJob() {
		// Avoid spam
		if (jobId) clearTimeout(jobId);

		// Avoid empty string
		const text = textareaFromE.val();
		if (text) jobId = setTimeout(() => translate(text), 2000);
	}

	// Handle on keyup event textarea-from
	$('#button-translate-text').on('click', startTranslateJob);

	// Handle on change selectors
	selectFromE.change(startTranslateJob);
	selectToE.change(startTranslateJob);

	// Handle on click clear text button
	$('#button-clear-text').on('click', () => {
		textareaFromE.val('');
		textareaFromE.attr('style', 'height: 13rem').val('');
	});

	// Handle on click copy button
	$('#button-copy').on('click', () => {
		const resultText = $('#textarea-to').val();

		if (resultText) navigator.clipboard.writeText(resultText);
	});

	// Handle click translate files button
	translateFileButtonE.on('click', () => {
		translateFileButtonE.hide();
		fetch(TRANSLATE_FILE_URL, {
			method: 'POST',
			body: JSON.stringify({
				file: $('#upload-translate-file')[0].files[0],
				source: selectFromE.val(),
				target: selectToE.val(),
			}),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})
			.then((data) => {
				// Get file here
				console.log(data);

				downloadFileButtonE.show();
			})
			.catch((err) => {
				console.error(err);
				translateFileButtonE.show();
			});
	});

	downloadFileButtonE.on('click', () => {
		downloadFileButtonE.hide();
		// Download file here
		// ...
		//
		translateFileButtonE.show();
	});
});

async function loadAPIsBeforeRender() {
	//Show loader
	const body = $('body').hide();
	const loader = $('#loader').addClass('active');

	// Call API to init data here
	const languages = await (await fetch(LANGUAGES_URL)).json();

	const languageEs = languages.map((lang) =>
		$('<option>').attr('value', lang.code).text(lang.name),
	);

	//Hide loader
	$(loader).removeClass('active').remove();
	$(body).show();

	return { languages, languageEs };
}

function render({ languageEs }) {
	// Hide translate files tab
	const translateFileTabE = $('#translate-file').hide();
	const translateTextTabE = $('#translate-text').show();

	// Hide download file button
	const downloadFileButtonE = $('#button-download').hide();
	const translateFileButtonE = $('#button-translate-file').show();

	// Init select language
	const selectFromE = $('#select-from').append(languageEs);

	const selectToE = $('#select-to').append(languageEs.map((e) => e.clone()));

	$('select').formSelect();

	// Init tooltip
	$('.tooltipped').tooltip();

	return {
		translateFileTabE,
		translateTextTabE,
		selectFromE,
		selectToE,
		downloadFileButtonE,
		translateFileButtonE,
	};
}
