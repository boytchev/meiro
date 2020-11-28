
//	Основи на Компютърната Графика
//	Модел 23321 - Крива на Безие при n=1
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M23321 = function M23321(room)
{
	MEIRO.Model.apply(this, arguments);

	this.t = 0;
	this.speed = 0;
	
	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	// N точки
	this.n = 2;
	this.points = [];
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Sphere(0.15);
		p.material = MEIRO.PRIMITIVE.STYLE.PAWN;
		p.offset = THREE.Math.randFloat(0,2*Math.PI);
		p.speed = THREE.Math.randFloat(0.5,1.5);
		p.position.set(-5+10*i/(this.n-1),4*Math.sin(p.offset),0);
		this.points.push(p);
	}
	
	this.m = 5;
	this.line = new MEIRO.Polygon(this.m);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.screen,this.line);
	for (var i=0; i<this.n; i++) this.image.add(this.points[i]);
}

MEIRO.Models.M23321.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M23321.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M23321.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M23321.ROT_Y = {MIN:-0.1, MAX:0.7};


MEIRO.Models.M23321.prototype.bezierCurve = function(t)
{
	var B0 = 1*Math.pow(1-t,1)*Math.pow(t,0);
	var B1 = 1*Math.pow(1-t,0)*Math.pow(t,1);

	var p = new THREE.Vector3();
	p.addScaledVector(this.points[0].position,B0);
	p.addScaledVector(this.points[1].position,B1);
	return p;
}


// аниматор на модела
MEIRO.Models.M23321.prototype.onAnimate = function(time)
{
	this.t += this.speed;

	for (var i=0; i<this.n; i++)
	{
		var p = this.points[i];
		p.position.x = -5+10*i/(this.n-1)+2*Math.cos(2*p.offset+p.speed*rpm(this.t,140));
		p.position.y = 4*Math.sin(p.offset+p.speed*rpm(this.t,180));
	}
	
	for (var i=0; i<this.m; i++)
	{
		var p = this.bezierCurve(i/(this.m-1));
		this.line.getPoint(i).copy(p);
	}
	this.line.geometry.verticesNeedUpdate = true;
	
	if (this.speed>0.0001)
		reanimate();
		
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M23321.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Крива на Безие при n=1</h1>';

	s += '<p>Крива на Безие <em>Q</em> при <em>n=1</em> се определя от две точки и представлява отсечката между тях: <em>Q(t) = (1-t)P<sub>0</sub> + tP<sub>1</sub></em></p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M23321.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:this.speed})
		.to({k:this.speed>0.5?0:1},1000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.speed=this.k} )
		.start();
	reanimate();
}