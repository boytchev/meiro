
//	Основи на Компютърната Графика
//	Модел 28171 - Плоско туширане
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M28171 = function M28171(room)
{
	MEIRO.Model.apply(this, arguments);

	var material = new THREE.MeshPhongMaterial({color:new THREE.Color(0.9,1,1.2),flatShading:true,shininess:0});

	this.ball1 = new THREE.Mesh( 
		new THREE.IcosahedronBufferGeometry(1,1),
		material);
	this.ball1.position.x = -2.2;

	this.ball2 = new THREE.Mesh( 
		new THREE.IcosahedronBufferGeometry(1,3),
		material);
	this.ball2.position.x = 0;
		
	this.ball3 = new THREE.Mesh( 
		new THREE.IcosahedronBufferGeometry(1,4),
		material);
	this.ball3.position.x = 2.2;
	
	this.label1 = new MEIRO.Label(this.ball1.geometry.attributes.position.count/3,0.5,-0.5,0,0);
	this.label1.position.set(-2.2,1.2,0);
	
	this.label2 = new MEIRO.Label(this.ball2.geometry.attributes.position.count/3,0.5,-0.62,0,0);
	this.label2.position.set(0,1.2,0);
	
	this.label3 = new MEIRO.Label(this.ball3.geometry.attributes.position.count/3,0.5,-0.62,0,0);
	this.label3.position.set(2.2,1.2,0);
	
	// сглобяване на целия модел
	this.image.add(this.ball1,this.ball2,this.ball3);
	this.image.add(this.label1,this.label2,this.label3);
}

MEIRO.Models.M28171.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M28171.DIST = {MIN:3.5, MAX:15, HEIGHT:0};
MEIRO.Models.M28171.POS = {DIST:7.5, ROT_X:Math.PI/2, ROT_Y:0};
MEIRO.Models.M28171.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M28171.prototype.onAnimate = function(time)
{
	this.label1.rotateLabel();
	this.label2.rotateLabel();
	this.label3.rotateLabel();
	
	this.ball1.rotation.y = rpm(time,2);
	this.ball2.rotation.y = rpm(time,2);
	this.ball3.rotation.y = rpm(time,2);
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M28171.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Плоско туширане</h1>';

	s += '<p>Най-бързият начин на туширане е чрез пресмятане на осветяването еднократно за всяка стена. По този начин тя е туширана цялата в еднаква степен. Недостатък е видимстта на границите между съседни стени. За направата на заоблени гладки обекти се налага изпозлването на твърде много на брой и твърде малки по размер стени.</p>';
	element.innerHTML = s;
}