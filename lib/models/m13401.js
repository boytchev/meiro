
//	Основи на Компютърната Графика
//	Модел 13401 - Прескачане на преграда
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13401 = function M13401(room)
{
	MEIRO.Model.apply(this, arguments);

	// платформа
	var platform = new MEIRO.Cube(1);
	platform.scale.set(12,0.1,12);
	platform.material = new THREE.MeshBasicMaterial({color:'cornflowerblue'});
	
	// преграда
	this.alpha = 1.57;
	var ball = new MEIRO.Sphere(0.3);
	this.bar = new MEIRO.Cylinder(0.1,5.5);
	this.bar.geometry = this.bar.geometry.clone();
	this.bar.geometry.translate(0,-0.5,0);
	this.bar.rotation.set(Math.PI/2,this.alpha,0);

	// тухли
	this.n = 30;
	this.brick = [];
	for (var i=0; i<this.n; i++)
	{
		var b = new MEIRO.Pawn(MEIRO.RandomColor());
		b.scale.set(0.3,0.3,0.3);
		b.offset = 2*Math.PI*Math.random();
		b.speed = 5+10*Math.random();
		b.radius = 2+3*Math.random();
		b.height = 0.1+1.0*Math.random();
		b.spread = 7*(1.8-b.height);
		b.material = new THREE.MeshPhongMaterial({color:'black',shininess:200});
		this.brick.push(b);
	}

	// сглобяване на целия модел
	this.image.add(platform,ball,this.bar);
	for (var i=0; i<this.n; i++)
	{
		this.image.add(this.brick[i]);
	}
}

MEIRO.Models.M13401.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13401.DIST = {MIN:5, MAX:20, HEIGHT:-0.5};
MEIRO.Models.M13401.POS = {DIST:10, ROT_X:0.1, ROT_Y:0.3};
MEIRO.Models.M13401.ROT_Y = {MIN:0, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13401.prototype.onAnimate = function(time)
{
	this.alpha -= 0.02;
	this.bar.rotation.y = this.alpha;
	this.bar.rotation.set(Math.PI/2,0,this.alpha+Math.PI/2);
	
	for (var i=0; i<this.n; i++)
	{
		var b = this.brick[i];
		var alpha = b.offset+rpm(time,b.speed)+Math.sin(time/200+i)/20;
		var dA = ((alpha-this.alpha)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
		if (Math.abs(dA)>Math.PI) dA -= 2*Math.PI;
		dA = THREE.Math.clamp(b.spread*dA,-Math.PI,Math.PI);
		var jump = b.height*(0.5+0.5*Math.cos(dA));
		b.position.set(b.radius*Math.cos(alpha),0.05+0.3/2+jump,b.radius*Math.sin(alpha));
		b.rotation.set(Math.sin(dA)/3,-alpha,0,'YXZ');
	}
	
	reanimate();	
}



// информатор на модела
MEIRO.Models.M13401.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Прескачане на преграда</h1>';

	s += '<p>Изчислението на скока се прави според разстоянието между обекта и преградата. Понеже и обектите, и преградата се въртят, то това разстояние е измерено в радиани.</p>';
	
	element.innerHTML = s;
}
