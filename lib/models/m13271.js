
//	Основи на Компютърната Графика
//	Модел 13271 - Отблъскване от стени
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13271 = function M13271(room)
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
		b.v = new THREE.Vector3().setFromSpherical(new THREE.Spherical(0.05,2*Math.PI*Math.random(),2*Math.PI*Math.random()));
		this.ball.push(b);
	}
	
	// сглобяване на целия модел
	this.image.add(cube,frame);
	for (var i=0; i<this.n; i++)
	{
		this.image.add(this.ball[i]);
	}
}

MEIRO.Models.M13271.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13271.DIST = {MIN:5, MAX:9, HEIGHT:0};
MEIRO.Models.M13271.POS = {DIST:7, ROT_X:0.1, ROT_Y:0.3};
MEIRO.Models.M13271.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13271.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		var p = this.ball[i].position;
		var v = this.ball[i].v;
		p.add(v);
		if (Math.abs(p.x)>2-0.2)
		{
			v.x = -v.x;
			p.x += v.x;
		}
		if (Math.abs(p.y)>2-0.2)
		{
			v.y = -v.y;
			p.y += v.y;
		}
		if (Math.abs(p.z)>2-0.2)
		{
			v.z = -v.z;
			p.z += v.z;
		}
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M13271.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Отблъскване от стени</h1>';

	s += '<p>Отблъскването от стена изисква първо да се знае кога е станал сблъсък, каква е посоката на движение и каква е ориентацията на стената в токчата на сблъсъка. Когато стените са успоредни на координатните стени, отблъскването се резлизира като се смени знака на тази кордината на скоростта, по която имаме пресичане на стена. Например, ако има стена на <em>y = 2</em> и обект със скорост <em>v = (1,2,3)</em> се удря в нея, то след удара скоростта на обекта ще бъде <em>v = (1,-2,3)</em>.</p>';
	
	element.innerHTML = s;
}
