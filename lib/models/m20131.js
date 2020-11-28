
//	Основи на Компютърната Графика
//	Модел 20131 - Гледна точка
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M20131 = function M20131(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-5,5],[-2,2],[-5,5],true);
	
	this.point = new MEIRO.Sphere(0.1);
	this.point.material = MEIRO.PRIMITIVE.STYLE.PAWN;
	this.vector = new MEIRO.Vector(new THREE.Vector3(0,1,0), 1, 'red', 0.5);

	var geometry = new THREE.CylinderGeometry(0.125,0.125,1/2,options.lowpoly?16:60,1,true);
	geometry.translate(0,1.5,0);
	geometry.rotateX(Math.PI/2);
	this.cylinder = new THREE.Mesh(
		geometry,
		new THREE.MeshBasicMaterial({color:'cornflowerblue', side:THREE.DoubleSide})
	);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ВИЖ', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.oxyz,this.point,this.vector,this.cylinder);
}

MEIRO.Models.M20131.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M20131.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M20131.POS = {DIST:15, ROT_X:0.57, ROT_Y:0.3};
MEIRO.Models.M20131.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M20131.prototype.onAnimate = function(time)
{
	this.oxyz.rotateLabels();
		
	this.point.position.set( Math.sin(rpm(time,6)), 0.5*Math.sin(rpm(time,5)), Math.sin(rpm(time,8)) );
	this.vector.position.copy(this.point.position);

	var s = new THREE.Spherical(1,rpm(time,4),rpm(time,3));
	var up = new THREE.Vector3().setFromSpherical(s);
	this.vector.setDirection(up);

	s.set(3.5,Math.PI/2+Math.sin(rpm(time,2)),rpm(time,3));
	this.cylinder.position.setFromSpherical(s);
	this.cylinder.lookAt(this.point.position);

	controls.userTarget.copy(this.point.getWorldPosition());
	controls.userUp.copy(up);
	controls.userPosition.copy(this.cylinder.getWorldPosition());
	
	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.M20131.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Гледна точка</h1>';

	s += '<p>Гледната точка се определя от три елемента &ndash; позиция в пространството, откъдето се гледа; позиция в пространството, към която се гледа и вектор, определящ посоката "нагоре".</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M20131.prototype.onToggle = function(element)
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


MEIRO.Models.M20131.prototype.onEnter = function()
{
	controls.userCamera = true;
	controls.userLERP = 0;
	controls.userUp = new THREE.Vector3(0,1,0);
	controls.userTarget = new THREE.Vector3(0,0,0);
	controls.userPosition = new THREE.Vector3(0,0,10);
	MEIRO.Model.prototype.onEnter.call(this);
}


MEIRO.Models.M20131.prototype.onExit = function()
{
	controls.userCamera = false;
	MEIRO.Model.prototype.onExit.call(this);
}
