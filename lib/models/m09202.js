
//	Основи на Компютърната Графика
//	Модел 09202 - Ветрила в OpenGL
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09202 = function M09202(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 10; // брой триъгълници
	
	// точки
	var geometry = new THREE.Geometry();
	for (var i=0; i<this.n+2; i++)
		geometry.vertices.push( new THREE.Vector3() );
	
	for (var i=0; i<this.n; i++)
		geometry.faces.push( new THREE.Face3(0,i+1,i+2) );
	this.points = new THREE.Points(geometry,new THREE.PointsMaterial({color:'black',size:0.015}));
	
	// триъгълници
	material = MEIRO.PRIMITIVE.STYLE.PLATE.clone();
	material.opacity = 0.5;
	this.triangles = new THREE.Mesh(geometry,material);
	
	// контурни линии (n триъгълници, 2n+1 линии, 4n+2 точки)
	var geometry = new THREE.Geometry();
	for (var i=0; i<4*this.n+2; i++)
		geometry.vertices.push( new THREE.Vector3() );
	this.lines = new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:'black',transparent:true,opacity:0.3}));

	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();

	// сглобяване на целия модел
	this.image.add(this.triangles,this.points,this.lines);
}

MEIRO.Models.M09202.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09202.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M09202.POS = {DIST:10, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09202.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09202.prototype.onAnimate = function(time)
{
	this.triangles.rotation.y = rpm(time,1);
	this.points.rotation.y = rpm(time,1);
	this.lines.rotation.y = rpm(time,1);
	reanimate();
}



// информатор на модела
MEIRO.Models.M09202.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Ветрила в OpenGL</h1>';

	s += '<p>Ветрила се изграждат на основата на група от точки. Първата точка е "центъра" на ветрилото, а останалите образуват периферията. Създадените триъгълници имат върхове центъра и две последователни точки от периферията.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M09202.prototype.onToggle = function(element)
{
	this.triangles.rotation.set(THREE.Math.randFloat(0,7),THREE.Math.randFloat(0,7),0);
	this.points.rotation.copy(this.triangles.rotation);
	this.lines.rotation.copy(this.triangles.rotation);
	
	var s = new THREE.Spherical(3,Math.PI/2,10*Math.random());
	this.points.geometry.vertices[0].set(0,0,0);
	for (var i=1; i<this.n+2; i++)
	{
		s.radius += THREE.Math.randFloat(-0.4,0.4);
		s.phi += THREE.Math.randFloat(-0.3,0.3);
		s.theta += THREE.Math.randFloat(0.2,0.6);
		this.points.geometry.vertices[i].setFromSpherical(s);
		this.points.geometry.vertices[0].addScaledVector(this.points.geometry.vertices[i],1/(this.n+1));
	}
	
	for (var i=0; i<this.n; i++)
	{
		this.lines.geometry.vertices[2*i].copy(this.points.geometry.vertices[i+1]);
		this.lines.geometry.vertices[2*i+1].copy(this.points.geometry.vertices[i+2]);
	}
	
	for (var i=0; i<this.n+1; i++)
	{
		this.lines.geometry.vertices[2*this.n+2*i].copy(this.points.geometry.vertices[0]);
		this.lines.geometry.vertices[2*this.n+2*i+1].copy(this.points.geometry.vertices[i+1]);
	}
	
	this.triangles.geometry.computeFaceNormals();
	this.triangles.geometry.verticesNeedUpdate = true;
	this.points.geometry.verticesNeedUpdate = true;
	this.lines.geometry.verticesNeedUpdate = true;
	
	reanimate();
}
