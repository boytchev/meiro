
//	Основи на Компютърната Графика
//	Модел 12221 - Движение в кръгов лабиринт
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12221 = function M12221(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.axes = new MEIRO.AxesPolar(6);
	
	// точки
	this.step = 0.08;
	this.n = 2000;
	this.i = 0;
	var geom = new THREE.Geometry;
	
	sprite = new THREE.TextureLoader().load( 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIBAMAAAA2IaO4AAAAD1BMVEUAAAAAAAAAAAAAAAAAAABPDueNAAAABHRSTlMA1YAa/jDwcAAAAB9JREFUCNdjAANmRSEDBiYXFwUGRhcXATAB5kIkQAAAQZEDU/MthFgAAAAASUVORK5CYII=' );
	
	for (var i=0; i<this.n; i++) geom.vertices.push(new THREE.Vector3(0,1000,0));
	this.points = new THREE.Points(geom,new THREE.PointsMaterial({color:'red',size:0.07,sizeAttenuation: true, map: sprite, transparent:true, depthTest:false}));
	
	
	this.r = 5;
	this.a = 0;
	this.targetR = 5;
	this.targetA = 2;
	this.dir = true;
	
	// сглобяване на целия модел
	this.image.add(this.axes,this.points);
}

MEIRO.Models.M12221.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12221.DIST = {MIN:15, MAX:30, HEIGHT:0};
MEIRO.Models.M12221.POS = {DIST:20, ROT_X:Math.PI/2, ROT_Y:0.1};
MEIRO.Models.M12221.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12221.prototype.onAnimate = function(time)
{
	this.axes.rotateLabels();
	
	this.i = (this.i+1)%this.n;

	var sR = this.targetR-this.r;
	var sA = this.targetA-this.a;
	
	this.r += Math.sign(sR)*this.step;
	this.a += Math.sign(sA)*this.step/this.r;

	if (Math.abs(sR)<this.step && Math.abs(sA)<this.step)
	{
		this.dir = !this.dir;
		if (this.dir)
		{
			this.targetR = this.r;
			do
				this.targetA = THREE.Math.randFloat(0,2*Math.PI);
			while (Math.abs(this.targetA-this.a)<0.3)
		}
		else
		{
			this.targetA = this.a;
			do
				this.targetR = THREE.Math.randFloat(1,5);	
			while (Math.abs(this.targetR-this.r)<0.3)
		}
	}
	
	this.points.geometry.vertices[this.i].set(
		this.r*Math.cos(this.a),
		this.r*Math.sin(this.a),
		0
	);
	this.points.geometry.verticesNeedUpdate = true;	
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M12221.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение в кръгов лабиринт</h1>';

	s += '<p>При кръгов лабиринт е удобно да се работи с полярни координати. При следване на координатните направления движенията са само два вида: дъги от концентрични окръжности и радиални отсечки. Дъгите са при променлив ъгъл и константно разстояние, а отсечките &ndash; при константен ъгъл и променливо разстояние.</p>';
	
	element.innerHTML = s;
}
