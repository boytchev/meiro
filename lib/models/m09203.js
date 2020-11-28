
//	Основи на Компютърната Графика
//	Модел 09203 - Ленти в OpenGL
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09203 = function M09203(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 10; // брой триъгълници
	
	// точки
	var geometry = new THREE.Geometry();
	for (var i=0; i<this.n+2; i++)
		geometry.vertices.push( new THREE.Vector3() );
	
	for (var i=0; i<this.n; i++)
		geometry.faces.push( new THREE.Face3(i,i+1,i+2) );
	this.points = new THREE.Points(geometry,new THREE.PointsMaterial({color:'black',size:0.015}));
	
	// триъгълници
	material = MEIRO.PRIMITIVE.STYLE.PLATE.clone();
	material.opacity = 0.5;
	this.triangles = new THREE.Mesh(geometry,material);
	
	// контурни линии
	var geometry = new THREE.Geometry();
	for (var i=0; i<2*this.n+3; i++)
		geometry.vertices.push( new THREE.Vector3() );
	this.lines = new THREE.Line(geometry,new THREE.LineBasicMaterial({color:'black',transparent:!true,opacity:0.3}));

	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();

	// сглобяване на целия модел
	this.image.add(this.triangles,this.points,this.lines);
}

MEIRO.Models.M09203.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09203.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M09203.POS = {DIST:10, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09203.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09203.prototype.onAnimate = function(time)
{
	this.triangles.rotation.y = rpm(time,1);
	this.points.rotation.y = rpm(time,1);
	this.lines.rotation.y = rpm(time,1);
	reanimate();
}



// информатор на модела
MEIRO.Models.M09203.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Ленти в OpenGL</h1>';

	s += '<p>Лентите се изграждат на основата на група от точки. Четните номера точки описват единия край на лентата, а нечетните &ndash; другия. Създадените триъгълници се допълват един-друг на зиг-заг.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M09203.prototype.onToggle = function(element)
{
	this.triangles.rotation.set(THREE.Math.randFloat(0,7),THREE.Math.randFloat(0,7),0);
	this.points.rotation.copy(this.triangles.rotation);
	this.lines.rotation.copy(this.triangles.rotation);
	
	var s = new THREE.Spherical(3,Math.PI/2,10*Math.random());
	this.points.geometry.vertices[0].set(0,0,0);
	for (var i=0; i<this.n+2; i++)
	{
		s.radius += THREE.Math.randFloat(-0.4,0.4);
		s.phi += THREE.Math.randFloat(0.5,1.5)*(i%2-0.5);
		s.theta += THREE.Math.randFloat(0.2,0.6);
		this.points.geometry.vertices[i].setFromSpherical(s);
	}
	
	var j=0;
	for (var i=1; i<this.n+2; i++,j++)
		this.lines.geometry.vertices[j].copy(this.points.geometry.vertices[i]);
	for (var i=this.n+1; i>0; i-=2,j++)
		this.lines.geometry.vertices[j].copy(this.points.geometry.vertices[i]);
	for (var i=0; i<this.n+2; i+=2,j++)
		this.lines.geometry.vertices[j].copy(this.points.geometry.vertices[i]);

	this.triangles.geometry.computeFaceNormals();
	this.triangles.geometry.verticesNeedUpdate = true;
	this.points.geometry.verticesNeedUpdate = true;
	this.lines.geometry.verticesNeedUpdate = true;
	
	reanimate();
}
