
//	Основи на Компютърната Графика
//	Модел 19211 - Транслация с матрица
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M19211 = function M19211(room)
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

MEIRO.Models.M19211.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M19211.DIST = {MIN:10, MAX:40, HEIGHT:0};
MEIRO.Models.M19211.POS = {DIST:20, ROT_X:0.57, ROT_Y:0.3};
MEIRO.Models.M19211.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M19211.prototype.onAnimate = function(time)
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
MEIRO.Models.M19211.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Транслация с матрица</h1>';

	s += '<p>Демонстрация на транслация на група от точки чрез матрица <em>T</em>, в която е включен векторът на транслация <em>v(x,y,z)</em>.</p>';
	s += '<p><pre>       |1 0 0 x|<br>';
	s += 'T(v) = |0 1 0 y|<br>';
	s += '       |0 0 1 z|<br>';
	s += '       |0 0 0 1|</pre></p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M19211.prototype.onToggle = function(element)
{	
	var s = new THREE.Spherical(0.1,Math.PI/2+THREE.Math.randFloat(-0.4,0.2),2*Math.random()*Math.PI);
	var v = new THREE.Vector3().setFromSpherical(s);
	
	this.matrix.set(
		1, 0, 0, v.x,
		0, 1, 0, v.y,
		0, 0, 1, v.z,
		0, 0, 0, 1 );
		
	for (var i=0; i<this.n; i++)
	{
		this.points[i].position.set( THREE.Math.randFloat(-4,4), THREE.Math.randFloat(-2,2),THREE.Math.randFloat(-4,4) );
		this.trails[i].setFrom(this.points[i].position.clone());
	}

	this.stepsLeft = this.m;
	
	reanimate();
}
	