
//	Основи на Компютърната Графика
//	Модел 08111 - Евклидово, манхатънско и максимално разстояние
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M08111 = function M08111(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxy = new MEIRO.Axes2D([-8,8],[-5,5]);

	// точки
	this.pointA = new MEIRO.Sphere(0.25);
	this.pointA.material = new THREE.MeshPhongMaterial({color:'black'});
	
	this.pointB = new MEIRO.Sphere(0.25);
	this.pointB.material = this.pointA.material;
	
	// елементи на обхващащи обекти
	this.frameBlock = new MEIRO.Cube(1);
	this.frameBlock.material = MEIRO.PRIMITIVE.STYLE.PLATE;

	this.frameDisk = new MEIRO.Cylinder(1,0.1);
	this.frameDisk.material = MEIRO.PRIMITIVE.STYLE.PLATE;
	this.frameDisk.rotation.set(Math.PI/2,0,0);
	
	var red = new THREE.MeshBasicMaterial({color:'red'});
	this.pathHor = new MEIRO.Cube(1);
	this.pathHor.material = red;
	this.pathVer = new MEIRO.Cube(1);
	this.pathVer.material = red;
	
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '', 'images/n123.png');
	this.toggle.state = -1;
	this.toggle.stateTexts = ['Евклидово','Махнатънско','Максимално'];
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.toggle.hide();
	this.onToggle();

	// сглобяване на целия модел
	this.image.add(this.oxy,this.pointA,this.pointB,this.frameBlock,this.frameDisk,this.pathHor,this.pathVer);
}

MEIRO.Models.M08111.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M08111.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M08111.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M08111.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M08111.prototype.onAnimate = function(time)
{
	// точки
	this.pointA.position.x = 4*Math.cos(rpm(time+1,3.2));
	this.pointA.position.y = 4*Math.sin(rpm(time+2,4.7));

	this.pointB.position.x = 4*Math.cos(rpm(time+3,4.2));
	this.pointB.position.y = 4*Math.sin(rpm(time+4,3.7));

	var dX = this.pointB.position.x-this.pointA.position.x; 
	var dY = this.pointB.position.y-this.pointA.position.y;
	
	// евклидово разстояние
	if (this.euclidean)
	{
		this.frameDisk.position.set(
			(this.pointB.position.x+this.pointA.position.x)/2,
			(this.pointB.position.y+this.pointA.position.y)/2,
			0 );
		var r = Math.sqrt(dX*dX+dY*dY)/2;
		this.frameDisk.scale.set(r,0.2,r);
		
		this.pathVer.visible = false;
		this.pathHor.visible = true;
		
		this.pathHor.position.copy(this.frameDisk.position);
		this.pathHor.scale.set(2*r,0.1,0.1);
		this.pathHor.rotation.set(0,0,Math.atan2(dY,dX));
	}
	else
	{
		this.pathHor.rotation.set(0,0,0);
	
		dX = Math.abs(dX); 
		dY = Math.abs(dY);

		this.pathHor.visible = this.manhattanian || dX>=dY;
		this.pathVer.visible = this.manhattanian || dX<dY;
		
		this.frameBlock.position.set(
			(this.pointB.position.x+this.pointA.position.x)/2,
			(this.pointB.position.y+this.pointA.position.y)/2,
			0 );
			
		if (this.manhattanian)
			this.frameBlock.scale.set(dX,dY,0.2);
		else
			this.frameBlock.scale.set(Math.max(dX,dY),Math.max(dX,dY),0.2);
		
		if (this.manhattanian || dX>=dY)
		{
			this.pathHor.position.set(
				(this.pointB.position.x+this.pointA.position.x)/2,
				this.pointB.position.y,
				0 );
			this.pathHor.scale.set(dX+0.05,0.1,0.1);
		}
		
		if (this.manhattanian || dX<dY)
		{
			this.pathVer.position.set(
				this.pointA.position.x,
				(this.pointB.position.y+this.pointA.position.y)/2,
				0 );
			this.pathVer.scale.set(0.1,dY+0.05,0.1);
			this.pathVer.rotation.set(0,0,0);
		}
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M08111.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Евклидово, манхатънско и максимално разстояние</h1>';

	s += '<p>Съществуват различни начини за измерване на разстояние между две точки, като всички те се използват в Компютърната Графика. Начините могат да бъдат демонстрирани чрез минималните фигури, които съдържат и двете точки.</p>';
	s += '<p><ul><li>евклидово разстояние &ndash; диаметърът на описаната окръжност;</li>';
	s += '<li>манхатънско разстояние &ndash; сумата от дължината и ширината на описания правоъгълник;</li>';
	s += '<li>максимално разстояние &ndash; дължината на страната на описания квадрат.</li></ul></p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M08111.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%3;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	
	this.euclidean = this.toggle.state==0;
	this.manhattanian = this.toggle.state==1;
	this.maximal = this.toggle.state==2;
	
	this.frameBlock.visible = !this.euclidean;
	this.frameDisk.visible = this.euclidean;
	this.pathVer.visible = this.manhattanian;
	
	reanimate();
}
