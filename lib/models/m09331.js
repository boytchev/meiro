
//	Основи на Компютърната Графика
//	Модел 09331 - Форма за кекс
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09331 = function M09331(room)
{
	MEIRO.Model.apply(this, arguments);

	// форма за кекс
	n = 9;
	this.cake = new THREE.Object3D();
	var geometry = new THREE.CylinderGeometry(0.5,1,3,options.lowpoly?6:32);
	geometry.scale(2/5*4,1,4);
	var material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});
	for (var i=0; i<n; i++)
	{
		var cake = new THREE.Mesh(geometry,material);
		cake.rotation.y = Math.PI/2-2*i/n*Math.PI;
		this.cake.add(cake);
	}

	this.distance = 0;
	
	var light = new THREE.PointLight('white');
	light.position.y = 10;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТГОВОР', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.cake,light);
}

MEIRO.Models.M09331.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09331.DIST = {MIN:10, MAX:40, HEIGHT:0};
MEIRO.Models.M09331.POS = {DIST:20, ROT_X:0, ROT_Y:0.6};
MEIRO.Models.M09331.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09331.prototype.onAnimate = function(time)
{
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M09331.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Форма за кекс</h1>';

	s += '<p>Тази форма е създадена чрез визуалното сливане на няколко сплескани пресечени конуса. Въпреки, че това не е оптималният начин, според броя използвани върхове и страни, подобен подход е често по-лесен и по-бърз за реализация.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M09331.prototype.onToggle = function(element)
{
	var that = this;

	for (var i=0; i<9; i++)
	{
		new TWEEN.Tween({k:that.distance,i:i})
			.to({k: (that.distance>3)?0:6,i:i},500)
			.easing( TWEEN.Easing.Quadratic.InOut )
			.onUpdate( function()
				{
					if (this.i==0) that.distance = this.k;
					var cake = that.cake.children[this.i];
					var a = this.i/9*2*Math.PI;
					cake.position.set(this.k*Math.cos(a),0,this.k*Math.sin(a));
					cake.rotation.y = Math.PI/2-a;
				})
			.delay(50*i+10*i*i)
			.start();
	}
	
	reanimate();
}