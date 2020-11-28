
//	Основи на Компютърната Графика
//	Модел 11451 - Търкаляне на куб
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M11451 = function M11451(room)
{
	MEIRO.Model.apply(this, arguments);

	// куб
	this.cube = new MEIRO.Cube(2);
	this.cube.geometry = this.cube.geometry.clone();
	this.cube.geometry.translate(-0.5,0.5,0);
	this.cube.material = new THREE.MeshPhongMaterial({color:'cornflowerblue'});
	this.cube.position.x = -7;
	
	this.dir = 1;
	
	// координатна система
	this.oxyz = new MEIRO.Axes3D([-10,10],[0,5],[-3,3]);
	
	// сглобяване на целия модел
	this.image.add(this.cube, this.oxyz);
}

MEIRO.Models.M11451.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M11451.DIST = {MIN:10, MAX:25, HEIGHT:0};
MEIRO.Models.M11451.POS = {DIST:18, ROT_X:1.2, ROT_Y:0.3};
MEIRO.Models.M11451.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M11451.prototype.onAnimate = function(time)
{
	this.oxyz.rotateLabels();

	this.cube.rotation.z += -0.17*this.dir+0.13;
	if (this.cube.rotation.z*this.dir < -(this.dir+1)*Math.PI/4)
	{
		if (this.cube.position.x*this.dir>6)
			this.dir = -this.dir;
		else
		{
			this.cube.rotation.z += this.dir*Math.PI/2;
			this.cube.position.x += this.dir*2;
		}
	}

	reanimate();
}



// информатор на модела
MEIRO.Models.M11451.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Търкаляне на куб</h1>';

	s += '<p>Каквато и фиксирана точка от куб да се използва за неговото търкаляне, траекторията на позицията му няма да е проста крива. Настоящият модел върти куба около един и същ негов ръб. Търкалянето се постига с илюзия, която използва симетричността на куба.</p>';
	
	element.innerHTML = s;
}
