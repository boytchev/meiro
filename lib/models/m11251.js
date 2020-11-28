
//	Основи на Компютърната Графика
//	Модел 11251 - Движение с вектор
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M11251 = function M11251(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-10,10],[0,3],[-10,10],false,false);
	
	// куб
	this.cube = new MEIRO.Cube(1);
	this.cube.position.set(0,1/2,0);
	this.cube.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});
	
	// вектор
	this.vector = new MEIRO.Vector(new THREE.Vector3(),3,'red');
	this.vector.visible = false;
	
	// скорост и време
	this.v = new THREE.Vector3();
	this.t = 0;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.cube,this.oxyz,this.vector);
}

MEIRO.Models.M11251.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M11251.DIST = {MIN:5, MAX:20, HEIGHT:-1};
MEIRO.Models.M11251.POS = {DIST:10, ROT_X:0.5, ROT_Y:0.5};
MEIRO.Models.M11251.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M11251.prototype.onAnimate = function(time)
{
	this.oxyz.rotateLabels();
	
	if (this.t)
	{
		this.cube.position.add(this.v);
		this.t--;
		reanimate();
	}
}



// информатор на модела
MEIRO.Models.M11251.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение с вектор</h1>';

	s += '<p>Това е най-базовата реализация на движение &ndash; праволинейно и равномерно. Определя се от броя кадри и вектора на движението за един кадър.</p>';
	s += '<p>В конкретния модел скоростта е <em>|v| = 0.05</em> единици/кадър, продължителността на движение е <em>t = 200</em> кадъра, a изминатото разстояние е <em>S = |v|.t = 10</em> единици.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M11251.prototype.onToggle = function(element)
{
	this.v.setFromSpherical( new THREE.Spherical(0.05,Math.PI/2,Math.random()*2*Math.PI) );
	this.vector.setDirection(this.v);
	this.vector.position.set(0,1/2,0);
	this.vector.visible = true;

	this.t = 200;
	this.cube.position.set(0,0.5,0);
	reanimate();
}
