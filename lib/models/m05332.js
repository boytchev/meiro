
//	Основи на Компютърната Графика
//	Модел 05332 - Вътрешна точка на изпъкнал многоъгълник
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M05332 = function M05332(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxy = new MEIRO.Axes2D([-8,8],[-5,5],false,false);
	
	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	// N точки
	this.n = 6;
	this.points = [];
	this.lines = [];
	var material = new THREE.MeshPhongMaterial({color:'black'});
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Sphere(0.15);
		p.material = material;
		this.points.push(p);
		var p = new MEIRO.Line();
		p.material = new THREE.LineBasicMaterial({color:'black'});;
		this.lines.push(p);
	}
	
	// точка
	this.point = new MEIRO.Sphere(0.25);
	this.point.material = new THREE.MeshPhongMaterial({color:'red'});
	
	// надписи
	this.labelInside = new MEIRO.Label('Вътрешна',0.6,-1.8,0.5,0);
	this.labelOutside = new MEIRO.Label('Външна',0.6,-1.38,0.5,0);
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
	this.image.add(this.oxy,this.screen,this.point,this.labelInside,this.labelOutside);
	for (var i=0; i<this.n; i++) this.image.add(this.points[i],this.lines[i]);
}

MEIRO.Models.M05332.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M05332.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M05332.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M05332.ROT_Y = {MIN:-0.1, MAX:0.7};


MEIRO.Models.M05332.prototype.onObject = function()
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
MEIRO.Models.M05332.prototype.onDragMove = function()
{
	var p = this.onObject();
	if (p) this.point.position.copy(p);
}


// аниматор на модела
MEIRO.Models.M05332.prototype.onAnimate = function(time)
{
	// пресмятане на ориентация: q-вектор-страна на многоъгълника, p-вектора от началото на p до подвижната точка
	var sum = 0;
	for (var i=0; i<this.n; i++)
	{
		var p = new THREE.Vector3().copy(this.point.position).sub(this.points[i].position);
		var q = new THREE.Vector3().copy(this.points[(i+1)%this.n].position).sub(this.points[i].position);
		q.set(-q.y,q.x,0);

		var sign = Math.sign(p.dot(q));
		this.lines[i].material.color.set(sign>0?'blue':'red');
		sum += sign;
	}

	// надписи
	this.labelInside.position.copy(this.point.position);
	this.labelOutside.position.copy(this.point.position);
	this.labelInside.visible = sum>this.n-EPS;
	this.labelOutside.visible = !this.labelInside.visible;
	this.labelInside.rotateLabel();
	this.labelOutside.rotateLabel();

	this.point.material = this.labelOutside.visible?this.labelOutside.material:this.labelInside.material;
	
	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M05332.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Вътрешна точка на изпъкнал многоъгълник</h1>';

	s += '<p>Ако върховете на изпъкнал многоъгълник се обхождат обратно на часовниковата стрелка, то вътрешните точки са само вляво. При обхождане обратно на часовниковата стрелка &ndash; те са само вдясно.</p>';
	s += '<p>Дори и спрямо само една страна получим обратна посока, то дадената точка не е вътрешна.</p>'; 
	s += '<p>Ако многоъгълникът не е изпъкнал, този начин за определяне на вътрешна или външна точка не е винаги приложим.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M05332.prototype.onToggle = function(element)
{
	var that = this;
	var from = {};
	var to = {};

	var a = THREE.Math.randFloat(-1.5,1.5);
	for (var i=0; i<this.n; i++)
	{
		a += 1/this.n*2*Math.PI;
		from['x'+i] = this.points[i].position.x;
		from['y'+i] = this.points[i].position.y;
		var r = THREE.Math.randFloat(1,5);
		to['x'+i] = r*Math.cos(a);
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