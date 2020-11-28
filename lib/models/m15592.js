
//	Основи на Компютърната Графика
//	Модел 15592 - Изпъкнала обвивка - алгоритъм "Опаковане на подарък"
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M15592 = function M15592(room)
{
	MEIRO.Model.apply(this, arguments);

	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	// N точки
	this.n = 20;
	this.points = [];
	this.lines = [];
	var material = new THREE.MeshPhongMaterial({color:'black'});
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Sphere(0.15);
		var a = THREE.Math.randFloat(0,2*Math.PI);
		var r = THREE.Math.randFloat(0,4);
		p.position.set(r*Math.cos(a),r*Math.sin(a),0);
		p.material = material;
		this.points.push(p);
	}
	var material = new THREE.LineBasicMaterial({color:'black'});
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Line();
		p.material = material;
		p.visible = false;
		this.lines.push(p);
	}
	this.lastLine = -1;

	// лъч
	this.ray = new MEIRO.Vector(new THREE.Vector3(0,1,0),6,'red',1);
	this.angle = 0;
	this.active = false;
	this.step = 0.002;
	this.startAlgorithm();
	this.firstRun = true;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	//this.onToggle(this.toggle);
	
	// сглобяване на целия модел
	this.image.add(this.screen,this.ray);
	for (var i=0; i<this.n; i++) this.image.add(this.points[i]);
	for (var i=0; i<this.n; i++) this.image.add(this.lines[i]);
}

MEIRO.Models.M15592.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M15592.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M15592.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M15592.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M15592.prototype.onAnimate = function(time)
{
	if (this.active)
	{
		// по няколко стъпки на цикъл
		for (var p=0; p<10; p++)
			this.continueAlgorithm();
	}
	
	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M15592.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Изпъкнала обвивка &ndash; алгоритъм "Опаковане на подарък"</h1>';

	s += '<p>Първата стъпка на този алгоритъм за намиране на изпъкнала обвивка е да се намери точка и права през нея такива, че всички останали точки да са от едната страна на тази права. След това правата се завърта около избраната точка, докато достигне някоя друга точка. После се завърта около другата точка и така докато не стигне до първоначалната точка.</p>';
	
	element.innerHTML = s;
}



MEIRO.Models.M15592.prototype.startAlgorithm = function()
{
	// намиране на най-дясната точка
	var leftmost = this.points[0].position;
	var j = 0;
	for (var i=0; i<this.n; i++)
	{
		this.points[i].startPoint = false;
		this.points[i].used = false;
		if (this.points[i].position.x<leftmost.x)
		{
			leftmost = this.points[i].position;
			j = i;
		}
	}
	
	this.points[j].startPoint = true;
	this.lastLine = -1;
	
	this.ray.visible = true;
	this.ray.setDirection(new THREE.Vector3(0,1,0));
	this.ray.position.copy(leftmost);
	this.angle = 0;
}


MEIRO.Models.M15592.prototype.continueAlgorithm = function()
{
	if (!this.active) return;
	
	// ориентирано лице x 2
	function area(a,b,c)
	{
		return a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y);
	}

	this.angle += this.step;
	this.ray.setDirection(new THREE.Vector3(Math.sin(this.angle),Math.cos(this.angle),0));
	
	// проверка дали се докосва някоя от точките
	for (var i=0; i<this.n; i++) if (!this.points[i].used)
	{
		var v = new THREE.Vector3().copy(this.ray.direction);
		v = v.sub(this.ray.position).multiplyScalar(1).add(this.ray.position);
		var a = area(this.ray.position,this.points[i].position,v);
		if (a<-EPS)
		{
			this.lastLine++;
			this.lines[this.lastLine].visible = true;
			this.lines[this.lastLine].setFromTo(this.ray.position.clone(),this.points[i].position.clone());
			
			this.ray.position.copy(this.points[i].position);

			this.points[i].used = true;
			
			if (this.points[i].startPoint)
			{
				this.active = false;
				this.ray.visible = false;
				this.toggle.setText('ОТНОВО');
				this.toggle.setIcon('images/random.png');
			}
			break;
		}
	}
	
	reanimate();
}


// превключвател на модела
MEIRO.Models.M15592.prototype.onToggle = function(element)
{
	for (var i=0; i<this.n; i++)
		this.lines[i].visible = false;
	
	var that = this;
	var from = {};
	var to = {};

	if (this.firstRun)
	{
		this.startAlgorithm();
		this.active = true;
		this.firstRun = false;
		reanimate();
		return;
	}
	
	for (var i=0; i<this.n; i++)
	{
		from['x'+i] = this.points[i].position.x;
		from['y'+i] = this.points[i].position.y;
		
		var a = THREE.Math.randFloat(0,2*Math.PI);
		var r = THREE.Math.randFloat(0,4);

		to['x'+i] = r*Math.cos(a);
		to['y'+i] = r*Math.sin(a);
	}

	new TWEEN.Tween(from)
		.to(to,500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
						that.ray.visible = false;
						for (var i=0; i<that.n; i++)
							that.points[i].position.set(this['x'+i],this['y'+i],0);
					})
		.onComplete( function(){
						that.startAlgorithm();
						that.active = true;
					})
		.start();
	reanimate();
}