
//	Основи на Компютърната Графика
//	Модел 10231 - Плъзгане на мащаб I
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M10231 = function M10231(room)
{
	MEIRO.Model.apply(this, arguments);

	this.s = 1;
	
	this.n = 15; // брой сфери
	this.objects = [];
	
	var geometry = new THREE.SphereGeometry(3,40,20);
	for (var i=0; i<this.n; i++)
	{
		var material = new THREE.MeshNormalMaterial();
		this.objects.push(new THREE.Mesh(geometry,material));
		this.objects[i].rotation.set(0,0,Math.PI/2);
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ПОКАЖИ', 'images/show.hide.png');
	this.toggle.hide();
		
	var light = new THREE.AmbientLight('white',1/3);
		
	// сглобяване на целия модел
	for (var i=0; i<this.n; i++)
		this.image.add(this.objects[i]);
	this.image.add(light);
}

MEIRO.Models.M10231.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M10231.DIST = {MIN:15, MAX:30, HEIGHT:0};
MEIRO.Models.M10231.POS = {DIST:20, ROT_X:1.2, ROT_Y:0.3};
MEIRO.Models.M10231.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M10231.prototype.onAnimate = function(time)
{
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M10231.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Плъзгане на мащаб I</h1>';

	s += '<p>Този модел показва сфера, на която е приложено плъзгане на мащаб. По две от осите мащабът се намалява, а по третата се увеличава.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M10231.prototype.onToggle = function(element)
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
					that.objects[i].scale.set(s,1/s,s);
				}
			})
		.start();
	
	reanimate();
}