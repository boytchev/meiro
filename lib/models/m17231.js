
//	Основи на Компютърната Графика
//	Модел 17231 - Успешна прозрачност на обект
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M17231 = function M17231(room)
{
	MEIRO.Model.apply(this, arguments);

	// геометрия
	var geometry = new THREE.SphereGeometry(3,40,20);
	var subGeometry = new THREE.SphereGeometry(3,20,10);

	// сфера
	this.sphereA = new THREE.Mesh(
		geometry,
		new THREE.MeshNormalMaterial({
			transparent: true,
			opacity: 0.8,
			side: THREE.BackSide,
	}));
	this.sphereA.rotation.x = Math.PI/3;
	this.sphereA.renderOrder = -1;
	
	this.sphereB = new THREE.Mesh(
		geometry,
		new THREE.MeshNormalMaterial({
			transparent: true,
			opacity: 0.8,
			side: THREE.FrontSide,
	}));
	this.sphereB.rotation.x = Math.PI/3;
	
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
	this.image.add(this.sphereA,this.sphereB,this.frame);
}

MEIRO.Models.M17231.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M17231.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M17231.POS = {DIST:10, ROT_X:0, ROT_Y:0};
MEIRO.Models.M17231.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M17231.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M17231.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Успешна прозрачност на обект</h1>';

	s += '<p>За да се нарисува полупрозрачна сфера, която изглежда правилно от всяка гледна точка, можем да я нарисуваме на две стъпки. При първата стъпка рисуваме само задните стени на сферата. При втората &ndash; само предните. Дали стена е задна или предна се определя в реално време и е бърза проверка.</p>';
	element.innerHTML = s;
}
