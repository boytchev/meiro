
//	Основи на Компютърната Графика
//	Модел 19461 - Ротация около права успоредна на Z с матрица
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M19461 = function M19461(room)
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
	this.matrixT1 = new THREE.Matrix4();
	this.matrixT2 = new THREE.Matrix4();
	this.matrixR = new THREE.Matrix4();
	
	// линия
	this.line = new MEIRO.Cylinder(0.05,20);
	this.line.material = this.point.material;
	this.line.rotation.x = Math.PI/2;
	
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

MEIRO.Models.M19461.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M19461.DIST = {MIN:10, MAX:40, HEIGHT:0};
MEIRO.Models.M19461.POS = {DIST:20, ROT_X:0.57, ROT_Y:0.3};
MEIRO.Models.M19461.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M19461.prototype.onAnimate = function(time)
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
MEIRO.Models.M19461.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Ротация около права успоредна на Z с матрица</h1>';

	s += '<p>Матрицата за ротация около оста <em>Z</em> използва само ъгъла на ротация <em>α</em>:</p>';
	s += '<p><pre>        |cosα -sinα  0   0|<br>';
	s += 'Rz(α) = |sinα  cosα  0   0|<br>';
	s += '        | 0     0    1   0|<br>';
	s += '        | 0     0    0   1|</pre></p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M19461.prototype.onToggle = function(element)
{	
	this.point.position.set( THREE.Math.randFloat(-3,3), THREE.Math.randFloat(-2,2),THREE.Math.randFloat(-3,3) );
	this.line.position.set(this.point.position.x,this.point.position.y,0);
	
	for (var i=0; i<this.n; i++)
	{
		this.points[i].position.set( THREE.Math.randFloat(-4,4), THREE.Math.randFloat(-3,3),THREE.Math.randFloat(-8,8) );
		for (var j=0; j<this.m; j++)
			this.trails[i].setPoint(j,this.points[i].position);
	}

	this.matrixT1.set(
		1, 0, 0, -this.point.position.x,
		0, 1, 0, -this.point.position.y,
		0, 0, 1, -this.point.position.z,
		0, 0, 0, 1 );
		
	this.matrixT2.set(
		1, 0, 0, this.point.position.x,
		0, 1, 0, this.point.position.y,
		0, 0, 1, this.point.position.z,
		0, 0, 0, 1 );
		
	var a = 2*Math.PI/(this.m-2)/10,
		s = Math.sin(a),
		c = Math.cos(a);
		
	this.matrixR.set(
		c,-s, 0, 0,
		s, c, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1 );
		
	this.matrix.set(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1 );
		
	this.matrix.multiply(this.matrixT2);
	this.matrix.multiply(this.matrixR);
	this.matrix.multiply(this.matrixT1);
		
	this.stepsLeft = this.m;
	
	reanimate();
}
	