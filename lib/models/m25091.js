
//	Основи на Компютърната Графика
//	Модел 25091 - Движения при DOF=2 - доминантна скорост
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M25091 = function M25091(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// основа
	var material = new THREE.MeshPhongMaterial({color:'black',shininess:150});
	
	var base1 = new MEIRO.Sphere(0.2);
	base1.material = material;
	base1.position.set(6,0,0);
	
	var base2 = new MEIRO.Sphere(0.2);
	base2.material = material;
	base2.position.set(-6,0,0);
	
	var base3 = new MEIRO.Cylinder(0.2,12);
	base3.material = material;
	base3.position.set(0,0,0);
	base3.rotation.z = Math.PI/2;

	this.n = 300;
	this.track = new MEIRO.Polygon(this.n);
	this.track.visible = false;
	for (var i=0; i<this.n; i++)
		this.track.setPoint(i,new THREE.Vector3(0,2.6,0));
	
	this.surface = new THREE.Mesh(
		new THREE.CylinderGeometry(2.6,2.6,11,32,1,true),
		new THREE.MeshPhongMaterial({color:'pink',transparent:true,opacity:0.15,side:THREE.DoubleSide,depthWrite:false})
	);
	this.surface.rotation.z = Math.PI/2;
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
	
	this.k = 0.7;
	this.time = 0;
	this.lastTime = 0;
	this.first = true;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'Съотношение', 'images/n123.png');
	this.toggle.status = 1;
	this.toggle.hide();

	this.show = new MEIRO.CornerButton('topRight', function(){that.onShow();}, 'Покажи', 'images/show.hide.png');
	this.show.hide();

	// сглобяване на целия модел
	this.image.add(base1,base2,base3,this.dyna,this.track,this.surface);
}

MEIRO.Models.M25091.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M25091.DIST = {MIN:5, MAX:30, HEIGHT:0};
MEIRO.Models.M25091.POS = {DIST:15, ROT_X:0.9, ROT_Y:0.5};
MEIRO.Models.M25091.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M25091.prototype.onAnimate = function(time)
{
	var dTime = (time-this.lastTime)/150;
	this.time += dTime*(1-this.k);
	
	var x = 5.5*Math.sin(this.time);
	
	this.dyna.position.x = x;
	this.dyna.rotation.x += dTime*this.k;

	var y = 2.6*Math.cos(this.dyna.rotation.x);
	var z = 2.6*Math.sin(this.dyna.rotation.x);

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
MEIRO.Models.M25091.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движения при DOF=2 - доминантна скорост</h1>';

	s += '<p>Този модел демонстрира движение при две степени на свобода (DOF=2). Едното е транслация, а другото е ротация. Въпреки, че достижимата повърхност е една и съща, при различни съотношения на скоростите по всяка от степените на свобода се получава визуално различни движения.</p>';

	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M25091.prototype.onToggle = function(element)
{
	this.toggle.status = (this.toggle.status+1)%3;
	
	var newK;
	switch (this.toggle.status)
	{
		case 0: newK = 0.1+0.07*Math.random(); break;
		case 1: newK = 0.6+0.2*Math.random(); break;
		case 2: newK = 0.90+0.08*Math.random(); break;
	}
	
	var that = this;
	new TWEEN.Tween({k:that.k})
		.to({k:newK},1500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.k=this.k} )
		.start();

	reanimate();
}



// превключвател на модела
MEIRO.Models.M25091.prototype.onShow = function(element)
{
	this.surface.visible = !this.surface.visible;
}
