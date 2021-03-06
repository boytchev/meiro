
//	Основи на Компютърната Графика
//	Модел 08221 - Растеризация с целочислено деление
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M08221 = function M08221(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxy = new MEIRO.Axes2D([-20,20],[-10,10],false,false,false);

	this.x1 = -10;
	this.y1 = -7
	this.x2 = 15;
	this.y2 = 7;
	
	// точки
	this.pointA = new MEIRO.Cube(1);
	this.pointA.material = new THREE.MeshPhongMaterial({color:'black'});
	this.pointA.scale.set(0.9,0.9,0.2);
	
	this.pointB = new MEIRO.Cube(1);
	this.pointB.material = this.pointA.material;
	this.pointB.scale.set(0.9,0.9,0.2);
	
	// линия
	this.line = new MEIRO.Cube(1);
	this.line.material = new THREE.MeshBasicMaterial({color:'red'});
	this.line.scale.set(0.2,0.2,0.15);
	
	// пиксели
	this.n = 80;
	this.pixels = new THREE.Object3D();
	var material = new THREE.MeshBasicMaterial({color:'cornflowerblue'});
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Cube(0.8);
		p.scale.z = 0.1;
		p.material = material;
		this.pixels.add(p);
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();

	// сглобяване на целия модел
	this.image.add(this.oxy,this.pointA,this.pointB,this.line,this.pixels);
}

MEIRO.Models.M08221.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M08221.DIST = {MIN:10, MAX:40, HEIGHT:0};
MEIRO.Models.M08221.POS = {DIST:30, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M08221.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M08221.prototype.onAnimate = function(time)
{
	//reanimate();
}



// информатор на модела
MEIRO.Models.M08221.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Растеризация с целочислено деление</h1>';

	s += '<p>Растеризацията на отсечка с целочислено деление се извършва много бързо, понеже всички използвани операции са бързи &ndash; събиране, изваждане и деление на 2 на цели числа. Поради загубата на точност при работа с цели числа не всички растеризирани пиксели ще са по линията.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M08221.prototype.onToggle = function(element)
{
	this.x1 = THREE.Math.randInt(-19,-10);
	this.y1 = THREE.Math.randInt(-9,-5);
	this.x2 = THREE.Math.randInt(10,19);
	this.y2 = THREE.Math.randInt(5,9);

	// точки
	this.pointA.position.set(this.x1+0.5,this.y1+0.5,0);
	this.pointB.position.set(this.x2+0.5,this.y2+0.5,0);
	
	// линия
	this.line.position.set((this.x2+this.x1)/2+0.5,(this.y2+this.y1)/2+0.5,0);
	this.line.scale.x = this.pointA.position.distanceTo(this.pointB.position);
	this.line.rotation.z = Math.atan2(this.y2-this.y1,this.x2-this.x1);

	// пиксели
	for (var i=0; i<this.n; i++)
		this.pixels.children[i].visible = false;
		
	var n = 0;
	
	var that = this;
	(function self(x1,y1,x2,y2)
	{
		if (n>=that.n) return;
		
		var x = Math.floor((x1+x2)/2);
		var y = Math.floor((y1+y2)/2);
		
		var p = that.pixels.children[n]
		p.visible = true;
		p.position.set(x+0.5,y+0.5,0);
		n++;
		
		if (x>x1+1) self(x1,y1,x,y); 
		if (x<x2-1) self(x,y,x2,y2); 
	})(this.x1,this.y1,this.x2,this.y2);
	
	reanimate();
}
