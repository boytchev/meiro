
//	Основи на Компютърната Графика
//	Модел 17201 - Изрязване на предни и задни стени
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M17201 = function M17201(room)
{
	MEIRO.Model.apply(this, arguments);

	// геометрия
	var geometry = new THREE.IcosahedronGeometry(2,2);
	var material = new THREE.MeshBasicMaterial({
			color: 'white',
			transparent: true,
			opacity: 0.2,
			wireframe: true
		});

	// сфери
	this.sphereA = new THREE.Mesh(
		geometry,
		new THREE.MeshPhongMaterial({
			color: 'cornflowerblue',
			shininess: 100,
			side: THREE.FrontSide,
			shading: THREE.FlatShading
	}));
	this.sphereA.position.x = -2.15;
	this.frameA = new THREE.Mesh(geometry,material);
	this.frameA.position.x = -2.15;

	this.sphereB = new THREE.Mesh(
		geometry,
		new THREE.MeshPhongMaterial({
			color: 'cornflowerblue',
			shininess: 100,
			side: THREE.BackSide,
			shading: THREE.FlatShading
	}));
	this.sphereB.position.x = 2.15;
	this.frameB = new THREE.Mesh(geometry,material);
	this.frameB.position.x = 2.15;
	
	// равнина
	this.plate = new MEIRO.Cube(1);
	this.plate.scale.set(10,0.1,6);
	this.plate.material.color = new THREE.Color('white');
	
	// сглобяване на целия модел
	this.image.add(this.sphereA,this.frameA,this.sphereB,this.frameB,this.plate);
}

MEIRO.Models.M17201.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M17201.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M17201.POS = {DIST:10, ROT_X:1, ROT_Y:0.5};
MEIRO.Models.M17201.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M17201.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M17201.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Изрязване на предни и задни стени</h1>';

	s += '<p>Затворени обекти могат да се изобразят по-бързо, чрез изрязване на задните стени, понеже те са невидими. Изрязването на стени (всички задни или всички предни) е бърза операция.</p>';
	element.innerHTML = s;
}
