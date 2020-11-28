
//	Основи на Компютърната Графика
//	Модел 13082 - Движение с линейна плавност
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13082 = function M13082(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes2D([-8,8],[-4,4],false,false,false);
	this.oxyz.rotation.x = Math.PI/2;
	
	// кубове
	this.cube1 = new MEIRO.Cube(2);
	this.cube1.position.set(-6,1,2);
	this.cube1.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});

	this.cube2 = new MEIRO.Cube(2);
	this.cube2.position.set(-6,1,-2);
	this.cube2.material = new THREE.MeshLambertMaterial({color:'red'});

	// време и посока
	this.T = 200;
	this.dir = -1;
	this.v0 = 0;
	this.v1 = 1;
	this.v2 = 0;
	
	// надписи
	this.label1 = new MEIRO.Label('линейно',0.4,-1.00,1.75,0);
	this.label1.material = this.cube1.material;
	this.label1.position.copy(this.cube1.position);

	this.label2 = new MEIRO.Label('безплавно',0.4,-1.25,1.75,0);
	this.label2.material = this.cube2.material;
	this.label2.position.copy(this.cube2.position);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.cube1,this.cube2,this.oxyz,this.label1,this.label2);
}

MEIRO.Models.M13082.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13082.DIST = {MIN:5, MAX:30, HEIGHT:-1};
MEIRO.Models.M13082.POS = {DIST:20, ROT_X:1.5, ROT_Y:0.4};
MEIRO.Models.M13082.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13082.prototype.onAnimate = function(time)
{
	this.label1.rotateLabel();
	this.label2.rotateLabel();
	
	if (this.t)
	{
		var t = 1-(this.t-1)/(this.T-1);
		
		// кубове
		if (t<=this.t1)
			v = (this.v1-this.v0)/(this.t1-this.t0)*(t-this.t0)+this.v0;
		else
			v = (this.v2-this.v1)/(this.t2-this.t1)*(t-this.t1)+this.v1;
		this.cube1.position.x += v;

		this.cube2.position.x = 6*this.dir*(2*t-1);
		
		// надписи
		this.label1.position.copy(this.cube1.position);
		this.label2.position.copy(this.cube2.position);
		
		this.t--;
		reanimate();
	}
}



// информатор на модела
MEIRO.Models.M13082.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение с линейна плавност</h1>';

	s += '<p>При движение с линейна плавност промяната на параметър на движението се извършва линейно. Това не означава, че самото движение е линейно или се извършва с линейна скорост.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M13082.prototype.onToggle = function(element)
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
