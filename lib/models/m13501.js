
//	Основи на Компютърната Графика
//	Модел 13501 - Поклащане на трева в едно направление
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13501 = function M13501(room)
{
	MEIRO.Model.apply(this, arguments);

	// трева
	this.curve = new THREE.QuadraticBezierCurve3(
		new THREE.Vector3(0,0,0),
		new THREE.Vector3(0,1/2,0),
		new THREE.Vector3(0,1,0)
	);
	this.n = options.lowpoly?40:500; // брой тревички
	this.m = options.lowpoly?4:16; // брой възли на една тревичка
	var material = new THREE.LineBasicMaterial({color:'black'});

	this.root = [];
	this.offset = [];
	for (var i=0; i<this.n; i++)
	{
		var x = 4*THREE.Math.randFloat(-1,1);
		var z = Math.sqrt(16-x*x)*THREE.Math.randFloat(-1,1);
		var p = new THREE.Vector3(x,0,z);
		this.root[i] = p;
		this.offset[i] = Math.sin(2*p.x);
	}
	
	var geometry = new THREE.Geometry();
	for (var i=0; i<this.n*this.m; i++)
		geometry.vertices.push(new THREE.Vector3());
	this.grass = new THREE.LineSegments(geometry,material);
	
	// сглобяване на целия модел
	this.image.add(this.grass);
}

MEIRO.Models.M13501.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13501.DIST = {MIN:5, MAX:20, HEIGHT:-1};
MEIRO.Models.M13501.POS = {DIST:10, ROT_X:0.1, ROT_Y:0.4};
MEIRO.Models.M13501.ROT_Y = {MIN:0, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13501.prototype.onAnimate = function(time)
{
	var t = 0;
	for (var i=0; i<this.n; i++)
	{
		this.curve.v2.x = 0.5*Math.sin(rpm(time,12)+this.offset[i]);
		for (var j=0; j<this.m; j++)
		{
			var u = Math.round(0.25+0.5*j)/(this.m/2-1);
			this.grass.geometry.vertices[t].copy(this.curve.getPoint(u));
			this.grass.geometry.vertices[t].add(this.root[i]);
			t++;
		}
	}
	this.grass.geometry.verticesNeedUpdate = true;
	reanimate();	
}



// информатор на модела
MEIRO.Models.M13501.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Поклащане на трева в едно направление</h1>';

	s += '<p>Всяка тревичка е гъвкава отсечка, на която горният край се поклаща напред-назад. Степенна на поклащане се изчислява от невидима повърхност със симулирани вълни. Поради едномерността на поклащането се виждат вълни от тревички.</p>';
	
	element.innerHTML = s;
}