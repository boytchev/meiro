
//	Основи на Компютърната Графика
//	Модел 16191 - Алгоритъм за отсичане на Коен-Съдърленд
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M16191 = function M16191(room)
{
	MEIRO.Model.apply(this, arguments);

	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	// зона
	this.zone = new MEIRO.Cube(1);
	this.zone.material = MEIRO.PRIMITIVE.STYLE.PLATE;
	this.zone.scale.set(6,4,0.1);
	
	// прави
	this.lines = new THREE.Object3D();
	this.lines.add( new MEIRO.DottedLine(new THREE.Vector3(-3,-4.5,0),new THREE.Vector3(-3,4.5,0)) );
	this.lines.add( new MEIRO.DottedLine(new THREE.Vector3(3,-4.5,0),new THREE.Vector3(3,4.5,0)) );
	this.lines.add( new MEIRO.DottedLine(new THREE.Vector3(-7.5,-2,0),new THREE.Vector3(7.5,-2,0)) );
	this.lines.add( new MEIRO.DottedLine(new THREE.Vector3(-7.5,2,0),new THREE.Vector3(7.5,2,0)) );
	
	// маски
	this.masks = [];
	// център
	var label = new MEIRO.Label('0000',1,-1.445,-0.3,0);
	label.position.set(0,0,0);
	this.masks.push(label);
	// горе
	var label = new MEIRO.Label('0010',1,-1.307,-0.3,0);
	label.position.set(0,3.25,0);
	this.masks.push(label);
	// долу
	var label = new MEIRO.Label('0001',1,-1.307,-0.3,0);
	label.position.set(0,-3.25,0);
	this.masks.push(label);
	// ляво
	var label = new MEIRO.Label('0100',1,-1.307,-0.3,0);
	label.position.set(-5.25,0,0);
	this.masks.push(label);
	// дясно
	var label = new MEIRO.Label('1000',1,-1.307,-0.3,0);
	label.position.set(5.25,0,0);
	this.masks.push(label);
	// горе-ляво
	var label = new MEIRO.Label('0110',1,-1.168,-0.3,0);
	label.position.set(-5.25,3.25,0);
	this.masks.push(label);
	// горе-дясно
	var label = new MEIRO.Label('1010',1,-1.168,-0.3,0);
	label.position.set(5.25,3.25,0);
	this.masks.push(label);
	// долу-ляво
	var label = new MEIRO.Label('0101',1,-1.168,-0.3,0);
	label.position.set(-5.25,-3.25,0);
	this.masks.push(label);
	// долу-дясно
	var label = new MEIRO.Label('1001',1,-1.168,-0.3,0);
	label.position.set(5.25,-3.25,0);
	this.masks.push(label);
	
	for (var i=0; i<this.masks.length; i++)
	{
		this.masks[i].material = MEIRO.PRIMITIVE.STYLE.PLATE;
	}

	this.labelIN = new MEIRO.Label('ВИДИМА',1,-2.811,0,0);
	this.labelIN.position.set(0,5.2,0);
	this.labelOUT = new MEIRO.Label('НЕВИДИМА',1,-3.611,0,0);
	this.labelOUT.position.set(0,5.2,0);
	this.labelCROSS = new MEIRO.Label('ОТСИЧАНЕ',1,-3.320,0,0);
	this.labelCROSS.position.set(0,5.2,0);
	
	// отсечка
	this.pointA = new MEIRO.Sphere(0.25);
	this.pointA.material = new THREE.MeshPhongMaterial({color:'red'});
	this.pointA.position.set(2,1/2,0);
	this.pointB = new MEIRO.Sphere(0.25);
	this.pointB.material = this.pointA.material;
	this.pointB.position.set(-2,-1/2,0);
	this.segment = new MEIRO.Cylinder(0.1,1);
	this.segment.geometry = this.segment.geometry.clone();
	this.segment.geometry.rotateX(Math.PI/2);
	this.segment.material = this.pointA.material;
	
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();

	// сглобяване на целия модел
	this.image.add(this.screen,this.zone,this.lines,this.pointA,this.pointB,this.segment,this.labelOUT,this.labelIN,this.labelCROSS);
	for (var i=0; i<this.masks.length; i++) this.image.add(this.masks[i]);
}

