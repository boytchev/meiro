
//	Основи на Компютърната Графика
//	Модел 09201 - Триъгълници в OpenGL
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09201 = function M09201(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 10; // брой триъгълници
	
	// точки
	var geometry = new THREE.Geometry();
	for (var i=0; i<3*this.n; i++)
		geometry.vertices.push( new THREE.Vector3() );
	for (var i=0; i<3*this.n; i+=3)
		geometry.faces.push( new THREE.Face3(i,i+1,i+2) );
	this.points = new THREE.Points(geometry,new THREE.PointsMaterial({color:'black',size:0.015}));
	
	// триъгълници
	material = MEIRO.PRIMITIVE.STYLE.PLATE.clone();
	material.opacity = 0.5;
	this.triangles = new THREE.Mesh(geometry,material);
	
	// контурни линии
	var geometry = new THREE.Geometry();
	for (var i=0; i<2*3*this.n; i++)
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

MEIRO.Models.M09201.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09201.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M09201.POS = {DIST:15, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09201.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09201.prototype.onAnimate = function(time)
{
	this.triangles.rotation.y = rpm(time,1);
	this.points.rotation.y = rpm(time,1);
	this.lines.rotation.y = rpm(time,1);
	reanimate();
}



// информатор на модела
MEIRO.Models.M09201.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Триъгълници в OpenGL</h1>';

	s += '<p>Триъгълници се изграждат на основата на група от точки. Първите три образуват един триъгълник, следващите три &ndash; друг и всяка тройка точки образува отделен триъгълник.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M09201.prototype.onToggle = function(element)
{
	this.triangles.rotation.set(THREE.Math.randFloat(0,7),THREE.Math.randFloat(0,7),0);
	this.points.rotation.copy(this.triangles.rotation);
	this.lines.rotation.copy(this.triangles.rotation);
	
	var s = new THREE.Spherical(0,0,0);
	for (var i=0; i<3*this.n; i++)
	{
		s.radius = THREE.Math.randFloat(2,5);
		s.phi = THREE.Math.randFloat(0,Math.PI);
		s.theta = THREE.Math.randFloat(0,2*Math.PI);
		this.triangles.geometry.vertices[i].setFromSpherical(s);
	
		var tr = Math.floor(i/3); // номер триъгълник
		var vr = i%3; // номер връх
		this.lines.geometry.vertices[6*tr+2*vr].setFromSpherical(s);
		this.lines.geometry.vertices[6*tr+(2*vr+5)%6].setFromSpherical(s);
	}
	this.triangles.geometry.computeFaceNormals();
	this.triangles.geometry.verticesNeedUpdate = true;
	this.points.geometry.verticesNeedUpdate = true;
	this.lines.geometry.verticesNeedUpdate = true;
	
	reanimate();
}
