
//	Основи на Компютърната Графика
//	Модел 12142 - Слънце, земя и рояк луни
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12142 = function M12142(room)
{
	MEIRO.Model.apply(this, arguments);

	// сфери
	this.sun = new MEIRO.Sphere(1);
	this.sun.material = new THREE.MeshLambertMaterial({color:'gold'});

	this.planet = new MEIRO.Sphere(1/2);
	this.planet.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});

	this.n = 15;
	this.moon = [];
	material = new THREE.MeshLambertMaterial({color:'lightgray'});
	for (var i=0; i<this.n; i++)
	{
		var m = new MEIRO.Sphere(THREE.Math.randFloat(1/16,1/8));
		m.material = material;
		m.offset = Math.random()*2*Math.PI;
		m.speed = 40/(0.7+i/10);
		this.moon.push(m);
	}

	// сглобяване на целия модел
	this.image.add(this.sun,this.planet);
	for (var i=0; i<this.n; i++)
		this.image.add(this.moon[i]);
}

MEIRO.Models.M12142.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12142.DIST = {MIN:7, MAX:20, HEIGHT:0};
MEIRO.Models.M12142.POS = {DIST:12, ROT_X:0, ROT_Y:0.2};
MEIRO.Models.M12142.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12142.prototype.onAnimate = function(time)
{
	var angle = rpm(time,3);
	this.planet.position.set(4*Math.cos(angle),0,4*Math.sin(angle));

	for (var i=0; i<this.n; i++)
	{
		var moon = this.moon[i];
		var angle = rpm(time,moon.speed)+moon.offset;
		var r = 0.7+i/10;
		moon.position.set(r*Math.cos(angle),Math.sin(angle+i)/5,r*Math.sin(angle));
		moon.position.add(this.planet.position);
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M12142.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Слънце, земя и рояк луни</h1>';

	s += '<p>Този модел на слънце, земя и луни използва вложено въртене. Движението на всяка луна е по собствена кръгова траектория към която се добавя текущото положение на планетата, около която се върти.</p>';
	
	element.innerHTML = s;
}