
//	Основи на Компютърната Графика
//	Модел 12401 - Движение по сфера
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12401 = function M12401(room)
{
	MEIRO.Model.apply(this, arguments);

	// повърхност
	this.surface = new MEIRO.Sphere(5);
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

MEIRO.Models.M12401.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12401.DIST = {MIN:20, MAX:30, HEIGHT:0};
MEIRO.Models.M12401.POS = {DIST:30, ROT_X:0.5, ROT_Y:0};
MEIRO.Models.M12401.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12401.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		var obj = this.objects[i];
		obj.u += obj.su/100*this.ku;
		obj.v += obj.sv/100*this.kv;
		
		var x = 5*Math.cos(obj.u)*Math.cos(obj.v);
		var y = 5*Math.sin(obj.v);
		var z = 5*Math.sin(obj.u)*Math.cos(obj.v);

		obj.position.set(x,y,z);
	}

	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.M12401.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение по сфера</h1>';

	s += '<p>Въпреки, че е в 3D, движението по повърхността на сфера се описва с два параметъра. При използване на сферични координати тези два параметъра са двата ъгъла, а радиусът е константа. След преобразуване в декартови координати се получават трите координати за 3D.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M12401.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%3;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);

	var us = [1,3,1/3];
	var vs = [1,1/3,2];
	
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