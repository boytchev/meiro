
//	Основи на Компютърната Графика
//	Модел 20501 - Перспективна проекция на въртящ се куб
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M20501 = function M20501(room)
{
	MEIRO.Model.apply(this, arguments);

	var f = 4,
		w = 0.3; // дебелина на телефона
	
	// телефон
	this.phone = new THREE.Object3D();
	var material = new THREE.MeshPhongMaterial({color:0x100808,shininess:100});
	this.phone.position.z = f-w/2-0.03;
	{
		var h=1.5, v=3, g=0.15;
		var a = new MEIRO.Sphere(w/2);
		a.material = material;
		a.position.set(h,v,0);
		this.phone.add(a);
		
		a = a.clone();
		a.position.set(-h,v,0);
		this.phone.add(a);
		
		a = a.clone();
		a.position.set(-h,-v,0);
		this.phone.add(a);
		
		a = a.clone();
		a.position.set(h,-v,0);
		this.phone.add(a);
		
		var a = new MEIRO.Cylinder(w/2,2*v);
		a.material = material;
		a.position.set(h,0,0);
		this.phone.add(a);
		
		a = a.clone();
		a.position.set(-h,0,0);
		this.phone.add(a);
		
		var a = new MEIRO.Cylinder(w/2,2*h);
		a.rotation.z = Math.PI/2;
		a.material = material;
		a.position.set(0,v,0);
		this.phone.add(a);
		
		a = a.clone();
		a.position.set(0,-v,0);
		this.phone.add(a);

		var a = new MEIRO.Sphere(1);
		a.scale.set(g,g,g/20);
		a.material = material;
		a.position.set(0,-v+1.5*g,w/2);
		this.phone.add(a);
		
		var a = new MEIRO.Cube(1);
		a.scale.set(2*h,2*v,w);
		a.material = material;
		a.position.set(0,0,0);
		this.phone.add(a);
		
		a = a.clone();
		a.scale.set(2*h-2*g,2*v-4*g,0.01);
		a.material = new THREE.MeshBasicMaterial({color:0xf6f0bb,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
		a.position.set(0,1*g,w/2);
		this.phone.add(a);
	}
	

	this.cube2 = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CUBE,MEIRO.PRIMITIVE.STYLE.PLATE.clone());
	this.cube2.scale.set(2.5,2.5,2.5);
	this.cube2.position.z = 8;
	this.cube2.material.depthTest = true;
	this.cube2.material.opacity = 0.5;
	
	var geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.5,2.5,2.5));
	this.cube = new THREE.LineSegments(geometry,MEIRO.PRIMITIVE.STYLE.SOLID_LINE.clone());
	this.cube.position.z = 8;
	this.cube.material.color = new THREE.Color('black');
	
	this.points = [];
	this.projections = [];
	this.trails = [];
	this.lines = [];
	var material = new THREE.MeshPhongMaterial({color:'red',shininess:100});
	var geometry = new THREE.IcosahedronGeometry(0.05,0);
	for (var i=0; i<8; i++)
	{
		this.points.push(new THREE.Vector3());
		this.projections.push(new THREE.Vector3());
		this.trails.push(new MEIRO.Line());
		this.trails[i].material = MEIRO.PRIMITIVE.STYLE.GRID;
	}
	for (var i=0; i<12; i++)
		this.lines.push(new MEIRO.Line());
	
	this.matrix = new THREE.Matrix4();
	this.matrix.set(
		1, 0, 0,   0,
		0, 1, 0,   0,
		0, 0, 1,   0,
		0, 0, 1/f, 0 );
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ВИЖ', 'images/show.hide.png');
	this.toggle.hide();
	
	this.cube.visible = false;
	this.cube2.visible = false;
	for (var i=0; i<8; i++)
		this.trails[i].visible = false;
	
	// сглобяване на целия модел
	this.image.add(this.phone,this.cube,this.cube2);
	for (var i=0; i<8; i++)
		this.image.add(this.trails[i]);
	for (var i=0; i<12; i++)
		this.image.add(this.lines[i]);
}

MEIRO.Models.M20501.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M20501.DIST = {MIN:5, MAX:20, HEIGHT:0, SHIFT_Z:-5};
MEIRO.Models.M20501.POS = {DIST:10, ROT_X:Math.PI/2, ROT_Y:0.1};
MEIRO.Models.M20501.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M20501.prototype.onAnimate = function(time)
{
	this.cube2.rotation.set( rpm(time,11), rpm(time,7),rpm(time,5) );
	this.cube.rotation.copy( this.cube2.rotation );
	this.cube.updateMatrix();
	
	var i=-1;
	for (var x=-1; x<2; x+=2)
	for (var y=-1; y<2; y+=2)
	for (var z=-1; z<2; z+=2)
	{
		i++;
		this.points[i].set(x,y,z).multiplyScalar(1.25).applyMatrix4(this.cube.matrix);
		this.projections[i].copy(this.points[i]).applyMatrix4(this.matrix);
		this.trails[i].setTo(this.points[i]);
	}
	
	var a = [0,1,1,3,3,2,2,0,4,5,5,7,7,6,6,4,0,4,1,5,2,6,3,7];
	for (var i=0; i<a.length/2; i++)
		this.lines[i].setFromTo(this.projections[a[2*i]],this.projections[a[2*i+1]]);

	reanimate();
}



// информатор на модела
MEIRO.Models.M20501.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Перспективна проекция на въртящ се куб</h1>';

	s += '<p>Този модел показва как се получава перспективна проекция на въртящ се куб върху екрана на телефон. Всъщност проекцията е двукратна, понеже за да се нарисува самата сцена с телефона и куба, тя също е подложена на перспективна проекция.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M20501.prototype.onToggle = function(element)
{	
	var b = !this.cube.visible;
	this.cube.visible = b;
	this.cube2.visible = b;
	for (var i=0; i<8; i++)
		this.trails[i].visible = b;
	reanimate();
}
