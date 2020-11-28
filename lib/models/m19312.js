
//	Основи на Компютърната Графика
//	Модел 19312 - Мащабиране с хомогенни координати
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M19312 = function M19312(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-10,10],[-5,5],[-10,10],true);
	
	this.n = options.lowpoly?10:30; // брой движещи се точки
	this.points = [];
	this.trails = [];
	var geometry = new THREE.IcosahedronGeometry(0.2,1);
	for (var i=0; i<this.n; i++)
	{
		this.points.push(new THREE.Mesh(geometry,MEIRO.PRIMITIVE.STYLE.PAWN));
		this.trails.push(new MEIRO.Line());
	}
	
	this.point = new THREE.Mesh(geometry,new THREE.MeshPhongMaterial({color:'red',shininess:100}));
	
	this.stepsLeft = 0;
	
	this.matrix = new THREE.Matrix4();
	this.matrixT1 = new THREE.Matrix4();
	this.matrixT2 = new THREE.Matrix4();
	this.matrixS = new THREE.Matrix4();
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();
	
	// сглобяване на целия модел
	this.image.add(this.oxyz,this.point);
	for (var i=0; i<this.n; i++)
		this.image.add(this.points[i],this.trails[i]);
}

MEIRO.Models.M19312.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M19312.DIST = {MIN:10, MAX:40, HEIGHT:0};
MEIRO.Models.M19312.POS = {DIST:20, ROT_X:0.57, ROT_Y:0.3};
MEIRO.Models.M19312.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M19312.prototype.onAnimate = function(time)
{
	this.oxyz.rotateLabels();
	if (this.stepsLeft<1) return;
	this.stepsLeft--;
	
	for (var i=0; i<this.n; i++)
	{
		this.points[i].position.applyMatrix4(this.matrix);
		this.trails[i].setTo(this.points[i].position.clone());
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M19312.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Мащабиране с хомогенни координати</h1>';

	s += '<p>Когато се мащабира с матрица и мащабите по трите оси са един и същи (и ненулеви), то може да се ползва и хомогенна матрица с общ коефициент на мащаба:</p>';
	s += '<p><pre>       |m 0 0 0|   |1 0 0  0 |<br>';
	s += 'S(m) = |0 m 0 0| = |0 1 0  0 |<br>';
	s += '       |0 0 m 0|   |0 0 1  0 |<br>';
	s += '       |0 0 0 1|   |0 0 0 1/m|</pre></p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M19312.prototype.onToggle = function(element)
{	
	this.point.position.set( THREE.Math.randFloat(-3,3), THREE.Math.randFloat(-2,2),THREE.Math.randFloat(-3,3) );
	
	for (var i=0; i<this.n; i++)
	{
		this.points[i].position.set( THREE.Math.randFloat(-3,3), THREE.Math.randFloat(-2,2),THREE.Math.randFloat(-3,3) );
		this.trails[i].setFrom(this.points[i].position.clone());
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
		
	var s = 1.005;
	this.matrixS.set(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1/s );
		
	this.matrix.set(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1 );
		
	this.matrix.multiply(this.matrixT2);
	this.matrix.multiply(this.matrixS);
	this.matrix.multiply(this.matrixT1);
	
	this.stepsLeft = this.m;
	
	reanimate();
}
	