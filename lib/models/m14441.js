
//	Основи на Компютърната Графика
//	Модел 14441 - Полет на осморки с грешен наклон
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M14441 = function M14441(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// топки
	var material = new THREE.MeshPhongMaterial({color:'orange',shininess:200});
	var cylA = new MEIRO.Cylinder(1,10);
	cylA.position.set(-5,0,0);
	cylA.material = material;
	var ballA1 = new MEIRO.Sphere(1);
	ballA1.position.set(-5,5,0);
	ballA1.material = material;
	var ballA2 = new MEIRO.Sphere(1);
	ballA2.position.set(-5,-5,0);
	ballA2.material = material;

	var cylB = new MEIRO.Cylinder(1,10);
	cylB.position.set(5,0,0);
	cylB.material = material;
	var ballB1 = new MEIRO.Sphere(1);
	ballB1.position.set(5,5,0);
	ballB1.material = material;
	var ballB2 = new MEIRO.Sphere(1);
	ballB2.position.set(5,-5,0);
	ballB2.material = material;

	this.basis = new MEIRO.Basis();
	this.basis.translate(0.07,0,0.08);
	this.basis.rotateY(-Math.PI/4);
	
	// самолетче
	this.plane = new MEIRO.PaperPlane('cornflowerblue');
	this.plane.matrixAutoUpdate = false;
	this.basis.apply(this.plane);
	this.time = 0;
	this.active = false;

	// светлина
	var light = new THREE.AmbientLight('white',0.5);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(light,cylA,ballA1,ballA2,cylB,ballB1,ballB2,this.plane);
}

MEIRO.Models.M14441.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M14441.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M14441.POS = {DIST:20, ROT_X:-0.9, ROT_Y:0.4};
MEIRO.Models.M14441.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M14441.prototype.onAnimate = function(time)
{	
	if (this.active)
	{
		this.time++;
		var angle = THREE.Math.degToRad(2.405*Math.sin(THREE.Math.degToRad(this.time)));
		this.basis.rotateY(angle);
		this.basis.translateX(0.1);
		
		this.basis.rotateX(0.023);
		this.basis.apply(this.plane);
		
		if (this.time>2000)
		{
			this.active = false;
			this.toggle.setText('ОТНОВО');
		}
		reanimate();
	}
}



// информатор на модела
MEIRO.Models.M14441.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Полет на осморки с грешен наклон</h1>';

	s += '<p>Моделирането на полет със завои и наклон може да доведе до грешна траектория. В случая, движението на осморка е чрез завой, но без наклон. Добавянето на наклон променя ориентацията и завоите не се правят в равнината на полета.</p>';

	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M14441.prototype.onToggle = function(element)
{
	this.time = -1;
	this.active = true;
	this.basis = new MEIRO.Basis();
	this.basis.translate(0.07,0,0.08);
	this.basis.rotateY(-Math.PI/4);
	this.basis.apply(this.plane);
	reanimate();
}