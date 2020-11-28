
//	Основи на Компютърната Графика
//	Модел 15593 - Изпъкнала обвивка - алгоритъм "Сканиране на Греъм"
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M15593 = function M15593(room)
{
	MEIRO.Model.apply(this, arguments);

	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	// N точки
	this.n = 15;
	this.points = [];
	this.lines = [];
	var material = new THREE.MeshPhongMaterial({color:'black'});
	var a,r;
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Sphere(0.15);

		if (i==0)
		{
			a = Math.PI + THREE.Math.randFloat(-0.2,0.2);
			r = 5;
			p.position.set(r*Math.cos(a),r*Math.sin(a),0);
		}
		else
		{
			a += ((2*Math.PI)/this.n)*(1+0*THREE.Math.randFloat(-0.2,0.2));
			r = 5;
			var x = r*Math.cos(a);
			var y = (r-1/2)*Math.sin(a);
			r = THREE.Math.randFloat(0,0.7);
			p.position.set(this.points[0].position.x*r+(1-r)*x,this.points[0].position.y*r+(1-r)*y,0);
		}

		p.material = material;
		this.points.push(p);
	}
	
	this.lineGood = new THREE.LineBasicMaterial({color:'black'});
	this.lineBad = new THREE.LineBasicMaterial({color:'red'});
	this.lineTest = new THREE.LineBasicMaterial({color:'cornflowerblue'});
	for (var i=0; i<2*this.n; i++)
	{
		var p = new MEIRO.Line();
		p.material = this.lineGood;
		p.visible = false;
		this.lines.push(p);
	}

	this.wrap = []; // индекси на точки в обвивката
	
	this.active = false;
	this.lastLine = -1;
	this.timer = 0;
	this.firstRun = true;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.screen);
	for (var i=0; i<this.n; i++) this.image.add(this.points[i]);
	for (var i=0; i<2*this.n; i++) this.image.add(this.lines[i]);
}

MEIRO.Models.M15593.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M15593.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M15593.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M15593.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M15593.prototype.onAnimate = function(time)
{
	if (this.active)
	{
		this.continueAlgorithm();
	}
	
	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M15593.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Изпъкнала обвивка &ndash; алгоритъм "Сканиране на Греъм"</h1>';

	s += '<p>При този алгоритъм изпъкналата обвивка се изгражда отсечка по отсечка. При всяко достигане на вдлъбнатост се елиминира съответната отсечка. В модела с червено са отбелязани премахнатите отсечки.</p>';
	
	element.innerHTML = s;
}



MEIRO.Models.M15593.prototype.startAlgorithm = function()
{
	this.timer = 0;
	
	// първи три точки
	this.wrap = [0,1,2]; // индекси на точки в обвивката

	this.lines[0].visible = true;
	this.lines[0].material = this.lineGood;
	this.lines[0].setFromTo( this.points[0].position, this.points[1].position );

	this.lines[1].visible = true;
	this.lines[1].material = this.lineTest;
	this.lines[1].setFromTo( this.points[1].position, this.points[2].position );
	
	this.lastLine = 1;
}


MEIRO.Models.M15593.prototype.continueAlgorithm = function()
{
	if (!this.active) return;

	this.timer++;
	if (this.timer%10) return;
	
	// ориентирано лице x 2
	function area(a,b,c)
	{
		return a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y);
	}

	// индекси на последните три точки от обвивката
	var first = this.wrap[this.wrap.length-3];
	var second = this.wrap[this.wrap.length-2];
	var third = this.wrap[this.wrap.length-1];

	if (third>=this.n)
	{
		this.active = false;
		return;
	}
		
	var a = area(this.points[first].position,this.points[second].position,this.points[third].position);
	
	
	if (a>=0)
	{
		// завой наляво - добре
		this.lines[this.lastLine].material = this.lineGood;
		this.wrap.push(third+1);	
		
		// нова отсечка
		this.lastLine++;
		this.lines[this.lastLine].visible = true;
		this.lines[this.lastLine].material = this.lineTest;
		this.lines[this.lastLine].setFromTo( this.points[third].position, this.points[ (third+1)%this.n].position );
		if (third+1>=this.n)
		{
			this.lines[this.lastLine].material = this.lineGood;
			this.toggle.setText('ОТНОВО');
			this.toggle.setIcon('images/random.png');
		}
	}
	else
	{
		// завой надясно - зле
		var line = this.lines[this.lastLine-1];
		line.material = this.lineBad;
		this.lines.splice(this.lastLine-1,1);
		this.lines.splice(0,0,line);
		this.lines[this.lastLine].setFrom( this.points[first].position );
		this.lines[this.lastLine].material = this.lineTest;
		this.wrap.splice(this.wrap.length-2,1);
	}
	
		
	
	reanimate();
}


// превключвател на модела
MEIRO.Models.M15593.prototype.onToggle = function(element)
{
	for (var i=0; i<2*this.n; i++)
	{
		this.lines[i].visible = false;
		this.lines[i].material = this.lineGood;
	}
	
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
	
	var a,r;
	for (var i=0; i<this.n; i++)
	{
		from['x'+i] = this.points[i].position.x;
		from['y'+i] = this.points[i].position.y;
		
		if (i==0)
		{
			a = Math.PI + THREE.Math.randFloat(-0.2,0.2);
			r = 5;
			to['x0'] = r*Math.cos(a);
			to['y0'] = r*Math.sin(a);
		}
		else
		{
			a += ((2*Math.PI)/this.n)*(1+0*THREE.Math.randFloat(-0.2,0.2));
			r = 5;
			var x = r*Math.cos(a);
			var y = (r-1)*Math.sin(a);
			r = THREE.Math.randFloat(0,0.7);
			to['x'+i] = to['x0']*r+(1-r)*x;
			to['y'+i] = to['y0']*r+(1-r)*y;
		}
	}

	new TWEEN.Tween(from)
		.to(to,500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
						for (var i=0; i<that.n; i++)
						{
							that.points[i].position.set(this['x'+i],this['y'+i],0);
						}
					})
		.onComplete( function(){
						that.startAlgorithm();
						that.active = true;
					})
		.start();
	reanimate();
}