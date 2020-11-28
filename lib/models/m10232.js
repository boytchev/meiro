
//	Основи на Компютърната Графика
//	Модел 10232 - Плъзгане на мащаб II
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M10232 = function M10232(room)
{
	MEIRO.Model.apply(this, arguments);

	this.s = 1;
	
	this.n = 15; // брой сфери
	this.objects = [];
	
	var geometry = new THREE.SphereGeometry(3,80,20);
	for (var i=0; i<this.n; i++)
	{
		var material = new THREE.MeshNormalMaterial();
		this.objects.push(new THREE.Mesh(geometry,material));
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ПОКАЖИ', 'images/show.hide.png');
	this.toggle.hide();
		
	var light = new THREE.HemisphereLight('white','red',1);
		
	// сглобяване на целия модел
	for (var i=0; i<this.n; i++)
		this.image.add(this.objects[i]);
	this.image.add(light);
}

MEIRO.Models.M10232.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M10232.DIST = {MIN:15, MAX:30, HEIGHT:0};
MEIRO.Models.M10232.POS = {DIST:20, ROT_X:1.2, ROT_Y:0.3};
MEIRO.Models.M10232.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M10232.prototype.onAnimate = function(time)
{
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M10232.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Плъзгане на мащаб II</h1>';

	s += '<p>Този модел показва сфера, на която е приложено плъзгане на мащаб. По една от осите мащабът се намалява, а по другите две се увеличава.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M10232.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:that.s})
		.to({k: (that.s<0.96)?1:0.92},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function()
			{
				that.s = this.k;
				for (var i=0; i<that.n; i++)
				{
					var s = Math.pow(that.s,i);
					that.objects[i].scale.set(1/s,s,1/s);
					that.objects[i].material.opacity = 1;
				}
			})
		.start();
	
	reanimate();
}