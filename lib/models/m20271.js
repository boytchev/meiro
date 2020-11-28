
//	Основи на Компютърната Графика
//	Модел 20271 - Слалом с накланяне между конуси
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M20271 = function M20271(room)
{
	MEIRO.Model.apply(this, arguments);

	this.target = new THREE.Object3D();
	this.target.position.set(0,0,20);
	
	this.eye = new THREE.Object3D();
	this.eye.position.set(0,0,-5);

	controls.userUp = new THREE.Vector3(0,1,0);
	controls.userTarget = this.target.getWorldPosition();
	controls.userPosition = this.eye.getWorldPosition();
	
	// конуси
	this.n = 10;
	this.dD = 2;
	this.cones = [];
	var geometry = new THREE.CylinderGeometry(0,0.2,1,options.lowpoly?6:32,1,false);
	var material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});
	for (var i=0; i<this.n; i++)
	{
		var cone = new THREE.Mesh(geometry,material);
		cone.position.y = 0.2;
		this.cones.push(cone);
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СЛАЛОМ', 'images/show.hide.png');
	this.toggle.hide();
	
	this.light = new THREE.PointLight('white',1);
	this.light.position.set(0,2,-10);
		
	// сглобяване на целия модел
	this.image.add(this.light,this.target,this.eye);
	for (var i=0; i<this.n; i++)
		this.image.add(this.cones[i]);
}

MEIRO.Models.M20271.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M20271.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M20271.POS = {DIST:15, ROT_X:-0.57, ROT_Y:0.3};
MEIRO.Models.M20271.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M20271.prototype.onAnimate = function(time)
{
	var t = time/500;
	var len = this.dD*this.n;
	
	for (var i=0; i<this.n; i++)
	{
		var z = t+this.dD*i;
		this.cones[i].position.z = len - z%len - 3*this.dD;
	}
	
	this.light.intensity = controls.userLERP/2;
	
	this.eye.position.x = 0.5*Math.sin(Math.PI/this.dD*t+Math.PI/6);
	
	controls.userUp.set(0.5*Math.sin(Math.PI/this.dD*t+5*Math.PI/6),1,0);
	controls.userTarget.copy(this.target.getWorldPosition());
	controls.userPosition.copy(this.eye.getWorldPosition());
	
	TWEEN.update();
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M20271.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Слалом с накланяне между конуси</h1>';

	s += '<p>Накланянето встрани по време на слалом е също периодична функция подобно на самия слалом. Според конкретната ситуация може да се наложи да се ползва друго фазово отместване, за да се нарави накланянето малко по-рано или по-късно спрямо завоите.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M20271.prototype.onToggle = function(element)
{	
	var that = this;
	new TWEEN.Tween({k:controls.userLERP})
		.to({k:controls.userLERP>0.5?0:1},2500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			controls.userLERP = this.k;
		} )
		.start();	
	reanimate();
}


MEIRO.Models.M20271.prototype.onEnter = function()
{
	controls.userCamera = true;
	controls.userLERP = 0;
	controls.userUp = new THREE.Vector3(0,1,0);
	controls.userTarget = this.target.getWorldPosition();
	controls.userPosition = this.eye.getWorldPosition();
	MEIRO.Model.prototype.onEnter.call(this);
}


MEIRO.Models.M20271.prototype.onExit = function()
{
	controls.userCamera = false;
	MEIRO.Model.prototype.onExit.call(this);
}
