
//	Основи на Компютърната Графика
//	Модел 14231 - Ъгли във виртуален механизъм
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M14231 = function M14231(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-5,5],[0,5],[-5,5]);

	// основа
	var material = new THREE.MeshPhongMaterial({color:'black',shininess:150});
	var base1 = new MEIRO.Sphere(0.5);
	base1.material = material;
	var base2 = new MEIRO.Cylinder(0.2,2);
	base2.material = material;
	base2.position.set(0,1,0);
	var base3 = new MEIRO.Sphere(0.5);
	base3.material = material;
	base3.position.set(0,2,0);
	
	// подвижна част
	this.dyna = new THREE.Object3D();
	this.dyna.position.set(0,2,0);
	
	var d = new MEIRO.Cylinder(0.2,2);
	d.material = material;
	d.position.set(0,1,0);
	this.dyna.add(d);
	
	d = new MEIRO.Sphere(0.5);
	d.material = material;
	d.position.set(0,2,0);
	this.dyna.add(d);

	material = new THREE.MeshPhongMaterial({color:'orange',shininess:150});
	this.head = new THREE.Object3D();
	this.head.position.set(0,2,0);
	this.dyna.add(this.head);
	
	d = new MEIRO.Cylinder(0.2,1.5);
	d.material = material;
	d.rotation.z = Math.PI/2;
	this.head.add(d);
	
	d = new MEIRO.Sphere(0.2);
	d.material = material;
	d.position.set(0.75,0,0);
	this.head.add(d);
	
	d = new MEIRO.Sphere(0.2);
	d.material = material;
	d.position.set(-0.75,0,0);
	this.head.add(d);
	
	// ъгли
	this.angles = [0,0,0];
	this.k = 0;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '', 'images/n123.png');
	this.toggle.stateTexts = ['ЪГЪЛ №1','ЪГЪЛ №2','ЪГЪЛ №3'];
	this.toggle.state = 0;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.toggle.hide();

	
	// сглобяване на целия модел
	this.image.add(this.oxyz,base1,base2,base3,this.dyna);
}

MEIRO.Models.M14231.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M14231.DIST = {MIN:5, MAX:20, HEIGHT:-2};
MEIRO.Models.M14231.POS = {DIST:10, ROT_X:0.9, ROT_Y:0.5};
MEIRO.Models.M14231.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M14231.prototype.onAnimate = function(time)
{	
	this.oxyz.rotateLabels();

	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	
	this.angles[this.toggle.state] += (1-this.k)*0.05;
	this.angles[(this.toggle.state+2)%3] += this.k*0.05;
	this.k *= 0.95;
	
	this.dyna.rotation.set(
		Math.PI/3+Math.PI/3*Math.sin(this.angles[0]),
		this.angles[1],
		0,
		'YXZ');
	this.head.rotation.y = this.angles[2];
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M14231.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Ъгли във виртуален механизъм</h1>';

	s += '<p>Ойлеровите ъгли се използват за контролиране на елементи от виртуални механизми (роботи). В конкретния модел има само една подвижна част и ориентацията ѝ се определя от три ъгъла:</p>';
	s += '<p><ul><li>Ъгъл №1 е за вертикалния наклон</li>';
	s += '<li>Ъгъл №2 е за хоризонталното завъртане</li>';
	s += '<li>Ъгъл №3 е за въртене около собствената ос</li></ul></p>';
	s += '<p>Понякога осите на въртене не са фиксирани към осите на координатната система.</p>';

	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M14231.prototype.onToggle = function(element)
{
	this.k = 1;
	this.toggle.state = (this.toggle.state+1)%3;
	reanimate();
}
