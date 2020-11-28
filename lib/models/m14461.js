
//	Основи на Компютърната Графика
//	Модел 14461 - Полет на осморки с наклон
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M14461 = function M14461(room, model)
{
	MEIRO.Model.apply(this, arguments);

	var material = new THREE.MeshPhongMaterial({color:'orange',shininess:200});
	var cylA = new MEIRO.Cylinder(0.7,10);
	cylA.position.set(-5,0,0);
	cylA.material = material;
	var ballA1 = new MEIRO.Sphere(0.7);
	ballA1.position.set(-5,5,0);
	ballA1.material = material;
	var ballA2 = new MEIRO.Sphere(0.7);
	ballA2.position.set(-5,-5,0);
	ballA2.material = material;

	var cylB = new MEIRO.Cylinder(0.7,10);
	cylB.position.set(5,0,0);
	cylB.material = material;
	var ballB1 = new MEIRO.Sphere(0.7);
	ballB1.position.set(5,5,0);
	ballB1.material = material;
	var ballB2 = new MEIRO.Sphere(0.7);
	ballB2.position.set(5,-5,0);
	ballB2.material = material;

	this.n = 22;
	this.basis = [];
	this.plane = [];
		
	for (var i=0; i<this.n; i++)
	{
		this.basis.push(new MEIRO.Basis());
		this.basis[i].translate(0.5,0,0.08);
		this.basis[i].rotateY(-Math.PI/4);
	
		// самолетче
		this.plane.push(new MEIRO.PaperPlane(MEIRO.RandomColor()));
		this.plane[i].matrixAutoUpdate = false;
		this.basis[i].apply(this.plane[i]);
	}
	this.time = -1;

	var light = new THREE.AmbientLight('white',0.5);

	// сглобяване на целия модел
	this.image.add(light,cylA,ballA1,ballA2,cylB,ballB1,ballB2,this.plane);
	for (var i=0; i<this.n; i++)
		this.image.add(this.plane[i]);
}

MEIRO.Models.M14461.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M14461.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M14461.POS = {DIST:15, ROT_X:-0.9, ROT_Y:0};
MEIRO.Models.M14461.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M14461.prototype.onAnimate = function(time)
{	
	this.time++;

	for (var i=0; i<Math.min(this.time>>3,this.n); i++)
	{
		var angle = THREE.Math.degToRad(2.405*Math.sin(THREE.Math.degToRad(this.time-(i<<3))));

		this.basis[i].rotateY(angle);
		this.basis[i].translateX(0.1);
		
		var x = this.basis[i].x.clone();
		var y = this.basis[i].y.clone();
		var z = this.basis[i].z.clone();
		this.basis[i].rotateX(-20*angle);
		this.basis[i].o.y = 2*Math.sin(rpm(time,2))*Math.sin(rpm(time,10+i/2)+i*i);
		this.basis[i].apply(this.plane[i]);
		this.basis[i].o.y = 0;
		this.basis[i].x = x;
		this.basis[i].y = y;
		this.basis[i].z = z;
	}
	reanimate();
}



// информатор на модела
MEIRO.Models.M14461.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Полет на осморки с грешен наклон</h1>';

	s += '<p>Моделирането на полет със завои и наклон може да доведе до грешна траектория. В случая, движението на осморка е чрез завой, но без наклон. Добавянето на наклон променя ориентацията и завоите не се правят в равнината на полета.</p>';

	element.innerHTML = s;
}
