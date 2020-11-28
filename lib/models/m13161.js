
//	Основи на Компютърната Графика
//	Модел 13161 - Движение с тригонометрична плавност
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13161 = function M13161(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes2D([-8,8],[-6,6],false,false,false);
	this.oxyz.rotation.x = Math.PI/2;
	
	// кубове
	this.cube1 = new MEIRO.Cube(2);
	this.cube1.position.set(-6,1,3);
	this.cube1.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});

	this.cube2 = new MEIRO.Cube(2);
	this.cube2.position.set(-6,1,0);
	this.cube2.material = new THREE.MeshLambertMaterial({color:'red'});

	this.cube3 = new MEIRO.Cube(2);
	this.cube3.position.set(-6,1,-3);
	this.cube3.material = new THREE.MeshLambertMaterial({color:'red'});

	// време и посока
	this.T = 200;
	this.dir = -1;
	this.v0 = 0;
	this.v1 = 1;
	this.v2 = 0;
	
	// надписи
	this.label1 = new MEIRO.Label('тригонометрично',0.4,-2.00,1.75,0);
	this.label1.material = this.cube1.material;
	this.label1.position.copy(this.cube1.position);

	this.label2 = new MEIRO.Label('линейно',0.4,-1.25,1.75,0);
	this.label2.material = this.cube2.material;
	this.label2.position.copy(this.cube2.position);

	this.label3 = new MEIRO.Label('безплавно',0.4,-1.25,1.75,0);
	this.label3.material = this.cube3.material;
	this.label3.position.copy(this.cube3.position);

	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.cube1,this.cube2,this.cube3,this.oxyz,this.label1,this.label2,this.label3);
}

MEIRO.Models.M13161.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13161.DIST = {MIN:5, MAX:30, HEIGHT:-1};
MEIRO.Models.M13161.POS = {DIST:20, ROT_X:1.5, ROT_Y:0.4};
MEIRO.Models.M13161.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13161.prototype.onAnimate = function(time)
{
	this.label1.rotateLabel();
	this.label2.rotateLabel();
	this.label3.rotateLabel();
	
	if (this.t)
	{
		var t = 1-(this.t-1)/(this.T-1);
		
		// кубове
		if (t<=this.t1)
			v = 0.5*(this.v1+this.v0)+0.5*(this.v1-this.v0)*Math.cos((t-this.t1)/(this.t1-this.t0)*Math.PI);
		else
			v = 0.5*(this.v2+this.v1)+0.5*(this.v2-this.v1)*Math.cos((t-this.t2)/(this.t2-this.t1)*Math.PI);
		this.cube1.position.x += v;

		if (t<=this.t1)
			v = (this.v1-this.v0)/(this.t1-this.t0)*(t-this.t0)+this.v0;
		else
			v = (this.v2-this.v1)/(this.t2-this.t1)*(t-this.t1)+this.v1;
		this.cube2.position.x += v;

		this.cube3.position.x = 6*this.dir*(2*t-1);
		
		// надписи
		this.label1.position.copy(this.cube1.position);
		this.label2.position.copy(this.cube2.position);
		this.label3.position.copy(this.cube3.position);
		
		this.t--;
		reanimate();
	}
}



// информатор на модела
MEIRO.Models.M13161.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение с тригонометрична плавност</h1>';

	s += '<p>При движение с тригонометрична плавност промяната на параметър на движението следва фрагмент от синусоида. Подобна плавност се използва само когато по-бързите методи, като линейната и полиномиалната плавност, не дават задоволителен резултат.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M13161.prototype.onToggle = function(element)
{
	this.t = this.T;
	this.dir = -this.dir;
	this.v0 = 0;
	this.v1 = 0.1205*this.dir;
	this.v2 = 0;
	this.t0 = 0;
	this.t1 = 0.5;
	this.t2 = 1;
	reanimate();
}
