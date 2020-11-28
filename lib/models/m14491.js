
//	Основи на Компютърната Графика
//	Модел 14491 - Пръстени от пешки обърнати навън
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M14491 = function M14491(room, model)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 18;

	// пръстен
	this.ring = new THREE.Mesh(
		new THREE.CylinderGeometry(4.5,4.5,2,18,1,true),
		new THREE.MeshPhongMaterial({color:'orange',shininess:100,shading:THREE.FlatShading,side:THREE.DoubleSide})
	);
	this.ring.geometry.rotateY(Math.PI/this.n);
	this.ring.geometry.rotateX(Math.PI/2);

	var basis = new MEIRO.Basis();
	basis.translate(0,4.25,0);
	
	// пешки
	this.pawn = [];
	for (var i=0; i<this.n; i++)
	{
		var pawn = new MEIRO.Pawn('black');
		pawn.matrixAutoUpdate = false;
		basis.applyScaled(pawn,1/2);

		this.pawn.push(pawn);
		
		basis.translateX(0.75);
		basis.rotateZ(-2*Math.PI/this.n);
		basis.translateX(0.75);
		this.ring.add(pawn);
	}
	
	//светлина
	var light = new THREE.PointLight('white',1/2);
	
	// сглобяване на целия модел
	this.image.add(this.ring,light);
}

MEIRO.Models.M14491.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M14491.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M14491.POS = {DIST:20, ROT_X:-0.9, ROT_Y:0};
MEIRO.Models.M14491.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M14491.prototype.onAnimate = function(time)
{	
	this.ring.rotation.set(0,rpm(time,2),rpm(time,8),'YXZ');	
	reanimate();
}



// информатор на модела
MEIRO.Models.M14491.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Пръстени от пешки обърнати навън</h1>';

	s += '<p>Положението и ориентацията на пешките е направено чрез невидима костенурка, която обхожда пръстен. На всяка стъпка се създава клонинг на пешка с положение и ориентация заимствани от костенурката. По този начин пешките са разположени, без да се пресмятат изрично техните координати и завъртания.</p>';

	element.innerHTML = s;
}
