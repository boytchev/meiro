
//	Основи на Компютърната Графика
//	Модел 09251 - Позиция на обект
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09251 = function M09251(room)
{
	MEIRO.Model.apply(this, arguments);

	// кубове
	this.n = 300;
	this.cubes = [];
	var sph = new THREE.Spherical(0,0,0);

	var edgeGeom = new THREE.EdgesGeometry(MEIRO.PRIMITIVE.GEOMETRY.CUBE);
	
	for (var i=0; i<this.n; i++)
	{
		sph.set(2.5,Math.random()*Math.PI,Math.random()*2*Math.PI);
		var cube = new MEIRO.Cube(1);
		cube.position.setFromSpherical(sph);
		cube.material = new THREE.MeshBasicMaterial({color:MEIRO.RandomColor()});
	
		var edge = new THREE.LineSegments(edgeGeom,MEIRO.PRIMITIVE.STYLE.GRID);
		cube.add(edge);
		
		this.cubes.push(cube);
	}

	// сглобяване на целия модел
	for (var i=0; i<this.n; i++)
		this.image.add(this.cubes[i]);
}

MEIRO.Models.M09251.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09251.DIST = {MIN:1, MAX:20, HEIGHT:0};
MEIRO.Models.M09251.POS = {DIST:10, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09251.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09251.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M09251.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Позиция на обект</h1>';

	s += '<p>Повечето графични обекти имат позиция. Това е невидима 3D точка, за която е закачен обект. При промяна на положението на тази точка се променя и положението на обекта в пространството.</p>';
	
	element.innerHTML = s;
}