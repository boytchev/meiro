
//	Основи на Компютърната Графика
//	Модел 19571 - Ротация около права с матрица
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M19571 = function M19571(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-10,10],[-5,5],[-10,10],true);
	
	this.n = options.lowpoly?10:30; // брой движещи се точки
	this.m = options.lowpoly?30:60; // дължина на следата
	this.points = [];
	this.trails = [];
	var geometry = new THREE.IcosahedronGeometry(0.2,1);
	for (var i=0; i<this.n; i++)
	{
		this.points.push(new THREE.Mesh(geometry,MEIRO.PRIMITIVE.STYLE.PAWN));
		this.trails.push(new MEIRO.Polygon(this.m));
	}
	
	this.point = new THREE.Mesh(geometry,new THREE.MeshPhongMaterial({color:'red',shininess:100}));

	this.counter= -1;
	this.stepsLeft = 0;
	
	this.matrix = new THREE.Matrix4();
	this.matrixM1 = new THREE.Matrix4();
	this.matrixM2 = new THREE.Matrix4();
	this.matrixM3 = new THREE.Matrix4();
	this.matrixM4 = new THREE.Matrix4();
	this.matrixM5 = new THREE.Matrix4();
	this.matrixM6 = new THREE.Matrix4();
	this.matrixM7 = new THREE.Matrix4();
	
	// линия
	var geometry = MEIRO.PRIMITIVE.GEOMETRY.CYLINDER.clone();
	geometry.rotateX(Math.PI/2);
	this.line = new THREE.Mesh(geometry,this.point.material);
	this.line.scale.set(0.05,0.05,20);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();
	
	// сглобяване на целия модел
	this.image.add(this.oxyz,this.point,this.line);
	for (var i=0; i<this.n; i++)
		this.image.add(this.points[i],this.trails[i]);
}

MEIRO.Models.M19571.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M19571.DIST = {MIN:10, MAX:40, HEIGHT:0};
MEIRO.Models.M19571.POS = {DIST:20, ROT_X:0.57, ROT_Y:0.3};
MEIRO.Models.M19571.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M19571.prototype.onAnimate = function(time)
{
	this.oxyz.rotateLabels();
	if (this.stepsLeft<1) return;
	
	for (var i=0; i<this.n; i++)
		this.points[i].position.applyMatrix4(this.matrix);
	
	this.counter = (this.counter+1)%10;
	if (!this.counter)
		this.stepsLeft--;
		
	for (var i=0; i<this.n; i++)
		this.trails[i].setPoint(this.stepsLeft,this.points[i].position.clone());
		
	reanimate();
}



// информатор на модела
MEIRO.Models.M19571.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Ротация около права с матрица</h1>';

	s += '<p>При ротация около права матрица е сложна, затова се създават по-прости матрици на частични трансформации, които се умножават за получаването на крайната матрица на ротация. При произволна права, зададена с точка и вектор, по-простите матрици са 7 на брой &ndash; две транслации и пет ротации.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M19571.prototype.onToggle = function(element)
{	
	this.point.position.set( THREE.Math.randFloat(-3,3), THREE.Math.randFloat(-2,2),THREE.Math.randFloat(-3,3) );
	this.line.position.copy(this.point.position);
	
	var s = new THREE.Spherical(1,THREE.Math.randFloat(0,Math.PI),THREE.Math.randFloat(0,2*Math.PI));
	var v = new THREE.Vector3().setFromSpherical(s);

	var p = this.point.position.clone();
	p.add(v);
	this.line.lookAt(p);
		
	for (var i=0; i<this.n; i++)
	{
		this.points[i].position.set( THREE.Math.randFloat(-4,4), THREE.Math.randFloat(-3,3),THREE.Math.randFloat(-8,8) );
		for (var j=0; j<this.m; j++)
			this.trails[i].setPoint(j,this.points[i].position);
	}

	this.matrixM1.set(
		1, 0, 0, -this.point.position.x,
		0, 1, 0, -this.point.position.y,
		0, 0, 1, -this.point.position.z,
		0, 0, 0, 1 );
		
	this.matrixM7.set(
		1, 0, 0, this.point.position.x,
		0, 1, 0, this.point.position.y,
		0, 0, 1, this.point.position.z,
		0, 0, 0, 1 );
		
	var xy = Math.sqrt(v.x*v.x+v.y*v.y);
	var c = v.x/xy;	
	var s = v.y/xy;	

	this.matrixM2.set(
		c, s, 0, 0,
	   -s, c, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1 );

	this.matrixM6.set(
		c,-s, 0, 0,
		s, c, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1 );

	var xyz = Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
	var c = v.z/xyz;	
	var s = xy/xyz;	

	this.matrixM3.set(
		c, 0,-s, 0,
		0, 1, 0, 0,
		s, 0, c, 0,
		0, 0, 0, 1 );

	this.matrixM5.set(
		c, 0, s, 0,
		0, 1, 0, 0,
	   -s, 0, c, 0,
		0, 0, 0, 1 );

	var a = 2*Math.PI/(this.m-2)/10,
		s = Math.sin(a),
		c = Math.cos(a);
		
	this.matrixM4.set(
		c,-s, 0, 0,
		s, c, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1 );
		
	this.matrix.set(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1 );
		
	this.matrix.multiply(this.matrixM7);
	this.matrix.multiply(this.matrixM6);
	this.matrix.multiply(this.matrixM5);
	this.matrix.multiply(this.matrixM4);
	this.matrix.multiply(this.matrixM3);
	this.matrix.multiply(this.matrixM2);
	this.matrix.multiply(this.matrixM1);
		
	this.stepsLeft = this.m;
	
	reanimate();
}
	