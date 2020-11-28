
//	Основи на Компютърната Графика
//	Модел 17111 - Изрязваща равнина по три точки
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M17111 = function M17111(room)
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
		
	this.cylinderA = new MEIRO.Cylinder(1/3,6);
	this.cylinderA.material = this.material;
	
	this.cylinderB = new MEIRO.Cylinder(1/3,6);
	this.cylinderB.rotation.z = Math.PI/2;
	this.cylinderB.material = this.material;
	
	this.cylinderC = new MEIRO.Cylinder(1/3,6);
	this.cylinderC.rotation.x = Math.PI/2;
	this.cylinderC.material = this.material;
	
	// точки
	this.points = [];
	for (var i=0; i<3; i++)
	{
		this.points.push(new MEIRO.Sphere(0.1));
		this.points[i].material = MEIRO.PRIMITIVE.STYLE.POINT;
	}
	
	// равнина
	this.plane = new THREE.Mesh(
		new THREE.CircleGeometry(4,options.lowpoly?12:48),
		MEIRO.PRIMITIVE.STYLE.PLATE
	);
	this.plane.material.opacity = 0.25;
	this.plane.material.depthTest = true;
		
	// сглобяване на целия модел
	this.image.add(this.cylinderA,this.cylinderB,this.cylinderC,this.plane);
	for (var i=0; i<3; i++)
		this.image.add(this.points[i]);
}

MEIRO.Models.M17111.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M17111.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M17111.POS = {DIST:10, ROT_X:1, ROT_Y:0.5};
MEIRO.Models.M17111.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M17111.prototype.onAnimate = function(time)
{
	this.plane.position.set(0,0,0);

	var angle = rpm(time,2);
	for (var i=0; i<3; i++)
	{
		var p = this.points[i].position;
		p.setComponent(i%3,2*Math.cos(angle+2*i*Math.PI/3),0,0);
		p.setComponent((i+1)%3,2*Math.sin(angle+2*i*Math.PI/3),0,0);
		p.setComponent((i+2)%3,2*Math.cos(-angle+2*i*Math.PI/3),0,0);
		
		this.plane.position.addScaledVector(p,1/3);
	}

	// трите точки - глобални координати
	var p1 = new THREE.Vector3().addScaledVector(this.points[0].position,this.image.scale.x).add(this.image.position);
	var p2 = new THREE.Vector3().addScaledVector(this.points[1].position,this.image.scale.x).add(this.image.position);
	var p3 = new THREE.Vector3().addScaledVector(this.points[2].position,this.image.scale.x).add(this.image.position);
	
	// изчисляване на коефициентите на изрязващата равнина
	var a = p1.y*(p2.z-p3.z)+p2.y*(p3.z-p1.z)+p3.y*(p1.z-p2.z);
	var b = p1.z*(p2.x-p3.x)+p2.z*(p3.x-p1.x)+p3.z*(p1.x-p2.x);
	var c = p1.x*(p2.y-p3.y)+p2.x*(p3.y-p1.y)+p3.x*(p1.y-p2.y);
	var d = -(p1.x*(p2.y*p3.z-p3.y*p2.z)+p2.x*(p3.y*p1.z-p1.y*p3.z)+p3.x*(p1.y*p2.z-p2.y*p1.z));
	
	this.material.clippingPlanes[0].setComponents(a,b,c,d);
	this.material.clippingPlanes[0].normalize();
	
	var v = this.plane.position.clone();
	this.plane.lookAt(v.add(this.material.clippingPlanes[0].normal));
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M17111.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Изрязваща равнина по три точки</h1>';

	s += '<p>Изрязваща равнина може еднозначно да се определи от три линейно независими точки. Редът на точките влияе на ориентацията на равнината &ndash; положителното полупространство е това, от което точките се виждат обхождани обратно на часовниковата стрелка.</p>';
	element.innerHTML = s;
}


MEIRO.Models.M17111.prototype.onEnter = function()
{
	renderer.localClippingEnabled = true;
	MEIRO.Model.prototype.onEnter.call(this);
}


MEIRO.Models.M17111.prototype.onExit = function()
{
	renderer.localClippingEnabled = false;
	MEIRO.Model.prototype.onExit.call(this);
}
