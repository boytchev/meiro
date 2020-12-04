//	MEIRO
//	Languages - translations of texts
//
//	MEIRO - Functions
//	 ├─ RandomColor()
//	 └─ RandomMilkyColor()
//
//
// 2020.12 - P. Boytchev

MEIRO.TEXTS = {};

MEIRO.TEXTS.bg =
{
	'GO UP':	'НАГОРЕ',
	'GO DOWN':	'НАДОЛУ',
	'INFO': 	'ИНФОРМАЦИЯ',
	'CLOSE':	'ИЗХОД',
}

MEIRO.TEXTS.jp =
{
	'GO UP':	'上がる',
	'GO DOWN':	'降りる',
	'INFO': 	'情報',
	'CLOSE':	'出口',
}

MEIRO.translate = function( id )
{
	var lang = options.lang || 'en';
	
	if( MEIRO.TEXTS[lang] && MEIRO.TEXTS[lang][id] )
		return MEIRO.TEXTS[lang][id];
	
	console.assert( lang=='en', 'Text not in dictionary (lang='+lang+') '+id );
	
	return id;
}