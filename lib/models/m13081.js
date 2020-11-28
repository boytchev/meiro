
//	Основи на Компютърната Графика
//	Модел 13081 - Движение без плавност
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13081 = function M13081(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes2D([-8,8],[-2,2],false,false,false);
	this.oxyz.rotation.x = Math.PI/2;
	
	// куб
	this.cube = new MEIRO.Cube(2);
	this.cube.position.set(-6,1,0);
	this.cube.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});

	// време и посока
	this.T = 200;
	this.dir = -1;
	
	// надпис
	this.label = new MEIRO.Label('безплавно',0.4,-1.25,1.75,0);
	this.label.material = this.cube.material;
	this.label.position.copy(this.cube.position);
	
	// бутон за превключване
	var that = this; 
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.cube,this.oxyz,this.label);
}

MEIRO.Models.M13081.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13081.DIST = {MIN:5, MAX:30, HEIGHT:-1};
MEIRO.Models.M13081.POS = {DIST:20, ROT_X:1.5, ROT_Y:0.4};
MEIRO.Models.M13081.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13081.prototype.onAnimate = function(time)
{
	this.label.rotateLabel();
	
	if (this.t)
	{
		var t = 1-(this.t-1)/(this.T-1);

		this.cube.position.x = 6*this.dir*(2*t-1);
		this.label.position.copy(this.cube.position);
		
		this.t--;
		reanimate();
	}
}



// информатор на модела
MEIRO.Models.M13081.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение без плавност</h1>';

	s += '<p>При движение без плавност промяната в движението, като тръгване или спиране, настъпва рязко. Подобно поведение се използва при реализиране на резки удари или сбъсаци.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M13081.prototype.onToggle = function(element)
{
	this.t = this.T;
	this.dir = -this.dir;
	reanimate();
}
