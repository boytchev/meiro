
//	Основи на Компютърната Графика
//	Модел 08401 - Алгоритъм на Брезенхам
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M08401 = function M08401(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxy = new MEIRO.Axes2D([-20,20],[-10,10],false,false,false);

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
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle();

	// сглобяване на целия модел
	this.image.add(this.oxy,this.pointA,this.pointB,this.line,this.pixels);
}

MEIRO.Models.M08401.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M08401.DIST = {MIN:10, MAX:40, HEIGHT:0};
MEIRO.Models.M08401.POS = {DIST:30, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M08401.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M08401.prototype.onAnimate = function(time)
{
	//reanimate();
}



// информатор на модела
MEIRO.Models.M08401.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Алгоритъм на Брезенхам</h1>';

	s += '<p>Растеризацията на отсечка чрез слгоритъма на Брезенхам обхожда с итерация пикселите. Всеки пиксел се получава от предходния чрез елементарни целочислени операции. Тази растеризация е точна и бърза.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M08401.prototype.onToggle = function(element)
{
	var x1 = THREE.Math.randInt(-19,-10);
	var y1 = THREE.Math.randInt(-9,-1);
	var x2 = THREE.Math.randInt(10,19);
	var y2 = THREE.Math.randInt(1,9);

	// точки
	this.pointA.position.set(x1+0.5,y1+0.5,0);
	this.pointB.position.set(x2+0.5,y2+0.5,0);
	
	// линия
	this.line.position.set((x2+x1)/2+0.5,(y2+y1)/2+0.5,0);
	this.line.scale.x = this.pointA.position.distanceTo(this.pointB.position);
	this.line.rotation.z = Math.atan2(y2-y1,x2-x1);

	// пиксели
	for (var i=0; i<this.n; i++)
		this.pixels.children[i].visible = false;
		
	var dX = x2-x1;
	var dY = y2-y1;
	
	var d = 2*dY-dX;
	for( var i=0; i<dX; i++ )
	{
		var p = this.pixels.children[i]
		p.visible = true;
		p.position.set(x1+0.5,y1+0.5,0);
		
		if( d<0 )
		{
			x1++;
			d = d+2*dY;
		}
		else
		{
			x1++;
			y1++;
			d = d+2*dY-2*dX;
		}
	}
	
	reanimate();
}
