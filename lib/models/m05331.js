
//	Основи на Компютърната Графика
//	Модел 05331 - Отляво и отдясно на вектор
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M05331 = function M05331(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxy = new MEIRO.Axes2D([-8,8],[-5,5],false,false);
	
	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	// вектор с пунктирана линия
	this.vector = new MEIRO.Vector(new THREE.Vector3(0,1,0),3,'black',2.5);
	this.line = new MEIRO.DottedLine(new THREE.Vector3(0,0,3+30),new THREE.Vector3(0,0,-30));
	this.vector.add(this.line);
	
	// точка
	this.point = new MEIRO.Sphere(0.25);
	this.point.material = new THREE.MeshPhongMaterial({color:'red'});
	
	// надписи
	this.labelLeft = new MEIRO.Label('Отляво',0.6,-1.38,0.5,0);
	this.labelRight = new MEIRO.Label('Отдясно',0.6,-1.6,0.5,0);
	this.labelLeft.material = new THREE.MeshPhongMaterial({color:'blue'});
	this.labelRight.material = new THREE.MeshPhongMaterial({color:'red'});
	
	this.labelLeft.visible = false;
	this.labelRight.visible = false;
	
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();
	
	// сглобяване на целия модел
	this.image.add(this.oxy,this.screen,this.vector,this.point,this.labelLeft,this.labelRight);
}

MEIRO.Models.M05331.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M05331.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M05331.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M05331.ROT_Y = {MIN:-0.1, MAX:0.7};


MEIRO.Models.M05331.prototype.onObject = function()
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
MEIRO.Models.M05331.prototype.onDragMove = function()
{
	var p = this.onObject();
	if (p) this.point.position.copy(p);
}


// аниматор на модела
MEIRO.Models.M05331.prototype.onAnimate = function(time)
{
	// вектор
	var a = rpm(time,3); // движение
	this.vector.position.x = 2*Math.cos(a);
	this.vector.position.y = 2*Math.sin(a);
	var a = rpm(time,4); // въртене
	this.vector.setDirection(new THREE.Vector3(Math.cos(a),Math.sin(a),0));
	
	// пресмятане на ориентация: q-въртящия се вектор, p-вектора от началото на p до подвижната точка
	var p = new THREE.Vector3().copy(this.point.position).sub(this.vector.position);
	var q = new THREE.Vector3(0,0,1).applyEuler(this.vector.rotation);
	q.set(-q.y,q.x,0);

	var sign = p.dot(q)*Math.sin(controls.rot.x);
	this.labelLeft.visible = sign>0 && !controls.freeWalk;
	this.labelRight.visible = sign<0 && !controls.freeWalk;
	
	this.point.material = (sign>0)?this.labelLeft.material:this.labelRight.material;
	
	// надписи
	this.labelLeft.position.copy(this.point.position);
	this.labelRight.position.copy(this.point.position);
	this.labelLeft.rotateLabel();
	this.labelRight.rotateLabel();

	reanimate();
}



// информатор на модела
MEIRO.Models.M05331.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Отляво и отдясно на вектор</h1>';

	s += '<p>Всеки (ненулев) вектор разделя равнината на две полуравнини. Ако гледаме в посоката на вектора, едната полуравнина е отдясно, а другата - отляво на вектора. Коя каква е, може да се определи при произволна ориентация на вектора.</p>';
	s += '<p>Съществуват поне три начина за определяне на ориентацията чрез проверка на знака:</p>';
	s += '<ul><li>на скаларно произведение</li>';
	s += '<li>на координата на векторно произведение</li>';
	s += '<li>на точка в уравнение на права</li></ul>';
	s += '<p>С кликване или докосване на координатната система може да се мести червената точка.</p>';
	
	element.innerHTML = s;
}
