
//	Основи на Компютърната Графика
//	Модел 05341 - Вътрешна точка чрез брой сечения
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M05341 = function M05341(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxy = new MEIRO.Axes2D([-8,8],[-5,5],false,false);
	
	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	// точка
	this.point = new MEIRO.Sphere(0.25);
	this.point.material = new THREE.MeshPhongMaterial({color:'red'});
	
	// N точки
	this.n = 12;
	this.points = [];
	this.lines = [];
	this.intersections = [];
	var material = new THREE.MeshPhongMaterial({color:'black'});
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Sphere(0.1);
		p.material = material;
		this.points.push(p);

		var p = new MEIRO.Line();
		p.material = new THREE.LineBasicMaterial({color:'black'});;
		this.lines.push(p);
		
		var p = new MEIRO.Sphere(0.15);
		p.material = this.point.material;
		this.intersections.push(p);
	}
	
	// лъч
	this.ray = new MEIRO.Line();
	this.ray.material = new THREE.LineBasicMaterial({color:'red'});
	
	// надписи
	this.labels = [];
	for (var i=0; i<this.n; i++) this.labels.push(new MEIRO.Label(i+1,0.4,-0.2,0.3,0));
	this.labelInside = new MEIRO.Label('Вътрешна',0.6,-4.2+0.7,0.5,0);
	this.labelOutside = new MEIRO.Label('Външна',0.6,-3.4+0.7,0.5,0);
	this.labelInside.material = new THREE.MeshPhongMaterial({color:'blue'});
	this.labelOutside.material = new THREE.MeshPhongMaterial({color:'red'});
	
	this.labelInside.visible = false;
	this.labelOutside.visible = false;
	
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();
	this.onToggle(this.toggle);
	
	// сглобяване на целия модел
	this.image.add(this.oxy,this.screen,this.point,this.ray,this.labelInside,this.labelOutside);
	for (var i=0; i<this.n; i++) this.image.add(this.points[i],this.lines[i],this.intersections[i],this.labels[i]);
}

MEIRO.Models.M05341.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M05341.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M05341.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M05341.ROT_Y = {MIN:-0.1, MAX:0.7};


MEIRO.Models.M05341.prototype.onObject = function()
{
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	var intersects = this.raycaster.intersectObject( this.screen.plate );
	if (intersects.length)
	{
		var p = intersects[0].point;
		p.sub(this.image.position).divide(this.image.scale);
		return p;
	}
	return undefined;
}


// интерактор на модела
MEIRO.Models.M05341.prototype.onDragMove = function()
{
	var p = this.onObject();
	if (p) this.point.position.copy(p);
}


// аниматор на модела
MEIRO.Models.M05341.prototype.onAnimate = function(time)
{
	// пресмятане на сеченията
	var y = this.point.position.y;
	var count = 0;
	for (var i=0; i<this.n; i++)
	{
		this.intersections[i].visible = false;
		this.labels[i].visible = false;
	}
	for (var i=0; i<this.n; i++)
	{
		var p = this.points[i].position;
		var q = this.points[(i+1)%this.n].position;
		if (p.y>=y && q.y>=y) continue; // над лъча
		if (p.y<=y && q.y<=y) continue; // под лъча
		
		// сечението е (x,y), т.q я игнорираме
		var x = p.x+(q.x-p.x)*(y-p.y)/(q.y-p.y);
		if (x<this.point.position.x-EPS) continue; 
//		if (Math.abs(x-q.x)<EPS && Math.abs(y-q.y)<EPS) continue; 
		this.intersections[count].position.set(x,y,0);
		this.intersections[count].visible = true;
		this.labels[count].position.set(x,y,0);
		this.labels[count].visible = true;
		count++;
	}
	
	// лъч
	this.ray.setFrom(this.point.position);
	this.ray.setTo(new THREE.Vector3(8,this.point.position.y,0));
		
	// надписи
	this.labelInside.position.copy(this.point.position);
	this.labelOutside.position.copy(this.point.position);
	this.labelInside.visible = count%2==1;
	this.labelOutside.visible = !this.labelInside.visible;
	this.labelInside.rotateLabel();
	this.labelOutside.rotateLabel();
	
	this.point.material = this.labelOutside.visible?this.labelOutside.material:this.labelInside.material;
	this.ray.material.color.copy(this.point.material.color);
	for (var i=0; i<count; i++)
	{
		this.labels[i].rotateLabel();
		this.labels[i].material = this.point.material;
		this.intersections[i].material = this.point.material;
	}
	
	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M05341.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Вътрешна точка чрез брой сечения</h1>';

	s += '<p>От точка се спуска лъч в произволна посока и се броят сеченията с многоъгълника. Ако този брой е нечетен, то точката е вътрешна, иначе &nmash; външна.</p>'; 
	s += '<p>Многоъгълникът може да е както изпъкнал, така и неизпъкнал и дори &ndash; самопресичащ се.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M05341.prototype.onToggle = function(element)
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
							that.points[i].position.set(this['x'+i],this['y'+i],0);
						for (var i=0; i<that.n; i++)
						{
							that.lines[i].setFrom(that.points[i].position);
							that.lines[i].setTo(that.points[(i+1)%that.n].position);
						}
					})
		.start();
	reanimate();
}