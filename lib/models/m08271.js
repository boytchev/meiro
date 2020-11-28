
//	Основи на Компютърната Графика
//	Модел 08271 - Растеризация с единичен вектор
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M08271 = function M08271(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxy = new MEIRO.Axes2D([-20,20],[-10,10],false,false,false);

	// лупа
	this.zoom = new MEIRO.Cube(1);
	this.zoom.material = new THREE.MeshBasicMaterial({color:'white'});
	this.zoom.scale.set(3.9,3.9,0.1);
	this.zoom.position.set(-18,8,0);
	
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
	this.n = 41;
	this.pixels = new THREE.Object3D();
	var material = new THREE.MeshBasicMaterial({color:'cornflowerblue'});
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Cube(0.8);
		p.scale.z = 0.1;
		p.material = material;
		this.pixels.add(p);
	}
	
	// вектор
	this.vector = new MEIRO.Vector(new THREE.Vector3(),1,'red',1.5);
	this.vectorZoom = new MEIRO.Vector(new THREE.Vector3(),1,'red',3);
	this.vectorZoom.position.set(-20,6,0.1);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();

	// сглобяване на целия модел
	this.image.add(this.oxy,this.zoom,this.pointA,this.pointB,this.line,this.pixels,this.vector,this.vectorZoom);
}

MEIRO.Models.M08271.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M08271.DIST = {MIN:10, MAX:40, HEIGHT:0};
MEIRO.Models.M08271.POS = {DIST:30, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M08271.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M08271.prototype.onAnimate = function(time)
{
	//reanimate();
}



// информатор на модела
MEIRO.Models.M08271.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Растеризация с единичен вектор</h1>';

	s += '<p>Растеризацията на отсечка с единичен вектор обхожда с итерация пикселите от отсечката. Всеки пиксел се получава от предходния чрез събиране с вектор с максимална дължина 1. Тази растеризация е точна, не пропуска пиксели и не включва излишни пиксели, но не е най-бърза заради използването на реални числа.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M08271.prototype.onToggle = function(element)
{
	var x1 = THREE.Math.randInt(-19,-1);
	var y1 = THREE.Math.randInt(-9,-1);
	var x2 = THREE.Math.randInt(1,19);
	var y2 = THREE.Math.randInt(1,9);

	// точки
	this.pointA.position.set(x1+0.5,y1+0.5,0);
	this.pointB.position.set(x2+0.5,y2+0.5,0);
	
	// линия
	this.line.position.set((x2+x1)/2+0.5,(y2+y1)/2+0.5,0);
	this.line.scale.x = this.pointA.position.distanceTo(this.pointB.position);
	this.line.rotation.z = Math.atan2(y2-y1,x2-x1);

	// вектор
	var len = (y2-y1)/(x2-x1)*(y2-y1)/(x2-x1);
	if (len>1) len = 1/len;
	len = Math.sqrt(len+1);
	
	this.vector.setDirection(new THREE.Vector3(x2-x1,y2-y1,0));
	this.vector.setLength(len);
	this.vector.position.set(x1+1,y1-1,0);

	this.vectorZoom.setDirection(new THREE.Vector3(x2-x1,y2-y1,0));
	this.vectorZoom.setLength(4*len);
	
	// пиксели
	for (var i=0; i<this.n; i++)
		this.pixels.children[i].visible = false;
		
	var n = 0;
	var vx = 1;
	var vy = (y2-y1)/(x2-x1);
	if (vy>1) {vx=1/vy; vy=1;}
	var y = y1;
	
	for (var x=x1, y=y1; x<=x2 && y<=y2; x+=vx, y+=vy)
	{
		var p = this.pixels.children[n]
		p.visible = true;
		p.position.set(Math.round(x)+0.5,Math.round(y)+0.5,0);
		n++;
	}
	
	reanimate();
}
