
//	Основи на Компютърната Графика
//	Модел 28191 - Гладко туширане на Гурò
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M28191 = function M28191(room)
{
	MEIRO.Model.apply(this, arguments);

	var material = new THREE.MeshLambertMaterial({color:new THREE.Color(0.9,1,1.2)});
	
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
	
	this.label2 = new MEIRO.Label(this.ball2.geometry.attributes.position.count/3,0.5,-0.61,0,0);
	this.label2.position.set(0,1.2,0);
	
	this.label3 = new MEIRO.Label(this.ball3.geometry.attributes.position.count/3,0.5,-0.60,0,0);
	this.label3.position.set(2.2,1.2,0);
		
	// сглобяване на целия модел
	this.image.add(this.ball1,this.ball2,this.ball3);
	this.image.add(this.label1,this.label2,this.label3);
}

MEIRO.Models.M28191.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M28191.DIST = {MIN:3.5, MAX:15, HEIGHT:0};
MEIRO.Models.M28191.POS = {DIST:7, ROT_X:Math.PI/2, ROT_Y:0};
MEIRO.Models.M28191.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M28191.prototype.onAnimate = function(time)
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
MEIRO.Models.M28191.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Гладко туширане на Гурò</h1>';

	s += '<p>За да се постигне по-гладко туширане може да се изчисли осветяването за всеки връх поотделно. Туширането на вътрешността на всяка стена е линейна комбинация от турирането във върховете. Този метод на гладко туширане е предложен от Анрѝ Гурò.</p>';
	element.innerHTML = s;
}