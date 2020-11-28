
//	Основи на Компютърната Графика
//	Модел 12093 - Кръгово движение - еднакви линейни скорости
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12093 = function M12093(room)
{
	MEIRO.Model.apply(this, arguments);

	// радиус
	this.Ra = 5;
	this.Rb = 5/2;
	
	// топки
	this.a = new MEIRO.Sphere(0.5);
	this.a.material = new THREE.MeshLambertMaterial({color:'tomato'});
	this.b = new MEIRO.Sphere(0.75);
	this.b.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});
	
	// траектории
	this.pathA = new THREE.Line( MEIRO.PRIMITIVE.GEOMETRY.CIRCLE, MEIRO.PRIMITIVE.STYLE.GRID );
	this.pathA.scale.set(this.Ra,this.Ra,this.Ra);
	this.pathA.rotation.x = Math.PI/2;
	this.pathB = new THREE.Line( MEIRO.PRIMITIVE.GEOMETRY.CIRCLE, MEIRO.PRIMITIVE.STYLE.GRID );
	this.pathB.scale.set(this.Rb,this.Rb,this.Rb);
	this.pathB.rotation.x = Math.PI/2;
	
	// сглобяване на целия модел
	this.image.add(this.a,this.b,this.pathA,this.pathB);
}

MEIRO.Models.M12093.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12093.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M12093.POS = {DIST:15, ROT_X:1.2, ROT_Y:0.5};
MEIRO.Models.M12093.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12093.prototype.onAnimate = function(time)
{
	var angle = rpm(time,10);
	this.a.position.set(this.Ra*Math.cos(angle),0,this.Ra*Math.sin(angle));
	
	var angle = rpm(time,10*this.Ra/this.Rb);
	this.b.position.set(this.Rb*Math.cos(angle),0,this.Rb*Math.sin(angle));
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M12093.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Кръгово движение &ndash; еднакви линейни скорости</h1>';

	s += '<p>При кръговото движение с еднакви линейни скорости обектите минават еднакво разстояние за едно и също време. Ако радиусите на движение са различни, то и ъгловите скорости ще са различни.</p>';
	
	element.innerHTML = s;
}
