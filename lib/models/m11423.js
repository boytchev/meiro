
//	Основи на Компютърната Графика
//	Модел 11423 - Движение по ръбовете на куб
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M11423 = function M11423(room)
{
	MEIRO.Model.apply(this, arguments);

	// куб
	this.cube = new THREE.LineSegments(
		new THREE.EdgesGeometry(MEIRO.PRIMITIVE.GEOMETRY.CUBE),
		new THREE.LineBasicMaterial({color:'black'}) );
	this.cube.scale.set(4,4,4);
	
	this.subCube = new MEIRO.Cube(4);
	this.subCube.material = new THREE.MeshNormalMaterial({
					transparent:true,
					opacity:0.1,
					side: THREE.DoubleSide,
				});
	

	// топка
	this.ball = new MEIRO.Sphere(0.1);
	this.ball.material = new THREE.MeshPhongMaterial({color:'red'});
	this.ball.position.set(-1/2,-1/2,-1/2);
	this.cube.add(this.ball);
	
	// движение
	this.t = 50;
	this.dir = 0;
	this.sign = 1;
	
	// сглобяване на целия модел
	this.image.add(this.cube, this.subCube);
}

MEIRO.Models.M11423.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M11423.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M11423.POS = {DIST:15, ROT_X:1.2, ROT_Y:0.3};
MEIRO.Models.M11423.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M11423.prototype.onAnimate = function(time)
{

	this.cube.rotation.x = rpm(time,1.1);
	this.cube.rotation.y = rpm(time,1.7);
	this.cube.rotation.z = rpm(time,1.3);

	this.subCube.rotation.copy(this.cube.rotation);
	
	if (this.t)
	{
		this.ball.position['xyz'[this.dir]] += this.sign*1/50;
		this.t--;
	}
	else
	{
		this.t = 50;
		this.dir = (this.dir+(Math.random()>0.5?1:2))%3;
		this.sign = -Math.sign(this.ball.position['xyz'[this.dir]]);
	}
	reanimate();
}



// информатор на модела
MEIRO.Models.M11423.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение по ръбовете на куб</h1>';

	s += '<p>Топче се движи по ръбовете на куб. При достигане на връх топчето тругва по случайно избран от другите два ръба към този връх. Самото движение е линейно, чрез вектор.</p>';
	
	element.innerHTML = s;
}
