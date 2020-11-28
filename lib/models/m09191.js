
//	Основи на Компютърната Графика
//	Модел 09191 - Отсечки в OpenGL
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09191 = function M09191(room)
{
	MEIRO.Model.apply(this, arguments);

	// точки и отсечки
	this.geometry = new THREE.Geometry();
	for (var i=0; i<80; i++)
		this.geometry.vertices.push( new THREE.Vector3() );
	this.points = new THREE.Points(this.geometry,new THREE.PointsMaterial({color:'black',size:0.015}));
	this.lines = new THREE.LineSegments(this.geometry,new THREE.LineBasicMaterial({color:'black'}));

	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();

	// сглобяване на целия модел
	this.image.add(this.lines,this.points);
}

MEIRO.Models.M09191.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09191.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M09191.POS = {DIST:15, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09191.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09191.prototype.onAnimate = function(time)
{
	this.lines.rotation.y = rpm(time,1);
	this.points.rotation.y = rpm(time,1);
	reanimate();
}



// информатор на модела
MEIRO.Models.M09191.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Отсечки в OpenGL</h1>';

	s += '<p>Отсечки се изграждат на основата на група от точки. Първите две образуват една отсечка, следващите две &ndash; друга и всяка двойка точки образува отделна отсечка.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M09191.prototype.onToggle = function(element)
{
	this.lines.rotation.set(THREE.Math.randFloat(0,7),THREE.Math.randFloat(0,7),0);
	this.points.rotation.copy(this.lines.rotation);
	
	var s = new THREE.Spherical(0,0,0);
	var n = this.lines.geometry.vertices.length;
	for (var i=0; i<n; i++)
	{
		s.radius = THREE.Math.randFloat(2,4);
		s.phi = THREE.Math.randFloat(0,Math.PI);
		s.theta = THREE.Math.randFloat(0,2*Math.PI);
		this.lines.geometry.vertices[i].setFromSpherical(s);
	}
	this.lines.geometry.verticesNeedUpdate = true;
	this.points.geometry.verticesNeedUpdate = true;
	
	reanimate();
}
