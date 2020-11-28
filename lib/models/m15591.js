
//	Основи на Компютърната Графика
//	Модел 15591 - Изпъкнала обвивка - алгоритъм "Добавяне на точки"
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M15591 = function M15591(room)
{
	MEIRO.Model.apply(this, arguments);

	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	this.colorOn = new THREE.Color('black');
	this.colorOff = new THREE.Color('lightgray');
	
	// N точки
	this.n = 7;
	this.points = [];
	this.lines = [];
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Sphere(0.15);
		p.material = new THREE.MeshPhongMaterial({color:this.colorOn});;
		p.inner = 0;
		this.points.push(p);
	}
	for (var i=0; i<this.n+2; i++)
	{
		var p = new MEIRO.Line();
		p.material = new THREE.LineBasicMaterial({color:this.colorOn});;
		this.lines.push(p);
	}
	
	// точка
	this.point = new MEIRO.Sphere(0.25);
	this.point.material = new THREE.MeshPhongMaterial({color:'red'});
	
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle(this.toggle);
	
	// сглобяване на целия модел
	this.image.add(this.screen,this.point);
	for (var i=0; i<this.n; i++) this.image.add(this.points[i]);
	for (var i=0; i<this.n+2; i++) this.image.add(this.lines[i]);
}

MEIRO.Models.M15591.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M15591.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M15591.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M15591.ROT_Y = {MIN:-0.1, MAX:0.7};


MEIRO.Models.M15591.prototype.onObject = function()
{
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	var intersects = this.raycaster.intersectObject( this.screen.plate );
	if (intersects.length)
	{
		var p = intersects[0].point;
		p.sub(this.image.position).divide(this.image.scale);
		return p;
	}
	return undefined;
}


// интерактор на модела
MEIRO.Models.M15591.prototype.onDragMove = function()
{
	var p = this.onObject();
	if (p) this.point.position.copy(p);
}


// аниматор на модела
MEIRO.Models.M15591.prototype.onAnimate = function(time)
{
	// ориентирано лице x 2
	function area(a,b,c)
	{
		a = a.position;
		b = b.position;
		c = c.position;
		return a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y);
	}

	for (var i=0; i<this.n; i++)
	{
		this.points[i].inner = 0;
	}
	
	for (var i=0; i<this.n; i++)
	{
		var j = (i+1)%this.n;
		var a = area(this.point,this.points[i],this.points[j]);
		if (a<0)
		{
			this.points[i].inner++;
			this.points[j].inner++;
			this.lines[i].material.color = this.colorOff;
		}
		else
		{
			this.lines[i].material.color = this.colorOn;
		}
	}
	
	for (var i=0; i<this.n; i++)
	{
		var inside = this.points[i].inner>1;
		this.points[i].material.color = inside?this.colorOff:this.colorOn;
		this.points[i].scale.setScalar(inside?0.1:0.25);
	}
	
	var j = this.n;
	this.lines[j].setFromTo(this.point.position,this.point.position);
	this.lines[j+1].setFromTo(this.point.position,this.point.position);
	
	for (var i=0; i<this.n; i++)
		if (this.points[i].inner==1)
		{
			this.lines[j].setTo(this.points[i].position);
			j++
		}

	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M15591.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Изпъкнала обвивка &ndash; алгоритъм "Добавяне на точки"</h1>';

	s += '<p>При този алгоритъм за намиране на изпъкнала обвивка точките се обработват една по една. При добавянето на точка към текущата изпъкнала обвивка тя може да е вътрешна за нея (тогава отпада) или да е външна (тогава отпадат някои от другите точки и ръбове).</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M15591.prototype.onToggle = function(element)
{
	var that = this;
	var from = {};
	var to = {};

	var a = THREE.Math.randFloat(-1.5,1.5);
	for (var i=0; i<this.n; i++)
	{
		a += 1/this.n*2*Math.PI;
		from['x'+i] = this.points[i].position.x;
		from['y'+i] = this.points[i].position.y;
		var r = THREE.Math.randFloat(2.5,4);
		to['x'+i] = r*Math.cos(a);
		to['y'+i] = r*Math.sin(a);
	}

	new TWEEN.Tween(from)
		.to(to,500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
						for (var i=0; i<that.n; i++)
							that.points[i].position.set(this['x'+i],this['y'+i],0);
						for (var i=0; i<that.n; i++)
						{
							that.lines[i].setFrom(that.points[i].position);
							that.lines[i].setTo(that.points[(i+1)%that.n].position);
						}
					})
		.start();
	reanimate();
}