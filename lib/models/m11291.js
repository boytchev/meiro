
//	Основи на Компютърната Графика
//	Модел 11291 - Плъзгане и падане III
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M11291 = function M11291(room)
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
	
	// време
	this.t = 0;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.cube1,this.cube2,this.oxyz);
}

MEIRO.Models.M11291.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M11291.DIST = {MIN:5, MAX:20, HEIGHT:-1};
MEIRO.Models.M11291.POS = {DIST:10, ROT_X:0.5, ROT_Y:0.5};
MEIRO.Models.M11291.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M11291.prototype.onAnimate = function(time)
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
		this.t--;
		reanimate();
	}
}



// информатор на модела
MEIRO.Models.M11291.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Плъзгане и падане III</h1>';

	s += '<p>Целта на този модел е да се плъзне горното кубче встрани и после да падне, като скоростта на падане е по-голяма от тази на плъзгане. Изчислявайки хоризонталното и вертикалното разстояние за придвижване и определяйки броя кадри за всяко от тях, позволява да се пресметнат скоростите, така че падането да е точно покрай стената и точно до земята.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M11291.prototype.onToggle = function(element)
{
	this.t = 150;
	this.cube2.position.set(0,2.5,0);
	reanimate();
}
