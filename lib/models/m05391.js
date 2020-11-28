
//	Основи на Компютърната Графика
//	Модел 05391 - Ориентирани лица
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M05391 = function M05391(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxy = new MEIRO.Axes2D([-8,8],[-5,5],false,false,false);
	
	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	// N точки
	var material = new THREE.MeshPhongMaterial({color:'black'});
	this.red = new THREE.LineBasicMaterial({color:'red'});
	this.blue = new THREE.LineBasicMaterial({color:'blue'});
	this.n = 5;
	this.points = [];
	this.polygons = [];
	this.lines = [];
	this.polygon = new MEIRO.Polygon(this.n+1);
	this.polygon.material = material;
	
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Sphere(0.1);
		p.material = material;
		this.points.push(p);
		
		for (var j=0; j<4; j++)
		{
			var p = new MEIRO.DottedLine();
			p.material = MEIRO.PRIMITIVE.STYLE.DOTTED_LINE.clone();
			this.lines.push(p);
		}
		
		var p = new MEIRO.Polygon(5);
		p.material = new THREE.MeshPhongMaterial({color:'black'});
		this.polygons.push(p);
	}
		
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle(this.toggle);
	
	// сглобяване на целия модел
	this.image.add(this.oxy,this.screen,this.polygon);
	for (var i=0; i<this.n; i++) this.image.add(this.points[i],this.polygons[i]);
	for (var i=0; i<4*this.n; i++) this.image.add(this.lines[i]);
}

MEIRO.Models.M05391.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M05391.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M05391.POS = {DIST:20, ROT_X:1, ROT_Y:0.2};
MEIRO.Models.M05391.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M05391.prototype.onAnimate = function(time)
{
	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M05391.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Ориентирани лица</h1>';

	s += '<p>Формираме правоъгълен трапец с вертикални основи, едно бедро &ndash; страна на многоъгълника и друго бедро, лежащо на координатната ос. Пресмятаме ориентираното лице на всеки трапец (т.е. без да игнорираме знака). Получават се положителни (сини) и отрицателни (червени) лица. Тяхната сума е лицето на многоъгълника.</p>'; 
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M05391.prototype.onToggle = function(element)
{
	var that = this;
	var from = {};
	var to = {};

	var a = THREE.Math.randFloat(-1.5,1.5);
	var k = THREE.Math.randFloat(1,3);
	for (var i=0; i<this.n; i++)
	{
		from['x'+i] = this.points[i].position.x;
		from['y'+i] = this.points[i].position.y;

		a += 1/this.n*2*Math.PI;
		var r = THREE.Math.randFloat(-1,1)+2.5+Math.sin(i*k);
		to['x'+i] = 1.5*r*Math.cos(a);
		to['y'+i] = r*Math.sin(a);
	}

	new TWEEN.Tween(from)
		.to(to,500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
						for (var i=0; i<that.n; i++)
						{
							var p = that.points[i];
							p.position.set(this['x'+i],this['y'+i],0);
							that.polygon.setPoint(i,p.position);
						}
						that.polygon.setPoint(that.n,that.points[0].position);
						for (var i=0; i<that.n; i++)
						{
							var p = that.points[i];
							var q = that.points[(i+1)%that.n];
							that.polygons[i].setPoint(0,p.position);
							that.polygons[i].setPoint(1,new THREE.Vector3(p.position.x,-5,p.position.z));
							that.polygons[i].setPoint(2,new THREE.Vector3(q.position.x,-5,q.position.z));
							that.polygons[i].setPoint(3,q.position);
							that.polygons[i].setPoint(4,p.position);
							
							var m = (q.position.x>p.position.x-EPS)?that.red:that.blue;
							var z = (q.position.x>p.position.x-EPS)?-3:3;
							
							that.polygons[i].material = m;
							that.polygons[i].position.z = z;

							for (var j=0; j<4; j++)
							{
								var r = that.polygons[i].getPoint(j);
								that.lines[4*i+j].setFrom(new THREE.Vector3(r.x,r.y,z));
								that.lines[4*i+j].setTo(new THREE.Vector3(r.x,r.y,0));
								that.lines[4*i+j].material.color = m.color;
							}
						}
					})
		.start();
	reanimate();
}