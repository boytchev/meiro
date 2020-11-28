
//	Основи на Компютърната Графика
//	Модел 13272 - Симулиране на топане
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13272 = function M13272(room)
{
	MEIRO.Model.apply(this, arguments);

	// куб
	var cube = new MEIRO.Cube(4);
	cube.material = MEIRO.PRIMITIVE.STYLE.PLATE.clone();
	cube.material.sides = THREE.BackSides;
	var edges = new THREE.EdgesGeometry(cube.geometry);
	var frame = new THREE.LineSegments(edges,MEIRO.PRIMITIVE.STYLE.GRID);
	frame.scale.set(4,4,4);
	
	// топки
	this.n = 20;
	this.ball = [];
	for (var i=0; i<this.n; i++)
	{
		var b = new MEIRO.Sphere(0.2);
		b.position.set(THREE.Math.randFloat(-1.5,1.5),THREE.Math.randFloat(-1.5,1.5),THREE.Math.randFloat(-1.5,1.5));
		b.material = new THREE.MeshPhongMaterial({color:MEIRO.RandomColor(),shininess:150});
		b.offset = 2*Math.PI*Math.random();
		b.height = 3-0.4+Math.random();
		b.speed = 12+6*Math.random();
		this.ball.push(b);
	}
	
	// сглобяване на целия модел
	this.image.add(cube,frame);
	for (var i=0; i<this.n; i++)
	{
		this.image.add(this.ball[i]);
	}
}

MEIRO.Models.M13272.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13272.DIST = {MIN:5, MAX:9, HEIGHT:0};
MEIRO.Models.M13272.POS = {DIST:7, ROT_X:0.1, ROT_Y:0.3};
MEIRO.Models.M13272.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13272.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		var b = this.ball[i];
		
		b.position.y = -(2-0.2)+b.height*Math.abs(Math.sin(rpm(time,b.speed)+b.offset));
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M13272.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Симулиране на топане</h1>';

	s += '<p>Топането е движение породено от гравитация. Когато не е нужен точен модел, топането може да се апроксимира с ограничена от модул синусоида &ndash; <em>y = a|sin(bt+c)|</em>.</p>';
	
	element.innerHTML = s;
}
