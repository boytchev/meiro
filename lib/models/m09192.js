
//	Основи на Компютърната Графика
//	Модел 09192 - Линии в OpenGL
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09192 = function M09192(room)
{
	MEIRO.Model.apply(this, arguments);

	// брой линии
	this.n = 5;
	this.geometries = [];
	this.points = [];
	this.lines = [];
	
	// точки и отсечки
	for (var j=0; j<this.n; j++)
	{
		var color = new THREE.Color(Math.random(),Math.random(),Math.random());
		var geom = new THREE.Geometry();
		for (var i=0; i<30; i++)
			geom.vertices.push( new THREE.Vector3() );
		this.geometries.push(geom);
		this.points.push(new THREE.Points(geom,new THREE.PointsMaterial({color:color,size:0.015})));
		this.lines.push(new THREE.LineSegments(geom,new THREE.LineBasicMaterial({color:color})));
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();

	// сглобяване на целия модел
	for (var j=0; j<this.n; j++)
		this.image.add(this.lines[j],this.points[j]);
}

MEIRO.Models.M09192.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09192.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M09192.POS = {DIST:15, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09192.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09192.prototype.onAnimate = function(time)
{
	for (var j=0; j<this.n; j++)
	{
		this.lines[j].rotation.y = rpm(time+j,1);
		this.points[j].rotation.y = rpm(time+j,1);
	}
//	reanimate();
}



// информатор на модела
MEIRO.Models.M09192.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Линии в OpenGL</h1>';

	s += '<p>Линии се изграждат на основата на група от точки. Точките се свързват всяка със следващата и така образуват начупена линия.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M09192.prototype.onToggle = function(element)
{
	for (var j=0; j<this.n; j++)
	{
		var color = new THREE.Color(Math.random(),Math.random(),Math.random());
		this.lines[j].rotation.set(THREE.Math.randFloat(0,7),THREE.Math.randFloat(0,7),THREE.Math.randFloat(0,7));
		this.points[j].rotation.copy(this.lines[j].rotation);
		this.lines[j].material.color = color;
		this.points[j].material.color = color;
		
		
		var s = new THREE.Spherical(3,Math.PI/2,10*Math.random());
		var n = this.geometries[j].vertices.length;
		for (var i=0; i<n; i++)
		{
			if (i==0 || i%2)
			{
				s.radius += THREE.Math.randFloat(-0.3,0.3);
				s.phi += THREE.Math.randFloat(-0.2,0.2);
				s.theta += THREE.Math.randFloat(0,0.3);
			}
			this.lines[j].geometry.vertices[i].setFromSpherical(s);
		}
		this.lines[j].geometry.verticesNeedUpdate = true;
		this.points[j].geometry.verticesNeedUpdate = true;
	}
	
	reanimate();
}
