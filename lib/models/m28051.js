
//	Основи на Компютърната Графика
//	Модел 28051 - Осветяване
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M28051 = function M28051(room)
{
	MEIRO.Model.apply(this, arguments);


	// сфери
	this.ballA = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, new THREE.MeshBasicMaterial({color:'cornflowerblue'}));
	this.ballA.position.z = 1.25;
	
	this.ballB = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, new THREE.MeshLambertMaterial({color:'cornflowerblue'}));
	this.ballB.position.z = -1.25;
	
	// сглобяване на целия модел
	this.image.add(this.ballA,this.ballB);
}

MEIRO.Models.M28051.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M28051.DIST = {MIN:3, MAX:10, HEIGHT:0};
MEIRO.Models.M28051.POS = {DIST:5, ROT_X:0, ROT_Y:0};
MEIRO.Models.M28051.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M28051.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M28051.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Осветяване</h1>';

	s += '<p>Осветяването променя цветовете на обекта най-често чрез потъмняване. По този начин е по-лесно да се възприеме пространствената форма на осветения обект.</p>';
	element.innerHTML = s;
}
