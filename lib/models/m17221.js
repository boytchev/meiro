
//	Основи на Компютърната Графика
//	Модел 17221 - Проблемна прозрачност на обект
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M17221 = function M17221(room)
{
	MEIRO.Model.apply(this, arguments);

	// геометрия
	var geometry = new THREE.SphereGeometry(3,40,20);
	var subGeometry = new THREE.SphereGeometry(3,20,10);

	// сфера
	this.sphere = new THREE.Mesh(
		geometry,
		new THREE.MeshNormalMaterial({
			transparent: true,
			opacity: 0.8,
			side: THREE.DoubleSide,
	}));
	this.sphere.rotation.x = Math.PI/3;
	
	this.frame = new THREE.Mesh(
		subGeometry,
		new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 0.08,
			color: 'white',
			wireframe: true,
			depthTest: false,
	}));
	this.frame.rotation.x = Math.PI/3;
	
	// сглобяване на целия модел
	this.image.add(this.sphere,this.frame);
}

MEIRO.Models.M17221.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M17221.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M17221.POS = {DIST:10, ROT_X:0, ROT_Y:0};
MEIRO.Models.M17221.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M17221.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M17221.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Проблемна прозрачност на обект</h1>';

	s += '<p>Някои широко използвани алгоритми за работа с полупрозрачни стени изискват те да бъдат сортирани според разстоянието си от гледната точка. Ако обектите или гледната точка са подвижни, то това сортиране трябва да се прави при всяко движение. В противен случай полупрозрачността не се обработва добре.</p>';
	s += '<p>В този модел е показана сфера от полупрозрачни стени. Тяхната подредба не се променя. Когато се обикаля около сферата се забелязва, че понякога полупрозрачността не е представена добре &ndash; виждат се тъмни и светли стени.</p>';
	element.innerHTML = s;
}
