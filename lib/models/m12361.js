
//	Основи на Компютърната Графика
//	Модел 12361 - Движение по цилиндър
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12361 = function M12361(room)
{
	MEIRO.Model.apply(this, arguments);

	// повърхност
	this.surface = new MEIRO.Cylinder(4,10);
	this.surface.material = new THREE.MeshPhongMaterial({color:'cornflowerblue',shininess:100});
	
	// обекти
	this.objects = [];
	this.n = 8;
	for (var i=0; i<this.n; i++)
	{
		this.objects.push(new MEIRO.Sphere(0.5));
		this.objects[i].u = 2*Math.PI*Math.random();
		this.objects[i].v = 2*Math.PI*Math.random();
		this.objects[i].su = 2+2*Math.random();
		this.objects[i].sv = 2+2*Math.random();
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '', 'images/time.png');
	this.toggle.stateTexts = ['СКОРОСТ u≈v','СКОРОСТ u≫v','СКОРОСТ u≪v'];
	this.toggle.state = 0;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.toggle.hide();

	// скорости
	this.ku = 1;
	this.kv = 1;
	
	// сглобяване на целия модел
	this.image.add(this.surface);
	for (var i=0; i<this.n; i++)
		this.image.add(this.objects[i]);
}

MEIRO.Models.M12361.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12361.DIST = {MIN:20, MAX:30, HEIGHT:0};
MEIRO.Models.M12361.POS = {DIST:25, ROT_X:0.5, ROT_Y:0.2};
MEIRO.Models.M12361.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12361.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		var obj = this.objects[i];
		obj.u += obj.su/80*this.ku;
		obj.v += obj.sv/100*this.kv;
		
		obj.position.set(
			4*Math.cos(obj.u),
			4.5*Math.sin(obj.v),
			4*Math.sin(obj.u)
		);
	}

	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.M12361.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение по цилиндър</h1>';

	s += '<p>Движението по повърхността на цилиндър може да се представи като две независими движения &ndash; кръгово около цилиндъра и линейно по неговото протежение. Съотношението на тези две скорости определя как визуално ще се възприема то.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M12361.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%3;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);

	var us = [1,2,1/2];
	var vs = [1,1/3,3];
	
	var from = {ku:this.ku,kv:this.kv};
	var to = {ku:us[this.toggle.state],kv:vs[this.toggle.state]};
	var that = this;
	new TWEEN.Tween(from)
		.to(to,1000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
						that.ku = this.ku;
						that.kv = this.kv;
					})
		.start();
			
	reanimate();
}