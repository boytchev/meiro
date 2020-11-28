
//	Основи на Компютърната Графика
//	Модел 09421 - Тор от пресечени конуси
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09421 = function M09421(room)
{
	MEIRO.Model.apply(this, arguments);

	var m = 60; // брой върхове по периферията
	var n = 80; // брой върхове по напречното сечение
	var R = 3; // радиус на тора
	var r = 1; // радиус на напречното сечение
	
	this.torus = new THREE.Object3D();
	for (var i=0; i<n; i++)
	{
		var a0 = (i+0)/n*2*Math.PI;
		var a1 = (i+1)/n*2*Math.PI;
		
		var r0 = R-r*Math.cos(a0);
		var r1 = R-r*Math.cos(a1);
		
		var h0 = r*Math.sin(a0);
		var h1 = r*Math.sin(a1);

		var material = new THREE.MeshPhongMaterial({color:'cornflowerblue',side:THREE.DoubleSide});
		var geometry = new THREE.CylinderGeometry(r1,r0,h1-h0,m,1,true);
		geometry.translate(0,h0+(h1-h0)/2,0);
		if (h1<h0) geometry.scale(-1,1,1);
		
		this.torus.add( new THREE.Mesh(geometry,material) );
	}
	
	light = new THREE.PointLight('white',1);
	light.position.set(0,10,0);
	
	// сглобяване на целия модел
	this.image.add(this.torus,light);
}

MEIRO.Models.M09421.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09421.DIST = {MIN:15, MAX:30, HEIGHT:0};
MEIRO.Models.M09421.POS = {DIST:20, ROT_X:0, ROT_Y:0.6};
MEIRO.Models.M09421.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09421.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M09421.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Тор от пресечени конуси</h1>';

	s += '<p>Тор може да се формира от отворени пресечени конуси &ndash; използват се само околните им повърхности, без основите. Всеки конус изгражда един слой от тора.</p>';
	s += '<p>В настоящия модел са включени много конуси, за да се постигне гладкост в цвета. При малък брой конуси трябва да се променят нормалните вектори във върховете им, за да се постигне отново подобна гладкост.</p>';
	
	element.innerHTML = s;
}
