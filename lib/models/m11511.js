
//	Основи на Компютърната Графика
//	Модел 11511 - Движение между две точки с линейна комбинация
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M11511 = function M11511(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-6,6],[0,4],[-6,6]);
	
	// крайни обекти
	this.a = new MEIRO.Cube(0.8);
	this.a.material = new THREE.MeshLambertMaterial({color:'lightgray'});
	this.a.position.set(0,0,0);
	this.b = new MEIRO.Cube(0.8);
	this.b.material = new THREE.MeshLambertMaterial({color:'lightgray'});
	this.b.position.set(0,2,0);
	this.line = new MEIRO.Line(this.a.position,this.b.position);
	this.line.material = new THREE.LineBasicMaterial({color:'black'});
	
	// топка
	this.ball = new MEIRO.Sphere(0.5);
	this.ball.material = new THREE.MeshPhongMaterial({color:'red'});
	this.ball.position.copy(this.a.position);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ДРУГИ ТОЧКИ', 'images/random.png');
	this.toggle.hide();
		
	// сглобяване на целия модел
	this.image.add(this.oxyz,this.a,this.b,this.line,this.ball);
}

MEIRO.Models.M11511.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M11511.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M11511.POS = {DIST:12, ROT_X:1.2, ROT_Y:0.3};
MEIRO.Models.M11511.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M11511.prototype.onAnimate = function(time)
{
	this.ball.position.copy(this.a.position);
	this.ball.position.lerp(this.b.position,1/2+1/2*Math.sin(rpm(time,25)));

	this.oxyz.rotateLabels();

	TWEEN.update();
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M11511.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение между две точки с линейна комбинация</h1>';

	s += '<p>Използването на линейна комбинация за реализиране на движение между две точки дава възможност движението да не е линейно, а също и крайните точки да са подвижни.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M11511.prototype.onToggle = function(element)
{
	var that = this;
	var from = {
				ax:that.a.position.x,
				ay:that.a.position.y,
				az:that.a.position.z,
				bx:that.b.position.x,
				by:that.b.position.y,
				bz:that.b.position.z
			};
	var to = {
				ax:THREE.Math.randFloat(-5,5),
				ay:THREE.Math.randFloat(0,4),
				az:THREE.Math.randFloat(-5,5),
				bx:THREE.Math.randFloat(-5,5),
				by:THREE.Math.randFloat(0,4),
				bz:THREE.Math.randFloat(-5,5)
			};

	new TWEEN.Tween(from)
		.to(to,200)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function()
			{
				that.a.position.set(this.ax,this.ay,this.az);
				that.b.position.set(this.bx,this.by,this.bz);
				that.line.setFromTo(that.a.position,that.b.position);
				that.ball.visible = false;
			})
		.onComplete( function()
			{
				that.ball.position.copy(that.a.position);
				that.ball.visible = true;
			})
		.start();
	
	reanimate();
}