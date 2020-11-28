
//	Основи на Компютърната Графика
//	Модел 12222 - Движение по сферичен лабиринт
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12222 = function M12222(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.axes = new MEIRO.AxesSpherical(6);
	
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
	this.b = 1;
	this.targetA = 2;
	this.targetB = 1;
	this.dir = true;
	
	// сглобяване на целия модел
	this.image.add(this.axes,this.points);
}

MEIRO.Models.M12222.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12222.DIST = {MIN:15, MAX:30, HEIGHT:0};
MEIRO.Models.M12222.POS = {DIST:20, ROT_X:1, ROT_Y:0.4};
MEIRO.Models.M12222.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12222.prototype.onAnimate = function(time)
{
	this.axes.rotateLabels();
	
	this.i = (this.i+1)%this.n;

	var sA = this.targetA-this.a;
	var sB = this.targetB-this.b;
	
	this.a += Math.sign(sA)*this.step/this.r;
	this.b += Math.sign(sB)*this.step/this.r;

	if (Math.abs(sB)<this.step && Math.abs(sA)<this.step)
	{
		this.dir = !this.dir;
		if (this.dir)
		{
			this.targetB = this.b;
			do
				this.targetA = THREE.Math.randFloat(0,2*Math.PI);
			while (Math.abs(this.targetA-this.a)<0.3)
		}
		else
		{
			this.targetA = this.a;
			do
				this.targetB = THREE.Math.randFloat(-1.4,1.4);	
			while (Math.abs(this.targetB-this.b)<0.3)
		}
	}
	
	this.points.geometry.vertices[this.i].set(
		this.r*Math.cos(this.a)*Math.cos(this.b),
		this.r*Math.sin(this.b),
		this.r*Math.sin(this.a)*Math.cos(this.b),
	);
	this.points.geometry.verticesNeedUpdate = true;	
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M12222.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение по сферичен лабиринт</h1>';

	s += '<p>При сферичен лабиринт е удобно да се работи със сферични координати, като радиусът е константа, а двата ъгъла са параметри &ndash; 2D координати на точка от повърхността на сферата.</p>';
	
	element.innerHTML = s;
}
