
//	Основи на Компютърната Графика
//	Модел 12382 - Движение по пресечен конус
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12382 = function M12382(room)
{
	MEIRO.Model.apply(this, arguments);

	// повърхност
	var material = new THREE.MeshPhongMaterial({color:'cornflowerblue',shininess:100,transparent:true,opacity:0.3});
	this.subsurface = new THREE.Mesh(
		new THREE.CylinderGeometry(0,0.4,0.4,options.lowpoly?6:32,1,false),
		material);
	this.subsurface.scale.set(5,10,5);
	this.subsurface.position.y = 3;

	var material = new THREE.MeshPhongMaterial({color:'cornflowerblue',shininess:100});
	this.surface = new THREE.Mesh(
		new THREE.CylinderGeometry(0.4,1,0.6,options.lowpoly?6:32,1,false),
		material);
	this.surface.scale.set(5,10,5);
	this.surface.position.y = -2;
	
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
	this.image.add(this.subsurface,this.surface);
	for (var i=0; i<this.n; i++)
		this.image.add(this.objects[i]);
}

MEIRO.Models.M12382.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12382.DIST = {MIN:20, MAX:30, HEIGHT:0};
MEIRO.Models.M12382.POS = {DIST:25, ROT_X:0.5, ROT_Y:0.2};
MEIRO.Models.M12382.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12382.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		var obj = this.objects[i];
		obj.u += obj.su/80*this.ku;
		obj.v += obj.sv/100*this.kv;
		
		var y = -2+3*Math.sin(obj.v);
		var r = 2.5-y/2;
		var x = r*Math.cos(obj.u);
		var z = r*Math.sin(obj.u);

		obj.position.set(x,y,z);
	}

	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.M12382.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение по пресечен конус</h1>';

	s += '<p>Движението по повърхността на пресечен конус използва същото уравнение, като при пълен конус. Разликата е само в ограничаването на вертикалното линейно движение.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M12382.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%3;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);

	var us = [1,2,1/2];
	var vs = [3/4,1/2,2];
	
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