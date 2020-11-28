
//	Основи на Компютърната Графика
//	Модел 20193 - Въртене на 2D сцена чрез гледна точка
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M20193 = function M20193(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxy = new MEIRO.Axes2D([-5,5],[-2,2],true,true,true);

	this.target = new THREE.Object3D();
	this.target.position.set(0,0,0);
	this.eye = new THREE.Object3D();
	this.eye.position.set(0,0,13);

	controls.userUp = new THREE.Vector3(0,1,0);
	controls.userTarget = this.target.getWorldPosition();
	controls.userPosition = this.eye.getWorldPosition();
	
	// линия
	this.n = 100;
	sprite = new THREE.TextureLoader().load( 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIBAMAAAA2IaO4AAAAD1BMVEUAAAAAAAAAAAAAAAAAAABPDueNAAAABHRSTlMA1YAa/jDwcAAAAB9JREFUCNdjAANmRSEDBiYXFwUGRhcXATAB5kIkQAAAQZEDU/MthFgAAAAASUVORK5CYII=' );
	var geometry = new THREE.Geometry();
	var material = new THREE.PointsMaterial({color:'cornflowerblue',size:0.07,sizeAttenuation: true, map: sprite, transparent:true, depthTest:false});
	for (var i=0; i<this.n; i++) geometry.vertices.push(new THREE.Vector3());
	this.line = new THREE.Points(geometry,material);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ВИЖ', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.oxy,this.eye,this.target,this.line);
}

MEIRO.Models.M20193.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M20193.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M20193.POS = {DIST:15, ROT_X:0.57, ROT_Y:0.3};
MEIRO.Models.M20193.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M20193.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		this.line.geometry.vertices[i].set(3.5*Math.sin(rpm(time-10*i,5)),0.75*Math.sin(rpm(time-10*i,51))+0.75*Math.cos(rpm(time-10*i,27)),0);
	}
	this.line.geometry.verticesNeedUpdate = true;

	var alpha = 4*Math.sin(rpm(time,3))+2.5*Math.cos(rpm(time,5))+1.3*Math.cos(rpm(time,8));
	controls.userUp.set(Math.cos(alpha),Math.sin(alpha),0);
	controls.userTarget.copy(this.target.getWorldPosition());
	controls.userPosition.copy(this.eye.getWorldPosition());

	TWEEN.update();
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M20193.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Въртене на 2D сцена чрез гледна точка</h1>';

	s += '<p>Въртенето на сцена се реализира чрез въртене на вектора "нагоре" на гледната точка. Положението, от което се гледа, и посоката на гледане са фиксирани.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M20193.prototype.onToggle = function(element)
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


MEIRO.Models.M20193.prototype.onEnter = function()
{
	controls.userCamera = true;
	controls.userLERP = 0;
	controls.userUp = new THREE.Vector3(0,1,0);
	controls.userTarget = this.target.getWorldPosition();
	controls.userPosition = this.eye.getWorldPosition();
	MEIRO.Model.prototype.onEnter.call(this);
}


MEIRO.Models.M20193.prototype.onExit = function()
{
	controls.userCamera = false;
	MEIRO.Model.prototype.onExit.call(this);
}
