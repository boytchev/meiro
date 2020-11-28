
//	Основи на Компютърната Графика
//	Модел 11512 - Бадминтон
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M11512 = function M11512(room)
{
	MEIRO.Model.apply(this, arguments);

	// ракети
	this.a = new MEIRO.Cylinder(1.5,0.25);
	this.a.material = new THREE.MeshLambertMaterial({color:'tomato'});
	this.b = new MEIRO.Cylinder(1.5,0.25);
	this.b.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});
	
	// перце
	this.ball = new MEIRO.Sphere(0.3);
	this.ball.material = new THREE.MeshPhongMaterial({color:'white'});
	
	// сглобяване на целия модел
	this.image.add(this.a,this.b,this.ball);
}

MEIRO.Models.M11512.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M11512.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M11512.POS = {DIST:15, ROT_X:1.2, ROT_Y:0};
MEIRO.Models.M11512.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M11512.prototype.onAnimate = function(time)
{
	function cir(a,b,c,d)
	{
		return Math.cos(rpm(time+a,c))+Math.sin(rpm(time+b,d))
	}
	
	this.a.position.set(
		-5+2*cir(1,2,24,27),
		1*cir(3,4,28,21),
		3*cir(5,6,25,26) );
	this.a.rotation.set(cir(1,2,61,69)/8,cir(3,4,62,68)/8,Math.PI/2+cir(5,6,63,67)/8);
	
	this.b.position.set(
		5+2*cir(3,4,26,23),
		1*cir(5,6,21,28),
		3*cir(1,2,30,24) );
	this.b.rotation.set(cir(3,4,63,67)/8,cir(5,6,68,62)/8,Math.PI/2+cir(1,1,69,61)/8);
		
	this.ball.position.copy(this.a.position);
	this.ball.position.lerp(this.b.position,0.5+0.43*Math.sin(rpm(time,80)));
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M11512.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Бадминтон</h1>';

	s += '<p>Движението на ракетите в този модел е с периодични функции по трите оси. Движението на перцето е чрез линейна комбинация между центровете на ракетите. Затова, независимо къде са ракетите и как са завъртяни, перцето винаги ще се движи между тях.</p>';
	
	element.innerHTML = s;
}
