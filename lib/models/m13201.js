
//	Основи на Компютърната Графика
//	Модел 13201 - Вибрация със затихване
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13201 = function M13201(room)
{
	MEIRO.Model.apply(this, arguments);

	// коефициенти на еластичност
	this.k = [0.96, 0.92, 0.85];
	
	// основи
	this.base = [];
	for (var i=0; i<3; i++)
	{
		var b = new MEIRO.Cube(2);
		b.scale.set(2.5,0.25,2.5);
		b.position.set(-3*(i-1),1,0);
		b.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});
		b.vibro = 0;
		this.base.push(b);
	}
	
	// топки
	this.ball = [];
	for (var i=0; i<3; i++)
	{
		var b = new MEIRO.Sphere(1);
		b.position.set(-3*(i-1),4,0);
		b.material = new THREE.MeshLambertMaterial({color:'red'});
		this.ball.push(b);
	}
	
	// надписи
	this.label = [];
	for (var i=0; i<3; i++)
	{
		this.label.push( new MEIRO.Label(this.k[i],0.4,-0.6,1.25,0) );
	}
	
	// сглобяване на целия модел
	for (var i=0; i<3; i++)
	{
		this.image.add(this.base[i],this.ball[i],this.label[i]);
	}
}

MEIRO.Models.M13201.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13201.DIST = {MIN:5, MAX:20, HEIGHT:-3};
MEIRO.Models.M13201.POS = {DIST:10, ROT_X:1.57, ROT_Y:0};
MEIRO.Models.M13201.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13201.prototype.onAnimate = function(time)
{
	for (var i=0; i<3; i++)
	{
		this.time = rpm(time,20);
		this.ball[i].position.y = 0.5+5*Math.abs(Math.sin(this.time));
		this.base[i].position.y = -0.5-this.base[i].vibro*Math.sin(rpm(time,200));
		if (Math.sign(Math.sin(this.time))!=Math.sign(Math.sin(this.oldTime)))
			this.base[i].vibro = 2;
		this.base[i].vibro *= this.k[i];
		this.label[i].position.copy(this.ball[i].position);
		this.label[i].rotateLabel();
	}
	
	this.oldTime = this.time
	reanimate();
}



// информатор на модела
MEIRO.Models.M13201.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Вибрация със затихване</h1>';

	s += '<p>Затихването е симулация на загуба на енергия, като тя постепенно клони към 0 чрез умножение с коефициент близък до 1, но по-малък от 1. Този коефициент определя колко гъвкав ще е обектът, който вибрира. Колкото е по-далече от 1, толкова по-бързо е затихването и по-твърд изглежда обектът.</p>';
	
	element.innerHTML = s;
}
