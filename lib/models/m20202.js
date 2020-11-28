
//	Основи на Компютърната Графика
//	Модел 20202 - Хоризонтално и вертикално въртене на 3D сцена
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M20202 = function M20202(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-5,5],[-5,5],[-5,5],true);

	this.target = new THREE.Object3D();
	this.target.position.set(0,0,0);
	this.eye = new THREE.Object3D();
	this.eye.position.set(0,0,13);

	this.s = new THREE.Spherical();
	
	controls.userUp = new THREE.Vector3(0,1,0);
	controls.userTarget = this.target.getWorldPosition();
	controls.userPosition = this.eye.getWorldPosition();
	
	// обекти
	this.n = options.lowpoly?30:60;
	this.objects = [];
	for (var i=0; i<this.n; i++)
	{
		var obj = new MEIRO.Cube(THREE.Math.randFloat(0.8,1.6));
		this.s.set(THREE.Math.randFloat(1,3),THREE.Math.randFloat(0,Math.PI),THREE.Math.randFloat(0,2*Math.PI));
		obj.position.setFromSpherical(this.s);
		obj.rotation.set(THREE.Math.randFloat(0,Math.PI),THREE.Math.randFloat(0,Math.PI),THREE.Math.randFloat(0,Math.PI));
		obj.material = new THREE.MeshLambertMaterial({color:MEIRO.RandomColor()});
		this.objects.push(obj);
	}
	
	this.light = new THREE.PointLight('white',0);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ВИЖ', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.oxyz,this.eye,this.target,this.light);
	for (var i=0; i<this.n; i++)
		this.image.add(this.objects[i]);
}

MEIRO.Models.M20202.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M20202.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M20202.POS = {DIST:15, ROT_X:0.57, ROT_Y:0.3};
MEIRO.Models.M20202.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M20202.prototype.onAnimate = function(time)
{
	this.oxyz.rotateLabels();
	
	this.s.set(15,Math.PI/2*(1+0.8*Math.sin(rpm(time,17))),rpm(time,10));

	this.light.intensity = controls.userLERP;
	this.light.position.setFromSpherical(this.s);

	this.eye.position.setFromSpherical(this.s);
	controls.userTarget.copy(this.target.getWorldPosition());
	controls.userPosition.copy(this.eye.getWorldPosition());

	TWEEN.update();
	
	if (controls.userLERP>0)
		reanimate();
}



// информатор на модела
MEIRO.Models.M20202.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Хоризонтално и вертикално въртене на 3D сцена</h1>';

	s += '<p>За да се запази разстоянието до сцена при едновременно хоризонтално и вертикално въртене е удобно позицията, от която се гледа, да се движи по сфера около сцената. Затова често се използват сферични координати.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M20202.prototype.onToggle = function(element)
{	
	new TWEEN.Tween({k:controls.userLERP})
		.to({k:controls.userLERP>0.5?0:1},2500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			controls.userLERP = this.k;
		} )
		.start();	
	reanimate();
}


MEIRO.Models.M20202.prototype.onEnter = function()
{
	controls.userCamera = true;
	controls.userLERP = 0;
	controls.userUp = new THREE.Vector3(0,1,0);
	controls.userTarget = this.target.getWorldPosition();
	controls.userPosition = this.eye.getWorldPosition();
	MEIRO.Model.prototype.onEnter.call(this);
}


MEIRO.Models.M20202.prototype.onExit = function()
{
	controls.userCamera = false;
	MEIRO.Model.prototype.onExit.call(this);
}
