
//	Основи на Компютърната Графика
//	Модел 25071 - Движения при DOF=1
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M25071 = function M25071(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// основа
	var material = new THREE.MeshPhongMaterial({color:'black',shininess:150});
	
	var base1 = new MEIRO.Sphere(0.2);
	base1.material = material;
	base1.position.set(4,0,0);
	
	var base2 = new MEIRO.Sphere(0.2);
	base2.material = material;
	base2.position.set(-4,0,0);
	
	var base3 = new MEIRO.Cylinder(0.2,8);
	base3.material = material;
	base3.position.set(0,0,0);
	base3.rotation.z = Math.PI/2;

	this.n = 100;
	this.track = new MEIRO.Polygon(this.n);
	for (var i=0; i<this.n; i++)
		this.track.setPoint(i,new THREE.Vector3(0,2.6,0));
	
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
	
	this.surface0 = new THREE.Mesh(
		new THREE.CylinderGeometry(2.6,2.6,0.2,48,1,true),
		new THREE.MeshPhongMaterial({color:'pink',transparent:true,opacity:0.15,side:THREE.DoubleSide,depthWrite:false})
	);
	this.surface0.rotation.z = Math.PI/2;
	this.surface0.visible = false;
	
	this.surface1 = new THREE.Mesh(
		new THREE.CylinderGeometry(0.03,0.03,9,8,1,true),
		new THREE.MeshPhongMaterial({color:'pink',transparent:true,opacity:0.15,side:THREE.DoubleSide,depthWrite:false})
	);
	this.surface1.rotation.z = Math.PI/2;
	this.surface1.visible = false;

	this.k = 0;
	this.time = 0;
	this.lastTime = 0;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'Смени', 'images/toggle.png');
	this.toggle.hide();

	// сглобяване на целия модел
	this.image.add(base1,base2,base3,this.dyna,this.track,this.surface,this.surface0,this.surface1);
}

MEIRO.Models.M25071.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M25071.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M25071.POS = {DIST:10, ROT_X:0.9, ROT_Y:0.5};
MEIRO.Models.M25071.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M25071.prototype.onAnimate = function(time)
{
	var dTime = (time-this.lastTime)/500;
	this.time += dTime*(1-this.k);
	this.lastTime = time;	
	
	this.dyna.position.x = 3.5*Math.sin(this.time);
	this.dyna.rotation.x += dTime*this.k;

	for (var i=0; i<this.n-1; i++)
		this.track.setPoint(i,this.track.getPoint(i+1));
	this.track.setPoint(this.n-1,new THREE.Vector3(this.dyna.position.x,2.6*Math.cos(this.dyna.rotation.x),2.6*Math.sin(this.dyna.rotation.x)));

	this.surface0.position.x = this.dyna.position.x;
	this.surface1.position.y = 2.6*Math.cos(this.dyna.rotation.x);
	this.surface1.position.z = 2.6*Math.sin(this.dyna.rotation.x);
	this.surface1.visible = (this.k<0.8);
	this.surface0.visible = (this.k>0.2);
	
	
	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.M25071.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движения при DOF=1</h1>';

	s += '<p>При движение с една степен на свобода (DOF=1) е достатъчен само един параметър, за се опише пълното движение. Описаната траектория при това движение е линия.</p>';

	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M25071.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:that.k})
		.to({k:that.k<0.5?1:0},1500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.k=this.k} )
		.start();

	reanimate();
}
