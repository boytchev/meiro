
//	Основи на Компютърната Графика
//	Модел 05411 - Теорема на Пик
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M05411 = function M05411(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxy = new MEIRO.Axes2D([-4,4],[-3,3],false,false,false);
	
	// екран
	this.screen = new MEIRO.Screen(8,6);
	
	// N точки
	this.black = new THREE.MeshPhongMaterial({color:'black'});
	this.red = new THREE.MeshPhongMaterial({color:'red'});
	this.n = 5;
	this.points = [];
	this.polygon = new MEIRO.Polygon(this.n+1);
	this.polygon.material = new THREE.LineBasicMaterial({color:'black'});
	
	for (var x=-2; x<=2; x++)
	for (var y=-2; y<=2; y++)
	{
		var p = new MEIRO.Sphere(0.1);
		p.position.set(x,y,0);
		this.points.push(p);
	}
		
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle(this.toggle);
	
	this.A = 0;
	this.B = 0;
	
	// сглобяване на целия модел
	this.image.add(this.oxy,this.screen,this.polygon);
	for (var i=0; i<25; i++) this.image.add(this.points[i]);
}

MEIRO.Models.M05411.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M05411.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M05411.POS = {DIST:15, ROT_X:Math.PI/2, ROT_Y:0};
MEIRO.Models.M05411.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M05411.prototype.onAnimate = function(time)
{
	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M05411.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Теорема на Пик</h1>';

	s += '<p>Теоремата на Пик е приложима за несамопресичащ се многоъгълник с целочислени координати на върховете. Ако <em>A</em> е броят на вътрешните за многоъгълника точки, а <em>B</em> е броят точки по контура, то лицето на многоъгълника е <em>S = A+B/2&ndash;1</em>.</p>'; 
	s += '<p>В конкретния случай имаме <em>A='+this.A+'</em> и <em>B='+this.B+'</em>, т.е. лицето <em>S='+(this.A+this.B/2-1)+'</em>.</p>';
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M05411.prototype.onToggle = function(element)
{
	var that = this;
	var from = {};
	var to = {};

	var a = THREE.Math.randFloat(-1.5,1.5);
	var k = THREE.Math.randFloat(1,3);
	for (var i=0; i<this.n; i++)
	{
		from['x'+i] = this.polygon.getPoint(i).x;
		from['y'+i] = this.polygon.getPoint(i).y;

		a += 1/this.n*2*Math.PI;
		var r = 2+Math.sin(i*k)/2;
		to['x'+i] = Math.round(r*Math.cos(a));
		to['y'+i] = Math.round(r*Math.sin(a));
	}

	new TWEEN.Tween(from)
		.to(to,500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
						function areaTriangle(ax,ay,bx,by,cx,cy)
						{
							return Math.abs(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by))/2;
						}
						
						var polygonArea = 0;
						for (var i=0; i<that.n; i++)
						{
							that.polygon.getPoint(i).set(this['x'+i],this['y'+i],0);
							var j = (i+1)%that.n;
							polygonArea += 0.5*(this['x'+i]-this['x'+j])*(this['y'+i]+this['y'+j]);
						}
						that.polygon.setPoint(that.n,that.polygon.getPoint(0));

						that.A = 0;
						that.B = 0;
						
						for (var i=0; i<25; i++)
						{
							var area = 0;
							var min = 1;
							var c = that.points[i].position;
							for (var j=0; j<that.n; j++)
							{
								var a = that.polygon.getPoint(j);
								var b = that.polygon.getPoint((j+1)%that.n);
								at = areaTriangle(a.x,a.y,b.x,b.y,c.x,c.y);
								min = Math.min(min,at);
								area += at;
							}
							if (Math.abs(area-polygonArea)<EPS)
							{
								that.points[i].visible = true;
								that.points[i].material = min?that.red:that.black;
								if (min) that.A++; else that.B++;
							}
							else
								that.points[i].visible = false;
						}
					})
		.start();
	reanimate();
}