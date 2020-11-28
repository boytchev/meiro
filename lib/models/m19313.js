
//	Основи на Компютърната Графика
//	Модел 19313 - Мащабиране с матрица с различни коефициенти по осите
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M19313 = function M19313(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-10,10],[-5,5],[-10,10],true);
	
	this.n = options.lowpoly?10:30; // брой движещи се точки
	this.m = options.lowpoly?15:30; // дължина на следата
	this.points = [];
	this.trails = [];
	var geometry = new THREE.IcosahedronGeometry(0.2,1);
	for (var i=0; i<this.n; i++)
	{
		this.points.push(new THREE.Mesh(geometry,MEIRO.PRIMITIVE.STYLE.PAWN));
		this.trails.push(new MEIRO.Polygon(this.m));
	}
	
	this.counter= -1;
	this.stepsLeft = 0;
	
	this.matrix = new THREE.Matrix4();
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();
	
	// сглобяване на целия модел
	this.image.add(this.oxyz);
	for (var i=0; i<this.n; i++)
		this.image.add(this.points[i],this.trails[i]);
}

MEIRO.Models.M19313.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M19313.DIST = {MIN:10, MAX:40, HEIGHT:0};
MEIRO.Models.M19313.POS = {DIST:20, ROT_X:0.57, ROT_Y:0.3};
MEIRO.Models.M19313.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M19313.prototype.onAnimate = function(time)
{
	this.oxyz.rotateLabels();
	if (this.stepsLeft<1) return;
	
	for (var i=0; i<this.n; i++)
		this.points[i].position.applyMatrix4(this.matrix);
	
	this.counter = (this.counter+1)%20;
	if (!this.counter)
		this.stepsLeft--;
		
	for (var i=0; i<this.n; i++)
		this.trails[i].setPoint(this.stepsLeft,this.points[i].position.clone());
		
	reanimate();
}



// информатор на модела
MEIRO.Models.M19313.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Мащабиране с матрица с различни коефициенти по осите</h1>';

	s += '<p>Матрицата за мащабиране с различни коефициенти по всяка от осите с мащаб, зададен с вектора <em>v=(x,y,z)</em>, включва тези коефициенти по главния диагонал:</p>';
	s += '<p><pre>       |x 0 0 0|<br>';
	s += 'S(v) = |0 y 0 0|<br>';
	s += '       |0 0 z 0|<br>';
	s += '       |0 0 0 1|</pre></p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M19313.prototype.onToggle = function(element)
{	
	for (var i=0; i<this.n; i++)
	{
		this.points[i].position.set( THREE.Math.randFloat(-4,4), THREE.Math.randFloat(-3,3),THREE.Math.randFloat(-8,8) );
		for (var j=0; j<this.m; j++)
			this.trails[i].setPoint(j,this.points[i].position);
	}

	var s = 1.01;
	s = new THREE.Vector3(THREE.Math.randFloat(1,s),THREE.Math.randFloat(1/s,s),THREE.Math.randFloat(1/s,1));
	this.matrix.set(
		s.x, 0, 0, 0,
		0, s.y, 0, 0,
		0, 0, s.z, 0,
		0, 0, 0, 1 );
		
	this.stepsLeft = this.m;
	
	reanimate();
}
	