
//	Основи на Компютърната Графика
//	Модел 28061 - Осветяване на стени
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M28061 = function M28061(room)
{
	MEIRO.Model.apply(this, arguments);


	var geometry = new THREE.BoxGeometry(1.5,1.5,1.5);
	geometry.rotateY( Math.PI/4 );
	geometry.rotateZ( Math.PI/180 * 54.7 );
	
	// кубове
	this.ballA = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:'cornflowerblue'}));
	this.ballA.position.z = 1.25;
	
	this.ballB = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({color:'cornflowerblue'}));
	this.ballB.position.z = -1.25;
	
	// сглобяване на целия модел
	this.image.add(this.ballA,this.ballB);
}

MEIRO.Models.M28061.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M28061.DIST = {MIN:3, MAX:10, HEIGHT:0};
MEIRO.Models.M28061.POS = {DIST:5, ROT_X:0, ROT_Y:0};
MEIRO.Models.M28061.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M28061.prototype.onAnimate = function(time)
{
	this.ballA.rotation.y = rpm(time,5);
	
	this.ballB.rotation.y = rpm(time,5);
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M28061.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Осветяване на стени</h1>';

	s += '<p>Различното осветяване на стените на куб, помага да се възприеме по-лесно не само формата на обекта, но и ориентацията на стените му. Освен това се разграничават контурите на стените, които образуват ръб.</p>';
	element.innerHTML = s;
}
