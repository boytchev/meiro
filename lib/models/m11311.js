
//	Основи на Компютърната Графика
//	Модел 11311 - Движения с неточна синхронизация
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M11311 = function M11311(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-4,4],[0,3],[-4,4],false,false);
	
	// кубове
	this.cube1 = new MEIRO.Cube(2);
	this.cube1.position.set(0,1,0);
	this.cube1.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});
	
	this.cube2 = new MEIRO.Cube(1);
	this.cube2.position.set(0,2.5,0);
	this.cube2.material = new THREE.MeshLambertMaterial({color:'gold'});
	
	this.cube3 = new MEIRO.Cube(0.5);
	this.cube3.position.set(0,3.25,0);
	this.cube3.material = new THREE.MeshLambertMaterial({color:'tomato'});
	
	// време
	this.t = 0;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.cube1,this.cube2,this.cube3,this.oxyz);
}

MEIRO.Models.M11311.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M11311.DIST = {MIN:5, MAX:20, HEIGHT:-1};
MEIRO.Models.M11311.POS = {DIST:10, ROT_X:0.5, ROT_Y:0.5};
MEIRO.Models.M11311.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M11311.prototype.onAnimate = function(time)
{
	this.oxyz.rotateLabels();

	// хоризонтално движение
	if (this.t>50)
	{
		this.cube2.position.x += 1.5/100;
		this.t--;
		reanimate();
	}
	
	// вертикално движение
	if (50>=this.t && this.t>0)
	{
		this.cube2.position.y -= 2.0/50;
		this.cube3.position.y -= 1.0/50;
		this.t--;
		reanimate();
	}
}



// информатор на модела
MEIRO.Models.M11311.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движения с неточна синхронизация</h1>';

	s += '<p>Целта на този модел е да се плъзне средното кубче встрани и после да падне, а горното само да падне. Синхронизацията в модела не е пълна. Паданията на средното и горното кубче са по едно и също време, което не е физически правилно. Горното кубче трябва да почне да пада докато средното все още се плъзга встрани.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M11311.prototype.onToggle = function(element)
{
	this.t = 150;
	this.cube2.position.set(0,2.5,0);
	this.cube3.position.set(0,3.25,0);
	reanimate();
}
