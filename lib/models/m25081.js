
//	Основи на Компютърната Графика
//	Модел 25081 - Движения при DOF=2 - две транслации
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M25081 = function M25081(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// основа
	var material = new THREE.MeshPhongMaterial({color:'black',shininess:150});
	
	var base1 = new MEIRO.Sphere(0.2);
	base1.material = material;
	base1.position.set(4,0,-4);
	var base1a = new MEIRO.Sphere(0.2);
	base1a.material = material;
	base1a.position.set(4,0,4);
	
	var base2 = new MEIRO.Sphere(0.2);
	base2.material = material;
	base2.position.set(-4,0,-4);
	var base2a = new MEIRO.Sphere(0.2);
	base2a.material = material;
	base2a.position.set(-4,0,4);
	
	var base3 = new MEIRO.Cylinder(0.2,8);
	base3.material = material;
	base3.position.set(0,0,-4);
	base3.rotation.z = Math.PI/2;
	var base3a = new MEIRO.Cylinder(0.2,8);
	base3a.material = material;
	base3a.position.set(0,0,4);
	base3a.rotation.z = Math.PI/2;

	this.base4 = new MEIRO.Cylinder(0.2,8);
	this.base4.material = material;
	this.base4.position.set(0,0,0);
	this.base4.rotation.x = Math.PI/2;

	this.first = true;
	this.n = 300;
	this.track = new MEIRO.Polygon(this.n);
	for (var i=0; i<this.n; i++)
		this.track.setPoint(i,new THREE.Vector3(0,0,0));
	
	this.surface = new THREE.Mesh(
		new THREE.PlaneGeometry(9,9),
		new THREE.MeshPhongMaterial({color:'pink',transparent:true,opacity:0.15,side:THREE.DoubleSide,depthWrite:false})
	);
	this.surface.rotation.x = Math.PI/2;
	this.surface.position.y = 2.6;
	this.surface.visible = false;
	
	// подвижна част
	var material = new THREE.MeshPhongMaterial({color:'orange',shininess:150});
	this.dyna = new THREE.Object3D();
	this.dyna.position.set(0,0,0);
	
	var d = new MEIRO.Cylinder(0.5,2);
	d.material = material;
	d.position.set(0,1,0);
	this.dyna.add(d);
	
	d = new MEIRO.Sphere(0.5);
	d.material = material;
	d.position.set(0,2,0);
	this.dyna.add(d);

	d = new MEIRO.Sphere(0.5);
	d.material = material;
	d.position.set(0,0,0);
	this.dyna.add(d);

	d = new MEIRO.Sphere(0.1);
	d.material = new THREE.MeshPhongMaterial({color:'red',shininess:150});
	d.position.set(0,2.6,0);
	this.dyna.add(d);
	
	this.time = 0;
	this.lastTime = 0;

	var that = this;
	this.show = new MEIRO.CornerButton('topLeft', function(){that.onShow();}, 'Покажи', 'images/show.hide.png');
	this.show.hide();
	
	// сглобяване на целия модел
	this.image.add(base1,base2,base3,base1a,base2a,base3a,this.dyna,this.track,this.base4,this.surface);
}

MEIRO.Models.M25081.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M25081.DIST = {MIN:5, MAX:30, HEIGHT:0};
MEIRO.Models.M25081.POS = {DIST:15, ROT_X:0.9, ROT_Y:0.5};
MEIRO.Models.M25081.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M25081.prototype.onAnimate = function(time)
{
	var dTime = (time-this.lastTime)/700;
	this.time += dTime;
	
	var x = 1.5*(Math.sin(this.time)+Math.sin(2.34*this.time)+Math.cos(3.54*this.time));
	var z = 1.5*(Math.cos(this.time+1)+Math.cos(2.34*this.time-1)+Math.sin(4.3*this.time-2));
	this.base4.position.x = x;
	this.dyna.position.x = x;
	this.dyna.position.z = z;

	if (this.first && this.lastTime>0.1)
	{
		for (var i=0; i<this.n; i++)
			this.track.setPoint(i,new THREE.Vector3(x,2.6,z));
		this.first = false;
	}
	else
	{
		for (var i=0; i<this.n-1; i++)
			this.track.setPoint(i,this.track.getPoint(i+1));
		this.track.setPoint(this.n-1,new THREE.Vector3(x,2.6,z));
	}
	
	TWEEN.update();
	reanimate();
	this.lastTime = time;	
}



// информатор на модела
MEIRO.Models.M25081.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движения при DOF=2 &ndash; две транслации</h1>';

	s += '<p>При движение с две степени на свобода (DOF=2) са нужни два параметъра, за се опише пълното движение. Достижимите точки в пространството при това движение са по повърхност. Всяка точка от тази повърхност отговаря на някакви стойности на двата параметъра.</p>';

	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M25081.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:that.k})
		.to({k:that.k<0.5?1:0},1500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.k=this.k} )
		.start();

	reanimate();
}


// превключвател на модела
MEIRO.Models.M25081.prototype.onShow = function(element)
{
	this.surface.visible = !this.surface.visible;
}
