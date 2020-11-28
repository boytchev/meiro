
//	Основи на Компютърната Графика
//	Модел 12091 - Кръгово движение - противоположни посоки
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12091 = function M12091(room)
{
	MEIRO.Model.apply(this, arguments);

	// радиус
	this.R = 5;
	
	// топки
	this.a = new MEIRO.Sphere(0.5);
	this.a.material = new THREE.MeshLambertMaterial({color:'tomato'});
	this.b = new MEIRO.Sphere(0.75);
	this.b.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});
	
	// траектория
	this.path = new THREE.Line( MEIRO.PRIMITIVE.GEOMETRY.CIRCLE, MEIRO.PRIMITIVE.STYLE.GRID );
	this.path.scale.set(this.R,this.R,this.R);
	this.path.rotation.x = Math.PI/2;
	
	// сглобяване на целия модел
	this.image.add(this.a,this.b,this.path);
}

MEIRO.Models.M12091.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12091.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M12091.POS = {DIST:15, ROT_X:1.2, ROT_Y:0.5};
MEIRO.Models.M12091.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12091.prototype.onAnimate = function(time)
{
	var angle = rpm(time,10);
	this.a.position.set(this.R*Math.cos(angle),0,this.R*Math.sin(angle));
	
	var angle = rpm(-time,15);
	this.b.position.set(this.R*Math.cos(angle),0,this.R*Math.sin(angle));
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M12091.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Кръгово движение &ndash; противоположни посоки</h1>';

	s += '<p>При кръговото движение има две посоки на движение. Посоката се определя от знака в промяната на ъгъла, редът на координатните оси, редът на тригонометрични функции, знак на радиуса по всяка от осите.</p>';
	
	element.innerHTML = s;
}
