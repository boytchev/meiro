
//	Основи на Компютърната Графика
//	Модел 20491 - Матрица за централна проекция
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M20491 = function M20491(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-3,3],[-3,3],[0,10],true);
	
	this.n = options.lowpoly?10:20; // брой движещи се точки
	this.points = [];
	this.projections = [];
	this.trails = [];
	var material = new THREE.MeshPhongMaterial({color:'red',shininess:100});
	var geometry = new THREE.IcosahedronGeometry(0.1,1);
	for (var i=0; i<this.n; i++)
	{
		this.points.push(new THREE.Mesh(geometry,MEIRO.PRIMITIVE.STYLE.PAWN));
		this.points[i].ofs = 2*Math.PI*Math.random();
		this.trails.push(new MEIRO.Line());
		this.trails[i].material = MEIRO.PRIMITIVE.STYLE.GRID;
		this.projections.push(new THREE.Mesh(geometry,material));
		this.projections[i].scale.set(0.8,0.8,0.8);
	}
	
	var f = 3;
	
	// екран
	this.screen = new MEIRO.Cube(1);
	this.screen.scale.set(7,5,0.05);
	this.screen.material = new THREE.MeshNormalMaterial({transparent:true,opacity:0.5,side: THREE.DoubleSide});
	this.screen.position.z = f;
	this.screen.renderOrder = 1;
	
	this.matrix = new THREE.Matrix4();
	this.matrix.set(
		1, 0, 0,   0,
		0, 1, 0,   0,
		0, 0, 1,   0,
		0, 0, 1/f, 0 );
	
	// сглобяване на целия модел
	this.image.add(this.oxyz,this.screen);
	for (var i=0; i<this.n; i++)
		this.image.add(this.points[i],this.projections[i],this.trails[i]);
}

MEIRO.Models.M20491.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M20491.DIST = {MIN:5, MAX:20, HEIGHT:0, SHIFT_Z:-5};
MEIRO.Models.M20491.POS = {DIST:15, ROT_X:3, ROT_Y:0.3};
MEIRO.Models.M20491.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M20491.prototype.onAnimate = function(time)
{
	this.oxyz.rotateLabels();
	
	for (var i=0; i<this.n; i++)
	{
		this.points[i].position.set(4*Math.sin(i+rpm(time,13)+this.points[i].ofs),4*Math.sin(i/2+2+rpm(time,9)),8+2*Math.sin(i*i+1+rpm(time,11)-this.points[i].ofs));
		this.projections[i].position.copy(this.points[i].position);
		this.projections[i].position.applyMatrix4(this.matrix);
		this.trails[i].setTo(this.points[i].position);
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M20491.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Матрица за централна проекция</h1>';

	s += '<p>Ако центърът на централната проекция е в точката <em>(0,0,0)</em>, а проекционната равнина се намира на <em>z = f</em>, то матрицата <em>M</em> на проекцията е :</p>';
	s += '<p><pre>    |1  0  0  0|<br>M = |0  1  0  0|<br>    |0  0  1  0|<br>    |0  0 1/f 0|</pre></p>';
	
	element.innerHTML = s;
}