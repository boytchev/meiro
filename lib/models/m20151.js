
//	Основи на Компютърната Графика
//	Модел 20151 - Традиционна гледна точка за 2D
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M20151 = function M20151(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxy = new MEIRO.Axes2D([-5,5],[-2,2],true,true,true);
	this.eye = new THREE.Object3D();
	this.eye.position.set(0,0,10);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ВИЖ', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.oxy,this.eye);
}

MEIRO.Models.M20151.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M20151.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M20151.POS = {DIST:15, ROT_X:0.57, ROT_Y:0.3};
MEIRO.Models.M20151.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M20151.prototype.onAnimate = function(time)
{
	controls.userTarget = this.oxy.getWorldPosition();
	controls.userPosition = this.eye.getWorldPosition();
	
	TWEEN.update();
	
	if (0<controls.userLERP && controls.userLERP<1)
		reanimate();
}



// информатор на модела
MEIRO.Models.M20151.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Традиционна гледна точка за 2D</h1>';

	s += '<p>За реализране на гледна точка при традиционен 2D чертеж позиция, откъдето се гледа, е по оста <em>Z</em>, посоката на гледане е към точката <em>(0,0,0)</em>, а векторът за "нагоре" е <em>(0,1,0)</em>.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M20151.prototype.onToggle = function(element)
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


MEIRO.Models.M20151.prototype.onEnter = function()
{
	controls.userCamera = true;
	controls.userLERP = 0;
	controls.userUp = new THREE.Vector3(0,1,0);
	controls.userTarget = this.oxy.getWorldPosition();
	controls.userPosition = this.eye.getWorldPosition();
	MEIRO.Model.prototype.onEnter.call(this);
}


MEIRO.Models.M20151.prototype.onExit = function()
{
	controls.userCamera = false;
	MEIRO.Model.prototype.onExit.call(this);
}