MEIRO.Models.M16191.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M16191.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M16191.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M16191.ROT_Y = {MIN:-0.1, MAX:0.7};


MEIRO.Models.M16191.prototype.onObject = function()
{
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );

	var intersects = this.raycaster.intersectObject( this.pointA );
	if (intersects.length) return this.pointA;

	var intersects = this.raycaster.intersectObject( this.pointB );
	if (intersects.length) return this.pointB;
	
	return undefined;
}


MEIRO.Models.M16191.prototype.onObjectPlate = function()
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
MEIRO.Models.M16191.prototype.onDragMove = function()
{
	if (controls.dragObject)
	{
		var p = this.onObjectPlate();
		if (p) controls.dragObject.position.copy(p);
	}
}



// аниматор на модела
MEIRO.Models.M16191.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.masks.length; i++)
		this.masks[i].rotateLabel();
		
	var A = this.pointA.position;
	var B = this.pointB.position;
	
	this.segment.position.lerpVectors(A,B,0.5);
	this.segment.lookAt(A);
	this.segment.scale.set(0.08,0.08,A.distanceTo(B));
	
	var codeA = 0;
	if (A.y<-2) codeA += 1;
	if (A.y>2)  codeA += 2;
	if (A.x<-3) codeA += 4;
	if (A.x>3)  codeA += 8;
	
	var codeB = 0;
	if (B.y<-2) codeB += 1;
	if (B.y>2)  codeB += 2;
	if (B.x<-3) codeB += 4;
	if (B.x>3)  codeB += 8;
	
	this.labelOUT.visible = false;
	this.labelIN.visible = false;
	this.labelCROSS.visible = false;

	if ((codeA|codeB) == 0)
		this.labelIN.visible = true;
	else if (codeA&codeB)
		this.labelOUT.visible = true;
	else
		this.labelCROSS.visible = true;

	this.labelOUT.rotateLabel();
	this.labelIN.rotateLabel();
	this.labelCROSS.rotateLabel();
	
	this.p = codeA;
	this.q = codeB;
//	reanimate();
}



// информатор на модела
MEIRO.Models.M16191.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Алгоритъм за отсичане на Коен-Съдърленд</h1>';

	s += '<p>Първата стъпка на този алгоритъм е да се отдели по най-бързия начин един от трите случая:</p>';
	s += '<p><ul><li>Отсечката е изцяло видима и не се нуждае от отсичане.</li>';
	s += '<li>Отсечката е изцяло невидима и не се нуждае от отсичане.</li>';
	s += '<li>Отсечката вероятно трябва да се отсече.</li></ul></p>';

	var p = ('0000'+this.p.toString(2)).slice(-4);
	var q = ('0000'+this.q.toString(2)).slice(-4);
	s += '<p>В конкретната ситуация единият край на отсечката е с битова маска <em>p = '+p+'</em>, а другият &ndash; с битова маска <em>q = '+q+'</em>. ';

	if ((this.p|this.q) == 0)
		s += 'Понеже <em>p|q = '+('0000'+(this.p|this.q).toString(2)).slice(-4)+' = 0</em>, отсечката е изцяло видима и не се нуждае от отсичане.</p>';
	else if (this.p&this.q)
		s += 'Понеже <em>p&q = '+('0000'+(this.p&this.q).toString(2)).slice(-4)+' &ne; 0</em>, отсечката е изцяло невидима и не се нуждае от отсичане.</p>';
	else
		s += 'Нито <em>p|q = 0</em>, нито <em>p&q &ne; 0</em>, затова отсечката може би пресича централанта зона и трябва да се отсече.</p>';
	
	element.innerHTML = s;
}
