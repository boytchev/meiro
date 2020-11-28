
//	Основи на Компютърната Графика
//	Модел 09181 - Точки в OpenGL
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09181 = function M09181(room)
{
	MEIRO.Model.apply(this, arguments);

	// точки
	var geometry = new THREE.Geometry();
	for (var i=0; i<2000; i++)
		geometry.vertices.push( new THREE.Vector3() );
	this.points = new THREE.Points(geometry,new THREE.PointsMaterial({color:'black',size:0.01}));

	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();

	// сглобяване на целия модел
	this.image.add(this.points);
}

MEIRO.Models.M09181.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09181.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M09181.POS = {DIST:15, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09181.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09181.prototype.onAnimate = function(time)
{
	this.points.rotation.y = rpm(time,1);
	reanimate();
}



// информатор на модела
MEIRO.Models.M09181.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Точки в OpenGL</h1>';

	s += '<p>Симулация на примитивния обект "точки" в OpenGL.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M09181.prototype.onToggle = function(element)
{
	var sx = THREE.Math.randFloat(3,5);
	var sy = THREE.Math.randFloat(1,4);
	var sz = THREE.Math.randFloat(3,5);

	for (var i=0; i<this.points.geometry.vertices.length; i++)
	{
		var vertex = this.points.geometry.vertices[i];
		vertex.x = THREE.Math.randFloat(-sx,sx);
		vertex.y = THREE.Math.randFloat(-sy,sy);
		vertex.z = THREE.Math.randFloat(-sz,sz);
	}
	this.points.geometry.verticesNeedUpdate = true;
	
	reanimate();
}
