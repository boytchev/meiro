
//	Основи на Компютърната Графика
//	Модел 23241 - Полиномиална интерполация
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M23241 = function M23241(room)
{
	MEIRO.Model.apply(this, arguments);

	this.t = 0;
	this.speed = 0;
	
	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	// N точки
	this.n = 7;
	this.points = [];
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Sphere(0.15);
		p.material = MEIRO.PRIMITIVE.STYLE.PAWN;
		p.offset = THREE.Math.randFloat(0,2*Math.PI);
		p.speed = THREE.Math.randFloat(0.8,1.2);
		p.position.set(-(this.n-1)+2*i,4*Math.sin(p.offset),0);
		this.points.push(p);
	}
	
	this.m = 150;
	this.line = new MEIRO.Polygon(this.m);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.screen,this.line);
	for (var i=0; i<this.n; i++) this.image.add(this.points[i]);
}

MEIRO.Models.M23241.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M23241.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M23241.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M23241.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M23241.prototype.onAnimate = function(time)
{
	this.t += this.speed;

	for (var i=0; i<this.n; i++)
	{
		var p = this.points[i];
		p.position.x = -(this.n-1)+2*i+0.9*Math.cos(2*p.offset+p.speed*rpm(this.t,80));
		p.position.y = 4*Math.sin(p.offset+p.speed*rpm(this.t,60));
	}
	
	for (var i=0; i<this.m; i++)
	{
		var x = this.points[0].position.x + (this.points[this.n-1].position.x-this.points[0].position.x)*(i/(this.m-1)); 
		var y = 0;
		for (var j=0; j<this.n; j++ )
		{
			var p = 1;
			for (var k=0; k<this.n; k++ )
				if( k!=j )
					p = p*(x-this.points[k].position.x)/(this.points[j].position.x-this.points[k].position.x);
			y = y+this.points[j].position.y*p;
		}
		
		var p = this.line.getPoint(i);
		p.set(x,y,0);
		this.line.geometry.verticesNeedUpdate = true;
	}
	
	if (this.speed>0.0001)
		reanimate();
		
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M23241.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Полиномиална интерполация</h1>';

	s += '<p>За всеки набор от <em>n+1</em> точки с различни координати по <em>x</em> може да се намери еднозначно полином от степен <em>n</em>, чиято графика минава през точките. Недостатък на получената крива е наличието на разсейки &ndash; промяна само в една от точките може да изкриви значително кривата.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M23241.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:this.speed})
		.to({k:this.speed>0.5?0:1},1000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.speed=this.k} )
		.start();
	reanimate();
}