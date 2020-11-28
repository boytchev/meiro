
//	Основи на Компютърната Графика
//	Модел 13273 - Топане с отблъскване
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13273 = function M13273(room)
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
		b.v = new THREE.Vector3().setFromSpherical(new THREE.Spherical(0.03,Math.PI/2,2*Math.PI*Math.random()));
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

MEIRO.Models.M13273.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13273.DIST = {MIN:5, MAX:9, HEIGHT:0};
MEIRO.Models.M13273.POS = {DIST:7, ROT_X:0.1, ROT_Y:0.3};
MEIRO.Models.M13273.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13273.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		var b = this.ball[i];
		var p = b.position;
		var v = b.v;
		p.add(v);
		if (Math.abs(p.x)>2-0.2)
		{
			v.x = -v.x;
			p.x += v.x;
		}
		if (Math.abs(p.z)>2-0.2)
		{
			v.z = -v.z;
			p.z += v.z;
		}
		p.y = -(2-0.2)+b.height*Math.abs(Math.sin(rpm(time,b.speed)+b.offset));
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M13273.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Топане с отблъскване</h1>';

	s += '<p>Това движение се създава като комбинация от две движения. Хоризонтално по осите <em>X</em> и <em>Z</em> движението е отблъскване от стени. Вертикално по оста <em>Y</em> движението е симулирано топане.</p>';
	
	element.innerHTML = s;
}
