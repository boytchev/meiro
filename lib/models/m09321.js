
//	Основи на Компютърната Графика
//	Модел 09321 - Японска възглавница
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09321 = function M09321(room)
{
	MEIRO.Model.apply(this, arguments);

	// японска възглавница
	this.n = 200;
	this.tubes = new THREE.Object3D();
	for (var i=0; i<this.n; i++)
	{
		var color = new THREE.Color(THREE.Math.randFloat(0.2,0.5),THREE.Math.randFloat(0.3,0.7),1);
		var tube = new THREE.Mesh(
			MEIRO.PRIMITIVE.GEOMETRY.TUBE,
			new THREE.MeshPhongMaterial({color:color,side:THREE.DoubleSide}) );
		tube.position.set(THREE.Math.randFloat(-4,4),THREE.Math.randFloat(-1,1),THREE.Math.randFloat(-3,3));
		tube.rotation.set(THREE.Math.randFloat(0,2*Math.PI),THREE.Math.randFloat(0,2*Math.PI),THREE.Math.randFloat(0,2*Math.PI));
		tube.scale.set(0.3,0.6,0.25);
		
		this.tubes.add(tube);
	}

	// сглобяване на целия модел
	this.image.add(this.tubes);
}

MEIRO.Models.M09321.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09321.DIST = {MIN:5, MAX:30, HEIGHT:0};
MEIRO.Models.M09321.POS = {DIST:15, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09321.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09321.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M09321.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Японска възглавница</h1>';

	s += '<p>Моделът на пълнежа на японска възглавница е от множество леко сплескани цилиндри, нарисувани без основите. Цветовете, координатите и ориентацията са случайно избрани.</p>';
	
	element.innerHTML = s;
}