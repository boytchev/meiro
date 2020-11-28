
//	Основи на Компютърната Графика
//	Модел 25092 - Движения при DOF=2 - доминантна скорост
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M25092 = function M25092(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// основа
	var material = new THREE.MeshPhongMaterial({color:'black',shininess:150});
	
	var base1 = new MEIRO.Sphere(0.2);
	base1.material = material;
	base1.position.set(0,0,0);

	this.base4 = new MEIRO.Cylinder(0.2,8);
	this.base4.geometry = this.base4.geometry.clone();
	this.base4.geometry.translate(0,0.5,0);
	this.base4.material = material;
	
	this.base5 = new MEIRO.Sphere(0.2);
	this.base5.material = material;

	this.n = 300;
	this.track = new MEIRO.Polygon(this.n);
	this.track.visible = false;
	for (var i=0; i<this.n; i++)
		this.track.setPoint(i,new THREE.Vector3(0,2.6,0));
	
	this.surface = new THREE.Mesh(
		new THREE.CylinderGeometry(0.5*Math.SQRT2,4.4+0.5*Math.SQRT2,4.4,48,1,true),
		new THREE.MeshPhongMaterial({color:'pink',transparent:true,opacity:0.15,side:THREE.DoubleSide,depthWrite:false})
	);
	this.surface.rotation.x = Math.PI;
	this.surface.position.y = 5.45;
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
	this.first = true;
	
	// бутон за превключване
	var that = this;
	this.show = new MEIRO.CornerButton('topLeft', function(){that.onShow();}, 'Покажи', 'images/show.hide.png');
	this.show.hide();

	// сглобяване на целия модел
	this.image.add(base1,this.base4,this.base5,this.dyna,this.track,this.surface);
}

MEIRO.Models.M25092.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M25092.DIST = {MIN:5, MAX:30, HEIGHT:-4};
MEIRO.Models.M25092.POS = {DIST:15, ROT_X:0.9, ROT_Y:0.5};
MEIRO.Models.M25092.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M25092.prototype.onAnimate = function(time)
{
	var dTime = (time-this.lastTime)/500;
	this.time += dTime;

	var a = this.time;
	var r = 2+1.5*Math.sin(2.5*a);
	
	this.base4.rotation.set(Math.PI/4,Math.PI/2-a,0,'YXZ');
	this.base5.position.set(4*Math.cos(a)*Math.SQRT2,4*Math.SQRT2,4*Math.sin(a)*Math.SQRT2);
	
	var x = r*Math.cos(a)*Math.SQRT2;
	var y = r*Math.SQRT2+2.6;
	var z = r*Math.sin(a)*Math.SQRT2;
	
	this.dyna.position.set(x,y-2.6,z);

	if (this.first && this.lastTime>0)
	{
		this.track.visible = true;
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
	
	this.lastTime = time;	
	
	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.M25092.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движения при DOF=2 - друг вариант</h1>';

	s += '<p>Този модел демонстрира друго движение отновно с две степени на свобода (DOF=2) &ndash; транслация и ротация. Достижимата повърхност зависи не само от това какви движение са двете степени, но и как са свързани в общ механизъм.</p>';

	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M25092.prototype.onShow = function(element)
{
	this.surface.visible = !this.surface.visible;
}
