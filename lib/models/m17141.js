
//	Основи на Компютърната Графика
//	Модел 17141 - Изрязваща равнина по точка и вектор
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M17141 = function M17141(room)
{
	MEIRO.Model.apply(this, arguments);

	// фигура
	var v = new THREE.Vector3(0,-1,0);
	var p = new THREE.Vector3(this.room.max.x/2,this.room.level.levelIndex*MEIRO.STAIRS.HEIGHT+0.5,this.room.max.z/2);
	this.material = new THREE.MeshPhongMaterial({
			color: 'cornflowerblue',
			clippingPlanes: [new THREE.Plane()],
			side: THREE.DoubleSide,
		});
		
	this.cylinderA = new MEIRO.Cylinder(1/3,16);
	this.cylinderA.material = this.material;
	
	this.cylinderB = new MEIRO.Cylinder(1/3,16);
	this.cylinderB.rotation.z = Math.PI/2;
	this.cylinderB.material = this.material;
	
	this.cylinderC = new MEIRO.Cylinder(1/3,16);
	this.cylinderC.rotation.x = Math.PI/2;
	this.cylinderC.material = this.material;
	
	// точка
	this.point = new MEIRO.Sphere(0.1);
	this.point.material = MEIRO.PRIMITIVE.STYLE.POINT;
	
	// вектор
	this.vector = new MEIRO.Vector(new THREE.Vector3(0,1,0),1,'red');

	// равнина
	this.plane = new THREE.Mesh(
		new THREE.CircleGeometry(4,options.lowpoly?12:48),
		MEIRO.PRIMITIVE.STYLE.PLATE
	);
	this.plane.material.opacity = 0.25;
	this.plane.material.depthTest = true;
		
	// сглобяване на целия модел
	this.image.add(this.cylinderA,this.cylinderB,this.cylinderC,this.plane,this.point,this.vector);
}

MEIRO.Models.M17141.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M17141.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M17141.POS = {DIST:10, ROT_X:1, ROT_Y:0.5};
MEIRO.Models.M17141.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M17141.prototype.onAnimate = function(time)
{
	var alpha = rpm(time,2/2);
	var beta = rpm(time,3/2);
	var sph = new THREE.Spherical(2,beta,alpha);
	
	this.point.position.setFromSpherical( sph );
	this.plane.position.copy(this.point.position);
	this.vector.position.copy(this.point.position);

	// точката - глобални координати
	var p = new THREE.Vector3().addScaledVector(this.point.position,this.image.scale.x).add(this.image.position);
	var v = this.point.position;

	// изчисляване на коефициентите на изрязващата равнина
	var a = -v.x/2;
	var b = -v.y/2;
	var c = -v.z/2;
	var d = p.dot(v)/2;

	this.material.clippingPlanes[0].setComponents(a,b,c,d);
//	this.material.clippingPlanes[0].negate();
	
	var w = v.clone();
	this.plane.lookAt(w.add(v));
	this.vector.lookAt(w.add(v).multiplyScalar(-1));
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M17141.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Изрязваща равнина по точка и вектор</h1>';

	s += '<p>Изрязваща равнина може еднозначно да се определи от точка, през която тя минава, и нейният нормален вектор. Ако векторът е нормализиран, то неговите координати съответстват на първите три коефициента в уравнението на равнината. Четвъртият коефициент е разстоянието от точката <em>(0,0,0)</em> до равнината.</p>';
	element.innerHTML = s;
}


MEIRO.Models.M17141.prototype.onEnter = function()
{
	renderer.localClippingEnabled = true;
	MEIRO.Model.prototype.onEnter.call(this);
}


MEIRO.Models.M17141.prototype.onExit = function()
{
	renderer.localClippingEnabled = false;
	MEIRO.Model.prototype.onExit.call(this);
}
