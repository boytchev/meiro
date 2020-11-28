
//	Основи на Компютърната Графика
//	Модел 25082 - Движения при DOF=2 - две ротации
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M25082 = function M25082(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// основа
	var material = new THREE.MeshPhongMaterial({color:'black',shininess:150});
	
	var base1 = new MEIRO.Sphere(0.2);
	base1.material = material;
	base1.position.set(0,-2,0);
	
	var base2 = new MEIRO.Cylinder(0.2,2);
	base2.material = material;
	base2.position.set(0,-1,0);

	this.first = true;
	this.n = 500;
	this.track = new MEIRO.Polygon(this.n);
	for (var i=0; i<this.n; i++)
		this.track.setPoint(i,new THREE.Vector3(0,0,0));
	
	this.surface = new THREE.Mesh(
		new THREE.SphereGeometry(2.6,16,16,Math.PI-1.2,2.4,Math.PI/2-0.8,1.6),
		new THREE.MeshPhongMaterial({color:'pink',transparent:true,opacity:0.15,side:THREE.DoubleSide,depthWrite:false})
	);
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
	this.image.add(base1,base2,this.dyna,this.track,this.surface);
}

MEIRO.Models.M25082.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M25082.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M25082.POS = {DIST:10, ROT_X:0.9, ROT_Y:0.5};
MEIRO.Models.M25082.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M25082.prototype.onAnimate = function(time)
{
	var dTime = (time-this.lastTime)/500;
	this.time += dTime;
	
	var a = 0.4*(Math.sin(this.time)+Math.sin(2.34*this.time)+Math.cos(3.54*this.time));
	var b = 0.25*(Math.cos(this.time+1)+Math.cos(2.34*this.time-1)+Math.sin(4.3*this.time-2));
	
	var x = 2.6*Math.cos(a)*Math.cos(b);
	var y = 2.6*Math.sin(b);
	var z = 2.6*Math.sin(a)*Math.cos(b);
	
	this.dyna.rotation.set(-b+Math.PI/2,Math.PI/2-a,0,'YXZ');

	if (this.first && this.lastTime>0.1)
	{
		for (var i=0; i<this.n; i++)
			this.track.setPoint(i,new THREE.Vector3(x,y,z));
		this.first = false;
	}
	else
	{
		for (var i=0; i<this.n-1; i++)
			this.track.setPoint(i,this.track.getPoint(i+1));
		this.track.setPoint(this.n-1,new THREE.Vector3(x,y,z));
	}
	
	TWEEN.update();
	reanimate();
	
	this.lastTime = time;	
}



// информатор на модела
MEIRO.Models.M25082.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движения при DOF=2 &ndash; две ротации</h1>';

	s += '<p>Този модел е демоснтрация на движение с две степени на свобода (DOF=2), които съответстват на ротации около две оси. Достижимите точки в пространството са част от сфера.</p>';

	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M25082.prototype.onToggle = function(element)
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
MEIRO.Models.M25082.prototype.onShow = function(element)
{
	this.surface.visible = !this.surface.visible;
}

